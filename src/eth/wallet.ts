import BigNumber from 'bignumber.js';
import {Contract, ethers, Event, Wallet} from 'ethers';
import {FormatTypes, Interface, parseEther} from 'ethers/lib/utils';
import {injectable} from 'inversify';
import {should} from '../commons';
import {ERC20_ABI, ERC721_ABI} from '../types/abi';
import {webService} from '../types/container';
import {
  Account,
  GasPriceDetails,
  Nft,
  Token,
  TxDetails,
  WalletInterface,
} from '../types/types';
import {ethersOf, parseUnits, unitsOf} from './ethUtils';

@injectable()
export class EthWallet implements WalletInterface {
  async createRandomAccount(password: string) {
    const wallet = Wallet.createRandom();
    return {
      address: wallet.address,
      details: await wallet.encrypt(password),
    };
  }

  async createAccountByPrivateKey(password: string, privateKey: string) {
    const wallet = new Wallet(privateKey);
    return {
      address: wallet.address,
      details: await wallet.encrypt(password),
    };
  }

  async createAccountByMnemonic(password: string, mnemonic: string) {
    const wallet = Wallet.fromMnemonic(mnemonic);
    return {
      address: wallet.address,
      details: await wallet.encrypt(password),
    };
  }

  async loadWallet(password: string, account: Account) {
    return Wallet.fromEncryptedJson(account.details, password);
  }

  async loadToken(address: string, wallet: Wallet) {
    try {
      const erc20 = this.erc20(address, wallet);
      const result = await Promise.all([
        erc20.name(),
        erc20.symbol(),
        erc20.decimals(),
      ]);

      return {
        address,
        name: result[0],
        symbol: result[1],
        decimals: Number(result[2].toString()),
      };
    } catch (e) {
      return null;
    }
  }

  async peekErc20(wallet: ethers.Wallet, address: string): Promise<any> {
    const erc20 = this.erc20(address, wallet);
    const result = await Promise.all([
      erc20.name(),
      erc20.symbol(),
      erc20.decimals(),
      erc20.totalSupply(),
    ]);

    return {
      name: result[0],
      symbol: result[1],
      decimals: Number(result[2].toString()),
      totalSupply: unitsOf(result[3], result[2]),
    };
  }

  async loadNft(address: string, wallet: Wallet) {
    try {
      const erc721 = this.erc721(address, wallet);
      const result = await Promise.all([erc721.name(), erc721.symbol()]);

      return {
        address,
        name: result[0],
        symbol: result[1],
        type: 'erc721',
      } as Nft;
    } catch (e) {
      return null;
    }
  }

  async peekErc721(
    wallet: ethers.Wallet,
    address: string,
    tokenId?: string
  ): Promise<any> {
    const erc721 = this.erc721(address, wallet);
    if (tokenId) {
      const result = await Promise.allSettled([
        erc721.name(),
        erc721.symbol(),
        erc721.tokenURI(tokenId),
        erc721.contractURI(),
      ]);

      return {
        name: result[0].status === 'fulfilled' ? result[0].value : 'failed',
        symbol: result[1].status === 'fulfilled' ? result[1].value : 'failed',
        tokenURI: result[2].status === 'fulfilled' ? result[2].value : 'failed',
        contractURI:
          result[3].status === 'fulfilled' ? result[3].value : 'failed',
      };
    } else {
      const result = await Promise.allSettled([
        erc721.name(),
        erc721.symbol(),
        erc721.contractURI(),
      ]);

      return {
        name: result[0].status === 'fulfilled' ? result[0].value : 'failed',
        symbol: result[1].status === 'fulfilled' ? result[1].value : 'failed',
        contractURI:
          result[2].status === 'fulfilled' ? result[2].value : 'failed',
      };
    }
  }

  async balanceOfCoin(wallet: Wallet, coin: string) {
    return [{symbol: coin, balance: ethersOf(await wallet.getBalance())}];
  }

  async balanceOfTokens(wallet: Wallet, tokens: Token[]) {
    return Promise.all(
      tokens.map(async t => {
        return {
          symbol: t.symbol,
          balance: unitsOf(
            await this.erc20(t.address, wallet).balanceOf(wallet.address),
            t.decimals
          ),
        };
      })
    );
  }

