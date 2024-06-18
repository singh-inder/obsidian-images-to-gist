import { App, Modal, ButtonComponent } from "obsidian";

const results = ["upload", "alwaysUpload", "local"] as const;

type Result = (typeof results)[number];

export default class UploadConfirmationModal extends Modal {
  private userResponded = false;

  // https://stackoverflow.com/a/77808165
  private localPromise: Promise<Result | undefined>;
  private localResolve: (result?: Result) => void;
  // private localReject: (error: Error) => void;

  constructor(app: App) {
    super(app);

    this.localPromise = new Promise((res, rej) => {
      this.localResolve = res;
      // this.localReject = rej;
    });
  }

  waitForResponse() {
    return this.localPromise;
  }

  private respond(result: Result) {
    this.userResponded = true;
    this.localResolve(result);
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

    if (!this.userResponded) this.localResolve();
  }
}
