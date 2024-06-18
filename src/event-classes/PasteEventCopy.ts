export default class PasteEventCopy extends ClipboardEvent {
  constructor(originalEvent: ClipboardEvent) {
    const data = originalEvent.clipboardData;
    if (!data) return;

    const dt = new DataTransfer();

    const files = data.files;

    for (let i = 0; i < files.length; i += 1) {
      const value = files.item(i);

      if (value) dt.items.add(value);
    }
    super("paste", { clipboardData: dt });
  }
}
