import Vorpal, {Args} from 'vorpal';
import {dynamicImportOraPromise} from '../../commons';
import {dbService} from '../../types/container';
import {Context} from '../context';

export async function exportCommand(
  args: Args,
  vorpal: Vorpal,
  context?: Context
) {
  await (
    await dynamicImportOraPromise()
  )(dbService().backup(), 'try to export all datas.');
}
