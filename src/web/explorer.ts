import {injectable} from 'inversify';
import {dbService, webService} from '../types/container';
import {ContractDeploymentDetails, ExplorerInterface} from '../types/types';

const abiSubPathOfEtherScanLike = (
  root: string,
  address: string,
  apiKey: string
) =>
  `${root}?module=contract&action=getabi&address=${address}&apikey=${apiKey}`;

const sourceSubPathOfEtherScanLike = (
  root: string,
  address: string,
  apiKey: string
) =>
  `${root}?module=contract&action=getsourcecode&address=${address}&apikey=${apiKey}`;

const deploymentDetailsSubPathOfEtherScanLike = (
  root: string,
  address: string,
  apiKey: string
) =>
  `${root}?module=contract&action=getcontractcreation&contractaddresses=${address}&apikey=${apiKey}`;

const explorerConfig: {[key: number]: any} = {
  1: {
    keyName: 'etherscan',
    uriRoot: 'https://api.etherscan.io/api',
    abi: abiSubPathOfEtherScanLike,
    source: sourceSubPathOfEtherScanLike,
    deploymentDetails: deploymentDetailsSubPathOfEtherScanLike,
  },
  5: {
    keyName: 'etherscan',
    uriRoot: 'https://api-goerli.etherscan.io/api',
    abi: abiSubPathOfEtherScanLike,
    source: sourceSubPathOfEtherScanLike,
    deploymentDetails: deploymentDetailsSubPathOfEtherScanLike,
  },
  137: {
    keyName: 'polygonscan',
    uriRoot: 'https://api.polygonscan.com/api',
    abi: abiSubPathOfEtherScanLike,
    source: sourceSubPathOfEtherScanLike,
  },
  80001: {
    keyName: 'polygonscan',
    uriRoot: 'https://api-testnet.polygonscan.com/api',
    abi: abiSubPathOfEtherScanLike,
    source: sourceSubPathOfEtherScanLike,
  },
  42161: {
    keyName: 'arbiscan',
    uriRoot: 'https://api.arbiscan.io/api',
    abi: abiSubPathOfEtherScanLike,
    source: sourceSubPathOfEtherScanLike,
  },
  421613: {
    keyName: 'arbiscan',
    uriRoot: 'https://api-goerli.arbiscan.io/api',
    abi: abiSubPathOfEtherScanLike,
    source: sourceSubPathOfEtherScanLike,
  },
  10: {
    keyName: 'opscan',
    uriRoot: 'https://api-optimistic.etherscan.io/api',
    abi: abiSubPathOfEtherScanLike,
    source: sourceSubPathOfEtherScanLike,
  },
  420: {
    keyName: 'opscan',
    uriRoot: 'https://api-goerli-optimism.etherscan.io/api',
    abi: abiSubPathOfEtherScanLike,
    source: sourceSubPathOfEtherScanLike,
  },
};

async function apiUrl(chain: number, address: string, action: string) {
  const details = explorerConfig[chain];
  if (!details) {
    throw new Error(`Not supported network, chain id: ${chain}.`);
  }

  if (!details[action]) {
    throw new Error(`Not supported on this network, action: ${action}.`);
  }

  const apiKey = await dbService().getKey(details.keyName);
  if (!apiKey) {
    throw new Error(`Cannot find an api key for: ${details.keyName}.`);
  }

  if ([1, 5, 137, 80001].includes(chain)) {
    return details[action](details.uriRoot, address, apiKey);
  }

  throw new Error(`Should not be here: chain: ${chain}, action: ${action}.`);
}

@injectable()
export class ExplorerService implements ExplorerInterface {
  async abi(chain: number, address: string): Promise<string> {
    const result = await this.getData(chain, address, 'abi');
    return result;
  }

  async source(chain: number, address: string): Promise<string> {
    const result = await this.getData(chain, address, 'source');
    return result[0].SourceCode;
  }

  async deploymentDetails(
    chain: number,
    address: string
  ): Promise<ContractDeploymentDetails> {
    const result = await this.getData(chain, address, 'deploymentDetails');
    return {
      creator: result[0].contractCreator,
      txHash: result[0].txHash,
    };
  }

  private async getData(chain: number, address: string, action: string) {
    const url = await apiUrl(chain, address, action);
    const response = await webService().get(url);

    if (response.status !== '1') {
      throw new Error(JSON.stringify(response));
    }

    return response.result;
  }
}
