/* eslint-disable no-empty */
import test from 'ava';
import sinon, {SinonStub} from 'sinon';
import {listCommand} from '../../../src/cli/commands/list';
import {Context} from '../../../src/cli/context';
import {dbService} from '../../../src/types/container';
import {
  createOrSetStub,
  mockVoral,
  testAccount,
  testNetwork,
  testNft721,
  testToken,
} from '../../_utils';

test.beforeEach(() => {
  sinon.reset();
});

test.serial('listCommand: "\\l -c" and "\\l"', async t => {
  const {log, vorpal} = mockVoral();
  const allNetworks = createOrSetStub(
    [[], [testNetwork]],
    dbService().allNetworks as SinonStub
  );

  await listCommand({options: {}}, vorpal);
  t.is(allNetworks.callCount, 1);
  t.is(log.callCount, 0);

  await listCommand({options: {c: true}}, vorpal);
  t.is(allNetworks.callCount, 2);
  t.is(log.callCount, 1);
});

test.serial('listCommand: "\\l -a"', async t => {
  const {log, vorpal} = mockVoral();
  const allAccounts = createOrSetStub(
    [[], [testAccount]],
    dbService().allAccounts as SinonStub
  );

  await listCommand({options: {a: true}}, vorpal);
  t.is(allAccounts.callCount, 1);
  t.is(log.callCount, 0);

  await listCommand({options: {a: true}}, vorpal);
  t.is(allAccounts.callCount, 2);
  t.is(log.callCount, 1);
});

test.serial('listCommand: "\\l -t"', async t => {
  const {log, vorpal} = mockVoral();
  const allTokens = createOrSetStub(
    [[], [testToken]],
    dbService().allTokens as SinonStub
  );
  const getCurrentNetwork = createOrSetStub([{chain: 1}]);
  const context = {
    getCurrentNetwork,
  } as unknown as Context;

  await listCommand({options: {t: true}}, vorpal, context);
  t.is(allTokens.callCount, 1);
  t.is(allTokens.args[0][0], 1);
  t.is(log.callCount, 0);

  await listCommand({options: {t: true}}, vorpal, context);
  t.is(allTokens.callCount, 2);
  t.is(allTokens.args[1][0], 1);
  t.is(log.callCount, 1);
});

test.serial('listCommand: "\\l -n"', async t => {
  const {vorpal} = mockVoral();
  const allNfts = createOrSetStub(
    [[], [testNft721]],
    dbService().allNfts as SinonStub
  );
  const getCurrentNetwork = createOrSetStub([{chain: 1}]);
  const context = {
    getCurrentNetwork,
  } as unknown as Context;

  try {
    await listCommand({options: {n: '321'}}, vorpal, context);
  } catch (e) {}
  t.is(
    allNfts.callCount,
    0,
    'allNfts should not be called when the nft type not one of [erc721, erc1155]'
  );

  await listCommand({options: {n: ''}}, vorpal, context);
  t.is(allNfts.callCount, 1);
  t.is(allNfts.args[0][0], 1);

  await listCommand({options: {n: 'erc721'}}, vorpal, context);
  t.is(allNfts.callCount, 2);
  t.is(allNfts.args[1][0], 1);
});
