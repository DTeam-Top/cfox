/* eslint-disable node/no-unpublished-import */
import test from 'ava';
import {SinonStub} from 'sinon';
import {idCommand} from '../../../src/cli/commands/id';
import {webService} from '../../../src/types/container';
import {createOrSetStub, mockVoral} from '../../_utils';

test('idCommand: id', async t => {
  const {log, vorpal} = mockVoral();
  const signature = createOrSetStub(
    ['signature'],
    webService().signature as SinonStub
  );

  await Promise.all(
    [{}, {f: ''}, {e: ''}].map(async options => {
      const error = await t.throwsAsync(async () => {
        await idCommand({options}, vorpal);
      });
      t.true(error!.message.includes('Please specify either -f or -e'));
      t.is(signature.callCount, 0);
    })
  );

  await idCommand({options: {f: 'test'}}, vorpal);
  t.is(signature.callCount, 1);
  t.is(signature.args[0][0], 'function');
  t.is(signature.args[0][1], 'test');
  t.true((log.args[0][0] as string).includes('type'));
  t.true((log.args[0][0] as string).includes('function'));
  t.true((log.args[0][0] as string).includes('result'));
  t.true((log.args[0][0] as string).includes('signature'));

  await idCommand({options: {e: 'test'}}, vorpal);
  t.is(signature.callCount, 2);
  t.is(signature.args[1][0], 'event');
  t.is(signature.args[1][1], 'test');
  t.true((log.args[1][0] as string).includes('type'));
  t.true((log.args[1][0] as string).includes('event'));
  t.true((log.args[1][0] as string).includes('result'));
  t.true((log.args[1][0] as string).includes('signature'));
});
