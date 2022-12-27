/* eslint-disable no-empty */
/* eslint-disable node/no-unpublished-import */
import test from 'ava';
import sinon, {SinonStub} from 'sinon';
import {queryCommand} from '../../../src/cli/commands/query';
import {Context} from '../../../src/cli/context';
import {MAX_ITEMS_PER_PAGE} from '../../../src/constant';
import {walletService} from '../../../src/types/container';
import {createOrSetStub, mockVoral} from '../../_utils';

test.beforeEach(() => {
  sinon.reset();
});

test.serial('queryCommand: query', async t => {
  const prompt = createOrSetStub([
    {eventAbi: 'bad abi'},
    {
      eventAbi: 'function name() public view returns (string)',
    },
    {
      eventAbi:
        'event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)',
    },
    {args: '1 2 3 4'},
    {
      eventAbi:
        'event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)',
    },
    {args: '1 2'},
    {
      start: 'earliest',
    },
    {end: 'latest'},
    {
      eventAbi:
        'event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)',
    },
    {args: ''},
    {
      start: '1000',
    },
    {end: '2000'},
    {
      eventAbi:
        'event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)',
    },
    {args: ' 2'},
    {
      start: '-1000',
    },
  ]);
  const {vorpal} = mockVoral(prompt);
  const wallet = {};
  const getWallet = createOrSetStub([null, wallet]);
  const context = {
    getWallet,
  } as unknown as Context;
  const query = createOrSetStub(
    [{result: 'mock'}],
    walletService().query as SinonStub
  );

  await queryCommand({contract: '0x123', options: {}}, vorpal, context);
  t.is(query.callCount, 0, 'query should not be called when wallet is null.');

  try {
    await queryCommand({contract: '0x123', options: {}}, vorpal, context);
  } catch (e) {}
  t.is(query.callCount, 0, 'query should not be called with bad abi.');

  try {
    await queryCommand({contract: '0x123', options: {}}, vorpal, context);
  } catch (e) {}
  t.is(query.callCount, 0, 'query should not be called with non event.');

  try {
    await queryCommand({contract: '0x123', options: {}}, vorpal, context);
  } catch (e) {}
  t.is(
    query.callCount,
    0,
    'should not be called with wrong number of arguments.'
  );

  await queryCommand({contract: '0x123', options: {}}, vorpal, context);
  t.is(query.callCount, 1);
  t.is(query.args[0][0], '0x123');
  t.is(query.args[0][1], wallet);
  t.is(
    query.args[0][2],
    'event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)'
  );
  t.deepEqual(query.args[0][3], ['1', '2']);
  t.is(query.args[0][4], 'earliest');
  t.is(query.args[0][5], 'latest');

  await queryCommand({contract: '0x123', options: {}}, vorpal, context);
  t.is(query.callCount, 2);
  t.is(query.args[1][0], '0x123');
  t.is(query.args[1][1], wallet);
  t.is(
    query.args[1][2],
    'event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)'
  );
  t.deepEqual(query.args[1][3], [null]);
  t.is(query.args[1][4], 1000);
  t.is(query.args[1][5], 2000);

  await queryCommand({contract: '0x123', options: {}}, vorpal, context);
  t.is(query.callCount, 3);
  t.is(query.args[2][0], '0x123');
  t.is(query.args[2][1], wallet);
  t.is(
    query.args[2][2],
    'event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)'
  );
  t.deepEqual(query.args[2][3], [null, '2']);
  t.is(query.args[2][4], -1000);
  t.is(query.args[2][5], null);
});

test.serial('queryCommand: query (pagination)', async t => {
  const prompt = createOrSetStub([
    {
      eventAbi:
        'event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)',
    },
    {args: '1 2'},
    {
      start: 'earliest',
    },
    {end: 'latest'},
    {confirm: false},
    {
      eventAbi:
        'event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)',
    },
    {args: '1 2'},
    {
      start: 'earliest',
    },
    {end: 'latest'},
    {confirm: true},
  ]);
  const {log, vorpal} = mockVoral(prompt);
  const wallet = {};
  const getWallet = createOrSetStub([wallet]);
  const context = {
    getWallet,
  } as unknown as Context;
  const query = createOrSetStub(
    [
      [
        {result: 'mock'},
        {result: 'mock'},
        {result: 'mock'},
        {result: 'mock'},
        {result: 'mock'},
        {result: 'mock'},
        {result: 'mock'},
        {result: 'mock'},
        {result: 'mock'},
        {result: 'mock'},
        {result: 'mock'},
        {result: 'mock'},
        {result: 'mock'},
        {result: 'mock'},
        {result: 'mock'},
        {result: 'mock'},
        {result: 'mock'},
        {result: 'mock'},
        {result: 'mock'},
        {result: 'mock'},
        {result: 'mock'},
        {result: 'mock'},
        {result: 'mock'},
        {result: 'mock'},
      ],
    ],
    walletService().query as SinonStub
  );

  await queryCommand({contract: '0x123', options: {}}, vorpal, context);
  t.is(query.callCount, 1);
  t.is(log.callCount, 1);
  t.is(log.args[0][0].split('mock').length, MAX_ITEMS_PER_PAGE + 1);

  await queryCommand({contract: '0x123', options: {}}, vorpal, context);
  t.is(query.callCount, 2);
  t.is(log.callCount, 3);
  t.is(log.args[2][0].split('mock').length, 4 + 1);
});
