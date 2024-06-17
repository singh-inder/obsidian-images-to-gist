import type ImagesFromGist from "../main";
import { PluginSettingTab, Setting, type App } from "obsidian";

export type ImagesFromGistSettings = {
	showConfirmationModal: boolean;
	githubToken?: string;
	serverUrl: string;
};

export const DEFAULT_SETTINGS: ImagesFromGistSettings = {
	// TODO: update default server url to be deployed server domain
	serverUrl: "http://localhost:5000",
	showConfirmationModal: true
};

// https://docs.obsidian.md/Plugins/User+interface/Settings
export default class ImagesFromGistSettingsTab extends PluginSettingTab {
	plugin: ImagesFromGist;

	constructor(app: App, plugin: ImagesFromGist) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		// https://docs.obsidian.md/Plugins/Releasing/Plugin+guidelines#Use+%60setHeading%60+instead+of+a+%60%3Ch1%3E%60%2C+%60%3Ch2%3E%60
		new Setting(containerEl)
			.setName("Images From Gist Plugin - Settings")
			.setHeading();
	}
}
