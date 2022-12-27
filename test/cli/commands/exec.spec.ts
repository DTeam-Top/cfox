/* eslint-disable no-empty */
import test from 'ava';
import {parseEther} from 'ethers/lib/utils';
import sinon, {SinonStub} from 'sinon';
import {execCommand} from '../../../src/cli/commands/exec';
import {Context} from '../../../src/cli/context';
import {walletService} from '../../../src/types/container';
import {createOrSetStub, mockVoral} from '../../_utils';

test.beforeEach(() => {
  sinon.reset();
});

test.serial('execCommand: exec', async t => {
  const prompt = createOrSetStub([
    {methodAbi: 'bad abi'},
    {
      methodAbi:
        'event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)',
    },
    {
      methodAbi: 'function name() public view returns (string)',
    },
    {
      methodAbi: 'function balanceOf(address) external view returns (uint256)',
    },
    {args: '1 2 3'},
    {
      methodAbi: 'function balanceOf(address) external view returns (uint256)',
    },
    {args: '0x123'},
    {
      methodAbi:
        'function safeTransferFrom(address, address, uint256) external',
    },
    {args: '0x123 0x456 1'},
    {confirm: false},
    {
      methodAbi:
        'function safeTransferFrom(address, address, uint256) external',
    },
    {args: '0x123 0x456 1'},
    {confirm: true},
    {price: '123'},
  ]);
  const {vorpal} = mockVoral(prompt);
  const wallet = {};
  const getWallet = createOrSetStub([null, wallet]);
  const context = {
    getWallet,
  } as unknown as Context;
  const read = createOrSetStub(
    [{result: 'mock'}],
    walletService().read as SinonStub
  );
  const exec = createOrSetStub(
    [{gasPrices: [{gwei: 1}], gasEstimation: '1000'}],
    walletService().exec as SinonStub
  );

  await execCommand({contract: '0x123', options: {}}, vorpal, context);
  t.is(read.callCount, 0, 'read should not be called when wallet is null.');
  t.is(exec.callCount, 0, 'exec should not be called when wallet is null.');

  try {
    await execCommand({contract: '0x123', options: {}}, vorpal, context);
  } catch (e) {}
  t.is(read.callCount, 0, 'read should not be called with bad abi.');
  t.is(exec.callCount, 0, 'exec should not be called when bad abi.');

  try {
    await execCommand({contract: '0x123', options: {}}, vorpal, context);
  } catch (e) {}
  t.is(read.callCount, 0, 'read should not be called with non function.');
  t.is(exec.callCount, 0, 'exec should not be called when non function.');

  await execCommand({contract: '0x123', options: {}}, vorpal, context);
  t.is(read.callCount, 1);
  t.is(read.args[0][0], '0x123');
  t.is(read.args[0][1], wallet);
  t.is(read.args[0][2], 'function name() public view returns (string)');
  t.deepEqual(read.args[0][3], []);
  t.is(exec.callCount, 0, 'exec should not be called with readonly function.');

  try {
    await execCommand({contract: '0x123', options: {}}, vorpal, context);
  } catch (e) {}
  t.is(
    read.callCount,
    1,
    'should not be called with wrong number of arguments.'
  );
  t.is(exec.callCount, 0, 'exec should not be called with readonly function.');

  await execCommand({contract: '0x123', options: {}}, vorpal, context);
  t.is(read.callCount, 2);
  t.is(read.args[1][0], '0x123');
  t.is(read.args[1][1], wallet);
  t.is(
    read.args[1][2],
    'function balanceOf(address) external view returns (uint256)'
  );
  t.deepEqual(read.args[1][3], ['0x123']);
  t.is(exec.callCount, 0, 'exec should not be called with readonly function.');

  await execCommand({contract: '0x123', options: {}}, vorpal, context);
  t.is(read.callCount, 2, 'read should not be called with writeonly function.');
  t.is(exec.callCount, 1);
  t.is(exec.args[0][0], '0x123');
  t.is(exec.args[0][1], wallet);
  t.is(
    exec.args[0][2],
    'function safeTransferFrom(address, address, uint256) external'
  );
  t.deepEqual(exec.args[0][3], ['0x123', '0x456', '1']);
  t.deepEqual(exec.args[0][4], {});
  t.true(exec.args[0][5]);

  await execCommand({contract: '0x123', options: {}}, vorpal, context);
  t.is(read.callCount, 2, 'read should not be called with writeonly function.');
  t.is(exec.callCount, 3);
  t.is(exec.args[2][0], '0x123');
  t.is(exec.args[2][1], wallet);
  t.is(
    exec.args[2][2],
    'function safeTransferFrom(address, address, uint256) external'
  );
  t.deepEqual(exec.args[2][3], ['0x123', '0x456', '1']);
  t.deepEqual(exec.args[2][4], {gasLimit: '1000'});
  t.false(exec.args[2][5]);
});

test.serial('execCommand: exec (payable)', async t => {
  const prompt = createOrSetStub([
    {
      methodAbi: 'function mintApe(uint) public payable',
    },
    {args: '10'},
    {paidEth: '10'},
    {
      methodAbi: 'function mintApe(uint) public payable',
    },
    {args: '10'},
    {paidEth: '10'},
    {confirm: true},
    {price: '123'},
  ]);
  const {vorpal} = mockVoral(prompt);
  const wallet = {};
  const getWallet = createOrSetStub([wallet]);
  const getCurrentNetwork = createOrSetStub([{coin: 'ETH'}]);
  const context = {
    getWallet,
    getCurrentNetwork,
  } as unknown as Context;
  const exec = createOrSetStub(
    [{gasPrices: [{gwei: 1}], gasEstimation: '1000'}],
    walletService().exec as SinonStub
  );
  createOrSetStub(
    [[{balance: '0.1'}], [{balance: '100'}]],
    walletService().balanceOfCoin as SinonStub
  );

  try {
    await execCommand({contract: '0x123', options: {}}, vorpal, context);
  } catch (e) {}
  t.is(
    exec.callCount,
    0,
    'exec should not be called when balance is not enough.'
  );

  await execCommand({contract: '0x123', options: {}}, vorpal, context);
  t.is(exec.callCount, 2);
  t.deepEqual(exec.args[0][4], {value: parseEther('10')});
  t.deepEqual(exec.args[1][4], {value: parseEther('10'), gasLimit: '1000'});
});
