/* eslint-disable node/no-unpublished-import */
import test from 'ava';
import {
  ethersOf,
  isAddress,
  parseEthers,
  parseUnits,
  unifyAddresses,
  unitsOf,
} from '../../src/eth/ethUtils';

test('parseUnits / unitsOf should work', t => {
  t.is(ethersOf(parseEthers('0.1')), '0.1');
  t.is(unitsOf(parseUnits('0.1', 17), 17), '0.1');
  t.is(unitsOf(parseUnits('0.1', 19), 19), '0.1');
  t.is(unitsOf(parseUnits('0.12345678', 6), 6), '0.123457');
  t.is(unitsOf(parseUnits('0.12345678', 3), 3), '0.123');
});

[
  '0x3F1EcC900564b03C79716fef5FD62a676Fd9e61D',
  '0X3F1ECC900564B03C79716FEF5FD62A676FD9E61D',
  '0x3f1ecc900564b03c79716fef5fd62a676fd9e61d',
  '0x3f1ECC900564b03c79716FEF5fd62a676fd9e61d',
].forEach(item => {
  test(`unifyAddresses(${item}) === 0x3F1EcC900564b03C79716fef5FD62a676Fd9e61D`, t => {
    t.is(unifyAddresses(item), '0x3F1EcC900564b03C79716fef5FD62a676Fd9e61D');
  });
});

[
  '0x3F1EcC900564b03C79716fef5FD62a676Fd9e61D',
  '0X3F1ECC900564B03C79716FEF5FD62A676FD9E61D',
  '0x3f1ecc900564b03c79716fef5fd62a676fd9e61d',
  '0x3f1ECC900564b03c79716FEF5fd62a676fd9e61d',
].forEach(item => {
  test(`isAddress(${item}) === true`, t => {
    t.true(isAddress(item));
  });
});

['test.eth', '0X3F1ECC900564B03C79716FEF5FD62A676FD9ED'].forEach(item => {
  test(`isAddress(${item}) === false`, t => {
    t.false(isAddress(item));
  });
});
