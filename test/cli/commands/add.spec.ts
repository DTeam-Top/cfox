/* eslint-disable no-empty */
import test from 'ava';
import sinon, {SinonStub} from 'sinon';
import {addCommand} from '../../../src/cli/commands/add';
import {Context} from '../../../src/cli/context';
import {dbService, walletService} from '../../../src/types/container';
import {
  createOrSetStub,
  mockVoral,
  testAccount,
  testMnemonic,
  testNetwork,
  testNft721,
  testPk,
  testToken,
} from '../../_utils';

test.beforeEach(() => {
  sinon.reset();
});

test.serial('addCommand: "\\a -c"', async t => {
  const prompt = createOrSetStub([testNetwork]);
  const {vorpal} = mockVoral(prompt);
  const addNetwork = dbService().addNetwork as SinonStub;

  await addCommand({options: {c: true}}, vorpal);

  t.is(addNetwork.callCount, 1);
  t.deepEqual(addNetwork.args[0][0], testNetwork);
});

test.serial('addCommand: "\\a -t"', async t => {
  const prompt = createOrSetStub([
    {address: '0x123'},
    {address: testToken.address},
    {confirm: false},
    {address: testToken.address},
    {confirm: true},
  ]);
  const wallet = {};
  const getWallet = createOrSetStub([null, wallet]);
  const {vorpal} = mockVoral(prompt);
  const addToken = dbService().addToken as SinonStub;
  const getCurrentNetwork = createOrSetStub([{chain: 1}]);
  const context = {
    getCurrentNetwork,
    getWallet,
  } as unknown as Context;
  const loadToken = createOrSetStub(
    [testToken],
    walletService().loadToken as SinonStub
  );

  await addCommand({options: {t: true}}, vorpal, context);
  t.is(
    addToken.callCount,
    0,
    'addToken should not be called when current wallet is null.'
  );

  try {
    await addCommand({options: {t: true}}, vorpal, context);
  } catch (e) {}
  t.is(
    addToken.callCount,
    0,
    'addToken should not be called with bad address.'
  );

  await addCommand({options: {t: true}}, vorpal, context);
  t.is(
    getCurrentNetwork.callCount,
    0,
    'addToken should not be called when confirm is false.'
  );

  await addCommand({options: {t: true}}, vorpal, context);
  t.is(addToken.callCount, 1);
  t.is(addToken.args[0][0], 1);
  t.deepEqual(addToken.args[0][1], testToken);
  t.is(loadToken.args[0][0], testToken.address);
});

test.serial('addCommand: "\\a -n"', async t => {
  const prompt = createOrSetStub([
    {address: '0x123'},
    {address: testNft721.address},
    {confirm: false},
    {address: testNft721.address},
    {confirm: true},
  ]);
  const wallet = {};
  const getWallet = createOrSetStub([null, wallet]);
  const {vorpal} = mockVoral(prompt);
  const addNft = dbService().addNft as SinonStub;
  const getCurrentNetwork = createOrSetStub([{chain: 1}]);
  const context = {
    getCurrentNetwork,
    getWallet,
  } as unknown as Context;
  const loadNft = createOrSetStub(
    [testNft721],
    walletService().loadNft as SinonStub
  );

  await addCommand({options: {n: true}}, vorpal, context);
  t.is(
    addNft.callCount,
    0,
    'addNft should not be called when current wallet is null.'
  );

  try {
    await addCommand({options: {n: true}}, vorpal, context);
  } catch (e) {}
  t.is(addNft.callCount, 0, 'addNft should not be called with bad address.');

  await addCommand({options: {n: true}}, vorpal, context);
  t.is(
    addNft.callCount,
    0,
    'addNft should not be called when confirm is false.'
  );

  await addCommand({options: {n: true}}, vorpal, context);
  t.is(addNft.callCount, 1);
  t.is(addNft.args[0][0], 1);
  t.deepEqual(addNft.args[0][1], testNft721);
  t.is(loadNft.args[0][0], testNft721.address);
});

