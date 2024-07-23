import fs from "node:fs";
import path from "node:path";
import { confirm, input } from "@inquirer/prompts";

const root = path.resolve(import.meta.dirname, "../");

const resolveRootFilePath = fileName => path.resolve(root, fileName);

const readAndParseFile = filePath => {
  return JSON.parse(fs.readFileSync(filePath, { encoding: "utf-8" }));
};

const main = async () => {
  const targetVersion = process.env.npm_package_version;
  if (!targetVersion) {
    console.log("No target version");
    process.exit(1);
  }

  const versionVerified = await confirm({
    message: `Is this the correct package.json version: ${targetVersion}`,
    default: true
  });

  // non zero code so that process exits with error & next cmd is not run
  if (!versionVerified) process.exit(1);

  const manifestFilePath = resolveRootFilePath("manifest.json");
  const manifestJson = readAndParseFile(manifestFilePath);

  let minAppVersion = manifestJson.minAppVersion;

  const updateMinAppVersion = await confirm({
    message: `Do you want to update the obsidian minAppVersion ${minAppVersion} for this release:`,
    default: false
  });

  if (updateMinAppVersion) {
    minAppVersion = await input({
      message: `Enter obsidian minAppVersion for release ${targetVersion}:`,
      required: true,
      validate: val => val.trim().length > 0
    });
  }

  manifestJson.version = targetVersion;
  manifestJson.minAppVersion = minAppVersion;

  const versionsFilePath = resolveRootFilePath("versions.json");
  const versionsJson = readAndParseFile(versionsFilePath);

  versionsJson[targetVersion] = minAppVersion;

  const writeFile = (filePath, content) => {
    return fs.promises.writeFile(filePath, JSON.stringify(content, null, 2));
  };

  await Promise.all([
    writeFile(manifestFilePath, manifestJson),
    writeFile(versionsFilePath, versionsJson)
  ]);
};

main();
