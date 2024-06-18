import { FileSystemAdapter, Notice, Plugin, normalizePath } from "obsidian";
import * as dotenv from "dotenv";

import ImagesFromGistSettingsTab, {
	DEFAULT_SETTINGS,
	type ImagesFromGistSettings
} from "./ui/ImagesFromGistSettingsTab";

export default class ImagesFromGist extends Plugin {
	pluginName = "images-from-gist";

	settings: ImagesFromGistSettings;

	private noGithubTokenNotice(addToStatusBar: boolean = false) {
		const errText = "❌ No Github token";
		new Notice(errText, 3 * 1000);

		if (addToStatusBar) this.addStatusBarItem().setText(errText);
	}

	private noServerUrlNotice(addToStatusBar: boolean = false) {
		const errText = "❌ No Server url";
		new Notice(errText, 3 * 1000);

		if (addToStatusBar) this.addStatusBarItem().setText(errText);
	}

	private getPluginPath() {
		return `${this.app.vault.configDir}/plugins/${this.pluginName}`;
	}

	// https://forum.obsidian.md/t/how-to-get-current-plugins-directory/26427/2
	private getAbsolutePath(fileName: string) {
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
		const token = process.env.GITHUB_TOKEN || this.settings.githubToken;

		const loadedFrom: "env" | "settings" = process.env.GITHUB_TOKEN
			? "env"
			: "settings";

		return token ? { token, loadedFrom } : null;
	}

	loadEnvVars() {
		// https://levelup.gitconnected.com/obsidian-plugin-development-tutorial-how-to-use-environment-variables-d6f9258f3957
		dotenv.config({ path: this.getAbsolutePath(".env") });
	}

	async onload() {
		await this.loadSettings();

		this.loadEnvVars();

		if (!this.getToken()) this.noGithubTokenNotice(true);
		if (!this.settings.serverUrl) this.noServerUrlNotice(true);

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new ImagesFromGistSettingsTab(this.app, this));
	}

	onunload() {}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
