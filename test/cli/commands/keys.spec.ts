/* eslint-disable no-empty */
import test from 'ava';
import {SinonStub} from 'sinon';
import {keysCommand} from '../../../src/cli/commands/keys';
import {dbService} from '../../../src/types/container';
import {mockVoral} from '../../_utils';

test('keysCommand: keys -l', async t => {
  const {vorpal} = mockVoral();
  const getKeys = dbService().getKeys as SinonStub;
  await keysCommand({options: {l: true}}, vorpal, undefined);
  t.is(getKeys.callCount, 1);
});

test('keysCommand: keys [name] [value]', async t => {
  const {vorpal} = mockVoral();
  const setKey = dbService().setKey as SinonStub;

  try {
    await keysCommand({options: {}}, vorpal, undefined);
  } catch (e) {}
  t.is(setKey.callCount, 0);

  try {
    await keysCommand(
      {options: {}, name: 'name', value: 'value'},
      vorpal,
      undefined
    );
  } catch (e) {}
  t.is(setKey.callCount, 0);

  await keysCommand(
    {options: {}, name: 'morails', value: 'value'},
    vorpal,
    undefined
  );
  t.is(setKey.callCount, 1);
  t.is(setKey.args[0][0], 'morails');
  t.is(setKey.args[0][1], 'value');

  await keysCommand({options: {}, name: 'morails'}, vorpal, undefined);
  t.is(setKey.callCount, 2);
  t.is(setKey.args[1][0], 'morails');
  t.is(setKey.args[1][1], null);
});
