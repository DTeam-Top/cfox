# CFOX: A shell for eth dapp developers

![build](https://github.com/DTeam-Top/cfox/actions/workflows/ci.yml/badge.svg)
![check-code-coverage](https://img.shields.io/badge/code--coverage-50%25-green)

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

> Tip:
>
> You can always find the saved data in the home directory of cfox: "${USER_HOME}/.cfox".
>
> For example, it is "~/.cfox" on linux or macos.

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

> Tips:
>
> 1. All command line arguments will be splitted by space.
> 1. When passing arguments to an event query, missing means null.

Example #1: query all Transfer events in an range.

```text
cfox[0xBED16Cd70529D459f4A1A44D6Fe0c6B41364a00C||mumbai]=#query 0x0dc5a5d352e55dbb3d27c462de6b506517b86443
Event Abi: event Transfer(address indexed from, address indexed to, uint256 value)
event args (address,address):
start block (top n blocks if it is negative.): 30037846
end block: 30038856
✔ try to query event Transfer().

...
```

Example #2: query all Transfer(,to) events in an range.

```text
cfox[0xBED16Cd70529D459f4A1A44D6Fe0c6B41364a00C||mumbai]=# query 0x0dc5a5d352e55dbb3d27c462de6b506517b86443
Event Abi: event Transfer(address indexed from, address indexed to, uint256 value)
event args (address,address):  0x3B057FD4Ba20D2129b1DD5355CEDE95D4E990ab4
start block (top n blocks if it is negative.): 30037846
end block: 30038856
✔ try to query event Transfer(,0x3B057FD4Ba20D2129b1DD5355CEDE95D4E990ab4).

...
```

Example #3: query all Transfer(from) events in an range.

```text
cfox[0xBED16Cd70529D459f4A1A44D6Fe0c6B41364a00C||mumbai]=# query 0x0dc5a5d352e55dbb3d27c462de6b506517b86443
Event Abi: event Transfer(address indexed from, address indexed to, uint256 value)
event args (address,address): 0x0000000000000000000000000000000000000000
start block (top n blocks if it is negative.): 30037846
end block: 30038856
✔ try to query event Transfer(0x0000000000000000000000000000000000000000).

...
```

## Development

1. `git clone` this repository.
1. `npm i` to install all the dependencies.
1. `npm start` to start the shell.
1. `npm test` to test all the testcases.