  async send(
    from: Wallet,
    to: string,
    amount: string,
    gasPrice: string | null,
    token: Token | null,
    dryrun: boolean
  ): Promise<TxDetails | void> {
    if (!token) {
      if (dryrun) {
        const estimation = await this.estimateGasSendEth(from, to, amount);
        return {
          details: [`to: ${to}`, `amount: ${amount}`].join('\n'),
          ...estimation,
        };
      }

      const tx = gasPrice
        ? {
            to: to,
            value: parseEther(amount),
            ...(await this.normalizeGasPriceParameters(
              from.provider as ethers.providers.JsonRpcProvider,
              gasPrice
            )),
          }
        : {
            to: to,
            value: parseEther(amount),
          };
      const txResponse = await from.sendTransaction(tx);
      await txResponse.wait();
    } else {
      if (dryrun) {
        const estimation = await this.estimateGas(
          this.erc20(token.address, from),
          'transfer',
          to,
          parseUnits(amount, token.decimals)
        );
        return {
          details: [
            `to: ${to}`,
            `amount: ${amount}`,
            `name: ${token.name}`,
            `token: ${token.address}`,
          ].join('\n'),
          ...estimation,
        };
      }

      const txResponse = await this.erc20(token.address, from).transfer(
        to,
        parseUnits(amount, token.decimals),
        gasPrice
          ? await this.normalizeGasPriceParameters(
              from.provider as ethers.providers.JsonRpcProvider,
              gasPrice
            )
          : {}
      );
      await txResponse.wait();
    }
  }

  async balanceOfNft(nft: Nft, wallet: Wallet) {
    return Number(
      (
        await this.erc721(nft.address, wallet).balanceOf(wallet.address)
      ).toString()
    );
  }

  async ownerOf(nft: Nft, wallet: Wallet, tokenId: string): Promise<string> {
    return this.erc721(nft.address, wallet).ownerOf(tokenId);
  }

  async tokens(nft: Nft, wallet: Wallet, tokenIdOnly = false) {
    const contract = this.erc721(nft.address, wallet);
    const count = Number((await contract.balanceOf(wallet.address)).toString());
    if (count) {
      const promises = [];
      for (let i = 0; i < count; i++) {
        promises.push(contract.tokenOfOwnerByIndex(wallet.address, i));
      }

      const tokenIds = (await Promise.all(promises)).map(tokenId =>
        tokenId.toString()
      );

      if (tokenIdOnly) {
        return tokenIds.map(tokenId => {
          return {
            name: nft.name,
            symbol: nft.symbol,
            type: nft.type,
            tokenId,
          };
        });
      } else {
        return await Promise.all(
          tokenIds.map(async tokenId => {
            const tokenUri = await contract.tokenURI(tokenId);
            const data = await webService().get(tokenUri);
            return {
              tokenId,
              name: nft.name,
              symbol: nft.symbol,
              type: nft.type,
              metadata: data || '',
            };
          })
        );
      }
    } else {
      return [];
    }
  }

  async gasPrice(
    provider: ethers.providers.Provider
  ): Promise<GasPriceDetails> {
    const data = await gasPriceData(
      provider as ethers.providers.JsonRpcProvider
    );

    const standard = unitsOf(data.maxPriorityFeePerGas || data.gasPrice, 9);
    return {
      baseFeePerGas: data.baseFeePerGas ? unitsOf(data.baseFeePerGas, 9) : '',
      fast: new BigNumber(standard).times('1.3').toString(),
      standard,
      low: new BigNumber(standard).times('0.7').toString(),
    };
  }

  async metadata(nft: Nft, tokenId: string, wallet: Wallet) {
    return webService().get(
      await this.erc721(nft.address, wallet).tokenURI(tokenId)
    );
  }

