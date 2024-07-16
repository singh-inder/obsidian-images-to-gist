# Changelog

All notable changes to this project will be documented in this file. See [commit-and-tag-version](https://github.com/absolute-version/commit-and-tag-version) for commit guidelines.

## [1.0.0](https://github.com/singh-inder/obsidian-images-to-gist/compare/0.5.1...1.0.0) (2024-07-16)

### Features

- update deps ([5281400](https://github.com/singh-inder/obsidian-images-to-gist/commit/52814004a3bf276706def6da0fb75e573b107db3))

## [0.5.1](https://github.com/singh-inder/obsidian-images-to-gist/compare/0.5.0...0.5.1) (2024-07-15)

### Bug Fixes

- **release.yaml:** update permissions ([581f7e3](https://github.com/singh-inder/obsidian-images-to-gist/commit/581f7e3eb47febd6c9b21e2f4d62ca0159847e2c))

## [0.5.0](https://github.com/singh-inder/obsidian-images-to-gist/compare/0.4.0...0.5.0) (2024-07-15)

### ⚠ BREAKING CHANGES

- - remove dotenv dependency

### Features

- update manifest.json, versions.json ([828f83e](https://github.com/singh-inder/obsidian-images-to-gist/commit/828f83eafe5dcdddfae4ba9776efb26b0e766f30))
- add release workflow ([dc91886](https://github.com/singh-inder/obsidian-images-to-gist/commit/dc91886e6bff5702db3b0cf983ab31d14afd34e3))
- **SettingsTab:** update urls ([4c01bb8](https://github.com/singh-inder/obsidian-images-to-gist/commit/4c01bb82a4fd99f36571c343859dafab3d905cd5))
- add parseEnv func ([52c2dba](https://github.com/singh-inder/obsidian-images-to-gist/commit/52c2dba50189c127b9d403ecd2a80fca95c7d0c6))

## [0.4.0](https://github.com/singh-inder/images-from-gist/compare/0.3.0...0.4.0) (2024-06-26)

### ⚠ BREAKING CHANGES

- **SettingsTab:** - no longer generate a separate fileId based on randomId setting

* no longer encode gist uri

### Features

- **SettingsTab:** remove randomId setting ([404551b](https://github.com/singh-inder/images-from-gist/commit/404551b7033b28ffc2321a5d946aa4521e7e5555))

## [0.3.0](https://github.com/singhinder2/images-from-gist/compare/0.2.0...0.3.0) (2024-06-21)

### ⚠ BREAKING CHANGES

- **main.ts:** commit hash removed from the gist url. this will result in always using the gist's latest commit and reduce the length of url

### Features

- register command to update server urls for all images in the file ([5153dc8](https://github.com/singhinder2/images-from-gist/commit/5153dc836f39016ce4af60599d2259a141764290))
- **main.ts:** handle canvas paste event ([8a5c855](https://github.com/singhinder2/images-from-gist/commit/8a5c855e399b22804bade2b94895fe8964ff9860))
- **main.ts:** encode gist url ([a4fc655](https://github.com/singhinder2/images-from-gist/commit/a4fc65553d8b3a81be3e4ff19cadd2cb47a3a917))
- **ImagesFromGistSettingsTab:** update github token setting description ([248a7ca](https://github.com/singhinder2/images-from-gist/commit/248a7ca8d5c5a80514a3adbd59cee47df6ad67c5))

### Bug Fixes

- **utils:** remove extra forward slash in removeCommitHash return value ([547d6df](https://github.com/singhinder2/images-from-gist/commit/547d6dfa854f81fd415501f5a042d31835cd4134))

## [0.2.0](https://github.com/inderrr/images-from-gist/compare/0.1.0...0.2.0) (2024-06-19)

### Features

- **main.ts:** add upload method ([c372556](https://github.com/inderrr/images-from-gist/commit/c372556e987e9554d2f1e7dd8d70fea0e5a7b6af))
- **ImagesFromGistSettingsTab:** update random id setting description ([ca7e4c4](https://github.com/inderrr/images-from-gist/commit/ca7e4c4d0cfd08f80b246ebf44d0e003ff170520))
- **main.ts:** handle editor-drop event ([3d91bef](https://github.com/inderrr/images-from-gist/commit/3d91bef7da0b6c419654501880f63a6489a70b79))
- **main.ts:** create gist, render confirmation modal ([bbd4d7c](https://github.com/inderrr/images-from-gist/commit/bbd4d7cda16d72e5314bac4eaf813023e8c34f4c))
- **main.ts:** handle paste event ([decc9c5](https://github.com/inderrr/images-from-gist/commit/decc9c589e67d0c965cbf663abadc6331d60e1ae))
- **main.ts:** loadEnvVars only when Platform is not mobile ([2a001e1](https://github.com/inderrr/images-from-gist/commit/2a001e1386d94ea6198716d9549137b3cc80e72c))
- **ImagesFromGistSettingsTab:** create/modify .env file directly ([eb15b26](https://github.com/inderrr/images-from-gist/commit/eb15b26cb9bba8c43db447daff1019594b7b77ce))
- **ImagesFromGistSettingsTab:** add random id toggle ([88f8177](https://github.com/inderrr/images-from-gist/commit/88f81770a632507f426ce332deb94115692da4d9))
- **main.ts:** check for serverUrl in settings onload ([af278e6](https://github.com/inderrr/images-from-gist/commit/af278e6f6baf52b30af7ce268b7be9eb56b45549))
- **ImagesFromGistSettingsTab:** set githubToken input type to password ([9674141](https://github.com/inderrr/images-from-gist/commit/967414190435186143e36232cae8529a42b0faca))
- **ImagesFromGistSettingsTab:** add new settings ([4a797ca](https://github.com/inderrr/images-from-gist/commit/4a797caec650f1965c07d8c0a3d602c804cebfa1))
- **ImagesFromGistSettingsTab:** check if token is loaded from env ([2f6c0f3](https://github.com/inderrr/images-from-gist/commit/2f6c0f3e3e34588b154698a7d66943fe0db11c45))
- create ImagesFromGistSettingsTab.ts ([cbb0a68](https://github.com/inderrr/images-from-gist/commit/cbb0a687fabc3d8314122e4b796628eb49d493ac))
- **main.ts:** load env vars ([bef3734](https://github.com/inderrr/images-from-gist/commit/bef373487775c9357f2b5f705e87d15f698269fd))

### Bug Fixes

- **main.ts:** await for modal response ([d9592c0](https://github.com/inderrr/images-from-gist/commit/d9592c072e8a86bc06e0be1df42d97b29c0fa705))

## 0.1.0 (2024-06-17)

### Features

- add commit-and-tag-version ([1bb7e72](https://github.com/inderrr/images-from-gist/commit/1bb7e72cd73a2f4d78f21843b90062f43ea28e43))
- initial project setup ([a279ffe](https://github.com/inderrr/images-from-gist/commit/a279ffe0349536985b27ba9c295213dd98a8b841))
