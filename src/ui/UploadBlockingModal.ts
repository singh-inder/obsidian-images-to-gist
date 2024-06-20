import { App, Modal, ButtonComponent } from "obsidian";

export default class UploadBlockingModal extends Modal {
  isOpen = false;

  constructor(app: App) {
    super(app);
  }

  onOpen() {
    this.isOpen = true;
    const { contentEl, titleEl } = this;

    titleEl.setText("Images from gist");
    contentEl.setText("Uploading image...");

    const buttonsDiv = contentEl.createDiv("modal-button-container");

    new ButtonComponent(buttonsDiv)
      .setButtonText("Cancel")
      .setCta()
      .onClick(this.close);

    contentEl.append(buttonsDiv);
  }

  onClose() {
    [this.contentEl, this.titleEl].forEach(el => el.empty());
    this.isOpen = false;
  }
}
