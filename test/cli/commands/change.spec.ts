/* eslint-disable no-empty */
import test from 'ava';
import sinon, {SinonStub} from 'sinon';
import {changeCommand} from '../../../src/cli/commands/change';
import {Context} from '../../../src/cli/context';
import {dbService} from '../../../src/types/container';
import {
  createOrSetStub,
  mockVoral,
  testAccount,
  testNetwork,
} from '../../_utils';

test.beforeEach(() => {
  sinon.reset();
});

test.serial('changeCommand: "\\c -c"', async t => {
  const currentData = {
    chain: 4,
    address: '0x123',
  };
  const {vorpal} = mockVoral();
  createOrSetStub(
    [undefined, testNetwork],
    dbService().getNetwork as SinonStub
  );
  const saveCurrent = dbService().saveCurrent as SinonStub;
  const setCurrentNetwork = sinon.stub();
  const current = createOrSetStub([currentData]);
  const context = {
    setCurrentNetwork,
    current,
  } as unknown as Context;

  try {
    await changeCommand({options: {c: 1}}, vorpal, context);
  } catch (e) {}
  t.is(
    setCurrentNetwork.callCount,
    0,
    'setCurrentNetwork should not be called with a non existing network.'
  );
  t.is(
    saveCurrent.callCount,
    0,
    'saveCurrent should not be called with a non existing network.'
  );

  await changeCommand({options: {c: 4}}, vorpal, context);
  t.is(
    setCurrentNetwork.callCount,
    1,
    'setCurrentNetwork should be called after current network changed.'
  );
  t.deepEqual(setCurrentNetwork.args[0][0], testNetwork);
  t.is(
    saveCurrent.callCount,
    1,
    'saveCurrent should be called after current network changed.'
  );
  t.deepEqual(saveCurrent.args[0][0], currentData);
});

test.serial('changeCommand: "\\c -a"', async t => {
  const currentData = {
    chain: 4,
    address: '0x123',
  };
  const {vorpal} = mockVoral();
  createOrSetStub(
    [undefined, testAccount],
    dbService().getAccount as SinonStub
  );
  const saveCurrent = dbService().saveCurrent as SinonStub;
  const setCurrentAccount = sinon.stub();
  const current = createOrSetStub([currentData]);
  const context = {
    setCurrentAccount,
    current,
  } as unknown as Context;

  try {
    await changeCommand({options: {a: '0x'}}, vorpal, context);
  } catch (e) {}
  t.is(
    setCurrentAccount.callCount,
    0,
    'setCurrentAccount shold not be called with a non existing account.'
  );
  t.is(
    saveCurrent.callCount,
    0,
    'saveCurrent shold not be called with a non existing account.'
  );

  await changeCommand({options: {a: '0x123'}}, vorpal, context);
  t.is(setCurrentAccount.callCount, 1);
  t.deepEqual(setCurrentAccount.args[0][0], testAccount);
  t.is(saveCurrent.callCount, 1);
  t.deepEqual(saveCurrent.args[0][0], currentData);
});
