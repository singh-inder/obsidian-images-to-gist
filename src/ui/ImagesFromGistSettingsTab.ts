import type ImagesFromGist from "../main";
import { Notice, PluginSettingTab, Setting, type App } from "obsidian";

import { appendAnchorToFragment, appendBrToFragment } from "../lib/utils";

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
const ENV_VAR_VID = "https://www.youtube.com/watch?v=0BIaDVnYp2A";

// TODO: ADD video url here
const SERVER_URL_VID = "https://www.youtube.com/watch?v=0BIaDVnYp2A";

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
					text.inputEl.setAttribute("type", "password");

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

		new Setting(containerEl)
			.setName("Server url")
			.setDesc(this.getServerUrlDesc())
			.addText((text) => {
				text.setValue(this.plugin.settings.serverUrl);

				text.onChange(async (val) => {
					this.plugin.settings.serverUrl = val;
					await this.plugin.saveSettings();
				});
			});

		new Setting(containerEl)
			.setName("Confirm before upload")
			.setDesc(
				"A dialog shown when you add an image which lets you choose whether you want to upload the image or keep it local."
			)
			.addToggle((toggle) => {
				toggle.setValue(this.plugin.settings.showConfirmationModal);

				toggle.onChange(async (val) => {
					this.plugin.settings.showConfirmationModal = val;
					await this.plugin.saveSettings();
				});
			});

		new Setting(containerEl)
			.setName("Reset!")
			.setDesc(
				"Reset to default settings. Doesn't affect github token environment variable."
			)
			.addButton((btn) => {
				btn.setIcon("rotate-ccw");
				btn.setCta();
				btn.setTooltip("Reset");

				btn.onClick(async (e) => {
					this.plugin.settings.serverUrl =
						DEFAULT_SETTINGS.serverUrl as string;

					this.plugin.settings.showConfirmationModal = true;

					this.plugin.settings.githubToken = "";

					await this.plugin.saveSettings();

					new Notice("✔ Reopen settings to see changes.", 2 * 1000);
				});
			});
	}

	private getNoTokenBannerDesc() {
		const fragment = document.createDocumentFragment();

		fragment.append(
			"Github token entered here won't be saved because of security reasons. Use environment variables."
		);

		appendBrToFragment(fragment);

		appendAnchorToFragment(
			fragment,
			"Learn how to add github token as an environment variable.",
			ENV_VAR_VID
		);

		return fragment;
	}

	private getServerUrlDesc() {
		const fragment = document.createDocumentFragment();

		fragment.append(
			"Continue to use the default server (completely private & absolutely free) or provide your own."
		);

		appendBrToFragment(fragment);

		appendAnchorToFragment(
			fragment,
			"Learn what server url does",
			SERVER_URL_VID
		);

		return fragment;
	}
}