test.serial('addCommand: "\\a -a"', async t => {
  const {vorpal} = mockVoral();
  const addAccount = dbService().addAccount as SinonStub;
  createOrSetStub([[testAccount]], dbService().allAccounts as SinonStub);
  const setCurrentAccount = sinon.stub();
  const getPassword = createOrSetStub(['password']);
  const getCurrentAccount = createOrSetStub([testAccount, null]);
  const context = {
    getCurrentAccount,
    setCurrentAccount,
    getPassword,
  } as unknown as Context;
  const createRandomAccount = createOrSetStub(
    [testAccount],
    walletService().createRandomAccount as SinonStub
  );

  await addCommand({options: {a: ''}}, vorpal, context);
  t.is(createRandomAccount.callCount, 1);
  t.is(createRandomAccount.args[0][0], 'password');
  t.is(addAccount.callCount, 1);
  t.deepEqual(addAccount.args[0][0], testAccount);
  t.is(getPassword.callCount, 1);
  t.is(getCurrentAccount.callCount, 1);
  t.is(
    setCurrentAccount.callCount,
    0,
    'setCurrentAccount should not be called when current account is set.'
  );

  await addCommand({options: {a: ''}}, vorpal, context);
  t.is(createRandomAccount.callCount, 2);
  t.is(createRandomAccount.args[1][0], 'password');
  t.is(addAccount.callCount, 2);
  t.deepEqual(addAccount.args[1][0], testAccount);
  t.is(getPassword.callCount, 2);
  t.is(getCurrentAccount.callCount, 2);
  t.is(setCurrentAccount.callCount, 1);
  t.deepEqual(setCurrentAccount.args[0][0], testAccount);
});

test.serial('addCommand: "\\a -a <pk>"', async t => {
  const {vorpal} = mockVoral();
  const addAccount = dbService().addAccount as SinonStub;
  createOrSetStub([[testAccount]], dbService().allAccounts as SinonStub);
  const setCurrentAccount = sinon.stub();
  const getPassword = createOrSetStub(['password']);
  const getCurrentAccount = createOrSetStub([testAccount, null]);
  const context = {
    getCurrentAccount,
    setCurrentAccount,
    getPassword,
  } as unknown as Context;
  const createAccountByPrivateKey = createOrSetStub(
    [testAccount],
    walletService().createAccountByPrivateKey as SinonStub
  );

  await addCommand({options: {a: testPk}}, vorpal, context);
  t.is(createAccountByPrivateKey.callCount, 1);
  t.is(createAccountByPrivateKey.args[0][0], 'password');
  t.is(createAccountByPrivateKey.args[0][1], testPk);
  t.is(addAccount.callCount, 1);
  t.deepEqual(addAccount.args[0][0], testAccount);
  t.is(getPassword.callCount, 1);
  t.is(getCurrentAccount.callCount, 1);
  t.is(
    setCurrentAccount.callCount,
    0,
    'setCurrentAccount should not be called when current account is set.'
  );

  await addCommand({options: {a: testPk}}, vorpal, context);
  t.is(createAccountByPrivateKey.callCount, 2);
  t.is(createAccountByPrivateKey.args[1][0], 'password');
  t.is(createAccountByPrivateKey.args[1][1], testPk);
  t.is(addAccount.callCount, 2);
  t.deepEqual(addAccount.args[1][0], testAccount);
  t.is(getPassword.callCount, 2);
  t.is(getCurrentAccount.callCount, 2);
  t.is(setCurrentAccount.callCount, 1);
  t.deepEqual(setCurrentAccount.args[0][0], testAccount);
});

test.serial('addCommand: "\\a -a <mnemonic>"', async t => {
  const {vorpal} = mockVoral();
  const addAccount = dbService().addAccount as SinonStub;
  createOrSetStub([[testAccount]], dbService().allAccounts as SinonStub);
  const setCurrentAccount = sinon.stub();
  const getPassword = createOrSetStub(['password']);
  const getCurrentAccount = createOrSetStub([testAccount, null]);
  const context = {
    getCurrentAccount,
    setCurrentAccount,
    getPassword,
  } as unknown as Context;
  const createAccountByMnemonic = createOrSetStub(
    [testAccount],
    walletService().createAccountByMnemonic as SinonStub
  );

  await addCommand({options: {a: testMnemonic}}, vorpal, context);
  t.is(createAccountByMnemonic.callCount, 1);
  t.is(createAccountByMnemonic.args[0][0], 'password');
  t.is(createAccountByMnemonic.args[0][1], testMnemonic);
  t.is(addAccount.callCount, 1);
  t.deepEqual(addAccount.args[0][0], testAccount);
  t.is(getPassword.callCount, 1);
  t.is(getCurrentAccount.callCount, 1);
  t.is(
    setCurrentAccount.callCount,
    0,
    'setCurrentAccount should not be called when current account is set.'
  );

  await addCommand({options: {a: testMnemonic}}, vorpal, context);
  t.is(createAccountByMnemonic.callCount, 2);
  t.is(createAccountByMnemonic.args[1][0], 'password');
  t.is(createAccountByMnemonic.args[1][1], testMnemonic);
  t.is(addAccount.callCount, 2);
  t.deepEqual(addAccount.args[1][0], testAccount);
  t.is(getPassword.callCount, 2);
  t.is(getCurrentAccount.callCount, 2);
  t.is(setCurrentAccount.callCount, 1);
  t.deepEqual(setCurrentAccount.args[0][0], testAccount);
});
