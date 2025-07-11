import { exec } from "child_process";
import { promisify } from "util";
import { PackageInfo, PackageManager } from "./types";
import { detectPackageManager } from "./utils";

const execAsync = promisify(exec);

const getInstallCommand = (
  packageManager: PackageManager,
  packages: PackageInfo[]
): string => {
  const packageNames = packages
    .map((pkg) => `${pkg.name}@${pkg.latest}`)
    .join(" ");

  switch (packageManager) {
    case "yarn":
      return `yarn add ${packageNames}`;
    case "pnpm":
      return `pnpm add ${packageNames}`;
    case "bun":
      return `bun add ${packageNames}`;
    case "npm":
    default:
      return `npm install ${packageNames}`;
  }
};

export const updatePackages = async (
  packages: PackageInfo[],
  cwd: string
): Promise<void> => {
  if (packages.length === 0) {
    return;
  }

  const packageManager = await detectPackageManager(cwd);
  const command = getInstallCommand(packageManager, packages);

  try {
    await execAsync(command, { cwd });
    console.log(
      `Updated ${packages.length} package(s) using ${packageManager}`
    );
  } catch (error) {
    throw new Error(
      `Failed to update packages: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};
