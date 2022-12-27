import Vorpal from 'vorpal';
import {error} from '../commons';
import {dbService} from '../types/container';
import {Authenticated, Command} from '../types/types';
import {Context} from './context';

export async function startCLi(
  vorpal: Vorpal,
  initCommand: Command,
  loginCommand: Command,
  supportedCommands: Command[]
) {
  vorpal.delimiter('cfox=#').show();

  const db = dbService();

  if (db.isNotConfigured()) {
    const init = vorpal.command(initCommand.name).action(async args => {
      await initCommand.handler(args, vorpal);
    });

    while (db.isNotConfigured()) {
      await vorpal.exec(initCommand.name);
    }

    init.remove();
  }

  let authenticated: Authenticated = {logined: false, password: ''};

  const login = vorpal.command(loginCommand.name).action(async args => {
    authenticated = await loginCommand.handler(args, vorpal);
  });

  while (!authenticated.logined) {
    await vorpal.exec(loginCommand.name);
  }

  login.remove();

  const current = db.getCurrent();
  const context = new Context(
    vorpal,
    authenticated.password,
    current.network,
    current.account
  );

  vorpal.ui.delimiter(context.currentDelimiter());

  supportedCommands.forEach(command => {
    const cmd = vorpal.command(command.name, command.description);
    command.options?.forEach(option => {
      cmd.option(option.name, option.description!);
    });
    if (command.types) {
      cmd.types(command.types);
    }
    cmd.action(async args => {
      try {
        // MUST use await, otherwise vorpal might exit after executing some commands.
        await command.handler(args, vorpal, context);
      } catch (e: any) {
        error(vorpal, e.message);
      }
    });
  });
}
