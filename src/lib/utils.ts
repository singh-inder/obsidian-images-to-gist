import type { GistPostApiRes } from "src/types";

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

export const allFilesAreImages = (files: FileList) => {
  if (files.length === 0) return false;

  for (let i = 0; i < files.length; i++) {
    if (!files[i].type.startsWith("image")) return false;
  }

  return true;
};

// https://stackoverflow.com/a/20285053
const convertFileToBase64 = (file: File): Promise<string> => {
  return new Promise((res, rej) => {
    const reader = new FileReader();

    reader.onloadend = () => {
      const result = reader.result;

      if (!result) {
        return rej(new Error(`Unable to convert ${file.name} to base64 string`));
      }

      res(result.toString().split(",")[1]);
    };

    reader.onerror = e => rej(e);
    reader.readAsDataURL(file);
  });
};

export const createGist = async (file: File, fileName: string, token: string) => {
  // https://docs.github.com/en/rest/gists/gists?apiVersion=2022-11-28#create-a-gist
  const res = await fetch("https://api.github.com/gists", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28"
    },
    body: JSON.stringify({
      public: false,
      files: { [fileName]: { content: await convertFileToBase64(file) } }
    })
  });

  return (await res.json()) as GistPostApiRes;
};
