import Vorpal, {Args} from 'vorpal';
import {dynamicImportOraPromise, log} from '../../commons';
import {dbService, walletService} from '../../types/container';
import {Context} from '../context';

export async function balanceCommand(
  args: Args,
  vorpal: Vorpal,
  context?: Context
) {
  const wallet = context!.getWallet();
  if (!wallet) {
    return;
  }

  const {coin, chain} = context!.getCurrentNetwork();

  if (args.options.e) {
    log(
      vorpal,
      await (
        await dynamicImportOraPromise()
      )(walletService().balanceOfCoin(wallet, coin), 'fetching the balance ...')
    );
  } else if (args.options.t !== undefined) {
    log(
      vorpal,
      args.options.t
        ? await (
            await dynamicImportOraPromise()
          )(
            walletService().balanceOfTokens(
              wallet,
              dbService().findTokens(chain, [args.options.t])
            ),
            `fetching the balance of ${args.options.t} ...`
          )
        : await (
            await dynamicImportOraPromise()
          )(
            walletService().balanceOfTokens(
              wallet,
              dbService().allTokens(chain)
            ),
            'fetching the balance of all tokens ...'
          )
    );
  } else {
    log(vorpal, [
      ...(await (
        await dynamicImportOraPromise()
      )(
        walletService().balanceOfCoin(wallet, coin),
        'fetching the balance ...'
      )),
      ...(await (
        await dynamicImportOraPromise()
      )(
        walletService().balanceOfTokens(wallet, dbService().allTokens(chain)),
        'fetching the balance of all tokens ...'
      )),
    ]);
  }
}