  async singleTransfer(
    nft: Nft,
    from: Wallet,
    to: string,
    tokenId: string,
    gasPrice: string | null,
    dryrun: boolean
  ): Promise<TxDetails | void> {
    if (dryrun) {
      const estimation = await this.estimateGas(
        this.erc721(nft.address, from),
        'safeTransferFrom',
        from.address,
        to,
        tokenId
      );
      return {
        details: [
          `to: ${to}`,
          `nft: ${nft.address}`,
          `tokenId: ${tokenId}`,
        ].join('\n'),
        ...estimation,
      };
    }

    const txResponse = await this.erc721(nft.address, from).safeTransferFrom(
      from.address,
      to,
      tokenId,
      gasPrice
        ? await this.normalizeGasPriceParameters(
            from.provider as ethers.providers.JsonRpcProvider,
            gasPrice
          )
        : {}
    );
    await txResponse.wait();
  }

  async read(
    contractAddress: string,
    wallet: Wallet,
    methodAbi: string,
    args: any[]
  ): Promise<any> {
    const jsonAbi = JSON.parse(
      new Interface([methodAbi]).format(FormatTypes.json) as string
    );
    const contract = new Contract(contractAddress, [methodAbi], wallet);
    return {result: await contract[jsonAbi[0].name](...args)};
  }

  async exec(
    contractAddress: string,
    wallet: Wallet,
    methodAbi: string,
    args: any[],
    options: any | null,
    dryrun: boolean
  ): Promise<void | TxDetails> {
    const jsonAbi = JSON.parse(
      new Interface([methodAbi]).format(FormatTypes.json) as string
    );
    const contract = new Contract(contractAddress, [methodAbi], wallet);

    if (dryrun) {
      const estimation = await this.estimateGas(
        contract,
        jsonAbi[0].name,
        ...args
      );
      return {
        details: `${jsonAbi[0].name}(${args.join(', ')})`,
        ...estimation,
      };
    }

    const txResponse = await contract[jsonAbi[0].name](...args, options);
    await txResponse.wait();
  }

  async query(
    contractAddress: string,
    wallet: Wallet,
    eventAbi: string,
    args: any[],
    start: number | 'earliest',
    end?: number | 'latest'
  ): Promise<any> {
    const jsonAbi = JSON.parse(
      new Interface([eventAbi]).format(FormatTypes.json) as string
    );
    const contract = new Contract(contractAddress, [eventAbi], wallet);

    let logs: Array<Event>;
    const filter = contract.filters[jsonAbi[0].name](...args);
    if (start < 0) {
      logs = await contract.queryFilter(filter, start);
    } else {
      logs = await contract.queryFilter(filter, start, end);
    }

    return logs.map(log => {
      return {
        txHash: log.transactionHash,
        args: JSON.stringify(log.args),
      };
    });
  }

  async lookupAddress(
    provider: ethers.providers.Provider,
    address: string
  ): Promise<{ensName: string}> {
    const name = await provider.lookupAddress(address);
    return {ensName: name || ''};
  }

  async resolveName(
    provider: ethers.providers.Provider,
    name: string
  ): Promise<{address: string}> {
    const address = await provider.resolveName(name);
    return {address: address || ''};
  }

  generateRandomAccounts(
    count: number
  ): Array<{address: string; privateKey: string}> {
    const wallet = ethers.Wallet.createRandom();
    const words = wallet.mnemonic.phrase;
    const node = ethers.utils.HDNode.fromMnemonic(words);

    const result = new Array<{address: string; privateKey: string}>();
    for (let i = 0; i < count; i++) {
      const path = `m/44'/60'/0'/0/${i}`;
      const account = node.derivePath(path);
      result.push({address: account.address, privateKey: account.privateKey});
    }
    return result;
  }

  async nonceDetails(
    provider: ethers.providers.Provider,
    address: string
  ): Promise<{
    currentNonce: number;
    pendingNonce: number;
    blocking: boolean;
  }> {
    const [currentNonce, pendingNonce] = await Promise.all([
      provider.getTransactionCount(address),
      provider.getTransactionCount(address, 'pending'),
    ]);

    return {
      currentNonce,
      pendingNonce,
      blocking: currentNonce !== pendingNonce,
    };
  }

  async cancelTxByNonce(wallet: ethers.Wallet, nonce: number): Promise<string> {
    await this.validateNonce(wallet, nonce);

    const feeData = await gasPriceData(
      wallet.provider as ethers.providers.JsonRpcProvider
    );
    const dumbTxObj = feeData.maxPriorityFeePerGas
      ? {
          to: wallet.address,
          nonce,
          value: parseEther('0'),
          maxPriorityFeePerGas: feeData.maxPriorityFeePerGas.mul(150).div(100),
        }
      : {
          to: wallet.address,
          nonce,
          value: parseEther('0'),
          gasPrice: feeData.gasPrice.mul(150).div(100),
        };
    const tx = await wallet.sendTransaction(dumbTxObj);
    return tx.hash;
  }

