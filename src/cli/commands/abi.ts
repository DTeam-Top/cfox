import fs from 'fs';
import path from 'path';
import Vorpal, {Args} from 'vorpal';
import {
  createPathIfNotExisting,
  dynamicImportOraPromise,
  error,
} from '../../commons';
import {explorerService} from '../../types/container';
import {Context} from '../context';

export async function abiCommand(
  args: Args,
  vorpal: Vorpal,
  context?: Context
) {
  const contract = args.contract;
  const chain = context!.getCurrentNetwork().chain;
  const abi = await (
    await dynamicImportOraPromise()
  )(
    explorerService().abi(chain, contract),
    `Downloading the abi for ${contract}`
  );

  if (!abi) {
    error(
      vorpal,
      `Cannot find the abi code for ${contract}, please:\n1. ensure it is verified.\n2. check the contract address is correct.`
    );
  }

  if (args.options.o) {
    createPathIfNotExisting(args.options.o);
  }

  const filename = path.join(args.options.o || '', `${chain}.${contract}.abi`);
  fs.writeFileSync(filename, abi);
}
