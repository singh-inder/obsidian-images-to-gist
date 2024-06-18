import {
  Platform,
  FileSystemAdapter,
  Notice,
  Plugin,
  normalizePath
} from "obsidian";

import ImagesFromGistSettingsTab, {
  DEFAULT_SETTINGS,
  type ImagesFromGistSettings
} from "./ui/ImagesFromGistSettingsTab";

export default class ImagesFromGist extends Plugin {
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
  }

  onunload() {}

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}
