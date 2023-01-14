import Vorpal, {Args} from 'vorpal';
import {dynamicImportOraPromise, log} from '../../commons';
import {explorerService} from '../../types/container';
import {Context} from '../context';

export async function firstCommand(
  args: Args,
  vorpal: Vorpal,
  context?: Context
) {
  const wallet = context!.getWallet();
  if (!wallet) {
    return;
  }

  const contract = args.contract;
  const deploymentDetails = await (
    await dynamicImportOraPromise()
  )(
    explorerService().deploymentDetails(
      context!.getCurrentNetwork().chain,
      contract
    ),
    `Querying the deployment details for ${contract}`
  );

  log(vorpal, [
    {
      creator: deploymentDetails.creator,
      firstTxHash: deploymentDetails.txHash,
      firstBlock: (
        await wallet.provider.getTransaction(deploymentDetails.txHash)
      ).blockNumber,
    },
  ]);
}
