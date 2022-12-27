import Vorpal, {Args} from 'vorpal';
import {dynamicImportOraPromise, success} from '../../commons';
import {walletService} from '../../types/container';
import {Context} from '../context';

export async function pushCommand(
  args: Args,
  vorpal: Vorpal,
  context?: Context
) {
  const wallet = context!.getWallet();
  if (!wallet) {
    return;
  }

  const txHash = await (
    await dynamicImportOraPromise()
  )(
    walletService().pushTx(wallet, args.txHash),
    `try to speed up the transaction ${args.txHash}.`
  );

  if (txHash) {
    success(
      vorpal,
      `a new Tx(${txHash}) created, write down its value, if still pending, use it to retry.`
    );
  }
}
