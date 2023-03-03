import Database from 'better-sqlite3';
import {injectable} from 'inversify';
import path from 'path';
import {createPathIfNotExisting, should} from '../commons';
import {DB_NAME, KEYS, RESERVED_NETWORKS} from '../constant';
import {
  Account,
  Current,
  DbInterface,
  Network,
  Nft,
  Settings,
  Token,
} from '../types/types';

@injectable()
export class Db implements DbInterface {
  private readonly SETTINGS_TABLE = 'settings';
  private readonly KEYS_TABLE = 'keys';
  private readonly ACCOUNTS_TABLE = 'accounts';
  private readonly NETWORKS_TABLE = 'networks';
  private readonly CURRENT_TABLE = 'current';
  private sqlite: ReturnType<typeof Database>;

  constructor() {
    this.sqlite = new Database(DB_NAME);
    this.initDb();
    this.migrate();
    this.closeDbWhenExit();
  }

  async backup(targetPath: string) {
    if (targetPath) {
      createPathIfNotExisting(targetPath);
    }

    const name = path.join(targetPath, `cfox-${Date.now()}.db`);
    await this.sqlite.backup(name);
    return name;
  }

  isNotConfigured(): boolean {
    return !this.getSettings();
  }

  saveSettings(settings: Settings) {
    let stmt;

    if (!this.getSettings()) {
      stmt = this.sqlite.prepare(
        `insert into ${this.SETTINGS_TABLE} (dbVersion, passwordHash) values(?,?)`
      );
    } else {
      stmt = this.sqlite.prepare(
        `update ${this.SETTINGS_TABLE} set dbVersion = ?, passwordHash = ?`
      );
    }

    stmt.run(settings.dbVersion, settings.passwordHash);
  }

  getSettings(): Settings | null {
    const settings = this.sqlite
      .prepare(`select * from ${this.SETTINGS_TABLE}`)
      .get();
    return settings || null;
  }

  setKey(name: string, value: string | null) {
    should(KEYS.includes(name), `Only [${KEYS.join(',')}] supported.`);

    const stmt = this.sqlite.prepare(
      `update ${this.KEYS_TABLE} set value = ? where name = ?`
    );

    stmt.run(value, name);
  }

  getKeys(): {name: string; value: string}[] {
    return this.sqlite.prepare(`select * from ${this.KEYS_TABLE}`).all();
  }

  getKey(name: string): string | null {
    should(KEYS.includes(name), `Only [${KEYS.join(',')}] supported.`);

    return this.sqlite
      .prepare(`select value from ${this.KEYS_TABLE} where name = ?`)
      .get(name).value;
  }

  saveCurrent(current: Current) {
    let stmt;

    const result = this.sqlite
      .prepare(`select * from ${this.CURRENT_TABLE}`)
      .get();

    if (!result) {
      stmt = this.sqlite.prepare(
        `insert into ${this.CURRENT_TABLE} (chain, address) values(?,?)`
      );
    } else {
      stmt = this.sqlite.prepare(
        `update ${this.CURRENT_TABLE} set chain = ?, address = ?`
      );
    }

    stmt.run(current.chain, current.address);
  }

  getCurrent() {
    const current = this.sqlite
      .prepare(`select * from ${this.CURRENT_TABLE}`)
      .get();
    if (current) {
      return {
        network: this.getNetwork(current.chain),
        account: current.address ? this.getAccount(current.address) : null,
      };
    } else {
      return {
        network: this.allNetworks()[0],
        account: this.allAccounts().length ? this.allAccounts()[0] : null,
      };
    }
  }

  clear() {
    this.clearTable(this.SETTINGS_TABLE);
    this.clearTable(this.ACCOUNTS_TABLE);
    this.clearTable(this.NETWORKS_TABLE);
    this.clearTable(this.CURRENT_TABLE);
  }

  allAccounts() {
    return this.sqlite.prepare(`select * from ${this.ACCOUNTS_TABLE}`).all();
  }

