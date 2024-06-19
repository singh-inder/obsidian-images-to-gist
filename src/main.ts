import {
  Platform,
  Editor,
  FileSystemAdapter,
  Notice,
  Plugin,
  normalizePath,
  MarkdownView,
  type EditorPosition
} from "obsidian";

import ImagesFromGistSettingsTab, {
  DEFAULT_SETTINGS,
  type ImagesFromGistSettings
} from "./ui/ImagesFromGistSettingsTab";
import UploadConfirmationModal from "./ui/UploadConfirmationModal";

import { allFilesAreImages, createGist, genFileId } from "./lib/utils";
import { PasteEventCopy, DragEventCopy } from "./event-classes";

declare module "obsidian" {
  interface MarkdownSubView {
    clipboardManager: ClipboardManager;
  }

  interface CanvasView extends TextFileView {
    handlePaste: (e: ClipboardEvent) => Promise<void>;
  }

  interface Editor {
    getClickableTokenAt(position: EditorPosition): ClickableToken | null;
  }

  type ClickableToken = {
    displayText: string;
    text: string;
    type: string;
    start: EditorPosition;
    end: EditorPosition;
  };
}

type ClipboardManager = {
  handlePaste(e: ClipboardEvent): void;
  handleDrop(e: DragEvent): void;
};

export default class ImagesFromGist extends Plugin {
  // same as in manifest.json
  pluginName = "images-from-gist";

  settings: ImagesFromGistSettings;

  private noGithubTokenNotice() {
    new Notice("❌ No Github token", 3 * 1000);
  }

  private noServerUrlNotice() {
    new Notice("❌ No Server url", 3 * 1000);
  }

  getPluginPath() {
    return `${this.app.vault.configDir}/plugins/${this.pluginName}`;
  }

  // https://forum.obsidian.md/t/how-to-get-current-plugins-directory/26427/2
  getAbsolutePath(fileName: string) {
    let basePath;

    if (this.app.vault.adapter instanceof FileSystemAdapter) {
      basePath = this.app.vault.adapter.getBasePath();
    } else {
      throw new Error("Cannot determine base path.");
    }

    const relativePath = `${this.getPluginPath()}/${fileName}`;

    // https://docs.obsidian.md/Plugins/Releasing/Plugin+guidelines#Use+%60normalizePath()%60+to+clean+up+user-defined+paths
    return normalizePath(`${basePath}/${relativePath}`);
  }

  getToken() {
    return process.env.GITHUB_TOKEN || this.settings.githubToken;
  }

  async loadEnvVars() {
    // https://levelup.gitconnected.com/obsidian-plugin-development-tutorial-how-to-use-environment-variables-d6f9258f3957
    (await import("dotenv")).config({ path: this.getAbsolutePath(".env") });
  }

  async onload() {
    await this.loadSettings();

    // dotenv internally uses nodejs apis which isn't supported on mobile platforms
    if (!Platform.isMobile) await this.loadEnvVars();

    if (!this.getToken()) this.noGithubTokenNotice();
    if (!this.settings.serverUrl) this.noServerUrlNotice();

    // This adds a settings tab so the user can configure various aspects of the plugin
    this.addSettingTab(new ImagesFromGistSettingsTab(this.app, this));

    this.setupHandlers();
  }

  onunload() {}

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  private setupHandlers() {
    const { workspace } = this.app;

    this.registerEvent(workspace.on("editor-paste", this.customPasteEventCb));
    this.registerEvent(workspace.on("editor-drop", this.customDropEventListener));
  }

  private customPasteEventCb = async (
    e: ClipboardEvent,
    _: Editor,
    markdownView: MarkdownView
  ) => {
    if (e instanceof PasteEventCopy) return;

    const files = e.clipboardData?.files;

    if (!files || !allFilesAreImages(files)) return;

    if (!this.getToken()) return this.noGithubTokenNotice();
    if (!this.settings.serverUrl) return this.noServerUrlNotice();

    e.preventDefault();

    if (this.settings.showConfirmationModal) {
      const modal = new UploadConfirmationModal(this.app);
      modal.open();

      const result = await modal.waitForResponse();
      if (!result) return;

      // no need to handle upload case
      if (result === "alwaysUpload") {
        this.settings.showConfirmationModal = false;
        this.saveSettings();
      } else if (result === "local") {
        return markdownView.currentMode.clipboardManager.handlePaste(
          new PasteEventCopy(e)
        );
      }
    }

    for (let i = 0; i < files.length; i++) {
      this.createGistAndEmbedImage(files[i]).catch(() => {
        markdownView.currentMode.clipboardManager.handlePaste(new PasteEventCopy(e));
      });
    }
  };

