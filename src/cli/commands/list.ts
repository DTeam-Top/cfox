import Vorpal, {Args} from 'vorpal';
import {isEmpty, log, should} from '../../commons';
import {dbService} from '../../types/container';
import {Context} from '../context';

export async function listCommand(
  args: Args,
  vorpal: Vorpal,
  context?: Context
) {
  if (isEmpty(args.options) || args.options.c) {
    log(
      vorpal,
      dbService()
        .allNetworks()
        .map(network => {
          return {
            name: network.name,
            chain: network.chain,
            coin: network.coin,
            explorerUrl: network.explorerUrl,
          };
        })
    );
  } else if (args.options.t) {
    log(vorpal, dbService().allTokens(context!.getCurrentNetwork().chain));
  } else if (args.options.n !== undefined) {
    should(
      !args.options.n || ['erc721', 'erc1155'].includes(args.options.n),
      'Type must be either "erc721" or "erc1155"'
    );

    log(
      vorpal,
      args.options.n
        ? dbService().allNfts(
            context!.getCurrentNetwork().chain,
            args.options.n
          )
        : dbService().allNfts(context!.getCurrentNetwork().chain)
    );
  } else if (args.options.a) {
    log(
      vorpal,
      dbService()
        .allAccounts()
        .map(account => {
          return {address: account.address};
        })
    );
  }
}
