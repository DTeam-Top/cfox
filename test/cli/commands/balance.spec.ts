/* eslint-disable no-empty */
import test from 'ava';
import sinon, {SinonStub} from 'sinon';
import {balanceCommand} from '../../../src/cli/commands/balance';
import {Context} from '../../../src/cli/context';
import {dbService, walletService} from '../../../src/types/container';
import {createOrSetStub, mockVoral, testAddress} from '../../_utils';

test.beforeEach(() => {
  sinon.reset();
});

test.serial('balanceCommand: balance -e', async t => {
  const {log, vorpal} = mockVoral();
  const wallet = {};
  const getWallet = createOrSetStub([null, wallet]);
  const getCurrentNetwork = createOrSetStub([{chain: 4, coin: 'ETH'}]);
  const context = {
    getCurrentNetwork,
    getWallet,
  } as unknown as Context;
  const balanceOfCoin = createOrSetStub(
    [[{symbol: 'ETH', balance: '0.1'}]],
    walletService().balanceOfCoin as SinonStub
  );

  await balanceCommand({options: {e: true}}, vorpal, context);
  t.is(getCurrentNetwork.callCount, 0);
  t.is(balanceOfCoin.callCount, 0);
  t.is(log.callCount, 0);

  await balanceCommand({options: {e: true}}, vorpal, context);
  t.is(getCurrentNetwork.callCount, 1);
  t.is(balanceOfCoin.callCount, 1);
  t.is(log.callCount, 1);
  t.true(log.args[0][0].includes('ETH'));
  t.true(log.args[0][0].includes('0.1'));
});

test.serial('balanceCommand: balance -t', async t => {
  const {log, vorpal} = mockVoral();
  const wallet = {};
  const findTokens = dbService().findTokens as SinonStub;
  const allTokens = dbService().allTokens as SinonStub;
  const getWallet = createOrSetStub([null, wallet]);
  const getCurrentNetwork = createOrSetStub([{chain: 4, coin: 'ETH'}]);
  const context = {
    getCurrentNetwork,
    getWallet,
  } as unknown as Context;
  const balanceOfTokens = createOrSetStub(
    [[{symbol: 'MT', balance: '0.1'}]],
    walletService().balanceOfTokens as SinonStub
  );

  await balanceCommand({options: {t: testAddress}}, vorpal, context);
  t.is(getCurrentNetwork.callCount, 0);
  t.is(balanceOfTokens.callCount, 0);
  t.is(findTokens.callCount, 0);
  t.is(allTokens.callCount, 0);
  t.is(log.callCount, 0);

  await balanceCommand({options: {t: testAddress}}, vorpal, context);
  t.is(getCurrentNetwork.callCount, 1);
  t.is(balanceOfTokens.callCount, 1);
  t.is(findTokens.callCount, 1);
  t.is(allTokens.callCount, 0);
  t.is(log.callCount, 1);
  t.true(log.args[0][0].includes('MT'));
  t.true(log.args[0][0].includes('0.1'));

  await balanceCommand({options: {t: ''}}, vorpal, context);
  t.is(getCurrentNetwork.callCount, 2);
  t.is(balanceOfTokens.callCount, 2);
  t.is(findTokens.callCount, 1);
  t.is(allTokens.callCount, 1);
  t.is(log.callCount, 2);
  t.true(log.args[1][0].includes('MT'));
  t.true(log.args[1][0].includes('0.1'));
});

test.serial('balanceCommand: balance', async t => {
  const {log, vorpal} = mockVoral();
  const wallet = {};
  const allTokens = dbService().allTokens as SinonStub;
  const getWallet = createOrSetStub([null, wallet]);
  const getCurrentNetwork = createOrSetStub([{chain: 4, coin: 'ETH'}]);
  const context = {
    getCurrentNetwork,
    getWallet,
  } as unknown as Context;
  const balanceOfTokens = createOrSetStub(
    [[{symbol: 'MT', balance: '0.01'}]],
    walletService().balanceOfTokens as SinonStub
  );
  const balanceOfCoin = createOrSetStub(
    [[{symbol: 'ETH', balance: '0.1'}]],
    walletService().balanceOfCoin as SinonStub
  );

  await balanceCommand({options: {}}, vorpal, context);
  t.is(getCurrentNetwork.callCount, 0);
  t.is(balanceOfCoin.callCount, 0);
  t.is(balanceOfTokens.callCount, 0);
  t.is(allTokens.callCount, 0);
  t.is(log.callCount, 0);

  await balanceCommand({options: {}}, vorpal, context);
  t.is(getCurrentNetwork.callCount, 1);
  t.is(balanceOfCoin.callCount, 1);
  t.is(balanceOfTokens.callCount, 1);
  t.is(allTokens.callCount, 1);
  t.is(log.callCount, 1);
  t.true(log.args[0][0].includes('ETH'));
  t.true(log.args[0][0].includes('0.1'));
  t.true(log.args[0][0].includes('MT'));
  t.true(log.args[0][0].includes('0.01'));
});
