// eslint-disable-next-line node/no-unpublished-import
import test from 'ava';
import Database from 'better-sqlite3';
import {unlinkSync} from 'fs';
import 'reflect-metadata';
import {isEmpty} from '../../src/commons';
import {KEYS, RESERVED_NETWORKS} from '../../src/constant';
import {Db} from '../../src/storage/storage';
import {Nft} from '../../src/types/types';

const db = new Db();

const account1 = {
  address: '0x37e766Af1a12b2E506b203f45778cDe8A6f58887',
  details: 'string',
};
const account2 = {
  address: '0x37e766Af1a12b2E506b203f45778cDe8A6f58888',
  details: 'string',
};

test.afterEach(() => {
  db.initDb();
});

test.serial('settings should work', async t => {
  t.true(db.isNotConfigured());
  t.is(db.getSettings(), null);

  const settings = {
    passwordHash: '0x123',
    dbVersion: '123',
  };
  db.saveSettings(settings);

  t.false(db.isNotConfigured());
  t.deepEqual(db.getSettings(), settings);
});

test.serial('backup should work', async t => {
  const name = await db.backup('');
  const sqlite = new Database(name);
  const result = sqlite.prepare('select count(*) counts from networks').get();
  t.true(result.counts > 0);
  sqlite.close();
  unlinkSync(name);
});

test.serial('keys should work', async t => {
  t.is(db.getKeys().length, KEYS.length);
  t.is(db.getKey('infura'), null);
  t.is(db.getKey('morails'), null);
  t.is(db.getKey('nft.storage'), null);

  db.setKey('infura', '123');
  t.is(db.getKey('infura'), '123');

  db.setKey('infura', null);
});

test.serial(
  'should throw an exception when passing an unsupported key.',
  async t => {
    const error = t.throws(() => {
      db.setKey('randomKey', '123');
    });
    t.true(error?.message.includes('Only'));
  }
);

test.serial('accounts should work', async t => {
  t.true(isEmpty(db.allAccounts()));

  db.addAccount(account1);
  t.deepEqual(db.getAccount(account1.address), account1);
  t.deepEqual(db.allAccounts(), [account1]);

  let error = t.throws(() => {
    db.addAccount(account1);
  });
  t.is(error!.message, `Account ${account1.address} already exists.`);

  db.addAccount(account2);
  t.deepEqual(db.getAccount(account2.address), account2);
  t.deepEqual(db.allAccounts(), [account1, account2]);

  t.deepEqual(db.removeAccount(account1.address, true), account1);
  t.deepEqual(db.allAccounts(), [account1, account2]);

  db.removeAccount(account1.address);
  t.false(!!db.getAccount(account1.address));
  t.deepEqual(db.allAccounts(), [account2]);

  error = t.throws(() => {
    db.removeAccount(account1.address);
  });
  t.is(error!.message, `Account ${account1.address} does not exist.`);

  db.removeAccount(account2.address);
  t.true(isEmpty(db.allAccounts()));
});

test.serial('networks should work', async t => {
  t.deepEqual(
    db.allNetworks(),
    RESERVED_NETWORKS.sort((a, b) => {
      return a.chain - b.chain;
    })
  );

  const network1 = {
    name: 'network',
    chain: 2,
    coin: 'ETH',
    tokens: {},
    nfts: {},
    explorerUrl: '',
  };
  db.addNetwork(network1);
  t.deepEqual(db.getNetwork(network1.chain), network1);
  t.is(db.allNetworks().length, RESERVED_NETWORKS.length + 1);

  let error = t.throws(() => {
    db.addNetwork(network1);
  });
  t.is(error!.message, `Network ${network1.chain} already exists.`);

  const network2 = {
    name: 'network',
    chain: 21,
    coin: 'ETH',
    explorerUrl: '',
    tokens: {},
    nfts: {},
  };
  db.addNetwork(network2);
  t.deepEqual(db.getNetwork(network2.chain), network2);
  t.is(db.allNetworks().length, RESERVED_NETWORKS.length + 2);

  t.deepEqual(db.removeNetwork(network1.chain, true), network1);
  t.deepEqual(db.getNetwork(network1.chain), network1);

  db.removeNetwork(network1.chain);
  t.false(!!db.getNetwork(network1.chain));
  t.is(db.allNetworks().length, RESERVED_NETWORKS.length + 1);

  error = t.throws(() => {
    db.removeNetwork(network1.chain);
  });
  t.is(error!.message, `Network ${network1.chain} does not exist.`);

  db.removeNetwork(network2.chain);
  t.deepEqual(db.allNetworks(), RESERVED_NETWORKS);
});

