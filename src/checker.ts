import * as semver from "semver";
import { PackageInfo, CliOptions, UpdateReport } from "./types";
import { readPackageJson, fetchPackageInfo, cleanVersion } from "./utils";

export const checkDependencies = async (
  cwd: string,
  options: CliOptions
): Promise<UpdateReport> => {
  const packageJson = await readPackageJson(cwd);
  const allDeps = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies,
  };

  const updates: PackageInfo[] = [];
  const ignored: string[] = [];
  const errors: string[] = [];

  const ignoreSet = new Set(options.ignore);

  for (const [name, version] of Object.entries(allDeps || {})) {
    if (ignoreSet.has(name)) {
      ignored.push(name);
      continue;
    }

    try {
      const packageInfo = await fetchPackageInfo(name);
      const currentVersion = cleanVersion(version);
      const latestVersion = packageInfo["dist-tags"]?.latest;

      if (!latestVersion) {
        errors.push(`No latest version found for ${name}`);
        continue;
      }

      if (!semver.valid(currentVersion) || !semver.valid(latestVersion)) {
        errors.push(`Invalid version format for ${name}`);
        continue;
      }

      if (semver.gt(latestVersion, currentVersion)) {
        const diff = semver.diff(currentVersion, latestVersion);
        const updateType =
          diff === "major" ? "major" : diff === "minor" ? "minor" : "patch";

        const canUpdate = options.major || updateType !== "major";

        if (canUpdate) {
          updates.push({
            name,
            current: currentVersion,
            latest: latestVersion,
            type: updateType,
            canUpdate: true,
          });
        }
      }
    } catch (error) {
      errors.push(
        `Failed to check ${name}: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  return { updates, ignored, errors };
};
