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

// TODO: ADD instructions video url here
const YT_VID_URL = "https://www.youtube.com/watch?v=0BIaDVnYp2A";

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

		const tokenData = this.plugin.getToken();

		if (!tokenData || tokenData.loadedFrom === "settings") {
			new Setting(containerEl)
				.setName("❌ Github token environment variable not found")
				.setDesc(this.getNoTokenBannerDesc())
				.addText((text) => {
					text.setPlaceholder("Enter Github token");

					text.setValue(this.plugin.settings.githubToken || "");

					text.onChange((val) => {
						// NOT CALLING this.plugin.saveSettings function as githubToken entered in input should not be persisted.
						this.plugin.settings.githubToken = val;
					});
				});
		} else {
			new Setting(containerEl).setName(
				"✔ Github token loaded from environment variables."
			);
		}
	}

	private getNoTokenBannerDesc() {
		const fragment = document.createDocumentFragment();

		fragment.append(
			"Github token entered here won't be saved because of security reasons. Use environment variables."
		);

		fragment.append(document.createElement("br"));

		const a = document.createElement("a");

		a.textContent =
			"Learn how to add github token as an environment variable.";

		a.setAttribute("href", YT_VID_URL);

		fragment.append(a);

		return fragment;
	}
}
