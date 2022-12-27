import Vorpal, {Args} from 'vorpal';
import {error, passwordHash} from '../../commons';
import {DB_VERSION} from '../../constant';
import {dbService} from '../../types/container';

export async function initCommand(args: Args, vorpal: Vorpal) {
  vorpal.log(
    'This is your first time to run cfox, please do some configurations first.'
  );

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const settings = await vorpal.activeCommand.prompt([
      {
        type: 'password',
        name: 'password1',
        message: 'Please set login password: ',
      },
      {
        type: 'password',
        name: 'password2',
        message: 'Please confirm the password: ',
      },
    ]);

    if (settings.password1 !== settings.password2) {
      error(vorpal, 'Please confirm the two passwords are the same.');
    } else {
      dbService().saveSettings({
        passwordHash: await passwordHash(settings.password1),
        dbVersion: DB_VERSION,
      });
      return;
    }
  }
}
