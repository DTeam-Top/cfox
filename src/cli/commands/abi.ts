import fs from 'fs';
import Vorpal, {Args} from 'vorpal';
import {dynamicImportOraPromise, error} from '../../commons';
import {explorerService} from '../../types/container';
import {Context} from '../context';

export async function abiCommand(
  args: Args,
  vorpal: Vorpal,
  context?: Context
) {
  const contract = args.contract;
  const abi = await (
    await dynamicImportOraPromise()
  )(
    explorerService().abi(context!.getCurrentNetwork().chain, contract),
    `Downloading the abi for ${contract}`
  );

  const filename = `${contract}.abi`;

  if (abi) {
    fs.writeFileSync(filename, abi);
  } else {
    error(
      vorpal,
      `Cannot find the abi code for ${contract}, please:\n1. ensure it is verified.\n2. check the contract address is correct.`
    );
  }
}
