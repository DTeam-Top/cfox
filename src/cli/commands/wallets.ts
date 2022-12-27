import Vorpal, {Args} from 'vorpal';
import {log} from '../../commons';
import {walletService} from '../../types/container';

export async function walletsCommand(args: Args, vorpal: Vorpal) {
  const count = Number(args.options.n || '10');
  const result = walletService().generateRandomAccounts(count);
  log(vorpal, result);
}
