import Vorpal, {Args} from 'vorpal';
import {confirmIt, dynamicImportOraPromise, should} from '../../commons';
import {isAddress} from '../../eth/ethUtils';
import {dbService, walletService} from '../../types/container';
import {Network, Nft, Token} from '../../types/types';
import {Context} from '../context';

export async function addCommand(
  args: Args,
  vorpal: Vorpal,
  context?: Context
) {
  if (args.options.c) {
    return tryToAddNetwork(args, vorpal);
  } else if (args.options.t) {
    if (!context!.getWallet()) {
      return;
    }
    return tryToAddToken(args, vorpal, context!);
  } else if (args.options.n) {
    if (!context!.getWallet()) {
      return;
    }
    return tryToAddNft(args, vorpal, context!);
  } else if (args.options.a !== undefined && args.options.a !== '') {
    const creationPromise =
      args.options.a.split(' ').length === 1
        ? walletService().createAccountByPrivateKey(
            context!.getPassword(),
            args.options.a
          )
        : walletService().createAccountByMnemonic(
            context!.getPassword(),
            args.options.a
          );
    dbService().addAccount(
      await (
        await dynamicImportOraPromise()
      )(creationPromise, 'try to import a new account.')
    );
    if (!context!.getCurrentAccount()) {
      await context!.setCurrentAccount(dbService().allAccounts()[0]);
    }
  } else if (args.options.a === '') {
    dbService().addAccount(
      await (
        await dynamicImportOraPromise()
      )(
        walletService().createRandomAccount(context!.getPassword()),
        'try to create a new account.'
      )
    );
    if (!context!.getCurrentAccount()) {
      await context!.setCurrentAccount(dbService().allAccounts()[0]);
    }
  }
}

async function tryToAddNetwork(args: Args, vorpal: Vorpal) {
  const network = await vorpal.activeCommand.prompt([
    {
      type: 'input',
      name: 'name',
      message: 'Network name:',
    },
    {
      type: 'input',
      name: 'chain',
      message: 'Network chain id:',
    },
    {
      type: 'input',
      name: 'coin',
      message: 'Network coin symbol:',
    },
    {
      type: 'input',
      name: 'explorerUrl',
      message: 'The explorer url of the network:',
    },
  ]);
  network.tokens = {};

  return dbService().addNetwork(network as Network);
}

async function tryToAddToken(args: Args, vorpal: Vorpal, context: Context) {
  const address = (
    await vorpal.activeCommand.prompt([
      {
        type: 'input',
        name: 'address',
        message: 'Token address:',
      },
    ])
  ).address;

  should(isAddress(address), `${address} is not a valid address!`);

  const token = await (
    await dynamicImportOraPromise()
  )(
    walletService().loadToken(address, context.getWallet()!),
    'try to load token metadata.'
  );
  const confirm = await confirmIt(vorpal, token, 'Want to add this token?');

  if (confirm) {
    return dbService().addToken(
      context.getCurrentNetwork().chain,
      token as Token
    );
  }
}

async function tryToAddNft(args: Args, vorpal: Vorpal, context: Context) {
  const address = (
    await vorpal.activeCommand.prompt([
      {
        type: 'input',
        name: 'address',
        message: 'Nft address:',
      },
    ])
  ).address;

  should(isAddress(address), `${address} is not a valid address!`);

  const nft = await (
    await dynamicImportOraPromise()
  )(
    walletService().loadNft(address, context.getWallet()!),
    'try to load nft metadata.'
  );
  const confirm = await confirmIt(vorpal, nft, 'Want to add this nft?');

  if (confirm) {
    return dbService().addNft(context.getCurrentNetwork().chain, nft as Nft);
  }
}
