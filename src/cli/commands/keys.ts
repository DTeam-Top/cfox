import Vorpal, {Args} from 'vorpal';
import {log, should} from '../../commons';
import {KEYS} from '../../constant';
import {dbService} from '../../types/container';
import {Context} from '../context';

export async function keysCommand(
  args: Args,
  vorpal: Vorpal,
  context?: Context
) {
  if (args.options.l) {
    return log(vorpal, dbService().getKeys());
  }

  if (!args.name) {
    throw new Error('name is missing.');
  }

  should(KEYS.includes(args.name), `Only [${KEYS.join(',')}] supported.`);

  dbService().setKey(args.name, args.value || null);
}
