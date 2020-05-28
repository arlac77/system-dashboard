import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { setup } from "./system-dashboard.mjs";
import { StandaloneServiceProvider } from "@kronos-integration/service";

const { version, description } = JSON.parse(
  readFileSync(
    join(dirname(fileURLToPath(import.meta.url)), "..", "package.json"),
    { encoding: "utf8" }
  )
);

const args = process.argv.slice(2);

switch (args[0]) {
  case "--version":
    console.log(version);
    process.exit(0);
  case "--help":
  case "-h":
    console.log(`${description} (${version})
usage:
 -h --help this help screen
 -c --config <directory> set config directory`);
    process.exit(0);
    break;

  case "--config":
  case "-c":
    process.env.CONFIGURATION_DIRECTORY = args[1];
    break;
}

async function initialize() {
  try {
    try {
      const m = await import("@kronos-integration/service-systemd");
      setup(new m.default());
    } catch (e) {
      const config = JSON.parse(
        readFileSync(join(args[1], "config.json"), { encoding: "utf8" })
      );

      setup(new StandaloneServiceProvider(config));
    }
  } catch (error) {
    console.log(error);
  }
}

initialize();
