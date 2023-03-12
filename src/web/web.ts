/* eslint-disable node/no-unpublished-import */
import axios from 'axios';
import {injectable} from 'inversify';
import {delay, isEmpty, should, toHttpUrl} from '../commons';
import {dbService} from '../types/container';
import {WebInterface} from '../types/types';

const MAX_RETRIES = 3;
const DELAY_INTERVAL = {
  start: 2000,
  range: 10000,
};

@injectable()
export class WebService implements WebInterface {
  get(url: string, config = {}) {
    return this.safeGet(url, config);
  }

  async tokens(
    address: string,
    contrat: string,
    chain: number,
    tokenIdOnly = false
  ) {
    const moralsKey = dbService().getKey('morails');
    should(!!moralsKey, 'morails key is missing, please set one.');

    const result = (
      await this.safeGet(
        `https://deep-index.moralis.io/api/v2/${address}/nft/${contrat}?chain=0x${chain.toString(
          16
        )}`,
        {
          headers: {
            Accept: 'application/json',
            'X-API-Key': moralsKey,
          },
        }
      )
    ).result;

    if (tokenIdOnly) {
      return result.map((item: any) => {
        return {
          name: item.name,
          symbol: item.symbol,
          type: item.contract_type.toLowerCase(),
          tokenId: item.token_id,
        };
      });
    } else {
      return result.map((item: any) => {
        return {
          name: item.name,
          symbol: item.symbol,
          type: item.contract_type.toLowerCase(),
          tokenId: item.token_id,
          metadata: item.metadata || '',
        };
      });
    }
  }

  async signature(type: 'function' | 'event', id: string) {
    const result = await this.get(
      `https://www.4byte.directory/api/v1/${
        type === 'event' ? 'event-' : ''
      }signatures/?hex_signature=${id}`
    );
    return result.results
      .map((result: any) => result.text_signature)
      .join('\n');
  }

  private async safeGet(
    url: string,
    config = {},
    retryCount = 0
  ): Promise<any> {
    try {
      const response = isEmpty(config)
        ? await axios.get(toHttpUrl(url))
        : await axios.get(toHttpUrl(url), config);

      return response.data;
    } catch (e: any) {
      if (retryCount < MAX_RETRIES) {
        await delay(
          DELAY_INTERVAL.start +
            Math.floor(Math.random() * DELAY_INTERVAL.range)
        );
        return this.safeGet(url, config, retryCount++);
      }

      throw new Error(
        `Tried ${MAX_RETRIES} times, cannot get data from ${url}, reason: ${e.message}.`
      );
    }
  }
}
