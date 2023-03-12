import test from 'ava';
import {SinonStub} from 'sinon';
import {walletsCommand} from '../../../src/cli/commands/wallets';
import {walletService} from '../../../src/types/container';
import {mockVoral} from '../../_utils';

test('walletsCommand: wallets', async t => {
  const {vorpal} = mockVoral();
  const generateRandomAccounts = walletService()
    .generateRandomAccounts as SinonStub;

  await walletsCommand({options: {}}, vorpal);
  t.is(generateRandomAccounts.callCount, 1);
  t.is(generateRandomAccounts.args[0][0], 10);

  await walletsCommand({options: {n: '3'}}, vorpal);
  t.is(generateRandomAccounts.callCount, 2);
  t.is(generateRandomAccounts.args[1][0], 3);
});
