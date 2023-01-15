import dotenv from 'dotenv';
import {homedir} from 'os';
import path from 'path';

const VERSION = '0.0.5';

dotenv.config();

export const LOGO = `
  ______  _______   ______   ___   ___ 
 /      ||   ____| /  __  \\  \\  \\ /  / 
|  ,----'|  |__   |  |  |  |  \\  V  /  
|  |     |   __|  |  |  |  |   >   <   
|  \`----.|  |     |  \`--'  |  /  .  \\  
 \\______||__|      \\______/  /__/ \\__\\ 
                             CFox ${VERSION}
`;

export const KEYS = [
  'infura',
  'morails',
  'nft.storage',
  'etherscan',
  'polygonscan',
  'arbiscan',
  'opcan',
];

export const MAX_ITEMS_PER_PAGE = 20;

export const CFOX_HOME = path.resolve(path.join(homedir(), '.cfox'));
export const DB_NAME =
  process.env.NODE_ENV === 'test'
    ? ':memory:'
    : path.resolve(path.join(CFOX_HOME, 'cfox.db'));
export const DB_VERSION = '0.0.2';
export const RESERVED_NETWORKS = [
  {
    name: 'mainnet',
    chain: 1,
    coin: 'ETH',
    explorerUrl: 'https://etherscan.io',
    tokens: {},
    nfts: {},
  },
  {
    name: 'goerli',
    chain: 5,
    coin: 'GoerliETH',
    explorerUrl: 'https://goerli.etherscan.io',
    tokens: {},
    nfts: {},
  },
  {
    name: 'polygon',
    chain: 137,
    coin: 'MATIC',
    explorerUrl: 'https://polygonscan.com',
    tokens: {},
    nfts: {},
  },
  {
    name: 'mumbai',
    chain: 80001,
    coin: 'MATIC',
    explorerUrl: 'https://mumbai.polygonscan.com/',
    tokens: {},
    nfts: {},
  },
  {
    name: 'arbitrum',
    chain: 42161,
    coin: 'ETH',
    explorerUrl: 'https://arbiscan.io/',
    tokens: {},
    nfts: {},
  },
  {
    name: 'arbitrum-goerli',
    chain: 421613,
    coin: 'ETH',
    explorerUrl: 'https://goerli.arbiscan.io/',
    tokens: {},
    nfts: {},
  },
  {
    name: 'optimism',
    chain: 10,
    coin: 'ETH',
    explorerUrl: 'https://optimistic.etherscan.io/',
    tokens: {},
    nfts: {},
  },
  {
    name: 'optimism-goerli',
    chain: 420,
    coin: 'ETH',
    explorerUrl: 'https://goerli-optimism.etherscan.io/',
    tokens: {},
    nfts: {},
  },
];
export const RESERVED_CHAINS = RESERVED_NETWORKS.map(network => network.chain);
