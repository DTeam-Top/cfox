import BigNumber from 'bignumber.js';
import Vorpal, {Args} from 'vorpal';
import {
  confirmIt,
  dynamicImportOraPromise,
  hasEnoughBalance,
  setGasPrice,
  should,
} from '../../commons';
import {dbService, walletService} from '../../types/container';
import {TxDetails} from '../../types/types';
import {Context} from '../context';

export async function sendCommand(
  args: Args,
  vorpal: Vorpal,
  context?: Context
) {
  const wallet = context!.getWallet();
  if (!wallet) {
    return;
  }

  const amount = args.amount;
  if (new BigNumber(amount).gt(0)) {
    let token = null;
    if (args.options.t) {
      token = dbService().findToken(
        context!.getCurrentNetwork().chain,
        args.options.t
      );
      should(!!token, `Token ${args.options.t} not found.`);
      should(
        await hasEnoughBalance(amount, context!, token!),
        `Insufficent balance of token ${token!.address}.`
      );
    } else {
      should(await hasEnoughBalance(amount, context!), 'Insufficent balance.');
    }

    const txDetails = (await (
      await dynamicImportOraPromise()
    )(
      walletService().send(wallet, args.target, args.amount, null, token, true),
      'try to get send tx details.'
    )) as TxDetails;

    const confirm = await confirmIt(vorpal, txDetails, 'want to send?');
    if (confirm) {
      const gasPrice = await setGasPrice(
        vorpal,
        txDetails.gasPrices.map(price => String(price.gwei))
      );

      await (
        await dynamicImportOraPromise()
      )(
        walletService().send(
          wallet,
          args.target,
          args.amount,
          gasPrice,
          token,
          false
        ),
        `try to send ${args.amount} ${
          token?.symbol || context!.getCurrentNetwork().coin
        } to ${args.target}`
      );
    }
  }
}
