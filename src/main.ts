import {
  Editor,
  Notice,
  Plugin,
  MarkdownView,
  type EditorPosition,
  type CanvasView
} from "obsidian";

import SettingsTab, { DEFAULT_SETTINGS, type PluginSettings } from "./ui/SettingsTab";
import UploadConfirmationModal from "./ui/UploadConfirmationModal";

import parseEnv from "./lib/parseEnv";
import {
  allFilesAreImages,
  createGist,
  extractAltAndSrcFromMarkdownImg,
  markdownImgTagRegex,
  removeCommitHash
} from "./lib/utils";
import { PasteEventCopy, DragEventCopy } from "./eventClasses";
import { createCanvasPasteHandler, type PasteHandler } from "./lib/Canvas";

declare module "obsidian" {
  interface MarkdownSubView {
    clipboardManager: ClipboardManager;
  }

  interface CanvasView extends TextFileView {
    handlePaste: PasteHandler;
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

export default class ImagesToGist extends Plugin {
  // same as in manifest.json
  pluginName = "images-to-gist";
  githubTokenEnv = "GITHUB_TOKEN" as const;
  settings: PluginSettings;

  private noGithubTokenNotice() {
    new Notice("❌ No Github token", 3 * 1000);
  }

  private noServerUrlNotice() {
    new Notice("❌ No Server url", 3 * 1000);
  }

  getPluginPath() {
    return `${this.app.vault.configDir}/plugins/${this.pluginName}`;
  }

  getToken() {
    return this.settings.githubToken;
  }

  getEnvFilePath() {
    return `${this.getPluginPath()}/.env`;
  }

  private async loadEnv() {
    try {
      const data = await this.app.vault.adapter.read(this.getEnvFilePath());
      this.settings.githubToken = parseEnv(data)[this.githubTokenEnv];
    } catch (error) {
      console.log("error loading env file", error.message);
    }
  }

  async onload() {
    await this.loadSettings();
    await this.loadEnv();

    if (!this.getToken()) this.noGithubTokenNotice();
    if (!this.settings.serverUrl) this.noServerUrlNotice();

    // This adds a settings tab so the user can configure various aspects of the plugin
    this.addSettingTab(new SettingsTab(this.app, this));

    this.setupHandlers();

    this.addCommand({
      id: "update-image-server-urls",
      name: "Update all image server urls",
      editorCallback: (editor, view) => {
        const serverUrl = this.settings.serverUrl;
        if (!serverUrl) return this.noServerUrlNotice();

        const newValue = editor.getValue().replace(markdownImgTagRegex, matched => {
          const data = extractAltAndSrcFromMarkdownImg(matched);
          if (!data) return matched;

          const val = data.src.split("?url=").pop();
          if (!val) return matched;

          const updatedUrl = `${serverUrl}?url=${val}`;

          return `![${data.alt}](${updatedUrl})`;
        });

        editor.setValue(newValue);
      }
    });
  }

  onunload() {}

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { githubToken, ...rest } = this.settings;
    await this.saveData({ ...rest });
  }

  private setupHandlers() {
    const { workspace } = this.app;

    this.registerEvent(workspace.on("editor-paste", this.customPasteEventCb));
    this.registerEvent(workspace.on("editor-drop", this.customDropEventListener));

    this.registerEvent(
      workspace.on("active-leaf-change", leaf => {
        if (!leaf) return;
        const view = leaf.view;

        if (view.getViewType() === "canvas") {
          this.overridePasteHandlerForCanvasView(view as CanvasView);
        }
      })
    );
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
    const { serverUrl } = this.settings;

    if (!token) return this.noGithubTokenNotice();
    if (!serverUrl) return this.noServerUrlNotice();

    const pasteId = (Math.random() + 1).toString(36).substring(2, 7);

    this.insertTemporaryText(pasteId, atPos);

    try {
      const imgUrl = await this.upload(file);

      const progressText = ImagesToGist.progressTextFor(pasteId);

      const markDownImage = `![](${imgUrl})`;

      const editor = this.getEditor();

      if (editor)
        ImagesToGist.replaceFirstOccurrence(editor, progressText, markDownImage);
    } catch (error) {
      console.error(`Failed to create gist for ${pasteId}: `, error);

      this.handleFailedUpload(pasteId, `⚠️failed to create gist, ${error.message}`);

      throw error;
    }
  }

  async upload(file: File) {
    const res = await createGist(file, this.getToken() as string);
    return `${this.settings.serverUrl}?url=${removeCommitHash(res.files[file.name].raw_url)}`;
  }

  private handleFailedUpload(pasteId: string, message: string) {
    const progressText = ImagesToGist.progressTextFor(pasteId);

    const editor = this.getEditor();

    if (editor)
      ImagesToGist.replaceFirstOccurrence(editor, progressText, `<!--${message}-->`);
  }

  private static progressTextFor(id: string) {
    return `![Uploading file...${id}]()`;
  }

  private insertTemporaryText(pasteId: string, atPos?: EditorPosition) {
    const progressText = ImagesToGist.progressTextFor(pasteId);

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

  private overridePasteHandlerForCanvasView(view: CanvasView) {
    const originalPasteFn = view.handlePaste;
    view.handlePaste = createCanvasPasteHandler(this, originalPasteFn);
  }
}
