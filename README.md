# Obsidian Images to Gist plugin

This plugin uploads images as base64 strings to your GitHub account's secret Gists instead of storing them locally inside your vault. Also, allows you to resize uploaded images on the fly.

## Demo

https://gist.github.com/user-attachments/assets/ed86975d-a315-47f9-97a1-f9b1ba7913af

## Features

- **Upload to GitHub Secret Gists**: Store your images securely in your GitHub account, ensuring privacy and control.
- **Dynamic Image Resizing**: Resize uploaded images on the fly by adding `w` and `h` query parameters to the URL. Check out the [demo](https://github.com/singh-inder/obsidian-images-to-gist#demo) or read the [how to resize images](https://github.com/singh-inder/obsidian-images-to-gist/blob/main/docs/getting_started.md#resize) guide.
- **Full Control**: As the images are stored in your GitHub secret Gists, you have the ability to delete them at any time.
- **Flexible Upload Methods**: Easily upload images by pasting from the clipboard or dragging and dropping from your file system. Support for animated GIFs is also available through drag-and-drop.

## Installation

Install the plugin via the [Community Plugins](https://help.obsidian.md/Extending+Obsidian/Community+plugins) tab within Obsidian

## Getting Started

<!-- TODO: add youtube video url -->

<!-- Get up & running with [getting started video]() or if you prefer a written version [getting_started.md](/docs/getting_started.md) -->

Get up & running with [getting_started.md](https://github.com/singh-inder/obsidian-images-to-gist/blob/main/docs/getting_started.md)

## Plugin Settings

<!-- prettier-ignore -->
| Setting | Description |  |
|---|---|---|
| GitHub Token | Personal access token for GitHub to authenticate API requests. Learn [how to generate one](https://github.com/singh-inder/obsidian-images-to-gist/blob/main/docs/getting_started.md) | Required |
| Image Server URL | Server URL for decoding images uploaded to GitHub gist. You can continue to use the default [Images-to-gist-server](https://github.com/singh-inder/images-to-gist-server) (completely private & free) or provide your own. | Optional |
| Confirmation Before Upload | Prompt for confirmation before uploading an image. | Default=`false` |

## Rate Limits

- **GitHub API**: As the plugin uses GitHub API,be mindful of the [github api rate limits](https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api?apiVersion=2022-11-28#primary-rate-limit-for-authenticated-users).
- **Images-to-gist-server**: If you use the default free image server, you'll be rate limited to 30 requests per minute. You can deploy your own server using the [Images-to-gist-server repo](https://github.com/singh-inder/images-to-gist-server) and define your own rate limits.

## FAQ

<details>
<summary>How secure is this approach?</summary>
Your image uploaded to GitHub secret Gists cannot be seen unless you share a link or someone magically guesses the URL to your gist.
</details>

<br>

<details>
<summary>Why does the plugin use a separate server to fetch image data from GitHub Gists?</summary>

1. As the image is uploaded as base64 string, the response from GitHub Gist api is a base64 string. The client(Obsidian) makes a request to the image server and receives the decoded image from GitHub Gist api with the necessary `Content-Type` headers so that Obsidian can recognize the resource as an image. In layman terms, this ensures that images are displayed correctly within your notes.

2. Also, I don't have access to service workers in Obsidian which would enable me to do decode base64 strings directly inside Obsidian. If in the future, Obsidian team allows developers to use service workers, I'll add the functionality to handle this entire process directly inside Obsidian.
</details>

<br>

<details>
    <summary>Is there any logging or tracking of data as the plugin uses a separate server to serve images from GitHub Gists?</summary>
  
  - Nope, there is no logging or tracking of data. The [images-to-gist-server](https://github.com/singh-inder/images-to-gist-server) is open source, ensuring transparency and allowing users to review it for themselves. 
  - You can easily self host your own image server by simply forking the repo and deploying it on your platform of choice.
</details>

<br>

<details>
<summary>Will I have to manually update image server url for all existing images if I provide my own image server url after some time?</summary>
 
 - No, you won't have to manually update the image server url for all existing images. 
 - Simply open the command palette (`CTRL/CMD + P`) and search for `Update all image server urls.` This command will automatically update the image server url for all images in current file with the url you've entered in settings.
</details>

<br>

<details>    
<summary>Can I run the image server locally before I decide to deploy it?</summary>

- Absolutely, you can either use [Docker](https://github.com/singh-inder/images-to-gist-server?tab=readme-ov-file#run-locally-using-docker) or [Clone the Repo](https://github.com/singh-inder/images-to-gist-server?tab=readme-ov-file#run-locally-using-docker) and run it locally.

- Inside settings set your image server url to `http://localhost:5000` or whatever port you run the server on.
</details>

## Acknowledgments

- code for handling image paste, drag & drop functionality is adapted from [obsidian-imgur-plugin](https://github.com/obdevimgur/obsidian-imgur-plugin).
- hot reloads in dev environment with [hot-reload](https://github.com/pjeby/hot-reload)

## Support

If this plugin is helpful to you, you can show your ❤️ by giving it a star ⭐️ on GitHub.

This plugin along with the default image server are offered completely free of charge. If you'd like to help cover the costs of hosting the image server or fuel my late-night coding sessions with more coffee:

[<img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="BuyMeACoffee" width="150">](https://www.buymeacoffee.com/_inder1)
