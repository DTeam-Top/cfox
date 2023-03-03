/* eslint-disable node/no-unpublished-import */
import test from 'ava';
import {existsSync, rmSync} from 'fs';
import {tmpdir} from 'os';
import path from 'path';
import {
  createPathIfNotExisting,
  isEmpty,
  isReserved,
  passwordHash,
  should,
  toHttpUrl,
  verifyPassword,
} from '../src/commons';

[
  [{a: 1}, false],
  [[1], false],
  [{}, true],
  [[], true],
].forEach(item => {
  test(`isEmpty(${JSON.stringify(item[0])}) === ${item[1]}`, t => {
    t.is(isEmpty(item[0]), item[1] as boolean);
  });
});

test('passwordHash should work', async t => {
  const password = 'password';
  t.true(await verifyPassword(await passwordHash(password), password));
});

[
  ['ipfs://xxx', 'https://ipfs.io/ipfs/xxx'],
  ['http://localhost:8080', 'http://localhost:8080'],
  ['https://g.cn', 'https://g.cn'],
].forEach(item => {
  test(`toHttpUrl(${item[0]}) === ${item[1]}`, t => {
    t.is(toHttpUrl(item[0]), item[1]);
  });
});

[
  [1, true],
  [5, true],
  [137, true],
  [80001, true],
  [42161, true],
  [421613, true],
  [10, true],
  [420, true],
  [41, false],
].forEach(item => {
  test(`isReserved(${JSON.stringify(item[0])}) === ${item[1]}`, t => {
    t.is(isReserved(item[0] as number), item[1] as boolean);
  });
});

test('should(false, message) must throw an Error', t => {
  const error = t.throws(() => {
    should(false, 'there is an error.');
  });
  t.is(error!.message, 'there is an error.');
});

test('should(true, message) must throws no error.', t => {
  t.notThrows(() => {
    should(true, 'there is an error.');
  });
});

test('createPathIfNotExisting should work.', t => {
  const tmp = path.resolve(path.join(tmpdir(), 'tmp-test'));
  t.false(existsSync(tmp));

  createPathIfNotExisting(tmp);
  t.true(existsSync(tmp));

  rmSync(tmp, {recursive: true});
});

test('createPathIfNotExisting should not create a dir when it exists.', t => {
  const tmp = path.resolve(path.join(tmpdir(), 'tmp1', 'child'));
  createPathIfNotExisting(tmp);

  t.true(existsSync(tmp));

  const tmpParent = path.resolve(path.join(tmpdir(), 'tmp1'));
  createPathIfNotExisting(tmpParent);
  t.true(existsSync(tmp));

  rmSync(tmp, {force: true, recursive: true});
});
