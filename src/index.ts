#!/usr/bin/env node

import Vorpal from 'vorpal';
import {startCLi} from './cli/cli';
import {abiCommand} from './cli/commands/abi';
import {addCommand} from './cli/commands/add';
import {balanceCommand} from './cli/commands/balance';
import {changeCommand} from './cli/commands/change';
import {ensCommand} from './cli/commands/ens';
import {execCommand} from './cli/commands/exec';
import {exportCommand} from './cli/commands/export';
import {firstCommand} from './cli/commands/first';
import {gpCommand} from './cli/commands/gp';
import {idCommand} from './cli/commands/id';
import {initCommand} from './cli/commands/init';
import {keysCommand} from './cli/commands/keys';
import {listCommand} from './cli/commands/list';
import {loginCommand} from './cli/commands/login';
import {nftCommand} from './cli/commands/nft';
import {nonceCommand} from './cli/commands/nonce';
import {peekCommand} from './cli/commands/peek';
import {pushCommand} from './cli/commands/push';
import {qrCommand} from './cli/commands/qr';
import {queryCommand} from './cli/commands/query';
import {removeCommand} from './cli/commands/remove';
import {sendCommand} from './cli/commands/send';
import {sourceCommand} from './cli/commands/source';
import {singleTransferCommand} from './cli/commands/transfer';
import {uploadCommand} from './cli/commands/upload';
import {walletsCommand} from './cli/commands/wallets';
import {createPathIfNotExisting, showLogo} from './commons';
import {CFOX_HOME} from './constant';

showLogo();

createPathIfNotExisting(CFOX_HOME);

const vorpal = new Vorpal();

vorpal.delimiter('cfox=#').show();

