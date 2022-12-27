/* eslint-disable node/no-unpublished-import */
import test from 'ava';
import 'reflect-metadata';
import {EthWallet} from '../../src/eth/wallet';

import {BigNumber} from 'bignumber.js';
import {deployContract, MockProvider} from 'ethereum-waffle';
import {ethers, Wallet} from 'ethers';
import {SinonStub} from 'sinon';
import MockERC20 from '../../abi/MockERC20.json';
import MockERC721 from '../../abi/MockERC721.json';
import {isEmpty} from '../../src/commons';
import {ethersOf, parseEthers, parseUnits} from '../../src/eth/ethUtils';
import {webService} from '../../src/types/container';
import {Nft, TxDetails} from '../../src/types/types';

const provider = new MockProvider();
const instance = new EthWallet();

test('an account can be created and loaded in different ways', async t => {
  const accountRandom = await instance.createRandomAccount('123');
  const accountPk1 = await instance.createAccountByPrivateKey(
    '123',
    (
      await instance.loadWallet('123', accountRandom)
    ).privateKey
  );
  t.is(accountPk1.address, accountRandom.address);

  const accountMn = await instance.createAccountByMnemonic(
    '123',
    'announce room limb pattern dry unit scale effort smooth jazz weasel alcohol'
  );
  const accountPk2 = await instance.createAccountByPrivateKey(
    '123',
    (
      await instance.loadWallet('123', accountMn)
    ).privateKey
  );
  t.is(accountPk2.address, accountMn.address);
});

test.serial('balance and send should work for ETH', async t => {
  const wallet1 = provider.getWallets()[0];
  const wallet2 = provider.getWallets()[1];

  t.deepEqual(
    await instance.balanceOfCoin(wallet1, 'ETH'),
    await instance.balanceOfCoin(wallet2, 'ETH')
  );

  const txDetails = (await instance.send(
    wallet1,
    wallet2.address,
    '100',
    null,
    null,
    true
  )) as TxDetails;
  t.true(!!txDetails.details);
  t.true(!!txDetails.gasEstimation);
  t.true(!!txDetails.gasFees);
  t.true(!!txDetails.gasPrices);
  t.deepEqual(
    await instance.balanceOfCoin(wallet1, 'ETH'),
    await instance.balanceOfCoin(wallet2, 'ETH')
  );

  await instance.send(wallet1, wallet2.address, '100', '10', null, false);

  const [balance1, balance2] = await Promise.all([
    instance.balanceOfCoin(wallet1, 'ETH'),
    instance.balanceOfCoin(wallet2, 'ETH'),
  ]);
  t.true(
    new BigNumber(balance1[0].balance).lt(new BigNumber(balance2[0].balance))
  );
});

test.serial('Erc20 functions should work.', async t => {
  const wallet1 = provider.getWallets()[0];
  const wallet2 = provider.getWallets()[1];
  const erc20 = await deployContract(wallet1, MockERC20, [parseEthers('10')]);
  const token = {
    name: 'MockERC20',
    symbol: 'MT20',
    decimals: 18,
    address: erc20.address,
  };

  t.deepEqual(await instance.loadToken(erc20.address, wallet1), token);

  t.deepEqual(await instance.balanceOfTokens(wallet1, [token]), [
    {balance: '10.0', symbol: 'MT20'},
  ]);

  t.deepEqual(await instance.balanceOfTokens(wallet2, [token]), [
    {balance: '0.0', symbol: 'MT20'},
  ]);

  const txDetails = (await instance.send(
    wallet1,
    wallet2.address,
    '1',
    '10',
    token,
    true
  )) as TxDetails;
  t.true(!!txDetails.details);
  t.true(!!txDetails.gasEstimation);
  t.true(!!txDetails.gasFees);
  t.true(!!txDetails.gasPrices);
  t.deepEqual(await instance.balanceOfTokens(wallet2, [token]), [
    {balance: '0.0', symbol: 'MT20'},
  ]);

  await instance.send(wallet1, wallet2.address, '1', '10', token, false);

  const [balance1, balance2] = await Promise.all([
    instance.balanceOfTokens(wallet1, [token]),
    instance.balanceOfTokens(wallet2, [token]),
  ]);

  t.true(new BigNumber(balance1[0].balance).lt('10.0'));
  t.is(balance2[0].balance, '1.0');

  const result = await instance.peekErc20(wallet1, erc20.address);
  t.is(result.name, 'MockERC20');
  t.is(result.symbol, 'MT20');
  t.is(result.decimals, 18);
  t.true(!!result.totalSupply);
});

