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

export const genFileId = (file: File, addRandomId: boolean) => {
  if (!addRandomId) return file.name;

  const randomId = `${(Math.random() + 1).toString(36).substring(2, 7)}`;
  const splitFileName = file.name.split(".");
  return `${splitFileName[0]}-${randomId}.${splitFileName[splitFileName.length - 1]}`;
};

export const removeCommitHash = (url: string) => {
  const splitUrl = url.split("raw");
  const fileName = splitUrl.pop()?.split("/").pop();
  return `${splitUrl[0]}/raw/${fileName}`;
};

export const createGist = (
  file: File,
  fileId: string,
  token?: string
): Promise<GistPostApiRes> => {
  return new Promise((res, rej) => {
    if (!token) return rej("No Github token");

    /// https://stackoverflow.com/a/20285053
    const reader = new FileReader();

    reader.onloadend = async () => {
      const result = reader.result;

      if (!result) {
        return rej(new Error(`Unable to convert ${file.name} to base64 string`));
      }

      const base64String = (
        typeof result !== "string" ? result.toString() : result
      ).split(",")[1];

      // https://docs.github.com/en/rest/gists/gists?apiVersion=2022-11-28#create-a-gist
      const response = await fetch("https://api.github.com/gists", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28"
        },
        body: JSON.stringify({
          public: false,
          files: { [fileId]: { content: base64String } }
        })
      });

      res((await response.json()) as GistPostApiRes);
    };

    reader.onerror = e => rej(e);

    reader.readAsDataURL(file);
  });
};

// https://stackoverflow.com/a/43828391
export const markdownImgTagRegex = /!\[(.*?)\]\((.*?)\)/g;

// https://chatgpt.com/share/1732e9c3-c335-44a8-b3d5-a9e61c24b378

const altAndSrcRegex = /!\[(.*?)\]\((.*?)\)/;

export const extractAltAndSrcFromMarkdownImg = (markdownImg: string) => {
  const matchedGroup = markdownImg.match(altAndSrcRegex);
  return matchedGroup ? { alt: matchedGroup[1], src: matchedGroup[2] } : null;
};
