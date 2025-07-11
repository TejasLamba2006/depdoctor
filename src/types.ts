export interface PackageInfo {
  name: string;
  current: string;
  latest: string;
  type: "patch" | "minor" | "major";
  canUpdate: boolean;
}

export interface CliOptions {
  major: boolean;
  update: boolean;
  dryRun: boolean;
  ignore: string[];
  json: boolean;
}

export interface PackageJson {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
}

export interface UpdateReport {
  updates: PackageInfo[];
  ignored: string[];
  errors: string[];
}

export type PackageManager = "npm" | "yarn" | "pnpm" | "bun";
