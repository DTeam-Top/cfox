/* eslint-disable no-empty */
import test, {ExecutionContext} from 'ava';
import sinon, {SinonStub} from 'sinon';
import {Args} from 'vorpal';
import {removeCommand} from '../../../src/cli/commands/remove';
import {Context} from '../../../src/cli/context';
import {dbService} from '../../../src/types/container';
import {
  createOrSetStub,
  mockVoral,
  testAccount,
  testAddress,
  testNetwork,
  testNft721,
  testToken,
} from '../../_utils';

async function removeSubitemAssert(
  args: Args,
  stub: sinon.SinonStub,
  t: ExecutionContext
) {
  const prompt = createOrSetStub([{confirm: false}, {confirm: true}]);
  const {vorpal} = mockVoral(prompt);
  const getCurrentNetwork = createOrSetStub([{chain: 4}]);
  const context = {
    getCurrentNetwork,
  } as unknown as Context;

  await removeCommand(args, vorpal, context);
  t.is(stub.callCount, 1);
  t.is(stub.args[0][0], 4);
  t.is(stub.args[0][1], testAddress);
  t.is(stub.args[0][2], true);

  await removeCommand(args, vorpal, context);
  t.is(stub.callCount, 3);
  t.is(stub.args[2][0], 4);
  t.is(stub.args[2][1], testAddress);
  t.is(stub.args[2][2], false);
}

test.beforeEach(() => {
  sinon.reset();
});

test.serial('removeCommand: "\\r -c"', async t => {
  const prompt = createOrSetStub([{confirm: false}, {confirm: true}]);
  const {vorpal} = mockVoral(prompt);
  const removeNetwork = createOrSetStub(
    [[testNetwork]],
    dbService().removeNetwork as SinonStub
  );
  const getCurrentNetwork = createOrSetStub([{chain: 137}, {chain: 1}]);
  const context = {
    getCurrentNetwork,
  } as unknown as Context;

  try {
    await removeCommand({options: {c: 137}}, vorpal, context);
  } catch (e) {}
  t.is(removeNetwork.callCount, 0, 'cannot remove current network.');

  try {
    await removeCommand({options: {c: 137}}, vorpal, context);
  } catch (e) {}
  t.is(removeNetwork.callCount, 0, 'Can not remove a reserved network.');

  await removeCommand({options: {c: 11}}, vorpal, context);
  t.is(removeNetwork.callCount, 1);
  t.is(removeNetwork.args[0][0], 11);
  t.is(removeNetwork.args[0][1], true);

  await removeCommand({options: {c: 11}}, vorpal, context);
  t.is(removeNetwork.callCount, 3);
  t.is(removeNetwork.args[2][0], 11);
  t.is(removeNetwork.args[2][1], false);
});

test.serial('removeCommand: "\\r -a"', async t => {
  const prompt = createOrSetStub([{confirm: false}, {confirm: true}]);
  const {vorpal} = mockVoral(prompt);
  const removeAccount = createOrSetStub(
    [[testAccount]],
    dbService().removeAccount as SinonStub
  );
  const getCurrentAccount = createOrSetStub([
    {address: testAddress},
    {address: '0x123'},
  ]);
  const context = {
    getCurrentAccount,
  } as unknown as Context;

  try {
    await removeCommand({options: {a: testAddress}}, vorpal, context);
  } catch (e) {}
  t.is(removeAccount.callCount, 0, 'cannot remove current account.');

  await removeCommand({options: {a: testAddress}}, vorpal, context);
  t.is(removeAccount.callCount, 1);
  t.is(removeAccount.args[0][0], testAddress);
  t.is(removeAccount.args[0][1], true);

  await removeCommand({options: {a: testAddress}}, vorpal, context);
  t.is(removeAccount.callCount, 3);
  t.is(removeAccount.args[2][0], testAddress);
  t.is(removeAccount.args[2][1], false);
});

test.serial('removeCommand: "\\r -t"', async t => {
  await removeSubitemAssert(
    {options: {t: testAddress}},
    createOrSetStub([[testToken]], dbService().removeToken as SinonStub),
    t
  );
});

test.serial('removeCommand: "\\r -n"', async t => {
  await removeSubitemAssert(
    {options: {n: testAddress}},
    createOrSetStub([[testNft721]], dbService().removeNft as SinonStub),
    t
  );
});
