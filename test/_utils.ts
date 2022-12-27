import sinon, {SinonStub} from 'sinon';
import Vorpal from 'vorpal';

export function createOrSetStub(expected: any[], host?: SinonStub) {
  const stub = host || sinon.stub();
  expected.forEach((item, index) => {
    index === expected.length - 1
      ? stub.returns(item)
      : stub.onCall(index).returns(item);
  });
  return stub;
}

export function mockVoral(prompt?: any) {
  const log = sinon.stub();
  const red = sinon.stub();
  const green = sinon.stub();
  const blue = sinon.stub().returnsArg(0);
  const vorpal = {
    log,
    chalk: {red, green, blue},
    activeCommand: {prompt},
  } as unknown as Vorpal;

  return {log, red, green, vorpal};
}

export const testNetwork = {
  name: 'rinkeby',
  chain: 11,
  coin: 'ETH',
  tokens: {},
};
export const testAccount = {
  address: '0x37e766Af1a12b2E506b203f45778cDe8A6f58887',
  details: 'string',
};
export const testToken = {
  address: '0x6F10B7B2587981eD5Ee8a7485B7992271d4107a4',
  name: 'MockToken',
  symbol: 'MT',
  decimals: 18,
};
export const testNft721 = {
  address: '0xc328216478Ae9E87C373b22452EC1b283202c6b8',
  name: 'MockToken',
  symbol: 'MT',
  type: 'erc721',
};
export const testNft1155 = {
  address: '0x6F10B7B2587981eD5Ee8a7485B7992271d4107a6',
  name: 'MockToken',
  symbol: 'MT',
  type: 'erc1155',
};
export const testPk =
  '0xf2d7e43370832d067f19bf748ddfc81e2c9fc702cfa1f6f0eafeedf3f9828d48';
export const testMnemonic =
  'announce room limb pattern dry unit scale effort smooth jazz weasel alcohol';
export const testAddress = '0x37e766Af1a12b2E506b203f45778cDe8A6f58887';
