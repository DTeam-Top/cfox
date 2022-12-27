import {FormatTypes, Interface} from 'ethers/lib/utils';
import Vorpal, {Args} from 'vorpal';
import {
  confirmIt,
  dynamicImportOraPromise,
  hasEnoughBalance,
  log,
  setGasPrice,
  should,
} from '../../commons';
import {parseEthers} from '../../eth/ethUtils';
import {walletService} from '../../types/container';
import {TxDetails} from '../../types/types';
import {Context} from '../context';

export async function execCommand(
  args: Args,
  vorpal: Vorpal,
  context?: Context
) {
  const wallet = context!.getWallet();
  if (!wallet) {
    return;
  }

  const methodAbi = (
    await vorpal.activeCommand.prompt([
      {
        type: 'input',
        name: 'methodAbi',
        message: 'Method Abi: ',
      },
    ])
  ).methodAbi;

  const jsonAbi = JSON.parse(
    new Interface([methodAbi]).format(FormatTypes.json) as string
  );

  should(jsonAbi[0].type === 'function', 'Only function type is supported.');

  const methodArgs = jsonAbi[0].inputs.length
    ? (
        await vorpal.activeCommand.prompt([
          {
            type: 'input',
            name: 'args',
            message: `Method args (${jsonAbi[0].inputs
              .map((input: {type: string; name: string}) => input.type)
              .join(',')}): `,
          },
        ])
      ).args.split(' ')
    : [];

  should(
    methodArgs.length === jsonAbi[0].inputs.length,
    'Wrong number of arguments.'
  );

  const paidEth =
    jsonAbi[0].stateMutability === 'payable'
      ? (
          await vorpal.activeCommand.prompt([
            {
              type: 'input',
              name: 'paidEth',
              message: 'Paid ETH: ',
            },
          ])
        ).paidEth
      : '';

  const options: any = {};
  if (paidEth) {
    should(await hasEnoughBalance(paidEth, context!), 'Insufficent balance.');
    options.value = parseEthers(paidEth);
  }

  if (jsonAbi[0].constant) {
    log(vorpal, [
      await (
        await dynamicImportOraPromise()
      )(
        walletService().read(args.contract, wallet, methodAbi, methodArgs),
        `try to exec ${jsonAbi[0].name}(${methodArgs.join(',')}).`
      ),
    ]);
  } else {
    const txDetails = (await (
      await dynamicImportOraPromise()
    )(
      walletService().exec(
        args.contract,
        wallet,
        methodAbi,
        methodArgs,
        options,
        true
      ),
      'try to get exec tx details.'
    )) as TxDetails;

    const confirm = await confirmIt(vorpal, txDetails, 'want to execute?');
    if (confirm) {
      const gasPrice = await setGasPrice(
        vorpal,
        txDetails.gasPrices.map(price => String(price.gwei))
      );

      await (
        await dynamicImportOraPromise()
      )(
        walletService().exec(
          args.contract,
          wallet,
          methodAbi,
          methodArgs,
          {
            gasLimit: txDetails.gasEstimation,
            ...options,
            // gasPrice: parseUnits(gasPrice, 9),
          },
          false
        ),
        `try to exec ${jsonAbi[0].name}(${methodArgs.join(',')}).`
      );
    }
  }
}
