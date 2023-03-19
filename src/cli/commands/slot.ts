import Vorpal, {Args} from 'vorpal';
import {dynamicImportOraPromise, log} from '../../commons';
import {walletService} from '../../types/container';
import {Context} from '../context';

export async function slotCommand(
  args: Args,
  vorpal: Vorpal,
  context?: Context
) {
  const wallet = context!.getWallet();
  if (!wallet) {
    return;
  }

  log(vorpal, [
    {
      result: await (
        await dynamicImportOraPromise()
      )(
        walletService().slot(wallet.provider, args.contract, args.pos),
        `Getting the value at ${args.pos} in ${args.contract} ...`
      ),
    },
  ]);
}
