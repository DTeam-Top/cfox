/* eslint-disable no-empty */
import test from 'ava';
import sinon, {SinonStub} from 'sinon';
import {Context} from '../../src/cli/context';
import {delay} from '../../src/commons';
import {RESERVED_NETWORKS} from '../../src/constant';
import {walletService} from '../../src/types/container';
import {mockVoral} from '../_utils';

test('init with null wallet', async t => {
  const {delimiter, vorpal} = mockVoral();
  const currentNetwork = RESERVED_NETWORKS[0];
  const context = new Context(vorpal, '123', currentNetwork, null);

  t.deepEqual(context.current(), {chain: 1, address: undefined});
  t.deepEqual(context.getCurrentNetwork(), currentNetwork);
  t.is(context.getCurrentAccount(), null);
  t.is(context.getWallet(), null);
  t.is(context.getPassword(), '123');
  t.is(context.currentDelimiter(), `cfox[?||${currentNetwork.name}]=#`);
  t.is(delimiter.callCount, 1);
  t.is(delimiter.args[0][0], `cfox[?||${currentNetwork.name}]=#`);

  const newNetwork = RESERVED_NETWORKS[1];
  context.setCurrentNetwork(newNetwork);
  t.is(context.getWallet(), null);
  t.is(context.currentDelimiter(), `cfox[?||${newNetwork.name}]=#`);
  t.is(delimiter.callCount, 2);
  t.is(delimiter.args[1][0], `cfox[?||${newNetwork.name}]=#`);
});

test('init with a wallet', async t => {
  const {delimiter, vorpal} = mockVoral();
  const currentNetwork = RESERVED_NETWORKS[0];
  const currentAccount = {
    address: '345',
    details: '789',
  };
  const password = '123';
  const connect = sinon.stub().returns({connect: sinon.stub()});
  const loadWallet = (walletService().loadWallet as SinonStub).returns({
    connect,
  });

  const context = new Context(vorpal, '123', currentNetwork, currentAccount);

  await delay(1000);

  t.is(context.getPassword(), password);
  t.deepEqual(context.current(), {
    chain: currentNetwork.chain,
    address: currentAccount.address,
  });
  t.deepEqual(context.getCurrentNetwork(), currentNetwork);
  t.deepEqual(context.getCurrentAccount(), currentAccount);
  t.not(context.getWallet(), null);
  t.is(
    context.currentDelimiter(),
    `cfox[${currentAccount.address}||${currentNetwork.name}]=#`
  );
  t.is(loadWallet.callCount, 1);
  t.is(loadWallet.args[0][0], password);
  t.deepEqual(loadWallet.args[0][1], currentAccount);
  t.is(delimiter.callCount, 1);
  t.is(
    delimiter.args[0][0],
    `cfox[${currentAccount.address}||${currentNetwork.name}]=#`
  );

  const newNetwork = RESERVED_NETWORKS[1];
  const oldWallet = context.getWallet();
  context.setCurrentNetwork(newNetwork);
  t.true(context.getWallet() !== oldWallet);
  t.is(
    context.currentDelimiter(),
    `cfox[${currentAccount.address}||${newNetwork.name}]=#`
  );
  t.is(delimiter.callCount, 2);
  t.is(
    delimiter.args[1][0],
    `cfox[${currentAccount.address}||${newNetwork.name}]=#`
  );
});
