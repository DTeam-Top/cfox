import {createTable} from '@dteam/st2/dist/stringTable';
import * as argon2 from 'argon2';
import BigNumber from 'bignumber.js';
import {existsSync, mkdirSync} from 'fs';
import Vorpal from 'vorpal';
import {Context} from './cli/context';
import {LOGO, RESERVED_CHAINS} from './constant';
import {walletService} from './types/container';
import {Token} from './types/types';

export function showLogo() {
  console.log(LOGO);
}

export function should(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(message);
  }
}

export function getChalk(vorpal: Vorpal) {
  return (vorpal as any).chalk;
}

export async function passwordHash(password: string) {
  return argon2.hash(password, {type: argon2.argon2id});
}

export async function verifyPassword(hash: string, password: string) {
  return argon2.verify(hash, password);
}

// this is a workaround for import esm when running tests
// without this function, it will fail with errors below
//   Error {
//   code: 'ERR_REQUIRE_ESM',
//   message: `require() of ES Module .../node_modules/ora/index.js from ../commons.ts not supported.
//   Instead change the require of index.js in ../commons.ts to a dynamic import() which is available in all CommonJS modules.`,
// }
export async function dynamicImportOraPromise() {
  return process.env.NODE_ENV === 'test'
    ? fnForTestingRunning
    : (await import('ora')).oraPromise;
}

async function fnForTestingRunning<T>(action: Promise<T>): Promise<T> {
  return Promise.resolve(action);
}

export function isEmpty(obj: any) {
  return Array.isArray(obj) ? !obj.length : !Object.keys(obj).length;
}

export function toHttpUrl(url: string) {
  return url.startsWith('ipfs://')
    ? url.replace('ipfs://', 'https://ipfs.io/ipfs/')
    : url;
}

export function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function log(vorpal: Vorpal, data: any) {
  if (!data || !Array.isArray(data) || !data.length) {
    return;
  }

  const hasComplexValue = data.some(item =>
    Object.values(item).some(value => !!value && typeof value === 'object')
  );

  const options: any = {
    typeFormatters: {
      number: function (value: number) {
        return getChalk(vorpal).blue(value);
      },
      boolean: function (value: boolean) {
        return value ? '√' : 'X';
      },
      string: function (value: string) {
        if (value.startsWith('0x') || value.startsWith('0X')) {
          return value;
        }
        const result = Number(value);
        return result || result === 0 ? getChalk(vorpal).blue(value) : value;
      },
    },
  };

  if (hasComplexValue) {
    options['rowSeparator'] = '-';
    options['headers'] = Object.keys(data[0]).sort((a, b) => {
      if (typeof data[0][a] === 'object') {
        return 1;
      } else if (typeof data[0][b] === 'object') {
        return -1;
      } else {
        return a.localeCompare(b);
      }
    });
  }

  const output = `\n${createTable(data, options)}\n`;

  vorpal.log(output);
}

export function error(vorpal: Vorpal, message: string) {
  const chalk = getChalk(vorpal);
  vorpal.log(chalk.red(message));
}

export function success(vorpal: Vorpal, message: string) {
  const chalk = getChalk(vorpal);
  vorpal.log(chalk.green(message));
}

export function isReserved(chain: number) {
  return RESERVED_CHAINS.includes(chain);
}

export async function confirmIt(vorpal: Vorpal, data: any, message: string) {
  if (Array.isArray(data)) {
    log(vorpal, data);
  } else {
    log(vorpal, [data]);
  }

  return (
    await vorpal.activeCommand.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message,
      },
    ])
  ).confirm;
}

export async function hasEnoughBalance(
  amount: string,
  context: Context,
  token?: Token
) {
  if (token) {
    const balance = await walletService().balanceOfTokens(
      context.getWallet()!,
      [token]
    );
    return new BigNumber(balance[0].balance).gt(amount);
  } else {
    const balance = await walletService().balanceOfCoin(
      context.getWallet()!,
      context.getCurrentNetwork().coin
    );

    return new BigNumber(balance[0].balance).gt(amount);
  }
}

export async function setGasPrice(vorpal: Vorpal, prices: string[]) {
  return (
    await vorpal.activeCommand.prompt([
      {
        type: 'list',
        name: 'price',
        message: 'Please select the gas price (gwei):',
        choices: prices,
      },
    ])
  ).price;
}

export function createPathIfNotExisting(path: string) {
  if (!existsSync(path)) {
    mkdirSync(path);
  }
}
