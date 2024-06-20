import type ImagesFromGist from "../main";
import { Platform, PluginSettingTab, Setting, type App } from "obsidian";

import { appendAnchorToFragment, appendBrToFragment } from "../lib/utils";

export type PluginSettings = {
  showConfirmationModal: boolean;
  githubToken?: string;
  serverUrl?: string;
  addRandomId: boolean;
};

export const DEFAULT_SETTINGS: PluginSettings = {
  // TODO: update default server url to be deployed server domain
  serverUrl: "http://localhost:5000",
  showConfirmationModal: true,
  addRandomId: true
};

// TODO: ADD video url here
const GITHUB_TOKEN_VID = "https://www.youtube.com/watch?v=0BIaDVnYp2A";

// TODO: ADD video url here
const SERVER_URL_VID = "https://www.youtube.com/watch?v=0BIaDVnYp2A";

// https://docs.obsidian.md/Plugins/User+interface/Settings
export default class SettingsTab extends PluginSettingTab {
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

          // early return mobile platform as dotenv cannot run on mobile platform.
          if (Platform.isMobile) return;

          try {
            // console.log(this.app)
            const adapter = this.app.vault.adapter;

            const envFilePath = `${this.plugin.getPluginPath()}/.env`;
            const envFileExists = await adapter.exists(envFilePath);

            const envValue = `GITHUB_TOKEN=${val}`;

            if (envFileExists) {
              // https://docs.obsidian.md/Plugins/Vault#Modify+files
              await adapter.process(envFilePath, fileData => {
                return envValue;
              });
            } else {
              await adapter.write(envFilePath, envValue);
            }
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

    new Setting(containerEl)
      .setName("Add random id")
      .setDesc(this.getRandomIdDesc())
      .addToggle(toggle => {
        toggle.setValue(this.plugin.settings.addRandomId);

        toggle.onChange(async val => {
          this.plugin.settings.addRandomId = val;
          await this.plugin.saveSettings();
        });
      });
  }

  private githubTokenSettingDesc() {
    const fragment = document.createDocumentFragment();

    if (Platform.isMobile) {
      fragment.append(
        "As you're on mobile, token won't be saved because of security reasons."
      );

      return fragment;
    }

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
      GITHUB_TOKEN_VID
    );

    return fragment;
  }

  private getServerUrlDesc() {
    const fragment = document.createDocumentFragment();

    fragment.append(
      "Continue to use the default server (completely private & absolutely free) or provide your own."
    );

    appendBrToFragment(fragment);

    appendAnchorToFragment(fragment, "Learn what image server does", SERVER_URL_VID);

    return fragment;
  }

  private getRandomIdDesc() {
    const fragment = document.createDocumentFragment();

    fragment.append(
      "A random id will be added to the gist title to ensure its uniqueness."
    );

    appendBrToFragment(fragment);

    fragment.append(
      "For example: If your image name is example.jpeg, it'll become example-{random id}.jpeg"
    );

    return fragment;
  }
}
