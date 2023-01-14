import {Container} from 'inversify';
import 'reflect-metadata';
import {EthWallet} from '../eth/wallet';
import {IpfsService} from '../storage/ipfs';
import {Db} from '../storage/storage';
import {ExplorerService} from '../web/explorer';
import {WebService} from '../web/web';
import {
  DbMock,
  EthWalletMock,
  ExplorerMock,
  IpfsServiceMock,
  WebServiceMock,
} from './mock';
import {
  DbInterface,
  ExplorerInterface,
  IpfsInterface,
  TYPES,
  WalletInterface,
  WebInterface,
} from './types';

export const container = new Container();

if (process.env.NODE_ENV === 'test') {
  container.bind<DbInterface>(TYPES.DbService).to(DbMock).inSingletonScope();

  container
    .bind<WalletInterface>(TYPES.WalletService)
    .to(EthWalletMock)
    .inSingletonScope();

  container
    .bind<WebInterface>(TYPES.WebService)
    .to(WebServiceMock)
    .inSingletonScope();

  container
    .bind<IpfsInterface>(TYPES.IpfsSevice)
    .to(IpfsServiceMock)
    .inSingletonScope();

  container
    .bind<ExplorerInterface>(TYPES.ExplorerInterface)
    .to(ExplorerMock)
    .inSingletonScope();
} else {
  container.bind<DbInterface>(TYPES.DbService).to(Db).inSingletonScope();

  container
    .bind<WalletInterface>(TYPES.WalletService)
    .to(EthWallet)
    .inSingletonScope();

  container
    .bind<WebInterface>(TYPES.WebService)
    .to(WebService)
    .inSingletonScope();

  container
    .bind<IpfsInterface>(TYPES.IpfsSevice)
    .to(IpfsService)
    .inSingletonScope();

  container
    .bind<ExplorerInterface>(TYPES.ExplorerInterface)
    .to(ExplorerService)
    .inSingletonScope();
}

export function walletService() {
  return container.get<WalletInterface>(TYPES.WalletService);
}

export function dbService() {
  return container.get<DbInterface>(TYPES.DbService);
}

export function webService() {
  return container.get<WebInterface>(TYPES.WebService);
}

export function ipfsService() {
  return container.get<IpfsInterface>(TYPES.IpfsSevice);
}

export function explorerService() {
  return container.get<ExplorerInterface>(TYPES.ExplorerInterface);
}
