/* eslint-disable no-empty */
import test from 'ava';
import sinon, {SinonStub} from 'sinon';
import {ensCommand} from '../../../src/cli/commands/ens';
import {Context} from '../../../src/cli/context';
import {walletService} from '../../../src/types/container';
import {createOrSetStub, mockVoral} from '../../_utils';

test('ensCommand: ens', async t => {
  const {vorpal} = mockVoral();
  const provider = sinon.stub();
  const getWallet = createOrSetStub([null, {provider}, {provider}]);
  const context = {
    getWallet,
  } as unknown as Context;
  const lookupAddress = createOrSetStub(
    [{}],
    walletService().lookupAddress as SinonStub
  );
  const resolveName = createOrSetStub(
    [{}],
    walletService().resolveName as SinonStub
  );

  await ensCommand({options: {}}, vorpal, context);
  t.is(
    lookupAddress.callCount,
    0,
    'lookupAddress should not be called when wallet is null.'
  );
  t.is(
    resolveName.callCount,
    0,
    'resolveName should not be called when wallet is null.'
  );

  await ensCommand(
    {value: '0x37e766Af1a12b2E506b203f45778cDe8A6f58887', options: {}},
    vorpal,
    context
  );
  t.is(lookupAddress.callCount, 1);
  t.is(resolveName.callCount, 0);

  await ensCommand({value: 'test.eth', options: {}}, vorpal, context);
  t.is(lookupAddress.callCount, 1);
  t.is(resolveName.callCount, 1);
});
