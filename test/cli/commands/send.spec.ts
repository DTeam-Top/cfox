/* eslint-disable no-empty */
import test from 'ava';
import sinon, {SinonStub} from 'sinon';
import {sendCommand} from '../../../src/cli/commands/send';
import {Context} from '../../../src/cli/context';
import {dbService, walletService} from '../../../src/types/container';
import {createOrSetStub, mockVoral, testAddress, testToken} from '../../_utils';

test.beforeEach(() => {
  sinon.reset();
});

test.serial('sendCommand: send', async t => {
  const prompt = createOrSetStub([
    {confirm: false},
    {confirm: true},
    {price: '123'},
  ]);
  const {vorpal} = mockVoral(prompt);
  const wallet = {};
  const getWallet = createOrSetStub([null, wallet]);
  const getCurrentNetwork = createOrSetStub([{chain: 4, coin: 'ETH'}]);
  const context = {
    getCurrentNetwork,
    getWallet,
  } as unknown as Context;
  createOrSetStub(
    [[{symbol: 'ETH', balance: '0.1'}]],
    walletService().balanceOfCoin as SinonStub
  );
  const send = createOrSetStub(
    [{gasPrices: [{gwei: 1}]}],
    walletService().send as SinonStub
  );

  await sendCommand({options: {}}, vorpal, context);
  t.is(send.callCount, 0, 'send should not be called when wallet is null.');

  await sendCommand({amount: -1, options: {}}, vorpal, context);
  t.is(send.callCount, 0, 'send should not be called when amoutn < 0.');

  try {
    await sendCommand({amount: '1', options: {}}, vorpal, context);
  } catch (e) {}
  t.is(
    send.callCount,
    0,
    'send should not be called when Insufficent balance.'
  );

  await sendCommand(
    {amount: '0.01', target: testAddress, options: {}},
    vorpal,
    context
  );
  t.is(send.callCount, 1);
  t.deepEqual(send.args[0][0], wallet);
  t.is(send.args[0][1], testAddress);
  t.is(send.args[0][2], '0.01');
  t.is(send.args[0][3], null);
  t.is(send.args[0][4], null);
  t.true(send.args[0][5]);

  await sendCommand(
    {amount: '0.01', target: testAddress, options: {}},
    vorpal,
    context
  );
  t.is(send.callCount, 3);
  t.deepEqual(send.args[2][0], wallet);
  t.is(send.args[2][1], testAddress);
  t.is(send.args[2][2], '0.01');
  t.is(send.args[2][3], '123');
  t.is(send.args[2][4], null);
  t.false(send.args[2][5]);
});

test.serial('sendCommand: send -t', async t => {
  const prompt = createOrSetStub([
    {confirm: false},
    {confirm: true},
    {price: '123'},
  ]);
  const {vorpal} = mockVoral(prompt);
  const wallet = {};
  createOrSetStub([null, testToken], dbService().findToken as SinonStub);
  const getWallet = createOrSetStub([null, wallet]);
  const getCurrentNetwork = createOrSetStub([{chain: 4, coin: 'ETH'}]);
  const context = {
    getCurrentNetwork,
    getWallet,
  } as unknown as Context;
  createOrSetStub(
    [[{symbol: testToken.symbol, balance: '0.1'}]],
    walletService().balanceOfTokens as SinonStub
  );
  const send = createOrSetStub(
    [{gasPrices: [{gwei: 1}]}],
    walletService().send as SinonStub
  );

  await sendCommand({options: {t: testToken.address}}, vorpal, context);
  t.is(send.callCount, 0, 'send should not be called when wallet is null.');

  await sendCommand(
    {amount: -1, options: {t: testToken.address}},
    vorpal,
    context
  );
  t.is(send.callCount, 0, 'send should not be called when amoutn < 0.');

  try {
    await sendCommand(
      {amount: '1', options: {t: testToken.address}},
      vorpal,
      context
    );
  } catch (e) {}
  t.is(send.callCount, 0, 'send should not be called when token not found.');

  try {
    await sendCommand(
      {amount: '1', options: {t: testToken.address}},
      vorpal,
      context
    );
  } catch (e) {}
  t.is(
    send.callCount,
    0,
    'send should not be called when Insufficent balance.'
  );

  await sendCommand(
    {amount: '0.01', target: testAddress, options: {t: testToken.address}},
    vorpal,
    context
  );
  t.is(send.callCount, 1);
  t.deepEqual(send.args[0][0], wallet);
  t.is(send.args[0][1], testAddress);
  t.is(send.args[0][2], '0.01');
  t.is(send.args[0][3], null);
  t.deepEqual(send.args[0][4], testToken);
  t.true(send.args[0][5]);

  await sendCommand(
    {amount: '0.01', target: testAddress, options: {t: testToken.address}},
    vorpal,
    context
  );
  t.is(send.callCount, 3);
  t.deepEqual(send.args[2][0], wallet);
  t.is(send.args[2][1], testAddress);
  t.is(send.args[2][2], '0.01');
  t.is(send.args[2][3], '123');
  t.deepEqual(send.args[2][4], testToken);
  t.false(send.args[2][5]);
});
