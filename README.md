# CFOX: A shell for eth dapp developers

[![pipeline status](https://git.shifudao.com/creative/cfox/badges/master/pipeline.svg)](https://git.shifudao.com/creative/cfox/-/commits/master) [![coverage report](https://git.shifudao.com/creative/cfox/badges/master/coverage.svg)](https://git.shifudao.com/creative/cfox/-/commits/master)

```text
  ______  _______   ______   ___   ___
 /      ||   ____| /  __  \  \  \ /  /
|  ,----'|  |__   |  |  |  |  \  V  /
|  |     |   __|  |  |  |  |   >   <
|  `----.|  |     |  `--'  |  /  .  \
 \______||__|      \______/  /__/ \__\
                             CFox 0.0.4
```

cfox is a shell for eth dapp developers and provided, current supported commands includes:

```text
  Commands:

    help [command...]                  Provides help for a given command.
    exit                               Exits application.
    \e                                 Export all datas in db.
    \l [options]                       List all datas in db.
    \c [options]                       Change current account or chain.
    \a [options]                       Add a chain, account or token to db.
    \r [options]                       Remove a chain, account or token from db.
    qr [account]                       Generate a QR Code for an account, current account will be used when account is missing.
    balance [options]                  Show a balance.
    send [options] <target> <amount>   Send a amount of token to a target account.
    nft [options] <contract>           Show all tokens owned by current account in the contract.
    transfer <contract> <target> <id>  Transfer a nft to a target account.
    gp                                 Show current gas price, if "baseFeePerGas" is not empty, then fast / standard / low are values of "maxPriorityFeePerGas". Otherwise, they are normal gas prices before EIP1559.
    exec <contract>                    Execute any function in the contract definition.
    query <contract>                   Query any event logs caused by the contract.
    ens <value>                        Execute ENS action, the returned value depends on <value>: an ens name if it is an address; an address when it is an ens name.
    wallets [options]                  Generate n wallets derived from a random wallet, following BIP-44
    upload [options]                   Upload files to IPFS.
    peek [options]                     Show metadata of a contract or a token.
    nonce [account]                    Show current nonce details of an account, current account will be used when account is missing.
    cancel [options]                   Cancel a tx sent by current account by nonce or transaction hash.
    push <txHash>                      Speed up a tx.
    keys [options] [name] [value]      Configure api keys used by cfox, null will be used when no value is provided.
```

## Installation

`npm install -g cfox`

## Initialization

cfox will ask the user to set the password on its first run:

```text
  ______  _______   ______   ___   ___
 /      ||   ____| /  __  \  \  \ /  /
|  ,----'|  |__   |  |  |  |  \  V  /
|  |     |   __|  |  |  |  |   >   <
|  `----.|  |     |  `--'  |  /  .  \
 \______||__|      \______/  /__/ \__\
                             CFox 0.0.4

cfox=#
This is your first time to run cfox, please do some configurations first.
Please set login password: ***
Please confirm the password: ***
cfox=#
Please input password: ***
Login successfully!
```

After that, since there are no wallets added the prompt will use `?` for current wallet:

```text
cfox[?||mainnet]=#
```

The prompt format: `cfox[current_wallet || current_network]`, both will be used by the provider or signer running the blockchain related command. You can use `\c` to change them.

Now, it's time to create a wallet for playing. The simplest way is to run `\a -a`, which will create an random wallet and set it the current wallet because there is no one.

```text
cfox[?||mainnet]=# \a -a
✔ try to create a new account.
cfox[0xBED16Cd70529D459f4A1A44D6Fe0c6B41364a00C||mainnet]=#
```

The last step of initialization is to set the keys used by cfox. You can find all the external apis supported by running `keys -l`. Currently, the result:

```text
cfox[0xBED16Cd70529D459f4A1A44D6Fe0c6B41364a00C||mainnet]=#keys -l

| name        | value |
-----------------------
| infura      |       |
| morails     |       |
| nft.storage |       |
```

## Commands

Each command has a detailed description and you can always know it by running `help <command>` or `<command> --help`. For example:

```text
cfox[0xBED16Cd70529D459f4A1A44D6Fe0c6B41364a00C||mainnet]=# help qr

  Usage: qr [options] [account]

  Generate a QR Code for an account, current account will be used when account is missing.

  Options:

    --help  output usage information
```

The commands using the external apis:

- `nft`, it will use morails as a fallback for those contracts not implementing `IERC721Enumerable`.
- `upload`, it depends on nft.storage api to fulfill uploading datas to IPFS.

## Development

1. `git clone` this repository.
1. `npm i` to install all the dependencies.
1. `npm start` to start the shell.
1. `npm test` to test all the testcases.