test.serial('tokens should work', async t => {
  t.true(isEmpty(db.allTokens(1)));

  const token1 = {
    address: '0x6F10B7B2587981eD5Ee8a7485B7992271d4107a4',
    name: 'MockToken',
    symbol: 'MT',
    decimals: 18,
  };
  db.addToken(1, token1);
  t.deepEqual(db.findToken(1, token1.address), token1);
  t.deepEqual(db.allTokens(1), [token1]);
  t.deepEqual(db.findTokens(1, [token1.address]), [token1]);

  let error = t.throws(() => {
    db.addToken(2, token1);
  });
  t.is(error!.message, 'Network 2 does not exist.');

  error = t.throws(() => {
    db.addToken(1, token1);
  });
  t.is(error!.message, `Token ${token1.address} already exists.`);

  const token2 = {
    address: '0x6F10B7B2587981eD5Ee8a7485B7992271d4107a5',
    name: 'MockToken',
    symbol: 'MT',
    decimals: 18,
  };
  db.addToken(1, token2);
  t.deepEqual(db.findToken(1, token2.address), token2);
  t.deepEqual(db.allTokens(1), [token1, token2]);
  t.deepEqual(db.findTokens(1, [token1.address, token2.address]), [
    token1,
    token2,
  ]);
  t.deepEqual(db.findTokens(1, [token2.address]), [token2]);
  t.deepEqual(db.findTokens(1, [token1.address]), [token1]);

  t.deepEqual(db.removeToken(1, token1.address, true), token1);
  t.true(!!db.findToken(1, token1.address));

  db.removeToken(1, token1.address);
  t.false(!!db.findToken(1, token1.address));
  t.true(isEmpty(db.findTokens(1, [token1.address])));
  t.deepEqual(db.allTokens(1), [token2]);

  error = t.throws(() => {
    db.removeToken(2, token1.address);
  });
  t.is(error!.message, 'Network 2 does not exist.');

  error = t.throws(() => {
    db.removeToken(1, token1.address);
  });
  t.is(error!.message, `Token ${token1.address} does not exists.`);

  db.removeToken(1, token2.address);
  t.true(isEmpty(db.allTokens(1)));
});