  async cancelTxByHash(wallet: ethers.Wallet, txHash: string): Promise<string> {
    const tx = await this.validateAndReturnTx(wallet, txHash);
    return await this.cancelTxByNonce(wallet, tx.nonce);
  }

  async pushTx(wallet: ethers.Wallet, txHash: string): Promise<string> {
    const blockedTx = await this.validateAndReturnTx(wallet, txHash);
    const feeData = await gasPriceData(
      wallet.provider as ethers.providers.JsonRpcProvider
    );
    const dumbTxObj = feeData.maxPriorityFeePerGas
      ? {
          to: blockedTx.to,
          data: blockedTx.data,
          nonce: blockedTx.nonce,
          value: blockedTx.value,
          gasLimit: blockedTx.gasLimit,
          maxPriorityFeePerGas: feeData.maxPriorityFeePerGas.mul(120).div(100),
          // maxFeePerGas = 2 * lastBaseFeePerGas + maxPriorityFeePerGas
          // maxPriorityFeePerGas increased 20%, so it needs to add to the old value.
          maxFeePerGas: feeData.maxFeePerGas.add(
            feeData.maxPriorityFeePerGas.mul(20).div(100)
          ),
        }
      : {
          to: blockedTx.to,
          data: blockedTx.data,
          nonce: blockedTx.nonce,
          value: blockedTx.value,
          gasLimit: blockedTx.gasLimit,
          gasPrice: feeData.gasPrice.mul(150).div(100),
        };
    const tx = await wallet.sendTransaction(dumbTxObj);
    return tx.hash;
  }

  private erc721(address: string, wallet: Wallet) {
    return new Contract(address, ERC721_ABI, wallet);
  }

  private erc20(address: string, wallet: Wallet) {
    return new Contract(address, ERC20_ABI, wallet);
  }

  private async estimateGasSendEth(from: Wallet, to: string, amount: string) {
    const [gasEstimation, gasPrice] = await Promise.all([
      from.estimateGas({
        to: to,
        value: parseEther(amount),
      }),
      this.gasPrice(from.provider),
    ]);
    return this.pricesAndFees(gasEstimation.toString(), gasPrice);
  }

  private async estimateGas(
    contract: Contract,
    method: string,
    ...args: any[]
  ) {
    const [gasEstimation, gasPrice] = await Promise.all([
      contract.estimateGas[method](...args)
        .then(value => {
          const minimumGas = ethers.BigNumber.from('55000');
          if (value.lt(minimumGas)) {
            return minimumGas;
          }
          return value;
        })
        .catch(() => {
          return ethers.BigNumber.from('2000000');
        }),
      this.gasPrice(contract.provider),
    ]);
    return this.pricesAndFees(gasEstimation.toString(), gasPrice);
  }

  private async pricesAndFees(
    gasEstimation: string,
    gasPrice: GasPriceDetails
  ) {
    return {
      gasEstimation,
      gasBaseFee: gasPrice.baseFeePerGas
        ? `${unitsOf(
            this.gasFee(gasEstimation, gasPrice.baseFeePerGas),
            9
          )} eth`
        : '',
      gasPrices: [
        {speed: 'fast', gwei: gasPrice.fast},
        {speed: 'standard', gwei: gasPrice.standard},
        {speed: 'low', gwei: gasPrice.low},
      ],
      gasFees: [
        {
          description: `estimation(${gasEstimation}) x fast(${gasPrice.fast} gwei)`,
          resultInEth: `${unitsOf(
            this.gasFee(gasEstimation, gasPrice.fast),
            9
          )} eth`,
        },
        {
          description: `estimation(${gasEstimation}) x standard(${gasPrice.standard} gwei)`,
          resultInEth: `${unitsOf(
            this.gasFee(gasEstimation, gasPrice.standard),
            9
          )} eth`,
        },
        {
          description: `estimation(${gasEstimation}) x low(${gasPrice.low} gwei)`,
          resultInEth: `${unitsOf(
            this.gasFee(gasEstimation, gasPrice.low),
            9
          )} eth`,
        },
      ],
    };
  }

