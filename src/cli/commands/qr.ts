import * as qrcode from 'qrcode-terminal';
import Vorpal, {Args} from 'vorpal';
import {Context} from '../context';

qrcode.setErrorLevel('H');

export async function qrCommand(args: Args, vorpal: Vorpal, context?: Context) {
  const account = args.account || context!.getCurrentAccount()?.address;
  if (account) {
    qrcode.generate(account, {small: true}, qr => vorpal.log(qr));
  }
}
