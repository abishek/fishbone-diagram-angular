import { mkdtemp, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

function getOption(name) {
  const index = process.argv.indexOf(name);
  return index === -1 ? undefined : process.argv[index + 1];
}

function run(command, argumentsList, options) {
  const result = spawnSync(command, argumentsList, {
    cwd: options.cwd,
    env: options.env ?? process.env,
    stdio: 'inherit'
  });

  if (result.status !== 0) {
    throw new Error(`${command} ${argumentsList.join(' ')} failed.`);
  }
}

const angularMinimum = getOption('--angular-min');
const angularMaximum = getOption('--angular-max');
const version = getOption('--version');
const tag = getOption('--tag');
const token = process.env.NPM_TOKEN ?? process.env.NODE_AUTH_TOKEN;

if (!angularMinimum || !angularMaximum || !version || !tag) {
  console.error('Usage: node scripts/publish-library.mjs --angular-min <13-21> --angular-max <min-21> --version <npm-version> --tag <npm-tag>');
  process.exitCode = 1;
} else if (!token) {
  console.error('Set NPM_TOKEN or NODE_AUTH_TOKEN to an npm granular automation token before publishing.');
  process.exitCode = 1;
} else {
  const repositoryRoot = resolve('.');
  const artifactDirectory = join(repositoryRoot, 'artifacts', `angular-${angularMinimum}-${angularMaximum}`);
  const npmConfigDirectory = await mkdtemp(join(tmpdir(), 'npm-publish-config-'));

  try {
    run(process.execPath, [
      'scripts/build-library.mjs',
      '--angular-min', angularMinimum,
      '--angular-max', angularMaximum,
      '--version', version,
      '--output', 'artifacts'
    ], { cwd: repositoryRoot });

    const tarball = (await readdir(artifactDirectory)).find((file) => file.endsWith('.tgz'));
    if (!tarball) {
      throw new Error(`No npm tarball was created in ${artifactDirectory}.`);
    }

    const npmConfigPath = join(npmConfigDirectory, '.npmrc');
    await writeFile(npmConfigPath, '//registry.npmjs.org/:_authToken=${NODE_AUTH_TOKEN}\n');
    run('npm', ['publish', join(artifactDirectory, tarball), '--tag', tag], {
      cwd: repositoryRoot,
      env: { ...process.env, NODE_AUTH_TOKEN: token, NPM_CONFIG_USERCONFIG: npmConfigPath }
    });
  } finally {
    await rm(npmConfigDirectory, { recursive: true, force: true });
  }
}