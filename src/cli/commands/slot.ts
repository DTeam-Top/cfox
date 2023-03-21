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

  if (args.options.p) {
    log(vorpal, [
      {
        result: await (
          await dynamicImportOraPromise()
        )(
          walletService().slot(wallet.provider, args.contract, args.options.p),
          `Getting the value at ${args.options.p} in ${args.contract} ...`
        ),
      },
    ]);
  } else if (args.options.i) {
    log(vorpal, [
      {
        result: await (
          await dynamicImportOraPromise()
        )(
          walletService().slot(wallet.provider, args.contract),
          `Getting eip1967 implementation or beacon slot in ${args.contract} ...`
        ),
      },
    ]);
  }
}
