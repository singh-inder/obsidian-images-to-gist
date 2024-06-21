import type ImagesFromGistPlugin from "../main";
import { Canvas } from "obsidian";

import UploadConfirmationModal from "../ui/UploadConfirmationModal";
import UploadBlockingModal from "../ui/UploadBlockingModal";

import { allFilesAreImages } from "./utils";

function buildPasteEventCopy(originalEvent: ClipboardEvent, files: File[] | FileList) {
  const clipboardData = new DataTransfer();
  for (let i = 0; i < files.length; i += 1) {
    clipboardData.items.add(files[i]);
  }

  return new ClipboardEvent(originalEvent.type, { clipboardData });
}

export type PasteHandler = (e: ClipboardEvent) => Promise<void>;

export function createCanvasPasteHandler(
  plugin: ImagesFromGistPlugin,
  originalPasteHandler: PasteHandler
) {
  return function (e: ClipboardEvent) {
    return canvasPaste.call(this, plugin, originalPasteHandler, e);
  };
}

async function canvasPaste(
  plugin: ImagesFromGistPlugin,
  originalPasteHandler: PasteHandler,
  e: ClipboardEvent
) {
  const files = e.clipboardData?.files;

  if (!files || !allFilesAreImages(files) || files.length != 1) {
    originalPasteHandler.call(this, e);
    return;
  }

  if (plugin.settings.showConfirmationModal) {
    const modal = new UploadConfirmationModal(plugin.app);
    modal.open();

    const result = await modal.waitForResponse();
    if (!result) return;

    if (result === "alwaysUpload") {
      this.settings.showConfirmationModal = false;
      this.saveSettings();
    } else if (result === "local") {
      originalPasteHandler.call(this, e);
      return;
    }
  }

  const canvas: Canvas = this.canvas;

  uploadImageOnCanvas(canvas, plugin, buildPasteEventCopy(e, files)).catch(() => {
    originalPasteHandler.call(this, e);
  });
}

async function uploadImageOnCanvas(
  canvas: Canvas,
  plugin: ImagesFromGistPlugin,
  e: ClipboardEvent
) {
  const modal = new UploadBlockingModal(plugin.app);
  modal.open();

  const file = e.clipboardData?.files[0];
  if (!file) return;

  try {
    const imgUrl = await plugin.upload(file);

    if (!modal.isOpen) return;

    modal.close();

    canvas.createTextNode({
      pos: canvas.posCenter(),
      position: "center",
      text: `![](${imgUrl})`
    });
  } catch (error) {
    modal.close();
    throw error;
  }
}

declare module "obsidian" {
  interface Canvas {
    posCenter(): Point;
    createTextNode(n: NewTextNode): unknown;
  }

  interface NewTextNode {
    pos: Point;
    position: string;
    text: string;
  }
}
