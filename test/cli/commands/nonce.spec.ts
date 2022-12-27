import test from 'ava';
import sinon, {SinonStub} from 'sinon';
import {nonceCommand} from '../../../src/cli/commands/nonce';
import {Context} from '../../../src/cli/context';
import {walletService} from '../../../src/types/container';
import {createOrSetStub, mockVoral} from '../../_utils';

test.serial('nonceCommand: nonce', async t => {
  const {vorpal} = mockVoral();
  const provider = sinon.stub();
  const wallet = {address: '0x123', provider};
  const getWallet = createOrSetStub([null, wallet, wallet]);
  const context = {
    getWallet,
  } as unknown as Context;
  const nonceDetails = createOrSetStub(
    [{}],
    walletService().nonceDetails as SinonStub
  );

  await nonceCommand({options: {}}, vorpal, context);
  t.is(
    nonceDetails.callCount,
    0,
    'nonceDetails should not be called when wallet is null.'
  );

  await nonceCommand({options: {}}, vorpal, context);
  t.is(nonceDetails.callCount, 1);
  t.is(nonceDetails.args[0][0], provider);
  t.is(nonceDetails.args[0][1], wallet.address);

  await nonceCommand({account: 'mockAddress', options: {}}, vorpal, context);

  t.is(nonceDetails.callCount, 2);
  t.is(nonceDetails.args[1][0], provider);
  t.is(nonceDetails.args[1][1], 'mockAddress');
});
