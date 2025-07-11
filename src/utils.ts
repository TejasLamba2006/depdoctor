import { promises as fs } from "fs";
import { join } from "path";
import { get } from "https";
import { PackageJson, PackageManager } from "./types";

export const readPackageJson = async (cwd: string): Promise<PackageJson> => {
  const packagePath = join(cwd, "package.json");

  try {
    const content = await fs.readFile(packagePath, "utf-8");
    return JSON.parse(content);
  } catch {
    throw new Error("package.json not found in current directory");
  }
};

export const fetchPackageInfo = async (packageName: string): Promise<any> => {
  const url = `https://registry.npmjs.org/${packageName}`;

  return new Promise((resolve, reject) => {
    get(url, (res) => {
      let data = "";

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        try {
          const parsed = JSON.parse(data);
          resolve(parsed);
        } catch {
          reject(new Error(`Failed to parse response for ${packageName}`));
        }
      });
    }).on("error", (error) => {
      reject(new Error(`Failed to fetch ${packageName}: ${error.message}`));
    });
  });
};

export const cleanVersion = (version: string): string => {
  return version.replace(/^[\^~]/, "");
};

export const formatTable = (
  data: Array<{ name: string; current: string; latest: string; type: string }>
): string => {
  if (data.length === 0) return "No updates available.";

  const maxNameLength = Math.max(...data.map((d) => d.name.length), 4);
  const maxCurrentLength = Math.max(...data.map((d) => d.current.length), 7);
  const maxLatestLength = Math.max(...data.map((d) => d.latest.length), 6);

  const header = `${"Name".padEnd(maxNameLength)} ${"Current".padEnd(
    maxCurrentLength
  )} ${"Latest".padEnd(maxLatestLength)} Type`;
  const separator = "-".repeat(header.length);

  const rows = data.map(
    (d) =>
      `${d.name.padEnd(maxNameLength)} ${d.current.padEnd(
        maxCurrentLength
      )} ${d.latest.padEnd(maxLatestLength)} ${d.type}`
  );

  return [header, separator, ...rows].join("\n");
};

export const detectPackageManager = async (
  cwd: string
): Promise<PackageManager> => {
  const lockFiles: Array<{ file: string; manager: PackageManager }> = [
    { file: "bun.lockb", manager: "bun" },
    { file: "pnpm-lock.yaml", manager: "pnpm" },
    { file: "yarn.lock", manager: "yarn" },
    { file: "package-lock.json", manager: "npm" },
  ];

  for (const { file, manager } of lockFiles) {
    try {
      await fs.access(join(cwd, file));
      return manager;
    } catch {
      continue;
    }
  }

  return "npm";
};
