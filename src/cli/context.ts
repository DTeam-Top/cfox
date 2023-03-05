import {ethers, Wallet} from 'ethers';
import Vorpal from 'vorpal';
import {getChalk} from '../commons';
import {dbService, walletService} from '../types/container';
import {Account, Network} from '../types/types';

export class Context {
  private currentAccount: Account | null = null;
  private provider: ethers.providers.InfuraProvider;
  private wallet: Wallet | null = null;

  constructor(
    private vorpal: Vorpal,
    private password: string,
    private currentNetwork: Network,
    account: Account | null
  ) {
    this.provider = new ethers.providers.InfuraProvider(
      Number(currentNetwork.chain),
      dbService().getKey('infura')
    );

    if (account) {
      this.setCurrentAccount(account);
    } else {
      this.changeDelimiter();
    }
  }

  getWallet() {
    return this.wallet;
  }

  getCurrentAccount() {
    return this.currentAccount;
  }

  async setCurrentAccount(account: Account) {
    this.currentAccount = account;
    this.wallet = (
      await walletService().loadWallet(this.password, account)
    ).connect(this.provider);
    this.changeDelimiter();
  }

  getCurrentNetwork() {
    return this.currentNetwork;
  }

  async setCurrentNetwork(network: Network) {
    this.currentNetwork = network;
    this.provider = new ethers.providers.InfuraProvider(
      Number(network.chain),
      dbService().getKey('infura')
    );
    if (this.wallet) {
      this.wallet = this.wallet.connect(this.provider);
    }
    this.changeDelimiter();
  }

  getPassword() {
    return this.password;
  }

  current() {
    return {
      chain: this.currentNetwork.chain,
      address: this.currentAccount?.address,
    };
  }

  currentDelimiter() {
    const chalk = getChalk(this.vorpal);
    return `cfox[${chalk.yellow(
      this.currentAccount?.address || '?'
    )}||${chalk.green(this.currentNetwork.name)}]=#`;
  }

  private changeDelimiter() {
    return this.vorpal.delimiter(this.currentDelimiter());
  }
}
