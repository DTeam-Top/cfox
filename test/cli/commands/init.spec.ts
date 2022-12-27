import test from 'ava';
import {SinonStub} from 'sinon';
import {Args} from 'vorpal';
import {initCommand} from '../../../src/cli/commands/init';
import {verifyPassword} from '../../../src/commons';
import {dbService} from '../../../src/types/container';
import {createOrSetStub, mockVoral} from '../../_utils';

test('initCommand flow', async t => {
  const prompt = createOrSetStub([
    {
      password1: 'password1',
      password2: 'password2',
    },
    {
      password1: 'password',
      password2: 'password',
    },
  ]);
  const {vorpal} = mockVoral(prompt);
  const saveSettings = dbService().saveSettings as SinonStub;

  await initCommand(null as unknown as Args, vorpal);

  t.true(saveSettings.calledOnce);
  t.true(
    await verifyPassword(saveSettings.args[0][0].passwordHash, 'password')
  );
});
