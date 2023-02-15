import {injectable} from 'inversify';
import sinon from 'sinon';
import {
  DbInterface,
  ExplorerInterface,
  IpfsInterface,
  WalletInterface,
  WebInterface,
} from './types';

@injectable()
export class IpfsServiceMock implements IpfsInterface {
  uploadSingleFile = sinon.stub();
  uploadDirectory = sinon.stub();
  uploadMetadata = sinon.stub();
}

@injectable()
export class WebServiceMock implements WebInterface {
  get = sinon.stub();
  tokens = sinon.stub();
}

@injectable()
export class DbMock implements DbInterface {
  isNotConfigured = sinon.stub();
  backup = sinon.stub();
  getCurrent = sinon.stub();
  saveCurrent = sinon.stub();
  allNetworks = sinon.stub();
  getNetwork = sinon.stub();
  addNetwork = sinon.stub();
  removeNetwork = sinon.stub();
  allTokens = sinon.stub();
  addToken = sinon.stub();
  findToken = sinon.stub();
  findTokens = sinon.stub();
  removeToken = sinon.stub();
  allNfts = sinon.stub();
  addNft = sinon.stub();
  findNft = sinon.stub();
  findNfts = sinon.stub();
  removeNft = sinon.stub();
  allAccounts = sinon.stub();
  getAccount = sinon.stub();
  addAccount = sinon.stub();
  removeAccount = sinon.stub();
  getSettings = sinon.stub();
  saveSettings = sinon.stub();
  migrate = sinon.stub();
  getKey = sinon.stub();
  getKeys = sinon.stub();
  setKey = sinon.stub();
}

@injectable()
export class EthWalletMock implements WalletInterface {
  createRandomAccount = sinon.stub();
  createAccountByPrivateKey = sinon.stub();
  createAccountByMnemonic = sinon.stub();
  loadWallet = sinon.stub();
  loadToken = sinon.stub();
  loadNft = sinon.stub();
  peekErc20 = sinon.stub();
  peekErc721 = sinon.stub();
  balanceOfCoin = sinon.stub();
  balanceOfTokens = sinon.stub();
  send = sinon.stub();
  tokens = sinon.stub();
  gasPrice = sinon.stub();
  ownerOf = sinon.stub();
  singleTransfer = sinon.stub();
  read = sinon.stub();
  exec = sinon.stub();
  query = sinon.stub();
  lookupAddress = sinon.stub();
  resolveName = sinon.stub();
  generateRandomAccounts = sinon.stub();
  nonceDetails = sinon.stub();
  cancelTxByNonce = sinon.stub();
  cancelTxByHash = sinon.stub();
  pushTx = sinon.stub();
}

@injectable()
export class ExplorerMock implements ExplorerInterface {
  abi = sinon.stub();
  source = sinon.stub();
  deploymentDetails = sinon.stub();
}
