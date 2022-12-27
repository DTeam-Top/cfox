/* eslint-disable no-empty */
import test from 'ava';
import {SinonStub} from 'sinon';
import {nftCommand} from '../../../src/cli/commands/nft';
import {Context} from '../../../src/cli/context';
import {
  dbService,
  walletService,
  webService,
} from '../../../src/types/container';
import {createOrSetStub, mockVoral, testNft721} from '../../_utils';

test.serial('nftCommand: nft', async t => {
  const {vorpal} = mockVoral();
  const wallet = {address: '0x123'};
  createOrSetStub([null, testNft721], dbService().findNft as SinonStub);
  const getWallet = createOrSetStub([null, wallet]);
  const getCurrentNetwork = createOrSetStub([{chain: 4, coin: 'ETH'}]);
  const context = {
    getCurrentNetwork,
    getWallet,
  } as unknown as Context;
  const tokens = walletService().tokens as SinonStub;

  await nftCommand({contract: '0x123', options: {}}, vorpal, context);
  t.is(tokens.callCount, 0, 'tokens should not be called when wallet is null.');

  try {
    await nftCommand({contract: '0x123', options: {}}, vorpal, context);
  } catch (e) {}
  t.is(tokens.callCount, 0, 'tokens should not be called when nft not found.');

  await nftCommand({contract: '0x123', options: {}}, vorpal, context);
  t.is(tokens.callCount, 1);
  t.deepEqual(tokens.args[0][0], testNft721);
  t.is(tokens.args[0][1], wallet);
  t.true(tokens.args[0][2]);

  await nftCommand({contract: '0x123', options: {v: true}}, vorpal, context);
  t.is(tokens.callCount, 2);
  t.deepEqual(tokens.args[1][0], testNft721);
  t.is(tokens.args[1][1], wallet);
  t.false(tokens.args[1][2]);

  tokens.rejects();
  const webTokens = webService().tokens as SinonStub;
  webTokens.returns([]);

  await nftCommand({contract: '0x123', options: {}}, vorpal, context);
  t.is(webTokens.callCount, 1);
  t.is(webTokens.args[0][0], wallet.address);
  t.is(webTokens.args[0][1], testNft721.address);
  t.is(webTokens.args[0][2], 4);
  t.true(webTokens.args[0][3]);

  await nftCommand({contract: '0x123', options: {v: true}}, vorpal, context);
  t.is(webTokens.callCount, 2);
  t.is(webTokens.args[1][0], wallet.address);
  t.is(webTokens.args[1][1], testNft721.address);
  t.is(webTokens.args[1][2], 4);
  t.false(webTokens.args[1][3]);
});