  getAccount(address: string) {
    return (
      this.sqlite
        .prepare(`select * from ${this.ACCOUNTS_TABLE} where address = ?`)
        .get(address) || null
    );
  }

  addAccount(account: Account) {
    should(
      !this.getAccount(account.address),
      `Account ${account.address} already exists.`
    );

    this.sqlite
      .prepare(
        `insert into ${this.ACCOUNTS_TABLE} (address, details) values(?,?)`
      )
      .run(account.address, account.details);
  }

  removeAccount(address: string, dryrun = false): Account | void {
    const account = this.getAccount(address);
    should(account, `Account ${address} does not exist.`);

    if (dryrun) {
      return account;
    }

    this.sqlite
      .prepare(`delete from ${this.ACCOUNTS_TABLE} where address = ?`)
      .run(address);
  }

  allNetworks() {
    return this.sqlite
      .prepare(`select * from ${this.NETWORKS_TABLE} order by chain`)
      .all()
      .map(network => {
        network.explorerUrl = network.explorerUrl || '';
        network.tokens = JSON.parse(network.tokens);
        network.nfts = JSON.parse(network.nfts);
        return network;
      });
  }

  getNetwork(chain: number) {
    const network =
      this.sqlite
        .prepare(`select * from ${this.NETWORKS_TABLE} where chain = ?`)
        .get(chain) || null;

    if (network) {
      network.explorerUrl = network.explorerUrl || '';
      network.tokens = JSON.parse(network.tokens);
      network.nfts = JSON.parse(network.nfts);
    }

    return network;
  }

  addNetwork(network: Network) {
    should(
      !this.getNetwork(network.chain),
      `Network ${network.chain} already exists.`
    );

    this.sqlite
      .prepare(
        `insert into ${this.NETWORKS_TABLE} (chain, name, coin, explorerUrl, tokens, nfts)
         values(?,?,?,?,?,?)`
      )
      .run(
        network.chain,
        network.name,
        network.coin,
        network.explorerUrl || null,
        JSON.stringify({}),
        JSON.stringify({})
      );
  }

  removeNetwork(chain: number, dryrun = false) {
    const network = this.getNetwork(chain);
    should(!!network, `Network ${chain} does not exist.`);

    if (dryrun) {
      return network;
    }

    this.sqlite
      .prepare(`delete from ${this.NETWORKS_TABLE} where chain = ?`)
      .run(network.chain);
  }

  allTokens(chain: number) {
    const tokens = this.getNetwork(chain)?.tokens as Token[];
    return tokens ? Object.values(tokens) : [];
  }

  findTokens(chain: number, addresses: string[]) {
    return this.findItems(chain, 'tokens', addresses);
  }

  findToken(chain: number, address: string) {
    return this.findItem(chain, 'tokens', address);
  }

  addToken(chain: number, token: Token) {
    this.addSubItemForNetwork(chain, 'tokens', token);
  }

  removeToken(chain: number, address: string, dryrun = false): Token | void {
    return this.removeSubItemForNetwork(
      chain,
      'tokens',
      address,
      dryrun
    ) as unknown as Token | void;
  }

  allNfts(chain: number, type?: 'erc721' | 'erc1155') {
    const nfts = this.getNetwork(chain)?.nfts as Nft[];
    return nfts
      ? type
        ? Object.values(nfts).filter(nft => nft.type === type)
        : Object.values(nfts)
      : [];
  }

  findNfts(chain: number, addresses: string[]) {
    return this.findItems(chain, 'nfts', addresses);
  }

  findNft(chain: number, address: string) {
    return this.findItem(chain, 'nfts', address);
  }

  addNft(chain: number, nft: Nft) {
    this.addSubItemForNetwork(chain, 'nfts', nft);
  }

  removeNft(chain: number, address: string, dryrun = false): Nft | void {
    return this.removeSubItemForNetwork(
      chain,
      'nfts',
      address,
      dryrun
    ) as unknown as Nft | void;
  }

  migrate() {}

