import fs from 'fs';
import Vorpal, {Args} from 'vorpal';
import {dynamicImportOraPromise, error} from '../../commons';
import {explorerService} from '../../types/container';
import {Context} from '../context';

export async function sourceCommand(
  args: Args,
  vorpal: Vorpal,
  context?: Context
) {
  const contract = args.contract;
  const source = await (
    await dynamicImportOraPromise()
  )(
    explorerService().source(context!.getCurrentNetwork().chain, contract),
    `Downloading the source code for ${contract}`
  );

  const filename = contract;

  if (source) {
    const normalizedSource = normalize(source);
    if (normalizedSource.startsWith('{') && normalizedSource.endsWith('}')) {
      fs.writeFileSync(
        filename,
        Object.entries(JSON.parse(normalizedSource).sources)
          .map(item => `// File: ${item[0]}\n\n${(item[1] as any).content}\n`)
          .join('\n')
      );
    } else {
      fs.writeFileSync(filename, normalizedSource);
    }
  } else {
    error(
      vorpal,
      `Cannot find the source code for ${contract}, please:\n1. ensure it is verified.\n2. check the contract address is correct.`
    );
  }
}

function normalize(source: string) {
  let normaizedSource = source;

  if (source.startsWith('{{')) {
    normaizedSource = normaizedSource.replace(/^{{/, '{');
  }

  if (source.endsWith('}}')) {
    normaizedSource = normaizedSource.replace(/}}$/, '}');
  }

  return normaizedSource;
}
