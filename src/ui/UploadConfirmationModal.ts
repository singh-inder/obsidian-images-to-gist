import { App, Modal, ButtonComponent } from "obsidian";

const results = ["upload", "alwaysUpload", "local"] as const;

type Result = (typeof results)[number];

type onSubmitCb = (result?: Result) => void;

export default class UploadConfirmationModal extends Modal {
  result: Result;
  userResponded = false;
  onSubmit: onSubmitCb;

  constructor(app: App, onSubmit: onSubmitCb) {
    super(app);

    this.onSubmit = onSubmit;
  }

  respond(result: Result) {
    this.userResponded = true;
    this.onSubmit(result);
    this.close();
  }

  onOpen() {
    const { contentEl, titleEl } = this;

    titleEl.setText("Images from gist");

    contentEl.setText("Would you like to create a gist paste your content locally?");

    const buttonsDiv = contentEl.createDiv("modal-button-container");

    new ButtonComponent(buttonsDiv)
      .setButtonText("Always upload")
      .setCta()
      .onClick(() => this.respond("alwaysUpload"));

    new ButtonComponent(buttonsDiv)
      .setButtonText("Upload")
      .setCta()
      .onClick(() => this.respond("upload"));

    new ButtonComponent(buttonsDiv)
      .setButtonText("Paste locally")
      .onClick(() => this.respond("local"));

    contentEl.appendChild(buttonsDiv);
  }

  onClose() {
    [this.contentEl, this.titleEl].forEach(el => el.empty());

    if (!this.userResponded) this.onSubmit();
  }
}