startCLi(
  vorpal,
  {
    name: 'init',
    handler: initCommand,
  },
  {name: 'login', handler: loginCommand},
  [
    {
      name: '\\e',
      description: 'Export all datas in db.',
      options: [
        {
          name: '-o <path>',
          description: 'output path, current directory by default.',
        },
      ],
      types: {string: ['o']},
      handler: exportCommand,
    },
    {
      name: '\\s <contract>',
      description: 'Fetch the source code for a contract.',
      options: [
        {
          name: '-o <path>',
          description: 'output path, current directory by default.',
        },
      ],
      types: {string: ['o', '_']},
      handler: sourceCommand,
    },
    {
      name: '\\l',
      description: 'List all datas in db.',
      options: [
        {
          name: '-c',
          description: 'chains, default option.',
        },
        {name: '-a', description: 'accounts.'},
        {name: '-t', description: 'tokens in current chain.'},
        {
          name: '-n [type]',
          description:
            'nfts in current chain, type must be either "erc721" or "erc1155".',
        },
      ],
      types: {string: ['n']},
      handler: listCommand,
    },
    {
      name: '\\c',
      description: 'Change current account or chain.',
      options: [
        {name: '-c <chain>', description: 'target chain'},
        {name: '-a <account>', description: 'target account'},
      ],
      types: {string: ['a']},
      handler: changeCommand,
    },
    {
      name: '\\a',
      description: 'Add a chain, account or token to db.',
      options: [
        {
          name: '-a [seeds]',
          description:
            'an account, an random account if seeds missing. seeds will be used as a private key when it is a single word, otherwise it will be seen as a mnemonic.',
        },
        // {name: '-c', description: 'an chain.'},
        {name: '-t', description: 'a token added to current chain.'},
        {name: '-n', description: 'an nft added to current chain.'},
      ],
      types: {string: ['a']},
      handler: addCommand,
    },
    {
      name: '\\r',
      description: 'Remove a chain, account or token from db.',
      options: [
        {
          name: '-a <account>',
          description: 'an account not current account.',
        },
        // {
        //   name: '-c <chain>',
        //   description: 'a chain not current chain.',
        // },
        {
          name: '-t <token>',
          description: 'a token in current chain.',
        },
        {
          name: '-n <nft>',
          description: 'a nft in current chain.',
        },
      ],
      types: {string: ['a', 't', 'n']},
      handler: removeCommand,
    },
    {
      name: 'qr [account]',
      description:
        'Generate a QR Code for an account, current account will be used when account is missing.',
      types: {string: ['_']},
      handler: qrCommand,
    },
    {
      name: 'balance',
      description: 'Show a balance.',
      options: [
        {
          name: '-e',
          description: 'eth',
        },
        {name: '-t [token]', description: 'token, all tokens if missing.'},
      ],
      types: {string: ['t']},
      handler: balanceCommand,
    },
    {
      name: 'send <target> <amount>',
      description: 'Send a amount of token to a target account.',
      options: [
        {
          name: '-t <token>',
          description:
            'token, the coin of current chain will be used if missing.',
        },
      ],
      types: {string: ['t', '_']},
      handler: sendCommand,
    },
    {
      name: 'nft <contract>',
      description: 'Show all tokens owned by current account in the contract.',
      options: [
        {
          name: '-v',
          description: 'verbose, metadata of each token will be shown.',
        },
      ],
      types: {string: ['_']},
      handler: nftCommand,
    },
    {
      name: 'transfer <contract> <target> <id>',
      description: 'Transfer a nft to a target account.',
      types: {string: ['_']},
      handler: singleTransferCommand,
    },
    {
      name: 'gp',
      description:
        'Show current gas price, if "baseFeePerGas" is not empty, then fast / standard / low are values of "maxPriorityFeePerGas". Otherwise, they are normal gas prices before EIP1559.',
      handler: gpCommand,
    },
    {
      name: 'exec <contract>',
      description: 'Execute any function in the contract definition.',
      types: {string: ['_']},
      handler: execCommand,
    },
    {
      name: 'query <contract>',
      description: 'Query any event logs caused by the contract.',
      types: {string: ['_']},
      handler: queryCommand,
    },
    {
      name: 'ens <value>',
      description:
        'Execute ENS action, the returned value depends on <value>: an ens name if it is an address; an address when it is an ens name.',
      types: {string: ['_']},
      handler: ensCommand,
    },
    {
      name: 'wallets',
      description:
        'Generate n wallets derived from an random wallet, following BIP-44',
      options: [
        {
          name: '-n <count>',
          description: 'count of derived wallets, 10 by default.',
        },
      ],
      types: {string: ['n']},
      handler: walletsCommand,
    },
    {
      name: 'upload',
      description: 'Upload files to IPFS.',
      options: [
        {
          name: '-f <filename>',
          description: 'file',
        },
        {
          name: '-d <directory>',
          description: 'directory',
        },
        {
          name: '-m <filename>',
          description: 'metadata',
        },
      ],
      types: {string: ['f', 'd', 'm']},
      handler: uploadCommand,
    },
    {
      name: 'peek',
      description: 'Show metadata of a contract or a token.',
      options: [
        {
          name: '--erc20 <contract>',
          description: 'erc20 contract address',
        },
        {
          name: '--erc721 <contract>',
          description: 'erc721 contract address',
        },
        {
          name: '-t <token>',
          description:
            'token id, it can only be used with "erc721" option. If missing, only contract level metadata will be returned.',
        },
      ],
      types: {string: ['erc20', 'erc721', 't']},
      handler: peekCommand,
    },
    {
      name: 'nonce [account]',
      description:
        'Show current nonce details of an account, current account will be used when account is missing.',
      types: {string: ['_']},
      handler: nonceCommand,
    },
    {
      name: 'cancel',
      description:
        'Cancel a tx sent by current account by nonce or transaction hash.',
      options: [
        {
          name: '--tx <txHash>',
          description: 'transaction hash',
        },
        {
          name: '-n <nonce>',
          description: 'nonce',
        },
      ],
      types: {string: ['n', 'tx']},
      handler: changeCommand,
    },
    {
      name: 'push <txHash>',
      description: 'Speed up a tx.',
      types: {string: ['_']},
      handler: pushCommand,
    },
    {
      name: 'keys [name] [value]',
      description:
        'Configure api keys used by cfox, null will be used when no value is provided.',
      options: [
        {
          name: '-l',
          description: 'list, show all the api keys.',
        },
      ],
      types: {string: ['_']},
      handler: keysCommand,
    },
    {
      name: 'abi <contract>',
      description: 'Fetch the abi for a contract.',
      options: [
        {
          name: '-o <path>',
          description: 'output path, current directory by default.',
        },
      ],
      types: {string: ['o', '_']},
      handler: abiCommand,
    },
    {
      name: 'first <contract>',
      description: 'Get the creation transaction of a contract.',
      types: {string: ['_']},
      handler: firstCommand,
    },
    {
      name: 'id',
      description: 'Return signature by id.',
      options: [
        {
          name: '-f <id>',
          description: 'function id',
        },
        {
          name: '-e <id>',
          description: 'event id',
        },
      ],
      types: {string: ['f', 'e']},
      handler: idCommand,
    },
  ]
);
