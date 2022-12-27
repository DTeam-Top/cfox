import Vorpal, {Args} from 'vorpal';
import {dynamicImportOraPromise, log} from '../../commons';
import {ipfsService} from '../../types/container';

export async function uploadCommand(args: Args, vorpal: Vorpal) {
  const ipfs = ipfsService();
  let result;

  if (args.options.f) {
    result = await (
      await dynamicImportOraPromise()
    )(
      ipfs.uploadSingleFile(args.options.f),
      `try to upload ${args.options.f}.`
    );
  } else if (args.options.d) {
    result = await (
      await dynamicImportOraPromise()
    )(ipfs.uploadDirectory(args.options.d), `try to upload ${args.options.d}.`);
  } else if (args.options.m) {
    result = await (
      await dynamicImportOraPromise()
    )(ipfs.uploadMetadata(args.options.m), `try to upload ${args.options.m}.`);
  }

  log(vorpal, [result]);
}
