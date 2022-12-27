/* eslint-disable no-empty */
import test from 'ava';
import {SinonStub} from 'sinon';
import {singleTransferCommand} from '../../../src/cli/commands/transfer';
import {Context} from '../../../src/cli/context';
import {dbService, walletService} from '../../../src/types/container';
import {createOrSetStub, mockVoral, testNft721} from '../../_utils';

test.serial('singleTransferCommand: transfer', async t => {
  const prompt = createOrSetStub([
    {confirm: false},
    {confirm: true},
    {price: '123'},
  ]);
  const {vorpal} = mockVoral(prompt);
  const wallet = {address: '0x123'};
  createOrSetStub([null, testNft721], dbService().findNft as SinonStub);
  const getWallet = createOrSetStub([null, wallet]);
  const getCurrentNetwork = createOrSetStub([{chain: 4, coin: 'ETH'}]);
  const context = {
    getCurrentNetwork,
    getWallet,
  } as unknown as Context;

  createOrSetStub(['0x456', '0x123'], walletService().ownerOf as SinonStub);
  const singleTransfer = createOrSetStub(
    [{gasPrices: [{gwei: 1}]}],
    walletService().singleTransfer as SinonStub
  );

  await singleTransferCommand(
    {contract: '0x123', target: '0x123', id: '1', options: {}},
    vorpal,
    context
  );
  t.is(
    singleTransfer.callCount,
    0,
    'singleTransfer should not be called when wallet is null.'
  );

  try {
    await singleTransferCommand(
      {contract: '0x123', target: '0x123', id: '1', options: {}},
      vorpal,
      context
    );
  } catch (e) {}
  t.is(
    singleTransfer.callCount,
    0,
    'singleTransfer should not be called when nft not found.'
  );

  try {
    await singleTransferCommand(
      {contract: '0x123', target: '0x123', id: '1', options: {}},
      vorpal,
      context
    );
  } catch (e) {}
  t.is(
    singleTransfer.callCount,
    0,
    'singleTransfer should not be called when current account not owner.'
  );

  await singleTransferCommand(
    {contract: '0x123', target: '0x123', id: '1', options: {}},
    vorpal,
    context
  );
  t.is(singleTransfer.callCount, 1);
  t.deepEqual(singleTransfer.args[0][0], testNft721);
  t.is(singleTransfer.args[0][1], wallet);
  t.is(singleTransfer.args[0][2], '0x123');
  t.is(singleTransfer.args[0][3], '1');
  t.is(singleTransfer.args[0][4], null);
  t.true(singleTransfer.args[0][5]);

  await singleTransferCommand(
    {contract: '0x123', target: '0x123', id: '1', options: {}},
    vorpal,
    context
  );
  t.is(singleTransfer.callCount, 3);
  t.deepEqual(singleTransfer.args[2][0], testNft721);
  t.is(singleTransfer.args[2][1], wallet);
  t.is(singleTransfer.args[2][2], '0x123');
  t.is(singleTransfer.args[2][3], '1');
  t.is(singleTransfer.args[2][4], '123');
  t.false(singleTransfer.args[2][5]);
});
