import test from 'ava';
import {SinonStub} from 'sinon';
import {uploadCommand} from '../../../src/cli/commands/upload';
import {ipfsService} from '../../../src/types/container';
import {mockVoral} from '../../_utils';

test('uploadCommand: upload', async t => {
  const {vorpal} = mockVoral();
  const uploadSingleFile = ipfsService().uploadSingleFile as SinonStub;
  uploadSingleFile.returns({});
  const uploadDirectory = ipfsService().uploadDirectory as SinonStub;
  uploadDirectory.returns({});
  const uploadMetadata = ipfsService().uploadMetadata as SinonStub;
  uploadMetadata.returns({});

  await uploadCommand({options: {f: 'test/mockFile'}}, vorpal);
  t.is(uploadSingleFile.callCount, 1);
  t.is(uploadSingleFile.args[0][0], 'test/mockFile');

  await uploadCommand({options: {d: 'test/directory'}}, vorpal);
  t.is(uploadDirectory.callCount, 1);
  t.is(uploadDirectory.args[0][0], 'test/directory');

  await uploadCommand({options: {m: 'test/metadata'}}, vorpal);
  t.is(uploadMetadata.callCount, 1);
  t.is(uploadMetadata.args[0][0], 'test/metadata');
});
