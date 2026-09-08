# Publishing to npm

This project builds the library separately from the demo. A library release supports an Angular range by compiling with the oldest Angular major in that range and declaring peer dependencies through the newest tested major.

## Prerequisites

1. Use a Node version supported by the compiler you are building with. The GitHub workflow selects this automatically; locally, use Node 16 for Angular 13-16, Node 20 for Angular 17-19, and Node 22 for Angular 20-21.
2. Sign in to [npmjs.com](https://www.npmjs.com/) and make sure you have publish access to `ngx-fishbone-diagram`.
3. For automated publishing, configure npm trusted publishing for the `abishek/fishbone-diagram-angular` repository and the `publish-library.yml` workflow. Allow direct `npm publish` when configuring the trusted publisher. The workflow uses OpenID Connect and does not require `npm login` or an `NPM_TOKEN` secret.

## Release plan

Choose a new, never-published npm version and a tested Angular range. For example:

| Package version | Compiles with | Peer dependency range | Supported Angular |
| --- | --- | --- | --- |
| `0.5.1` | 13 | `>=13.0.0 <17.0.0` | 13-16 |
| `0.5.2` | 17 | `>=17.0.0 <20.0.0` | 17-19 |
| `0.5.3` | 20 | `>=20.0.0 <22.0.0` | 20-21 |

Before publishing, test the generated package in each Angular major you claim to support. The oldest major is the compiler target; the highest major only controls the declared peer range.

## Build locally

Build version `0.5.1` for Angular 13 through 16:

```sh
npm run build:library -- \
  --angular-min 13 \
  --angular-max 16 \
  --version 0.5.1
```

The publishable tarball is created at:

```text
artifacts/angular-13-16/ngx-fishbone-diagram-0.5.1.tgz
```

Inspect it before publishing:

```sh
npm pack --dry-run artifacts/angular-13-16/*.tgz
```

## Publish locally

Use this only when npm trusted publishing is not configured, or for the initial package publication. Create an npm granular access token with **Read and write** permission for `ngx-fishbone-diagram`, then store it in your local shell as `NPM_TOKEN`. Do not commit the token or pass it on a command line.

```sh
export NPM_TOKEN="your-npm-granular-automation-token"
npm run publish:library -- \
  --angular-min 13 \
  --angular-max 16 \
  --version 0.5.1 \
  --tag latest
```

The script builds the package, publishes it with the supplied tag, and then adds the release to the compatibility table in [README.md](README.md). Local token publishing cannot generate npm provenance because provenance is available only from a supported CI provider such as GitHub Actions. Commit and push the README update after a successful publication:

```sh
git add README.md
git commit -m "Document ngx-fishbone-diagram 0.5.1"
git push origin main
```

`latest` should point to the release you want new consumers to receive. A named tag, such as `ng16` or `angular-13-16`, is an independent install selector: `npm install ngx-fishbone-diagram@ng16` resolves to the version published under that tag. Use a new patch version for every publication because npm package versions are immutable.

## Publish with GitHub Actions

1. Push the release commit to GitHub.
2. Open **Actions**, select **Publish Angular library**, then select **Run workflow**.
3. Enter `13` as the minimum Angular major, `16` as the maximum, `0.5.1` as the npm version, and `latest` as the tag.
4. Run the workflow. It builds the tarball in an isolated workspace and publishes it with npm provenance, generated automatically by npm trusted publishing.

Do not reuse a version number: npm package versions are immutable. To correct a published package, release a new patch version such as `0.5.2`.

## Build and deploy the demo site

The demo source lives on `main` and may use the newest Angular version. The `deploy` branch contains only the generated static site served by GitHub Pages. Keep source code, library releases, and generated Pages output separate.

### One-time GitHub Pages setup

1. Create and push an empty `deploy` branch:

```sh
git switch --orphan deploy
git rm -rf .
git commit --allow-empty -m "Initialize GitHub Pages deployment branch"
git push -u origin deploy
git switch main
```

2. In the repository's **Settings > Pages**, select **Deploy from a branch**.
3. Select the `deploy` branch and the `/(root)` folder, then save.

Do not create the branch if it already exists. The first deployment command below will populate it.

### Deploy a demo update

Build the demo from `main`, then replace the contents of the `deploy` branch with the production output:

```sh
git fetch origin
git switch main
git pull --ff-only origin main
npm ci
npm run build
git switch deploy
git pull --ff-only origin deploy
git rm -rf .
git checkout main -- docs
mv docs/* .
rmdir docs
git add .
git commit -m "Deploy demo site"
git push origin deploy
git switch main
```

The production build writes the static site to `docs/`. The commands place its contents at the root of `deploy`, which triggers the GitHub Pages deployment at `https://abishek.github.io/fishbone-diagram-angular/`.

After verifying the `deploy`-branch site, the old `angular-16` branch can be deleted. Its important source changes were Angular 13-to-16 migration history and generated output; it should not be merged wholesale into `main`.

## Add a future Angular major

When a new Angular release is available, add its compiler-compatible TypeScript version to `angularVersions` in [scripts/build-library.mjs](scripts/build-library.mjs), add the major to both workflow inputs in [.github/workflows/publish-library.yml](.github/workflows/publish-library.yml), then build and test a package before widening a published peer range.