# depdoctor

A CLI tool that scans your project's dependencies and reports which ones can be safely updated.

## Installation

Install globally:

```bash
npm install -g depdoctor
```

Or use with npx (no installation required):

```bash
npx depdoctor
```

## Usage

Run in your project directory:

```bash
depdoctor
```

This will scan your `package.json` and show available updates for dependencies and devDependencies.

### Options

- `--major` - Include major version upgrades (breaking changes)
- `--update` - Actually install the updated packages
- `--dry-run` - Show what would change without modifying anything
- `--ignore <packages>` - Comma-separated list of packages to ignore
- `--json` - Output report as JSON

### Examples

Check for non-breaking updates only:

```bash
depdoctor
```

Include major version updates:

```bash
depdoctor --major
```

Update packages automatically:

```bash
depdoctor --update
```

Ignore specific packages:

```bash
depdoctor --ignore "react,lodash"
```

Get JSON output:

```bash
depdoctor --json
```

Dry run with major updates:

```bash
depdoctor --major --dry-run
```

## How it works

depdoctor reads your `package.json`, queries the npm registry for each dependency's latest version, compares them using semantic versioning, and reports:

- Current version
- Latest available version  
- Update type (patch/minor/major)

By default, only patch and minor updates are shown since they shouldn't contain breaking changes. Use `--major` to see major updates too.

### Package Manager Detection

When using `--update`, depdoctor automatically detects your package manager based on lockfiles:

- `bun.lockb` → uses `bun add`
- `pnpm-lock.yaml` → uses `pnpm add`  
- `yarn.lock` → uses `yarn add`
- `package-lock.json` → uses `npm install`
- No lockfile found → defaults to `npm install`

This ensures updates work correctly regardless of which package manager your project uses.

## Requirements

- Node.js 14 or higher
- Your package manager of choice (npm, yarn, pnpm, or bun)

## License

MIT
