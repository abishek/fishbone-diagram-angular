# Publishing to npm

This project builds the library separately from the demo. A library release supports an Angular range by compiling with the oldest Angular major in that range and declaring peer dependencies through the newest tested major.

## Prerequisites

1. Use a Node version supported by the compiler you are building with. The GitHub workflow selects this automatically; locally, use Node 16 for Angular 13-16, Node 20 for Angular 17-19, and Node 22 for Angular 20-21.
2. Sign in to [npmjs.com](https://www.npmjs.com/) and make sure you have publish access to `ngx-fishbone-diagram`.
3. For automated publishing, configure npm trusted publishing for the `abishek/fishbone-diagram-angular` repository and the `publish-library.yml` workflow. The workflow uses OpenID Connect and does not require `npm login` or an `NPM_TOKEN` secret.

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

Use this only when npm trusted publishing is not configured, or for the initial package publication.

```sh
npm login
npm publish artifacts/angular-13-16/*.tgz --tag latest --provenance
```

`npm login` is interactive and should never be scripted or committed. `latest` should point to the release you want new consumers to receive. An older maintained compatibility range can use a named tag, such as `angular-13-16`:

```sh
npm publish artifacts/angular-13-16/*.tgz --tag angular-13-16 --provenance
```

## Publish with GitHub Actions

1. Push the release commit to GitHub.
2. Open **Actions**, select **Publish Angular library**, then select **Run workflow**.
3. Enter `13` as the minimum Angular major, `16` as the maximum, `0.5.1` as the npm version, and `latest` as the tag.
4. Run the workflow. It builds the tarball in an isolated workspace and publishes it with npm provenance.

Do not reuse a version number: npm package versions are immutable. To correct a published package, release a new patch version such as `0.5.2`.

## Build and deploy the demo site

The demo is maintained on the `angular-16` branch, independently of the library release builds on `main`. GitHub Pages must be configured in the repository's **Settings > Pages** to deploy from the `angular-16` branch and the `/docs` folder.

Build and publish a demo change from a clean working tree:

```sh
git fetch origin
git switch angular-16
git pull --ff-only origin angular-16
npm ci
npm run build
git add docs
git commit -m "Deploy demo site"
git push origin angular-16
git switch main
```

The production build writes the static site to `docs/`. Pushing the resulting `docs` changes to `angular-16` triggers the GitHub Pages deployment at `https://abishek.github.io/fishbone-diagram-angular/`.

Do not build the demo on `main`: `main` is the library release branch, while the Pages branch retains the Angular version used by the hosted demo. When the demo is upgraded to a newer Angular major, migrate the Pages branch deliberately and keep its production `outputPath` set to `docs/`.

## Add a future Angular major

When a new Angular release is available, add its compiler-compatible TypeScript version to `angularVersions` in [scripts/build-library.mjs](scripts/build-library.mjs), add the major to both workflow inputs in [.github/workflows/publish-library.yml](.github/workflows/publish-library.yml), then build and test a package before widening a published peer range.