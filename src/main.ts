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

import { allFilesAreImages } from "./lib/utils";
import { PasteEventCopy } from "./event-classes";

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
    this.registerEvent(
      this.app.workspace.on("editor-paste", this.customPasteEventCb)
    );
    // TODO: handle drag & drop event
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
      // TODO render a confirmation modal
    }

    for (let i = 0; i < files.length; i++) {
      this.createGistAndEmbedImage(files[i]).catch(() => {
        markdownView.currentMode.clipboardManager.handlePaste(
          new PasteEventCopy(e)
        );
      });
    }
  };

  private async createGistAndEmbedImage(file: File, atPos?: EditorPosition) {
    const token = this.getToken();
    const { addRandomId, serverUrl } = this.settings;

    if (!token) return this.noGithubTokenNotice();
    if (!serverUrl) return this.noServerUrlNotice();

    let fileName = file.name;

    if (addRandomId) {
      const randomId = `${(Math.random() + 1).toString(36).substring(2, 7)}`;

      const splitFileName = file.name.split(".");
      const extension = splitFileName[splitFileName.length - 1];

      fileName = `${splitFileName[0]}-${randomId}.${extension}`;
    }

    console.log(fileName);

    // TODO Make a POST request to github gist api
  }
}
