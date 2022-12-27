/* eslint-disable no-empty */
import test from 'ava';
import {SinonStub} from 'sinon';
import {exportCommand} from '../../../src/cli/commands/export';
import {dbService} from '../../../src/types/container';
import {mockVoral} from '../../_utils';

test('exportCommand: \\e', async t => {
  const {vorpal} = mockVoral();
  const backup = dbService().backup as SinonStub;
  await exportCommand({options: {}}, vorpal, undefined);
  t.is(backup.callCount, 1);
});