test.serial('Erc721 functions should work.', async t => {
  const wallet1 = provider.getWallets()[0];
  const wallet2 = provider.getWallets()[1];
  const erc721 = await deployContract(wallet1, MockERC721, [
    'MockERC721',
    'M7',
  ]);

  const nft = {
    name: 'MockERC721',
    symbol: 'M7',
    address: erc721.address,
    type: 'erc721',
  };

  const get = webService().get as SinonStub;

  const tx = await erc721.mint(wallet1.address, 1);
  await tx.wait();
  t.is(await instance.balanceOfNft(nft as Nft, wallet1), 1);
  t.is(await instance.balanceOfNft(nft as Nft, wallet2), 0);

  t.deepEqual(await instance.loadNft(erc721.address, wallet1), nft);

  const tokenUri1 = await erc721.tokenURI('1');
  await instance.metadata(nft as Nft, '1', wallet1);
  t.is((webService().get as SinonStub).callCount, 1);
  t.is(get.args[0][0], tokenUri1);

  t.deepEqual(await instance.tokens(nft as Nft, wallet1, true), [
    {
      name: 'MockERC721',
      symbol: 'M7',
      type: nft.type,
      tokenId: '1',
    },
  ]);
  t.true(isEmpty(await instance.tokens(nft as Nft, wallet2, true)));

  get.returns('metadata');
  t.deepEqual(await instance.tokens(nft as Nft, wallet1, false), [
    {
      name: 'MockERC721',
      symbol: 'M7',
      type: nft.type,
      tokenId: '1',
      metadata: 'metadata',
    },
  ]);

  const mockMetadata = {
    name: 'token1',
    image: 'ipfs',
    tokenId: '2',
    attributes: [{attribute1: 'attribute1'}],
  };
  get.returns(mockMetadata);
  t.deepEqual(await instance.tokens(nft as Nft, wallet1, false), [
    {
      name: 'MockERC721',
      symbol: 'M7',
      type: nft.type,
      tokenId: '1',
      metadata: mockMetadata,
    },
  ]);

  t.is(await instance.ownerOf(nft as Nft, wallet1, '1'), wallet1.address);

  const txDetails = (await instance.singleTransfer(
    nft as Nft,
    wallet1,
    wallet2.address,
    '1',
    null,
    true
  )) as TxDetails;
  t.true(!!txDetails.details);
  t.true(!!txDetails.gasEstimation);
  t.true(!!txDetails.gasFees);
  t.true(!!txDetails.gasPrices);
  t.is(await instance.ownerOf(nft as Nft, wallet1, '1'), wallet1.address);

  await instance.singleTransfer(
    nft as Nft,
    wallet1,
    wallet2.address,
    '1',
    '1',
    false
  );

  t.is(await instance.ownerOf(nft as Nft, wallet1, '1'), wallet2.address);

  let result = await instance.peekErc721(wallet1, erc721.address);
  t.is(result.name, 'MockERC721');
  t.is(result.symbol, 'M7');
  t.is(result.contractURI, 'failed');
  t.is(result.tokenURI, undefined);

  result = await instance.peekErc721(wallet1, erc721.address, '1');
  t.is(result.name, 'MockERC721');
  t.is(result.symbol, 'M7');
  t.is(result.contractURI, 'failed');
  t.not(result.tokenURI, undefined);

  let error = await t.throwsAsync(async () => {
    await instance.cancelTxByHash(
      wallet1,
      '0xf8166a6a615bc90b56079536b100eb96a1e8fa7bc1c9e8d507da1761fbc7ebfe'
    );
  });
  t.true(error!.message.includes("Can't find transaction"));

  error = await t.throwsAsync(async () => {
    await instance.pushTx(
      wallet1,
      '0xf8166a6a615bc90b56079536b100eb96a1e8fa7bc1c9e8d507da1761fbc7ebfe'
    );
  });
  t.true(error!.message.includes("Can't find transaction"));

  error = await t.throwsAsync(async () => {
    await instance.cancelTxByHash(wallet1, tx.hash);
  });
  t.true(error!.message.includes('minted'));

  error = await t.throwsAsync(async () => {
    await instance.pushTx(wallet1, tx.hash);
  });
  t.true(error!.message.includes('minted'));

  error = await t.throwsAsync(async () => {
    await instance.cancelTxByNonce(wallet1, 1);
  });
  t.true(error!.message.includes('not blocked'));
});

