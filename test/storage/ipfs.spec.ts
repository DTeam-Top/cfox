/* eslint-disable node/no-unpublished-import */
import test from 'ava';
import 'reflect-metadata';
import {IpfsService} from '../../src/storage/ipfs';

test('uploadMetadata should throw error for bad metadata', async t => {
  const error = await t.throwsAsync(async () => {
    await new IpfsService().uploadMetadata('test/storage/bad-metadata.json');
  });
  t.true(
    error!.message.includes('not includes "name", "description", "image".')
  );
});
