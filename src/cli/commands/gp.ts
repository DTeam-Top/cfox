import Vorpal, {Args} from 'vorpal';
import {dynamicImportOraPromise, log} from '../../commons';
import {walletService} from '../../types/container';
import {Context} from '../context';

export async function gpCommand(args: Args, vorpal: Vorpal, context?: Context) {
  const wallet = context!.getWallet();
  if (!wallet) {
    return;
  }

  const result = await (
    await dynamicImportOraPromise()
  )(
    walletService().gasPrice(wallet.provider),
    'try to query current gas price.'
  );
  log(vorpal, [result]);
}
