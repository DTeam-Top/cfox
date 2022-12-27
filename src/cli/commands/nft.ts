import Vorpal, {Args} from 'vorpal';
import {dynamicImportOraPromise, log, should} from '../../commons';
import {dbService, walletService, webService} from '../../types/container';
import {Context} from '../context';

export async function nftCommand(
  args: Args,
  vorpal: Vorpal,
  context?: Context
) {
  const wallet = context!.getWallet();
  if (!wallet) {
    return;
  }

  const chain = context!.getCurrentNetwork().chain;
  const nft = dbService().findNft(chain, args.contract);
  should(!!nft, `Nft ${args.contract} not found.`);

  try {
    log(
      vorpal,
      await (
        await dynamicImportOraPromise()
      )(
        walletService().tokens(nft!, wallet, !args.options.v),
        'try to fetch owning tokens by calling contract methods.'
      )
    );
  } catch (e) {
    log(
      vorpal,
      await (
        await dynamicImportOraPromise()
      )(
        webService().tokens(
          wallet.address,
          nft!.address,
          chain,
          !args.options.v
        ),
        'try to fetch owning tokens by external apis.'
      )
    );
  }
}