  initDb() {
    this.createTablesIfNotExist();
    this.initNetworksWithPredefinedValues();
    this.initKeys();
  }

  private closeDbWhenExit() {
    process.on('exit', () => {
      this.sqlite.close();
    });
  }

  private createTablesIfNotExist() {
    const ddls = [
      `
      create table if not exists ${this.SETTINGS_TABLE} (
        dbVersion text not null,
        passwordHash text not null
      )
    `,
      `
      create table if not exists ${this.KEYS_TABLE} (
        name text primary key,
        value text
      )
    `,
      `
      create table if not exists ${this.CURRENT_TABLE} (
        chain integer,
        address text
      )
    `,
      `
      create table if not exists ${this.ACCOUNTS_TABLE} (
        address text primary key,
        details text not null
      )
    `,
      `
      create table if not exists ${this.NETWORKS_TABLE} (
        chain integer primary key,
        name text not null,
        coin text not null,
        explorerUrl text,
        tokens text,
        nfts text
      )
    `,
    ];

    ddls.forEach(ddl => {
      this.sqlite.exec(ddl);
    });
  }

  private clearTable(table: string) {
    this.sqlite.exec(`delete from ${table}`);
  }

  private initNetworksWithPredefinedValues() {
    const stmt = this.sqlite.prepare(
      `insert into ${this.NETWORKS_TABLE} (chain, name, coin, explorerUrl, tokens, nfts)
         values(?,?,?,?,?,?)
         on conflict(chain) do nothing`
    );

    const tx = this.sqlite.transaction(networks => {
      networks.forEach((network: any) => {
        stmt.run(
          network.chain,
          network.name,
          network.coin,
          network.explorerUrl || null,
          JSON.stringify({}),
          JSON.stringify({})
        );
      });
    });

    tx(RESERVED_NETWORKS);
  }

  private initKeys() {
    const stmt = this.sqlite.prepare(
      `insert into ${this.KEYS_TABLE} (name, value)
         values(?,?)
         on conflict(name) do nothing`
    );

    const tx = this.sqlite.transaction((keys: string[]) => {
      keys.forEach((key: string) => {
        stmt.run(key, null);
      });
    });

    tx(KEYS);
  }

  private findItems(
    chain: number,
    key: 'tokens' | 'nfts',
    addresses: string[]
  ) {
    const network = this.getNetwork(chain);
    if (!network) {
      return [];
    }

    const items = network[key] as any[];
    return items
      ? Object.values(items).filter(item => addresses.includes(item.address))
      : [];
  }

  private findItem(chain: number, key: 'tokens' | 'nfts', address: string) {
    const items = this.findItems(chain, key, [address]);
    return items.length ? items[0] : null;
  }

  private addSubItemForNetwork(
    chain: number,
    key: 'tokens' | 'nfts',
    item: Token | Nft
  ) {
    const network = this.getNetwork(chain);
    should(network, `Network ${chain} does not exist.`);
    should(
      !network[key][item.address],
      `${key === 'tokens' ? 'Token' : 'Nft'} ${item.address} already exists.`
    );

    network[key][item.address] = item;
    this.updateNetwork(network, key);
  }

  private removeSubItemForNetwork(
    chain: number,
    key: 'tokens' | 'nfts',
    address: string,
    dryrun = false
  ): Token | Nft | void {
    const network = this.getNetwork(chain);
    should(network, `Network ${chain} does not exist.`);

    const result = network[key][address];
    should(
      result,
      `${key === 'tokens' ? 'Token' : 'Nft'} ${address} does not exists.`
    );

    if (dryrun) {
      return result;
    }

    delete network[key][address];
    return this.updateNetwork(network, key);
  }

  private updateNetwork(network: Network, key: 'tokens' | 'nfts') {
    this.sqlite
      .prepare(`update ${this.NETWORKS_TABLE} set ${key} = ? where chain = ?`)
      .run(JSON.stringify(network[key] || {}), network.chain);
  }
}
