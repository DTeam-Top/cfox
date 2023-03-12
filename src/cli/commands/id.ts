import Vorpal, {Args} from 'vorpal';
import {dynamicImportOraPromise, log} from '../../commons';
import {webService} from '../../types/container';
import {Context} from '../context';

export async function idCommand(args: Args, vorpal: Vorpal, context?: Context) {
  let type: 'function' | 'event';
  let id = '';
  if (args.options.f) {
    type = 'function';
    id = args.options.f;
  } else if (args.options.e) {
    type = 'event';
    id = args.options.e;
  } else {
    throw new Error('Please specify either -f or -e.');
  }

  log(vorpal, [
    {
      type,
      result: await (
        await dynamicImportOraPromise()
      )(webService().signature(type, id), `Resolving the signature for ${id}`),
    },
  ]);
}
