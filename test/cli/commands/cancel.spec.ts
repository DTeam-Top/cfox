/* eslint-disable no-empty */
/* eslint-disable node/no-unpublished-import */
import test from 'ava';
import {SinonStub} from 'sinon';
import {cancelCommand} from '../../../src/cli/commands/cancel';
import {Context} from '../../../src/cli/context';
import {walletService} from '../../../src/types/container';
import {createOrSetStub, mockVoral} from '../../_utils';

test.serial('cancelCommand: cancel', async t => {
  const {vorpal} = mockVoral();
  const wallet = {address: '0x123'};
  const getWallet = createOrSetStub([null, wallet, wallet]);
  const context = {
    getWallet,
  } as unknown as Context;
  const cancelTxByNonce = createOrSetStub(
    [{}],
    walletService().cancelTxByNonce as SinonStub
  );
  const cancelTxByHash = createOrSetStub(
    [{}],
    walletService().cancelTxByHash as SinonStub
  );

  await cancelCommand({options: {n: 1}}, vorpal, context);
  t.is(
    cancelTxByNonce.callCount,
    0,
    'cancelTxByNonce should not be called when wallet is null.'
  );

  await cancelCommand({options: {n: 1}}, vorpal, context);
  t.is(cancelTxByHash.callCount, 0);
  t.is(cancelTxByNonce.callCount, 1);
  t.is(cancelTxByNonce.args[0][0], wallet);
  t.is(cancelTxByNonce.args[0][1], 1);

  await cancelCommand({options: {tx: '123'}}, vorpal, context);

  t.is(cancelTxByNonce.callCount, 1);
  t.is(cancelTxByHash.callCount, 1);
  t.is(cancelTxByHash.args[0][0], wallet);
  t.is(cancelTxByHash.args[0][1], '123');
});
