// eslint-disable-next-line node/no-unpublished-import
import test from 'ava';
import sinon, {SinonStub} from 'sinon';
import Vorpal from 'vorpal';
import {startCLi} from '../../src/cli/cli';
import {delay} from '../../src/commons';
import {dbService} from '../../src/types/container';
import {createOrSetStub} from '../_utils';

test.beforeEach(() => {
  sinon.reset();
});

test('start flow (not initailized): init -> login -> install', async t => {
  const vorpal = new Vorpal();
  createOrSetStub([true], dbService().isNotConfigured as SinonStub);
  createOrSetStub(
    [
      {
        network: {
          name: 'goerli',
          chain: 5,
          coin: 'ETH',
          tokens: {},
        },
      },
    ],
    dbService().getCurrent as SinonStub
  );

  let initCommandExecuted = false;
  const init = {
    name: 'init',
    handler: async () => {
      await delay(2000);
      initCommandExecuted = true;
      createOrSetStub([false], dbService().isNotConfigured as SinonStub);
    },
  };

  let loginCommandExecuted = false;
  const login = {
    name: 'login',
    handler: async () => {
      await delay(2000);
      loginCommandExecuted = true;
      return {logined: true, password: ''};
    },
  };

  startCLi(vorpal, init, login, [
    {
      name: 'command1',
      handler: async () => {},
    },
  ]);

  t.is(vorpal.find(init.name)._name, init.name, 'init command not installed');

  while (!initCommandExecuted) {
    await delay(1000);
  }

  t.true(initCommandExecuted, 'init command not executed.');
  t.true(vorpal.find(init.name) === undefined, 'init command not removed.');

  t.is(
    vorpal.find(login.name)._name,
    login.name,
    'login command not installed'
  );

  while (!loginCommandExecuted) {
    await delay(1000);
  }

  t.true(loginCommandExecuted, 'login command not executed.');
  t.true(vorpal.find(login.name) === undefined, 'login command not removed.');
  t.is(vorpal.find('command1')._name, 'command1', 'command1 not installed');
});

test('start flow (initailized): login -> install', async t => {
  const vorpal = new Vorpal();
  createOrSetStub([false], dbService().isNotConfigured as SinonStub);
  createOrSetStub(
    [
      {
        network: {
          name: 'goerli',
          chain: 5,
          coin: 'ETH',
          tokens: {},
        },
      },
    ],
    dbService().getCurrent as SinonStub
  );

  const init = {
    name: 'init',
    handler: async () => {},
  };

  let loginCommandExecuted = false;
  const login = {
    name: 'login',
    handler: async () => {
      await delay(2000);
      loginCommandExecuted = true;
      return {logined: true, password: ''};
    },
  };

  startCLi(vorpal, init, login, [
    {
      name: 'command1',
      handler: async () => {},
    },
  ]);

  t.true(vorpal.find(init.name) === undefined, 'init command installed');

  t.is(
    vorpal.find(login.name)._name,
    login.name,
    'login command not installed'
  );

  while (!loginCommandExecuted) {
    await delay(1000);
  }

  t.true(loginCommandExecuted, 'login command not executed.');
  t.true(vorpal.find(login.name) === undefined, 'login command not removed.');
  t.is(vorpal.find('command1')._name, 'command1', 'command1 not installed');
});
