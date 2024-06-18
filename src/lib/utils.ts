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

