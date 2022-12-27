import Vorpal, {Args} from 'vorpal';
import {dynamicImportOraPromise, log} from '../../commons';
import {walletService} from '../../types/container';
import {Context} from '../context';

export async function nonceCommand(
  args: Args,
  vorpal: Vorpal,
  context?: Context
) {
  const wallet = context!.getWallet();
  if (!wallet) {
    return;
  }

  const account = args.account || wallet.address;
  const result = await (
    await dynamicImportOraPromise()
  )(
    walletService().nonceDetails(wallet.provider, account),
    `try to get nonce details of ${account}.`
  );

  log(vorpal, [result]);
}
