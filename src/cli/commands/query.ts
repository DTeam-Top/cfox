import {FormatTypes, Interface} from 'ethers/lib/utils';
import Vorpal, {Args} from 'vorpal';
import {confirmIt, dynamicImportOraPromise, log, should} from '../../commons';
import {MAX_ITEMS_PER_PAGE} from '../../constant';
import {walletService} from '../../types/container';
import {Context} from '../context';

export async function queryCommand(
  args: Args,
  vorpal: Vorpal,
  context?: Context
) {
  const wallet = context!.getWallet();
  if (!wallet) {
    return;
  }

  const eventAbi = (
    await vorpal.activeCommand.prompt([
      {
        type: 'input',
        name: 'eventAbi',
        message: 'Event Abi: ',
      },
    ])
  ).eventAbi;

  const jsonAbi = JSON.parse(
    new Interface([eventAbi]).format(FormatTypes.json) as string
  );

  should(jsonAbi[0].type === 'event', 'Only event type is supported.');

  const eventArgs = jsonAbi[0].inputs.length
    ? (
        await vorpal.activeCommand.prompt([
          {
            type: 'input',
            name: 'args',
            message: `event args (${jsonAbi[0].inputs
              .filter((input: any) => input.indexed)
              .map((input: {type: string; name: string}) => input.type)
              .join(',')}): `,
          },
        ])
      ).args
        .split(' ')
        .map((arg: string) => arg || null)
    : [];

  should(
    eventArgs.length <= jsonAbi[0].inputs.length,
    'Wrong number of arguments.'
  );

  const startBlock = (
    await vorpal.activeCommand.prompt([
      {
        type: 'input',
        name: 'start',
        default: 'earliest',
        message: 'start block (top n blocks if it is negative.): ',
      },
    ])
  ).start;

  const endBlock =
    startBlock === 'earliest' || Number(startBlock) > 0
      ? (
          await vorpal.activeCommand.prompt([
            {
              type: 'input',
              name: 'end',
              default: 'latest',
              message: 'end block: ',
            },
          ])
        ).end
      : null;

  const results = await (
    await dynamicImportOraPromise()
  )(
    walletService().query(
      args.contract,
      wallet,
      eventAbi,
      eventArgs,
      startBlock === 'earliest' ? startBlock : Number(startBlock),
      endBlock === null || endBlock === 'latest' ? endBlock : Number(endBlock)
    ),
    `try to query event ${jsonAbi[0].name}(${eventArgs.join(',')}).`
  );

  const pages = Math.ceil(results.length / MAX_ITEMS_PER_PAGE);

  if (results.length > MAX_ITEMS_PER_PAGE) {
    for (let i = 0; i < pages; i++) {
      log(
        vorpal,
        results.slice(i * MAX_ITEMS_PER_PAGE, (i + 1) * MAX_ITEMS_PER_PAGE)
      );
      if (i !== pages - 1) {
        const more = await confirmIt(vorpal, [], 'more?');
        if (!more) {
          break;
        }
      }
    }
  }
}
