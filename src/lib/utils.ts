import type { GistPostApiRes } from "src/types";
import { requestUrl } from "obsidian";

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

// https://stackoverflow.com/a/47175630
export const removeCommitHash = (url: string) => {
  const splitUrl = url.split("raw");
  const fileName = splitUrl.pop()?.split("/").pop();
  return `${splitUrl[0]}raw/${fileName}`;
};

export const createGist = async (file: File, token: string) => {
  const base64String = await new Promise<string>((res, rej) => {
    /// https://stackoverflow.com/a/20285053
    const reader = new FileReader();

    reader.onload = () => {
      const result = reader.result;

      if (!result)
        return rej(new Error(`Unable to convert ${file.name} to base64 string`));

      res((typeof result !== "string" ? result.toString() : result).split(",")[1]);
    };

    reader.onerror = e => rej(e);

    reader.readAsDataURL(file);
  });

  // https://docs.github.com/en/rest/gists/gists?apiVersion=2022-11-28#create-a-gist
  const response = await requestUrl({
    url: "https://api.github.com/gists",
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28"
    },
    body: JSON.stringify({
      public: false,
      files: { [file.name]: { content: base64String } }
    })
  });

  return response.json as GistPostApiRes;
};

// https://stackoverflow.com/a/43828391
export const markdownImgTagRegex = /!\[(.*?)\]\((.*?)\)/g;

// https://chatgpt.com/share/1732e9c3-c335-44a8-b3d5-a9e61c24b378

const altAndSrcRegex = /!\[(.*?)\]\((.*?)\)/;

export const extractAltAndSrcFromMarkdownImg = (markdownImg: string) => {
  const matchedGroup = markdownImg.match(altAndSrcRegex);
  return matchedGroup ? { alt: matchedGroup[1], src: matchedGroup[2] } : null;
};
