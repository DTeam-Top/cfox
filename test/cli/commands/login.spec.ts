import test from 'ava';
import {SinonStub} from 'sinon';
import {Args} from 'vorpal';
import {loginCommand} from '../../../src/cli/commands/login';
import {passwordHash} from '../../../src/commons';
import {dbService} from '../../../src/types/container';
import {createOrSetStub, mockVoral} from '../../_utils';

test('loginCommand flow', async t => {
  const prompt = createOrSetStub([
    {
      password: 'password1',
    },
    {
      password: 'password',
    },
  ]);
  const {vorpal} = mockVoral(prompt);
  const getSettings = createOrSetStub(
    [{passwordHash: await passwordHash('password')}],
    dbService().getSettings as SinonStub
  );

  const result = await loginCommand(null as unknown as Args, vorpal);

  t.is(getSettings.callCount, 2);
  t.deepEqual(result, {logined: true, password: 'password'});
});
