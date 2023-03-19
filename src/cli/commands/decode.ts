import Vorpal, {Args} from 'vorpal';
import {dynamicImportOraPromise, log, success} from '../../commons';
import {walletService} from '../../types/container';
import {Context} from '../context';

export async function decodeCommand(
  args: Args,
  vorpal: Vorpal,
  context?: Context
) {
  const wallet = context!.getWallet();
  if (!wallet) {
    return;
  }

  const result = await (
    await dynamicImportOraPromise()
  )(
    walletService().decodeTx(wallet.provider, args.txHash),
    `Decoding transaction ${args.txHash} ...`
  );

  success(vorpal, 'Basic Information:');
  log(vorpal, [
    {...result.parties, value: result.value, minted: result.minted},
  ]);

  if (result.method) {
    success(vorpal, 'Method:');
    console.log({
      method: result.method.signature,
      data: result.method.params.map(p => JSON.stringify(p)),
    });
  }

  if (result.events) {
    success(vorpal, '\nEvents:');
    const events = result.events.map(e => {
      return {
        event: e.signature,
        data: e.params.map(p => JSON.stringify(p)),
      };
    });
    console.log(events);
  }
}
