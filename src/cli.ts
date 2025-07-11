#!/usr/bin/env node

import { Command } from "commander";
import { checkDependencies } from "./checker";
import { updatePackages } from "./updater";
import { formatTable } from "./utils";
import { CliOptions } from "./types";

const program = new Command();

program
  .name("depdoctor")
  .description("Check and update package dependencies")
  .version("1.0.0")
  .option("--major", "include major version upgrades", false)
  .option("--update", "install the updated packages", false)
  .option(
    "--dry-run",
    "show what would change without modifying anything",
    false
  )
  .option(
    "--ignore <packages>",
    "comma-separated list of packages to ignore",
    ""
  )
  .option("--json", "output report as JSON", false);

program.action(async (options) => {
  const cliOptions: CliOptions = {
    major: options.major,
    update: options.update,
    dryRun: options.dryRun,
    ignore: options.ignore
      ? options.ignore.split(",").map((s: string) => s.trim())
      : [],
    json: options.json,
  };

  try {
    const report = await checkDependencies(process.cwd(), cliOptions);

    if (cliOptions.json) {
      console.log(JSON.stringify(report, null, 2));
      return;
    }

    if (report.updates.length === 0) {
      console.log("All dependencies are up to date.");
      return;
    }

    const tableData = report.updates.map((update) => ({
      name: update.name,
      current: update.current,
      latest: update.latest,
      type: update.type,
    }));

    console.log(formatTable(tableData));

    if (report.errors.length > 0) {
      console.log("\nErrors:");
      report.errors.forEach((error) => console.log(`  ${error}`));
    }

    if (cliOptions.update && !cliOptions.dryRun) {
      console.log("\nUpdating packages...");
      await updatePackages(report.updates, process.cwd());
    } else if (cliOptions.dryRun) {
      console.log("\nDry run: no packages were updated.");
    }
  } catch (error) {
    console.error(
      `Error: ${error instanceof Error ? error.message : "Unknown error"}`
    );
    process.exit(1);
  }
});

program.parse();
