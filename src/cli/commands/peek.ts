import Vorpal, {Args} from 'vorpal';
import {dynamicImportOraPromise, log} from '../../commons';
import {walletService} from '../../types/container';
import {Context} from '../context';

export async function peekCommand(
  args: Args,
  vorpal: Vorpal,
  context?: Context
) {
  const wallet = context!.getWallet();
  if (!wallet) {
    return;
  }

  let result;
  if (args.options.erc20) {
    result = await (
      await dynamicImportOraPromise()
    )(
      walletService().peekErc20(wallet, args.options.erc20),
      `try to peek erc20 contract ${args.options.erc20}.`
    );
  } else if (args.options.erc721) {
    result = await (
      await dynamicImportOraPromise()
    )(
      walletService().peekErc721(wallet, args.options.erc721, args.options.t),
      `try to peek erc721 contract ${args.options.erc721}.`
    );
  }

  log(vorpal, [result]);
}
