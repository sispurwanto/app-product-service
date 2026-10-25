import { spawn, SpawnOptionsWithoutStdio } from 'child_process';
import chalk from 'chalk';
import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';

type CommandResult = {
  code: number | null;
  output: string;
};

type Env = 'dev' | 'prod';

const envToConfig = {
  dev: 'development',
  prod: 'production',
};

// Helper to run commands
function runCommand(command: string, args: string[], options: SpawnOptionsWithoutStdio = {}): Promise<CommandResult> {
  return new Promise<CommandResult>((resolve, reject) => {
    const proc = spawn(command, args, { stdio: 'pipe', shell: true, ...options });
    let output = '';

    proc.stdout?.on('data', (data: Buffer) => {
      output += data.toString();
      process.stdout.write(data);
    });

    proc.stderr?.on('data', (data: Buffer) => {
      output += data.toString();
      process.stderr.write(data);
    });

    proc.on('close', (code: number | null) => {
      resolve({ code, output });
    });

    proc.on('error', (error: Error) => {
      reject(new Error(`Error executing ${command}: ${error.message}`));
    });
  });
}

// Build the application for the specified environment
async function buildApp(env: Env) {
  const { code, output } = await runCommand('ng', ['build', '--configuration', envToConfig[env]]);
  if (code !== 0) {
    throw new Error(`ng build exited with code ${code}\n${output}`);
  }
}

// Check Firebase version
async function checkFirebaseVersion() {
  const { code, output } = await runCommand('firebase', ['--version']);
  if (code !== 0) {
    throw new Error(`firebase --version exited with code ${code}\n${output}`);
  } else {
    console.log(chalk.black.bgGreen(`firebase version: ${output.trim()}`));
  }
}

// Switch Firebase project
async function switchFirebaseProject(env: Env) {
  const { code, output } = await runCommand('firebase', ['use', env]);
  if (code !== 0) {
    if (output.includes('Invalid project selection')) {
      console.log(
        chalk.black.bgYellow(
          `[Peringatan] Project alias "${env}" tidak ditemukan di akun Firebase yang sedang aktif.`
        )
      );
      console.log(
        chalk.yellow(
          `Silakan pastikan akun Google yang Anda gunakan untuk login Firebase memiliki akses ke project tersebut, atau periksa file .firebaserc.`
        )
      );
    }
    throw new Error(`firebase use ${env} exited with code ${code}\n${output}`);
  }
}

// Deploy to Firebase
async function deployFirebase(env: Env) {
  const { code, output } = await runCommand('firebase', ['deploy', '--only', 'hosting']);
  if (code !== 0) {
    if (output.includes('Error: HTTP Error: 401')) {
      console.log(chalk.black.bgYellow('please try "firebase login --reauth"'));
    } else {
      throw new Error(`firebase deploy exited with code ${code}\n${output}`);
    }
  }
}

// Main function
async function main() {
  const argv = await yargs(hideBin(process.argv)).option('env', {
    type: 'string',
    default: 'dev',
    choices: ['dev', 'prod'],
    describe: 'The environment to deploy',
  }).argv;

  try {
    // Install packages
    const { code: installCode, output: installOutput } = await runCommand('npm', ['install', '--legacy-peer-deps']);
    if (installCode !== 0) {
      throw new Error(`npm install exited with code ${installCode}\n${installOutput}`);
    }

    // Build the app for the target environment
    await buildApp(argv.env as Env);
    await checkFirebaseVersion();
    await switchFirebaseProject(argv.env as Env);
    await deployFirebase(argv.env as Env);
  } catch (error) {
    console.error((error as Error).message);
    process.exit(1);
  }
}

main();
