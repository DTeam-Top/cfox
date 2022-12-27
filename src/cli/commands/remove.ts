import Vorpal, {Args} from 'vorpal';
import {confirmIt, isReserved, should} from '../../commons';
import {dbService} from '../../types/container';
import {Context} from '../context';

export async function removeCommand(
  args: Args,
  vorpal: Vorpal,
  context?: Context
) {
  if (args.options.c) {
    should(
      args.options.c !== Number(context!.getCurrentNetwork().chain),
      'Can not remove current network.'
    );
    should(!isReserved(args.options.c), 'Can not remove a reserved network.');

    const network = [dbService().removeNetwork(args.options.c, true)].map(
      result => {
        return {
          name: result!.name,
          chain: result!.chain,
          coin: result!.coin,
          explorerUrl: result!.explorerUrl,
        };
      }
    );
    const confirm = await confirmIt(
      vorpal,
      network,
      'Want to delete this network?'
    );
    if (confirm) {
      dbService().removeNetwork(args.options.c, false);
    }
  } else if (args.options.t) {
    const token = dbService().removeToken(
      context!.getCurrentNetwork().chain,
      args.options.t,
      true
    );
    const confirm = await confirmIt(
      vorpal,
      token,
      'Want to delete this token?'
    );
    if (confirm) {
      dbService().removeToken(
        context!.getCurrentNetwork().chain,
        args.options.t,
        false
      );
    }
  } else if (args.options.n) {
    const nft = dbService().removeNft(
      context!.getCurrentNetwork().chain,
      args.options.n,
      true
    );
    const confirm = await confirmIt(vorpal, nft, 'Want to delete this nft?');
    if (confirm) {
      dbService().removeNft(
        context!.getCurrentNetwork().chain,
        args.options.n,
        false
      );
    }
  } else if (args.options.a) {
    should(
      args.options.a !== context!.getCurrentAccount()!.address,
      'Can not remove current wallet.'
    );

    const account = dbService().removeAccount(args.options.a, true);
    const confirm = await confirmIt(
      vorpal,
      account,
      'Want to delete this account?'
    );
    if (confirm) {
      dbService().removeAccount(args.options.a, false);
    }
  }
}
