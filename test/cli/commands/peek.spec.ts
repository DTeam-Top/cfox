import test from 'ava';
import {SinonStub} from 'sinon';
import {peekCommand} from '../../../src/cli/commands/peek';
import {Context} from '../../../src/cli/context';
import {walletService} from '../../../src/types/container';
import {createOrSetStub, mockVoral} from '../../_utils';

test('peekCommand: peek', async t => {
  const {vorpal} = mockVoral();
  const wallet = {};
  const getWallet = createOrSetStub([null, wallet, wallet, wallet]);
  const context = {
    getWallet,
  } as unknown as Context;
  const peekErc20 = createOrSetStub(
    [{}],
    walletService().peekErc20 as SinonStub
  );
  const peekErc721 = createOrSetStub(
    [{}],
    walletService().peekErc721 as SinonStub
  );

  await peekCommand({options: {erc20: 'mockAddress'}}, vorpal, context);
  t.is(
    peekErc20.callCount,
    0,
    'peekErc20 should not be called when wallet is null.'
  );
  t.is(
    peekErc721.callCount,
    0,
    'peekErc721 should not be called when wallet is null.'
  );

  await peekCommand({options: {erc20: 'mockAddress'}}, vorpal, context);
  t.is(peekErc20.callCount, 1);
  t.is(peekErc20.args[0][0], wallet);
  t.is(peekErc20.args[0][1], 'mockAddress');
  t.is(peekErc721.callCount, 0);

  await peekCommand({options: {erc721: 'mockAddress'}}, vorpal, context);
  t.is(peekErc20.callCount, 1);
  t.is(peekErc721.callCount, 1);
  t.is(peekErc721.args[0][0], wallet);
  t.is(peekErc721.args[0][1], 'mockAddress');
  t.is(peekErc721.args[0][2], undefined);

  await peekCommand(
    {options: {erc721: 'mockAddress', t: 'mockTokenId'}},
    vorpal,
    context
  );
  t.is(peekErc20.callCount, 1);
  t.is(peekErc721.callCount, 2);
  t.is(peekErc721.args[1][0], wallet);
  t.is(peekErc721.args[1][1], 'mockAddress');
  t.is(peekErc721.args[1][2], 'mockTokenId');
});
