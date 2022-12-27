import Vorpal, {Args} from 'vorpal';
import {dynamicImportOraPromise, success} from '../../commons';
import {walletService} from '../../types/container';
import {Context} from '../context';

export async function cancelCommand(
  args: Args,
  vorpal: Vorpal,
  context?: Context
) {
  const wallet = context!.getWallet();
  if (!wallet) {
    return;
  }

  let txHash = '';
  if (args.options.n) {
    txHash = await (
      await dynamicImportOraPromise()
    )(
      walletService().cancelTxByNonce(wallet, Number(args.options.n)),
      `try to cancel the transaction with nonce ${args.options.n}.`
    );
  } else if (args.options.tx) {
    txHash = await (
      await dynamicImportOraPromise()
    )(
      walletService().cancelTxByHash(wallet, args.options.tx),
      `try to cancel the transaction ${args.options.tx}.`
    );
  }

  if (txHash) {
    success(
      vorpal,
      `a new Tx(${txHash}) created, write down its value, if still pending, use it to retry.`
    );
  }
}
