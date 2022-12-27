import Vorpal, {Args} from 'vorpal';
import {dynamicImportOraPromise, log} from '../../commons';
import {isAddress, unifyAddresses} from '../../eth/ethUtils';
import {walletService} from '../../types/container';
import {Context} from '../context';

export async function ensCommand(
  args: Args,
  vorpal: Vorpal,
  context?: Context
) {
  const wallet = context!.getWallet();
  if (!wallet) {
    return;
  }

  const result = isAddress(args.value.toLowerCase())
    ? await (
        await dynamicImportOraPromise()
      )(
        walletService().lookupAddress(
          wallet.provider,
          unifyAddresses(args.value.toLowerCase())
        ),
        `try to look up ${args.value}.`
      )
    : await (
        await dynamicImportOraPromise()
      )(
        walletService().resolveName(wallet.provider, args.value),
        `try to resolve ${args.value}.`
      );
  log(vorpal, [result]);
}
