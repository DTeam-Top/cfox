import Vorpal, {Args} from 'vorpal';
import {
  confirmIt,
  dynamicImportOraPromise,
  setGasPrice,
  should,
} from '../../commons';
import {dbService, walletService} from '../../types/container';
import {TxDetails} from '../../types/types';
import {Context} from '../context';

export async function singleTransferCommand(
  args: Args,
  vorpal: Vorpal,
  context?: Context
) {
  const wallet = context!.getWallet();
  if (!wallet) {
    return;
  }

  const nft = dbService().findNft(
    context!.getCurrentNetwork().chain,
    args.contract
  );
  should(!!nft, `Nft ${args.contract} not found.`);

  const owner = await walletService().ownerOf(nft!, wallet, args.id);
  should(
    owner === wallet.address,
    `Token ${args.id} in Nft ${args.contract} is not owned by current account.`
  );

  const txDetails = (await (
    await dynamicImportOraPromise()
  )(
    walletService().singleTransfer(
      nft!,
      wallet,
      args.target,
      args.id,
      null,
      true
    ),
    'try to get transfer tx details.'
  )) as TxDetails;

  const confirm = await confirmIt(vorpal, txDetails, 'want to transfer?');
  if (confirm) {
    const gasPrice = await setGasPrice(
      vorpal,
      txDetails.gasPrices.map(price => String(price.gwei))
    );

    await (
      await dynamicImportOraPromise()
    )(
      walletService().singleTransfer(
        nft!,
        wallet,
        args.target,
        args.id,
        gasPrice,
        false
      ),
      `try to transfer token ${args.id}.`
    );
  }
}
