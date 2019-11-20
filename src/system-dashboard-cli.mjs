import program from "commander";
import { version, description } from "../package.json";
import { StandaloneServiceProvider } from "@kronos-integration/service";
import { setup } from "./system-dashboard.mjs";

program
  .version(version)
  .description(description)
  .option("-c, --config <directory>", "use config from directory")
  .action(async () => {
    if (program.config) {
    }

    try {
      setup(new StandaloneServiceProvider());
    } catch (error) {
      console.log(error);
    }
  })
  .parse(process.argv);
