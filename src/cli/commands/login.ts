import Vorpal, {Args} from 'vorpal';
import {success, verifyPassword} from '../../commons';
import {dbService} from '../../types/container';

export async function loginCommand(args: Args, vorpal: Vorpal) {
  let authenticated = false;
  let message = 'Please input password: ';
  let userPassword = '';

  // eslint-disable-next-line no-constant-condition
  while (!authenticated) {
    const password = await vorpal.activeCommand.prompt([
      {
        type: 'password',
        name: 'password',
        message,
      },
    ]);

    const settings = dbService().getSettings();
    if (settings) {
      authenticated = await verifyPassword(
        settings.passwordHash,
        password.password
      );
    }

    if (!authenticated) {
      message = 'Wrong password, please try again: ';
    } else {
      userPassword = password.password;
    }
  }

  success(vorpal, 'Login successfully!');
  return {logined: true, password: userPassword};
}
