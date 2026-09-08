import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const angularVersions = new Map([
  [13, '4.6.4'],
  [14, '4.8.4'],
  [15, '4.9.5'],
  [16, '5.1.6'],
  [17, '5.4.5'],
  [18, '5.5.4'],
  [19, '5.7.3'],
  [20, '5.9.3'],
  [21, '5.9.3']
]);

function getOption(name) {
  const index = process.argv.indexOf(name);
  return index === -1 ? undefined : process.argv[index + 1];
}

function run(command, argumentsList, options) {
  const result = spawnSync(command, argumentsList, {
    cwd: options.cwd,
    env: process.env,
    stdio: 'inherit'
  });

  if (result.status !== 0) {
    throw new Error(`${command} ${argumentsList.join(' ')} failed.`);
  }
}

const angularMinimum = Number(getOption('--angular-min'));
const angularMaximum = Number(getOption('--angular-max'));
const version = getOption('--version');
const outputDirectory = resolve(getOption('--output') ?? 'artifacts');
const typescriptVersion = angularVersions.get(angularMinimum);

if (!typescriptVersion || !version || angularMaximum < angularMinimum || angularMaximum > 21) {
  console.error('Usage: node scripts/build-library.mjs --angular-min <13-21> --angular-max <min-21> --version <npm-version> [--output <directory>]');
  process.exitCode = 1;
} else {
  const repositoryRoot = resolve('.');
  const stagingDirectory = await mkdtemp(join(tmpdir(), `ngx-fishbone-angular-${angularMinimum}-`));
  const libraryDirectory = join(stagingDirectory, 'library');

  try {
    await cp(join(repositoryRoot, 'projects/ngx-fishbone-diagram/src'), join(libraryDirectory, 'src'), { recursive: true });
    await cp(join(repositoryRoot, 'projects/ngx-fishbone-diagram/ng-package.json'), join(libraryDirectory, 'ng-package.json'));

    if (angularMinimum >= 19) {
      const componentPath = join(libraryDirectory, 'src/lib/ngx-fishbone-diagram.component.ts');
      const componentSource = await readFile(componentPath, 'utf8');
      await writeFile(componentPath, componentSource.replace(
        "  styleUrls: ['./ngx-fishbone-diagram.component.css']",
        "  styleUrls: ['./ngx-fishbone-diagram.component.css'],\n  standalone: false"
      ));
    }

    const libraryPackage = JSON.parse(
      await readFile(join(repositoryRoot, 'projects/ngx-fishbone-diagram/package.json'), 'utf8')
    );
    libraryPackage.version = version;
    libraryPackage.peerDependencies = {
      '@angular/common': `>=${angularMinimum}.0.0 <${angularMaximum + 1}.0.0`,
      '@angular/core': `>=${angularMinimum}.0.0 <${angularMaximum + 1}.0.0`
    };
    await writeFile(join(libraryDirectory, 'package.json'), `${JSON.stringify(libraryPackage, null, 2)}\n`);

    const buildPackage = {
      ...libraryPackage,
      private: true,
      overrides: {
        '@types/d3-dispatch': '3.0.5'
      },
      devDependencies: {
        '@angular/common': `^${angularMinimum}.0.0`,
        '@angular/compiler-cli': `^${angularMinimum}.0.0`,
        '@angular/core': `^${angularMinimum}.0.0`,
        '@types/d3': '^7.4.3',
        '@types/d3-force': '^3.0.10',
        '@types/d3-scale': '^4.0.9',
        '@types/node': '12.20.55',
        'ng-packagr': `^${angularMinimum}.0.0`,
        'typescript': typescriptVersion
      }
    };
    await writeFile(join(libraryDirectory, 'build-package.json'), `${JSON.stringify(buildPackage, null, 2)}\n`);
    await writeFile(join(libraryDirectory, 'tsconfig.lib.json'), `${JSON.stringify({
      compilerOptions: {
        target: 'es2017',
        declaration: true,
        declarationMap: true,
        inlineSources: true,
        moduleResolution: 'node',
        importHelpers: true,
        lib: ['dom', 'es2018'],
        types: [],
        noImplicitAny: false
      },
      angularCompilerOptions: {
        enableI18nLegacyMessageIdFormat: false
      },
      exclude: ['src/test.ts', '**/*.spec.ts']
    }, null, 2)}\n`);
    await writeFile(join(libraryDirectory, 'tsconfig.lib.prod.json'), `${JSON.stringify({
      extends: './tsconfig.lib.json',
      compilerOptions: { declarationMap: false },
      angularCompilerOptions: { compilationMode: 'partial' }
    }, null, 2)}\n`);

    await writeFile(join(libraryDirectory, 'package.json'), `${JSON.stringify(buildPackage, null, 2)}\n`);
    run('npm', ['install', '--no-audit', '--no-fund'], { cwd: libraryDirectory });
    await writeFile(join(libraryDirectory, 'package.json'), `${JSON.stringify(libraryPackage, null, 2)}\n`);
    run('npx', ['ng-packagr', '-p', 'ng-package.json'], { cwd: libraryDirectory });

    const artifactDirectory = join(outputDirectory, `angular-${angularMinimum}-${angularMaximum}`);
    await rm(artifactDirectory, { recursive: true, force: true });
    await mkdir(artifactDirectory, { recursive: true });
    run('npm', ['pack', join(dirname(stagingDirectory), 'dist/ngx-fishbone-diagram'), '--pack-destination', artifactDirectory], { cwd: libraryDirectory });
  } finally {
    await rm(stagingDirectory, { recursive: true, force: true });
  }
}