test.serial('nfts should work', async t => {
  t.true(isEmpty(db.allNfts(1)));
  t.true(isEmpty(db.allNfts(1, 'erc721')));
  t.true(isEmpty(db.allNfts(1, 'erc1155')));

  const nft7211 = {
    address: '0x6F10B7B2587981eD5Ee8a7485B7992271d4107a4',
    name: 'MockToken',
    symbol: 'MT',
    type: 'erc721',
  } as Nft;
  db.addNft(1, nft7211);
  t.deepEqual(db.findNft(1, nft7211.address), nft7211);
  t.deepEqual(db.allNfts(1), [nft7211]);
  t.deepEqual(db.allNfts(1, 'erc721'), [nft7211]);
  t.deepEqual(db.findNfts(1, [nft7211.address]), [nft7211]);

  let error = t.throws(() => {
    db.addNft(2, nft7211);
  });
  t.is(error!.message, 'Network 2 does not exist.');

  error = t.throws(() => {
    db.addNft(1, nft7211);
  });
  t.is(error!.message, `Nft ${nft7211.address} already exists.`);

  const nft7212 = {
    address: '0x6F10B7B2587981eD5Ee8a7485B7992271d4107a5',
    name: 'MockToken',
    symbol: 'MT',
    type: 'erc721',
  } as Nft;
  db.addNft(1, nft7212);
  t.deepEqual(db.findNft(1, nft7212.address), nft7212);
  t.deepEqual(db.allNfts(1), [nft7211, nft7212]);
  t.deepEqual(db.allNfts(1, 'erc721'), [nft7211, nft7212]);
  t.deepEqual(db.findNfts(1, [nft7211.address, nft7212.address]), [
    nft7211,
    nft7212,
  ]);
  t.deepEqual(db.findNfts(1, [nft7212.address]), [nft7212]);

  const nft1155 = {
    address: '0x6F10B7B2587981eD5Ee8a7485B7992271d4107a6',
    name: 'MockToken',
    symbol: 'MT',
    type: 'erc1155',
  } as Nft;
  db.addNft(1, nft1155);
  t.deepEqual(db.findNft(1, nft1155.address), nft1155);
  t.deepEqual(db.allNfts(1), [nft7211, nft7212, nft1155]);
  t.deepEqual(db.allNfts(1, 'erc721'), [nft7211, nft7212]);
  t.deepEqual(db.allNfts(1, 'erc1155'), [nft1155]);
  t.deepEqual(db.findNfts(1, [nft1155.address]), [nft1155]);

  t.deepEqual(db.removeNft(1, nft7211.address, true), nft7211);
  t.true(!!db.findNft(1, nft7211.address));

  db.removeNft(1, nft7211.address);
  t.false(!!db.findNft(1, nft7211.address));
  t.true(isEmpty(db.findNfts(1, [nft7211.address])));
  t.deepEqual(db.allNfts(1), [nft7212, nft1155]);
  t.deepEqual(db.allNfts(1, 'erc721'), [nft7212]);

  error = t.throws(() => {
    db.removeNft(2, nft7211.address);
  });
  t.is(error!.message, 'Network 2 does not exist.');

  error = t.throws(() => {
    db.removeNft(1, nft7211.address);
  });
  t.is(error!.message, `Nft ${nft7211.address} does not exists.`);

  db.removeNft(1, nft1155.address);
  db.removeNft(1, nft7212.address);
  t.true(isEmpty(db.allNfts(1)));
  t.true(isEmpty(db.allNfts(1, 'erc721')));
  t.true(isEmpty(db.allNfts(1, 'erc1155')));
});

test.serial(
  'removing a network should remove all its tokens and nfts.',
  async t => {
    t.true(isEmpty(db.allTokens(3)));
    t.true(isEmpty(db.allNfts(3)));

    const network = {
      name: 'network',
      chain: 31,
      coin: 'ETH',
      tokens: {},
      nfts: {},
    };
    db.addNetwork(network);

    const token = {
      address: '0x6F10B7B2587981eD5Ee8a7485B7992271d4107a4',
      name: 'MockToken',
      symbol: 'MT',
      decimals: 18,
    };
    db.addToken(network.chain, token);
    t.false(isEmpty(db.allTokens(network.chain)));

    const nft = {
      address: '0x6F10B7B2587981eD5Ee8a7485B7992271d4107a4',
      name: 'MockToken',
      symbol: 'MT',
      type: 'erc721',
    } as Nft;
    db.addNft(network.chain, nft);
    t.false(isEmpty(db.allNfts(network.chain)));

    db.removeNetwork(network.chain);
    t.true(isEmpty(db.allTokens(network.chain)));
    t.true(isEmpty(db.allNfts(network.chain)));
  }
);

test.serial('current should work.', async t => {
  t.deepEqual(
    db.getCurrent(),
    {
      network: RESERVED_NETWORKS[0],
      account: null,
    },
    'should return correct default value when no accounts.'
  );

  db.addAccount(account1);
  db.addAccount(account2);
  t.deepEqual(
    db.getCurrent(),
    {
      network: RESERVED_NETWORKS[0],
      account: account1,
    },
    'should return correct default value when having accounts.'
  );

  db.saveCurrent({chain: 4});
  t.deepEqual(db.getCurrent(), {
    network: db.getNetwork(4),
    account: null,
  });

  db.saveCurrent({chain: 1, address: account2.address});
  t.deepEqual(db.getCurrent(), {
    network: db.getNetwork(1),
    account: account2,
  });
});
