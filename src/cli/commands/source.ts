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

export async function sourceCommand(
  args: Args,
  vorpal: Vorpal,
  context?: Context
) {
  const contract = args.contract;
  const chain = context!.getCurrentNetwork().chain;
  const source = await (
    await dynamicImportOraPromise()
  )(
    explorerService().source(chain, contract),
    `Downloading the source code for ${contract}`
  );

  if (!source) {
    error(
      vorpal,
      `Cannot find the source code for ${contract}, please:\n1. ensure it is verified.\n2. check the contract address is correct.`
    );
  }

  if (args.options.o) {
    createPathIfNotExisting(args.options.o);
  }

  const filename = path.join(
    args.options.o || '',
    `${chain}.${contract}.source`
  );

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
