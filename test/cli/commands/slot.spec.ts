/* eslint-disable no-empty */
import test from 'ava';
import {SinonStub} from 'sinon';
import {slotCommand} from '../../../src/cli/commands/slot';
import {Context} from '../../../src/cli/context';
import {walletService} from '../../../src/types/container';
import {createOrSetStub, mockVoral} from '../../_utils';

test.serial('slotCommand: slot', async t => {
  const {vorpal} = mockVoral();
  const wallet = {provider: {}};
  const getWallet = createOrSetStub([null, wallet]);
  const context = {
    getWallet,
  } as unknown as Context;
  const slot = createOrSetStub([''], walletService().slot as SinonStub);

  await slotCommand({contract: '123', options: {i: true}}, vorpal, context);
  t.is(slot.callCount, 0, 'slot should not be called when wallet is null.');

  await slotCommand({contract: '123', options: {i: true}}, vorpal, context);
  t.is(slot.callCount, 1);
  t.deepEqual(slot.args[0][0], wallet.provider);
  t.is(slot.args[0][1], '123');
  t.is(slot.args[0][2], undefined);

  await slotCommand({contract: '324', options: {p: 1}}, vorpal, context);
  t.is(slot.callCount, 2);
  t.deepEqual(slot.args[1][0], wallet.provider);
  t.is(slot.args[1][1], '324');
  t.is(slot.args[1][2], 1);
});