test.serial('read / exec / query should work.', async t => {
  const wallet1 = provider.getWallets()[0];
  const wallet2 = provider.getWallets()[1];
  const erc20 = await deployContract(wallet1, MockERC20, [parseEthers('10')]);
  const token = {
    name: 'MockERC20',
    symbol: 'MT20',
    decimals: 18,
    address: erc20.address,
  };

  t.deepEqual(
    await instance.read(
      erc20.address,
      wallet1,
      'function name() public view returns (string)',
      []
    ),
    {result: 'MockERC20'}
  );

  t.true(
    'result' in
      (await instance.read(
        erc20.address,
        wallet1,
        'function balanceOf(address) external view returns (uint256)',
        [wallet1.address]
      ))
  );

  t.is(
    (
      await instance.query(
        erc20.address,
        wallet1,
        'event Transfer(address indexed from, address indexed to, uint256 value)',
        [],
        'earliest',
        'latest'
      )
    ).length,
    1
  );

  t.is(
    (
      await instance.query(
        erc20.address,
        wallet1,
        'event Transfer(address indexed from, address indexed to, uint256 value)',
        [ethers.constants.AddressZero],
        'earliest',
        'latest'
      )
    ).length,
    1
  );

  t.is(
    (
      await instance.query(
        erc20.address,
        wallet1,
        'event Transfer(address indexed from, address indexed to, uint256 value)',
        [wallet1.address],
        'earliest',
        'latest'
      )
    ).length,
    0
  );

  const txDetails = (await instance.exec(
    erc20.address,
    wallet1,
    'function transfer(address, uint256) returns (bool)',
    [wallet2.address, '1'],
    null,
    true
  )) as TxDetails;
  t.true(!!txDetails.details);
  t.true(!!txDetails.gasEstimation);
  t.true(!!txDetails.gasFees);
  t.true(!!txDetails.gasPrices);
  t.deepEqual(await instance.balanceOfTokens(wallet2, [token]), [
    {balance: '0.0', symbol: 'MT20'},
  ]);

  t.is(
    (
      await instance.query(
        erc20.address,
        wallet1,
        'event Transfer(address indexed from, address indexed to, uint256 value)',
        [wallet1.address],
        'earliest',
        'latest'
      )
    ).length,
    0
  );

  await instance.exec(
    erc20.address,
    wallet1,
    'function transfer(address, uint256) returns (bool)',
    [wallet2.address, parseUnits('1', token.decimals)],
    null,
    false
  );

  const [balance1, balance2] = await Promise.all([
    instance.balanceOfTokens(wallet1, [token]),
    instance.balanceOfTokens(wallet2, [token]),
  ]);

  t.true(new BigNumber(balance1[0].balance).lt('10.0'));
  t.is(balance2[0].balance, '1.0');

  await instance.exec(
    erc20.address,
    wallet1,
    'function payableMethod() public payable returns (bool)',
    [],
    {value: parseEthers('1.0')},
    false
  );

  const balanceOfContract = ethersOf(await provider.getBalance(erc20.address));
  t.is(balanceOfContract, '1.0');

  t.is(
    (
      await instance.query(
        erc20.address,
        wallet1,
        'event Transfer(address indexed from, address indexed to, uint256 value)',
        [wallet1.address],
        'earliest',
        'latest'
      )
    ).length,
    1
  );

  t.is(
    (
      await instance.query(
        erc20.address,
        wallet1,
        'event Transfer(address indexed from, address indexed to, uint256 value)',
        [null, wallet2.address],
        'earliest',
        'latest'
      )
    ).length,
    1
  );
});

test('generateRandomAccounts should work.', t => {
  const result = instance.generateRandomAccounts(3);
  t.is(result.length, 3);
  for (let i = 0; i < 3; i++) {
    t.is(new Wallet(result[i].privateKey).address, result[i].address);
  }
});

// test('pending tx related commands should work.', async t => {
//   const server = Ganache.server({
//     chain: {
//       hardfork: 'berlin',
//     },
//     logging: {quiet: true},
//     miner: {
//       blockTime: 10,
//       instamine: 'strict',
//     },
//   });
//   await server.listen(8545);

//   const urlProvider = new ethers.providers.JsonRpcProvider(
//     'http://localhost:8545'
//   );

//   const accounts = server.provider.getInitialAccounts();
//   const wallet1 = new Wallet(
//     accounts[Object.keys(accounts)[0]].secretKey,
//     urlProvider
//   );
//   const wallet2 = new Wallet(
//     accounts[Object.keys(accounts)[1]].secretKey,
//     urlProvider
//   );

//   const tx1 = await wallet1.sendTransaction({
//     to: wallet2.address,
//     value: parseEthers('1'),
//   });

//   const tx2 = await wallet1.sendTransaction({
//     to: wallet2.address,
//     value: parseEthers('1'),
//     nonce: tx1.nonce,
//   });

//   await tx2.wait();

//   console.log(ethersOf(await wallet1.getBalance()));

//   const tx3 = await wallet1.sendTransaction({
//     to: wallet2.address,
//     value: parseEthers('1'),
//   });

//   await tx3.wait();

//   console.log(ethersOf(await wallet1.getBalance()));

//   await server.close();

//   t.pass();
// });
