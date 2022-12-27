/* eslint-disable no-empty */
import test from 'ava';
import sinon, {SinonStub} from 'sinon';
import {gpCommand} from '../../../src/cli/commands/gp';
import {Context} from '../../../src/cli/context';
import {walletService} from '../../../src/types/container';
import {createOrSetStub, mockVoral} from '../../_utils';

test('gpCommand: gp', async t => {
  const {vorpal} = mockVoral();
  const provider = sinon.stub();
  const getWallet = createOrSetStub([null, {provider}]);
  const context = {
    getWallet,
  } as unknown as Context;
  const gasPrice = createOrSetStub([{}], walletService().gasPrice as SinonStub);

  await gpCommand({options: {}}, vorpal, context);
  t.is(
    gasPrice.callCount,
    0,
    'gasPrice should not be called when wallet is null.'
  );

  await gpCommand({options: {}}, vorpal, context);
  t.is(gasPrice.callCount, 1);
  t.is(gasPrice.args[0][0], provider);
});