  private async createGistAndEmbedImage(file: File, atPos?: EditorPosition) {
    const token = this.getToken();
    const { addRandomId, serverUrl } = this.settings;

    if (!token) return this.noGithubTokenNotice();
    if (!serverUrl) return this.noServerUrlNotice();

    const fileId = genFileId(file, addRandomId);

    this.insertTemporaryText(fileId, atPos);

    try {
      const imgUrl = await this.upload(file, fileId);

      const progressText = ImagesFromGist.progressTextFor(fileId);

      const markDownImage = `![](${imgUrl})`;

      const editor = this.getEditor();

      if (editor)
        ImagesFromGist.replaceFirstOccurrence(editor, progressText, markDownImage);
    } catch (error) {
      console.error(`Failed to create gist for ${fileId}: `, error);

      this.handleFailedUpload(fileId, `⚠️failed to create gist, ${error.message}`);

      throw error;
    }
  }

  async upload(file: File, fileId: string) {
    const res = await createGist(file, fileId, this.getToken());
    return `${this.settings.serverUrl}?url=${res.files[fileId].raw_url}`;
  }

  private handleFailedUpload(pasteId: string, message: string) {
    const progressText = ImagesFromGist.progressTextFor(pasteId);

    const editor = this.getEditor();

    if (editor)
      ImagesFromGist.replaceFirstOccurrence(editor, progressText, `<!--${message}-->`);
  }

  private static progressTextFor(id: string) {
    return `![Uploading file...${id}]()`;
  }

  private insertTemporaryText(pasteId: string, atPos?: EditorPosition) {
    const progressText = ImagesFromGist.progressTextFor(pasteId);

    const replacement = `${progressText}\n`;

    const editor = this.getEditor();
    if (!editor) return;

    if (atPos) {
      editor.replaceRange(replacement, atPos, atPos);
    } else {
      editor.replaceSelection(replacement);
    }
  }

  private getEditor() {
    const mdView = this.app.workspace.getActiveViewOfType(MarkdownView);
    return mdView?.editor;
  }

  private static replaceFirstOccurrence(
    editor: Editor,
    target: string,
    replacement: string
  ) {
    const lines = editor.getValue().split("\n");

    for (let i = 0; i < lines.length; i += 1) {
      const ch = lines[i].indexOf(target);
      if (ch === -1) continue;

      const from = { line: i, ch };
      const to = { line: i, ch: ch + target.length };
      editor.replaceRange(replacement, from, to);
      break;
    }
  }

  private customDropEventListener = async (
    e: DragEvent,
    _: Editor,
    markdownView: MarkdownView
  ) => {
    if (e instanceof DragEventCopy) return;

    if (!this.getToken()) return this.noGithubTokenNotice();
    if (!this.settings.serverUrl) return this.noServerUrlNotice();

    const dataTransfer = e.dataTransfer;

    if (
      !dataTransfer ||
      dataTransfer.types.length !== 1 ||
      dataTransfer.types[0] !== "Files"
    ) {
      return;
    }

    // Preserve files before showing modal, otherwise they will be lost from the event
    const { files } = dataTransfer;

    if (!allFilesAreImages(files)) return;

    e.preventDefault();

    if (this.settings.showConfirmationModal) {
      const modal = new UploadConfirmationModal(this.app);
      modal.open();

      const result = await modal.waitForResponse();
      if (!result) return;

      // no need to handle upload case
      if (result === "alwaysUpload") {
        this.settings.showConfirmationModal = false;
        this.saveSettings();
      } else if (result === "local") {
        return markdownView.currentMode.clipboardManager.handleDrop(
          DragEventCopy.create(e, files)
        );
      }
    }

    // Adding newline to avoid messing images pasted via default handler with any text added by the plugin
    this.getEditor()?.replaceSelection("\n");

    const promises: Promise<void>[] = [];
    const filesFailedToUpload: File[] = [];

    for (let i = 0; i < files.length; i++) {
      const image = files[i];

      const uploadPromise = this.createGistAndEmbedImage(image).catch(() => {
        filesFailedToUpload.push(image);
      });

      promises.push(uploadPromise);
    }

    await Promise.all(promises);

    if (filesFailedToUpload.length === 0) return;

    markdownView.currentMode.clipboardManager.handleDrop(
      DragEventCopy.create(e, filesFailedToUpload)
    );
  };
}
