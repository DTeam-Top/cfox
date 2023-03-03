/* eslint-disable node/no-unpublished-import */
import test from 'ava';
import {existsSync, rmSync} from 'fs';
import {tmpdir} from 'os';
import path from 'path';
import {LocalCache} from '../../src/storage/cache';

test('cache should work', async t => {
  const cacheHome = path.resolve(path.join(tmpdir(), 'cache'));
  const cache = new LocalCache(cacheHome);

  t.true(
    existsSync(cacheHome),
    'cache home should be created after LocalCache initialized.'
  );

  t.false(!!cache.get('tmp-key'));

  cache.put('tmp-key', 'this is a test.');
  t.is(cache.get('tmp-key'), 'this is a test.');

  const error = t.throws(() => {
    cache.put('tmp-key', 'this is a another test');
  });
  t.true(error?.message.includes('Existing key: tmp-key'));

  t.is(cache.get('tmp-key'), 'this is a test.');

  rmSync(cacheHome, {force: true, recursive: true});
});
