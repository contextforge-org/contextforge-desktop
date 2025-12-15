import { execSync } from 'child_process';
import { join } from 'path';
import fs from 'fs';
import os from 'os';
import type { ForgeConfig } from '@electron-forge/shared-types';
import { MakerSquirrel } from '@electron-forge/maker-squirrel';
import { MakerZIP } from '@electron-forge/maker-zip';
import { MakerDeb } from '@electron-forge/maker-deb';
import { MakerRpm } from '@electron-forge/maker-rpm';
import { VitePlugin } from '@electron-forge/plugin-vite';
import { FusesPlugin } from '@electron-forge/plugin-fuses';
import { FuseV1Options, FuseVersion } from '@electron/fuses';

const config: ForgeConfig = {
  hooks: {
    prePackage: async (forgeConfig, platform, arch) => {
      console.log(`[PrePackage Hook] Building cforge binary ${platform}-${arch}...`);
      try {

        // Get the user data location for the default home
        const appName = JSON.parse(fs.readFileSync('package.json', 'utf-8')).name;
        let userData: string | undefined;
        let buildScript: string = 'build.sh';
        if (platform === 'darwin') {
          userData = join(os.homedir(), 'Library', 'Application Support');
        } else if (platform === 'linux') {
          userData = process.env.XDG_CONFIG_HOME || join(os.homedir(), '.config');
        } else if (platform === 'win32') {
          userData = process.env.APPDATA;
          buildScript = 'build.bat';
        }
        if (userData === undefined) {
          throw new Error(`Unable to determine user data directory on ${platform}-${arch}`);
        }
        const appUserData: string = join(userData, appName);

        // Run the build script
        const buildScriptPath = join(process.cwd(), 'python', buildScript);
        const envCopy = { ...process.env };
        envCopy.DEFAULT_HOME_DIR = join(appUserData, '.contextforge');
        execSync(buildScriptPath, {stdio: 'inherit', env: envCopy});

        console.log('[PrePackage Hook] Backend binary generated successfully.');

      } catch (error) {
        console.error('[PrePackage Hook] Error generating Backend binary:', error);
        throw new Error('Backend binary generation failed. Aborting package step.');
      }
    }
  },
  packagerConfig: {
    asar: true,
    icon: './assets/icons/tray/icon',
    extraResource: [
      './assets',
      './python/dist/cforge',
    ],
  },
  rebuildConfig: {},
  makers: [
    new MakerSquirrel({}),
    new MakerZIP({}, ['darwin']),
    new MakerRpm({}),
    new MakerDeb({}),
  ],
  plugins: [
    new VitePlugin({
      // `build` can specify multiple entry builds, which can be Main process, Preload scripts, Worker process, etc.
      // If you are familiar with Vite configuration, it will look really familiar.
      build: [
        {
          // `entry` is just an alias for `build.lib.entry` in the corresponding file of `config`.
          entry: 'src/main.ts',
          config: 'vite.main.config.ts',
          target: 'main',
        },
        {
          entry: 'src/preload.ts',
          config: 'vite.preload.config.ts',
          target: 'preload',
        },
      ],
      renderer: [
        {
          name: 'main_window',
          config: 'vite.renderer.config.ts',
        },
      ],
    }),
    // Fuses are used to enable/disable various Electron functionality
    // at package time, before code signing the application
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],
};

export default config;
