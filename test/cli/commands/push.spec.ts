/* eslint-disable no-empty */
/* eslint-disable node/no-unpublished-import */
import test from 'ava';
import {SinonStub} from 'sinon';
import {pushCommand} from '../../../src/cli/commands/push';
import {Context} from '../../../src/cli/context';
import {walletService} from '../../../src/types/container';
import {createOrSetStub, mockVoral} from '../../_utils';

test('pushCommand: push', async t => {
  const {vorpal} = mockVoral();
  const wallet = {address: '0x123'};
  const getWallet = createOrSetStub([null, wallet]);
  const context = {
    getWallet,
  } as unknown as Context;
  const pushTx = createOrSetStub([{}], walletService().pushTx as SinonStub);

  await pushCommand({txHash: '123', options: {}}, vorpal, context);
  t.is(pushTx.callCount, 0, 'pushTx should not be called when wallet is null.');

  await pushCommand({txHash: '123', options: {}}, vorpal, context);
  t.is(pushTx.callCount, 1);
  t.is(pushTx.args[0][0], wallet);
  t.is(pushTx.args[0][1], '123');
});
