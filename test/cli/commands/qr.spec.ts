import test from 'ava';
import {qrCommand} from '../../../src/cli/commands/qr';
import {Context} from '../../../src/cli/context';
import {createOrSetStub, mockVoral} from '../../_utils';

test('qrCommand: "\\qr [account]"', async t => {
  const {log, vorpal} = mockVoral();
  const getCurrentAccount = createOrSetStub([{address: '0x123'}]);
  const context = {
    getCurrentAccount,
  } as unknown as Context;

  await qrCommand({account: '123', options: {}}, vorpal, context);
  t.is(log.callCount, 1);
  t.is(
    getCurrentAccount.callCount,
    0,
    'getCurrentAccount should not be called when account is provided.'
  );

  await qrCommand({options: {}}, vorpal, context);
  t.is(log.callCount, 2);
  t.is(getCurrentAccount.callCount, 1);
});
