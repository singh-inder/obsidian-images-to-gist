import type ImagesToGist from "../main";
import { PluginSettingTab, Setting, type App } from "obsidian";

import { appendAnchorToFragment, appendBrToFragment } from "../lib/utils";

export type PluginSettings = {
  showConfirmationModal: boolean;
  githubToken?: string;
  serverUrl?: string;
};

export const DEFAULT_SETTINGS: PluginSettings = {
  serverUrl: "https://itg.singhinder.com",
  showConfirmationModal: false
};

const GUIDE_BASE_URL = "https://pluginguide.singhinder.com";

const GITHUB_TOKEN_GUIDE = `${GUIDE_BASE_URL}?g=token`;

const SERVER_URL_GUIDE = `${GUIDE_BASE_URL}?g=serverurl`;

// https://docs.obsidian.md/Plugins/User+interface/Settings
export default class SettingsTab extends PluginSettingTab {
  plugin: ImagesToGist;

  constructor(app: App, plugin: ImagesToGist) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;

    containerEl.empty();

    // https://docs.obsidian.md/Plugins/Releasing/Plugin+guidelines#Use+%60setHeading%60+instead+of+a+%60%3Ch1%3E%60%2C+%60%3Ch2%3E%60
    new Setting(containerEl).setName("Images To Gist - Settings").setHeading();

    const token = this.plugin.getToken();

    new Setting(containerEl)
      .setName("Github token")
      .setDesc(this.githubTokenSettingDesc())
      .addText(text => {
        text.inputEl.setAttribute("type", "password");

        text.setPlaceholder("Enter Github token");

        text.setValue(token || "");

        text.onChange(async val => {
          this.plugin.settings.githubToken = val;

          try {
            await this.app.vault.adapter.write(
              this.plugin.getEnvFilePath(),
              `${this.plugin.githubTokenEnv}=${val}`
            );
          } catch (error) {
            console.error(error);
          }
        });
      });

    new Setting(containerEl)
      .setName("Image server url")
      .setDesc(this.getServerUrlDesc())
      .addText(text => {
        text.setValue(this.plugin.settings.serverUrl || "");

        text.setPlaceholder(DEFAULT_SETTINGS.serverUrl as string);

        text.onChange(async val => {
          this.plugin.settings.serverUrl = val;
          await this.plugin.saveSettings();
        });
      });

    new Setting(containerEl)
      .setName("Confirm before upload")
      .setDesc(
        "A dialog appears when you add an image, allowing you to choose between uploading the image or keeping it local."
      )
      .addToggle(toggle => {
        toggle.setValue(this.plugin.settings.showConfirmationModal);

        toggle.onChange(async val => {
          this.plugin.settings.showConfirmationModal = val;
          await this.plugin.saveSettings();
        });
      });
  }

  private githubTokenSettingDesc() {
    const fragment = document.createDocumentFragment();

    fragment.append("Token is saved in ");

    const strongTag = document.createElement("strong");
    strongTag.textContent = this.plugin.getAbsolutePath(".env");
    fragment.append(strongTag);

    appendBrToFragment(fragment);

    fragment.append("If you use any sync service, make sure to exclude this file.");

    appendBrToFragment(fragment);

    appendAnchorToFragment(
      fragment,
      "Learn how to generate github token",
      GITHUB_TOKEN_GUIDE
    );

    return fragment;
  }

  private getServerUrlDesc() {
    const fragment = document.createDocumentFragment();

    fragment.append(
      "Continue to use the default server (completely private & absolutely free) or provide your own."
    );

    appendBrToFragment(fragment);

    appendAnchorToFragment(fragment, "Learn what image server does", SERVER_URL_GUIDE);

    return fragment;
  }
}
