import {AxiosRequestConfig} from 'axios';
import {ethers, Wallet} from 'ethers';
import Vorpal, {Args} from 'vorpal';
import {Context} from '../cli/context';

export const TYPES = {
  DbService: Symbol.for('DbService'),
  WalletService: Symbol.for('WalletService'),
  WebService: Symbol.for('WebService'),
  IpfsSevice: Symbol.for('IpfsSevice'),
  ExplorerInterface: Symbol.for('ExplorerInterface'),
  Cache: Symbol.for('Cache'),
};

export type Authenticated = {logined: boolean; password: string};

export type Settings = {
  dbVersion: string;
  passwordHash: string;
};

export type Token = {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
};

export type Nft = {
  address: string;
  name: string;
  symbol: string;
  type: 'erc721' | 'erc1155';
};

export type Account = {
  address: string;
  details: string;
};

export type Network = {
  name: string;
  chain: number;
  coin: string;
  explorerUrl?: string;
  tokens: {[key: string]: Token};
  nfts: {[key: string]: Nft};
};

export type Current = {
  chain: number;
  address?: string;
};

export type TxDetails = {
  details: string;
  gasEstimation: string;
  gasPrices: Array<{speed: string; gwei: string}>;
  gasBaseFee: string;
  gasFees: Array<{
    description: string;
    resultInEth: string;
  }>;
};

export type GasPriceDetails = {
  baseFeePerGas: string;
  fast: string;
  standard: string;
  low: string;
};

export interface Storage {
  getItem(key: string): string | null;
  removeItem(key: string): void;
  setItem(key: string, value: string): void;
}

export interface DbInterface {
  isNotConfigured(): boolean;
  backup(): Promise<string>;
  getCurrent(): {network: Network; account: Account | null};
  saveCurrent(current: Current): void;
  allNetworks(): Network[];
  getNetwork(chain: number): Network;
  addNetwork(network: Network): void;
  removeNetwork(chain: number, dryrun: boolean): Network | void;
  allTokens(chain: number): Token[];
  addToken(chain: number, token: Token): void;
  findToken(chain: number, address: string): Token | null;
  findTokens(chain: number, addresses: string[]): Token[];
  removeToken(chain: number, address: string, dryrun: boolean): void;
  allNfts(chain: number, type?: 'erc721' | 'erc1155'): Nft[];
  addNft(chain: number, nft: Nft): void;
  findNft(chain: number, address: string): Nft | null;
  findNfts(chain: number, addresses: string[]): Nft[];
  removeNft(chain: number, address: string, dryrun: boolean): void;
  allAccounts(): Account[];
  getAccount(account: string): Account;
  addAccount(account: Account): void;
  removeAccount(address: string, dryrun: boolean): Account | void;
  getSettings(): Settings | null;
  saveSettings(settings: Settings): void;
  migrate(): void;
  getKeys(): {name: string; value: string}[];
  setKey(name: string, value: string | null): void;
  getKey(name: string): string | null;
}

export interface WalletInterface {
  createRandomAccount(password: string): Promise<Account>;
  createAccountByPrivateKey(
    password: string,
    privateKey: string
  ): Promise<Account>;
  createAccountByMnemonic(password: string, mnemonic: string): Promise<Account>;
  loadWallet(password: string, account: Account): Promise<Wallet>;
  loadToken(address: string, wallet: Wallet): Promise<Token | null>;
  loadNft(address: string, wallet: Wallet): Promise<Nft | null>;
  peekErc20(wallet: Wallet, address: string): Promise<any>;
  peekErc721(wallet: Wallet, address: string, tokenId?: string): Promise<any>;
  balanceOfCoin(
    wallet: Wallet,
    coin: string
  ): Promise<{symbol: string; balance: string}[]>;
  balanceOfTokens(
    wallet: Wallet,
    tokens: Token[]
  ): Promise<{symbol: string; balance: string}[]>;
  send(
    from: Wallet,
    to: string,
    amount: string,
    gasPrice: string | null,
    token: Token | null,
    dryrun: boolean
  ): Promise<TxDetails | void>;
  tokens(nft: Nft, wallet: Wallet, tokenIdOnly: boolean): Promise<any>;
  gasPrice(provider: ethers.providers.Provider): Promise<GasPriceDetails>;
  ownerOf(nft: Nft, wallet: Wallet, tokenId: string): Promise<string>;
  singleTransfer(
    nft: Nft,
    from: Wallet,
    to: string,
    tokenId: string,
    gasPrice: string | null,
    dryrun: boolean
  ): Promise<TxDetails | void>;
  read(
    contractAddress: string,
    wallet: Wallet,
    methodAbi: string,
    args: any[]
  ): Promise<any>;
  exec(
    contractAddress: string,
    wallet: Wallet,
    methodAbi: string,
    args: any[],
    options: any | null,
    dryrun: boolean
  ): Promise<void | TxDetails>;
  query(
    contractAddress: string,
    wallet: Wallet,
    eventAbi: string,
    args: any[],
    start: number | 'earliest',
    end?: number | 'latest'
  ): Promise<any[]>;
  lookupAddress(
    provider: ethers.providers.Provider,
    address: string
  ): Promise<{ensName: string}>;
  resolveName(
    provider: ethers.providers.Provider,
    name: string
  ): Promise<{address: string}>;
  generateRandomAccounts(
    count: number
  ): Array<{address: string; privateKey: string}>;
  nonceDetails(
    provider: ethers.providers.Provider,
    address: string
  ): Promise<{currentNonce: number; pendingNonce: number; blocking: boolean}>;
  cancelTxByNonce(wallet: Wallet, nonce: number): Promise<string>;
  cancelTxByHash(wallet: Wallet, txHash: string): Promise<string>;
  pushTx(wallet: Wallet, txHash: string): Promise<string>;
}

export type StringPair = {
  name: string;
  description?: string;
};

export type Command = {
  name: string;
  description?: string;
  options?: StringPair[];
  types?: {string: ReadonlyArray<string> | undefined};
  handler: (args: Args, vorpal: Vorpal, context?: Context) => Promise<any>;
};

export interface WebInterface {
  get(url: string, config?: AxiosRequestConfig): Promise<any>;
  tokens(
    address: string,
    contrat: string,
    chain: number,
    tokenIdOnly: boolean
  ): Promise<any>;
}

export interface IpfsInterface {
  uploadSingleFile(fileName: string): Promise<any>;
  uploadDirectory(pathName: string): Promise<any>;
  uploadMetadata(metadataPath: string): Promise<any>;
}

export type ContractDeploymentDetails = {
  creator: string;
  txHash: string;
};

export interface ExplorerInterface {
  abi(chain: number, address: string): Promise<string>;
  source(chain: number, address: string): Promise<string>;
  deploymentDetails(
    chain: number,
    address: string
  ): Promise<ContractDeploymentDetails>;
}

export interface Cache {
  get(key: string): string | null;
  put(key: string, value: string): void;
}
