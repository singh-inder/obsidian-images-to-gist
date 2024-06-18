export const appendBrToFragment = (fragment: DocumentFragment) => {
  fragment.append(document.createElement("br"));
};

export const appendAnchorToFragment = (
  fragment: DocumentFragment,
  textContent: string,
  href: string
) => {
  const a = document.createElement("a");

  a.textContent = textContent;

  a.setAttribute("href", href);

  fragment.append(a);
};

export function allFilesAreImages(files: FileList) {
  if (files.length === 0) return false;

  for (let i = 0; i < files.length; i++) {
    if (!files[i].type.startsWith("image")) return false;
  }

  return true;
}