  private gasFee(amount: string, price: string) {
    return new BigNumber(amount)
      .times(new BigNumber(price))
      .toFixed(0)
      .toString();
  }

  private async normalizeGasPriceParameters(
    provider: ethers.providers.JsonRpcProvider,
    gasPrice: string
  ) {
    if (!gasPrice) {
      return {};
    }

    const maxPriorityFeePerGas = (await gasPriceData(provider))
      .maxPriorityFeePerGas;
    return maxPriorityFeePerGas
      ? {
          maxPriorityFeePerGas: parseUnits(gasPrice, 9),
        }
      : {
          gasPrice: parseUnits(gasPrice, 9),
        };
  }

  private async validateNonce(wallet: Wallet, nonce: number) {
    const [currentNonce, pendingNonce] = await Promise.all([
      wallet.getTransactionCount(),
      wallet.getTransactionCount('pending'),
    ]);

    should(pendingNonce !== currentNonce, `${wallet.address} is not blocked.`);

    should(
      nonce >= currentNonce && nonce < pendingNonce,
      ` wrong nonce: nonce must be in range: [${currentNonce}, ${pendingNonce}).`
    );
  }

  private async validateAndReturnTx(wallet: Wallet, txHash: string) {
    const [tx, txReceipt] = await Promise.all([
      wallet.provider.getTransaction(txHash),
      wallet.provider.getTransactionReceipt(txHash),
    ]);

    should(!!tx, `Can't find transaction by ${txHash}.`);
    should(!txReceipt, `Transaction ${txHash} minted.`);

    return tx;
  }
}

export async function gasPriceData(provider: ethers.providers.JsonRpcProvider) {
  const feeData = await provider.getFeeData();
  if (feeData.lastBaseFeePerGas) {
    // EIP1559
    const maxPriorityFeePerGas = ethers.BigNumber.from(
      await provider.send('eth_maxPriorityFeePerGas', [])
    );

    return {
      baseFeePerGas: feeData.lastBaseFeePerGas,
      maxPriorityFeePerGas,
      maxFeePerGas: maxPriorityFeePerGas.add(feeData.lastBaseFeePerGas.mul(2)),
    };
  } else {
    // before EIP1559
    return {
      gasPrice: await provider.getGasPrice(),
    };
  }
}

// borrowed from https://docs.alchemy.com/docs/how-to-build-a-gas-fee-estimator-using-eip-1559
export async function estimateGas(provider: ethers.providers.JsonRpcProvider) {
  const count = 5;
  const result = await provider.send('eth_feeHistory', [
    count,
    'pending',
    [10],
  ]);
  const blocks = formatFeeHistory(result, count);
  const firstPercentialPriorityFees = blocks.map(b => b.priorityFeePerGas[0]);
  const sum = firstPercentialPriorityFees.reduce((a, v) => a + v);
  console.log(
    'Manual estimate (maxPriorityFeePerGas):',
    Math.round(sum / firstPercentialPriorityFees.length)
  );
  console.log(
    'Geth estimate (maxPriorityFeePerGas):',
    Number(await provider.send('eth_maxPriorityFeePerGas', []))
  );
}

function formatFeeHistory(result: any, count: number) {
  should(result.baseFeePerGas.length >= count, 'wrong number of blocks');
  const blocks = [];
  const pendingIncluded = result.baseFeePerGas.length === count;
  for (let i = 0; i < count && result.gasUsedRatio[i] !== undefined; i++) {
    blocks.push({
      number: Number(result.oldestBlock) + i,
      baseFeePerGas: Number(result.baseFeePerGas[i]),
      gasUsedRatio: Number(result.gasUsedRatio[i]),
      priorityFeePerGas: result.reward[i].map((x: string) => Number(x)),
    });
  }
  if (pendingIncluded) {
    blocks.push({
      number: 'pending',
      baseFeePerGas: Number(result.baseFeePerGas[count]),
      gasUsedRatio: NaN,
      priorityFeePerGas: [],
    });
  }
  return blocks;
}
