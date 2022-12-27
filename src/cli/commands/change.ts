import Vorpal, {Args} from 'vorpal';
import {dynamicImportOraPromise, should} from '../../commons';
import {dbService} from '../../types/container';
import {Context} from '../context';

export async function changeCommand(
  args: Args,
  vorpal: Vorpal,
  context?: Context
) {
  if (args.options.c) {
    const target = dbService().getNetwork(args.options.c);
    should(!!target, `Can find network ${args.options.c}!`);
    await context!.setCurrentNetwork(target);
    dbService().saveCurrent(context!.current());
  } else if (args.options.a) {
    const target = dbService().getAccount(args.options.a);
    should(!!target, `Can find account ${args.options.a}!`);
    await (
      await dynamicImportOraPromise()
    )(context!.setCurrentAccount(target), 'try to change current account.');
    dbService().saveCurrent(context!.current());
  }
}
