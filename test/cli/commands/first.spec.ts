/* eslint-disable no-empty */
/* eslint-disable node/no-unpublished-import */
import test from 'ava';
import {SinonStub} from 'sinon';
import {firstCommand} from '../../../src/cli/commands/first';
import {Context} from '../../../src/cli/context';
import {explorerService} from '../../../src/types/container';
import {createOrSetStub, mockVoral} from '../../_utils';

test.serial('firstCommand: first', async t => {
  const {log, vorpal} = mockVoral();
  const wallet = {
    provider: {
      getTransaction: () => {
        return {blockNumber: 1};
      },
    },
  };
  const getWallet = createOrSetStub([null, wallet]);
  const getCurrentNetwork = createOrSetStub([{chain: 1}]);
  const context = {
    getCurrentNetwork,
    getWallet,
  } as unknown as Context;
  const deploymentDetails = createOrSetStub(
    [{creator: 'creator', txHash: 'txHash'}],
    explorerService().deploymentDetails as SinonStub
  );

  await firstCommand({contract: '123', options: {}}, vorpal, context);
  t.is(
    deploymentDetails.callCount,
    0,
    'first should not be called when wallet is null.'
  );

  await firstCommand({contract: '123', options: {}}, vorpal, context);
  t.is(deploymentDetails.callCount, 1);
  t.is(deploymentDetails.args[0][0], 1);
  t.is(deploymentDetails.args[0][1], '123');
  t.true((log.args[0][0] as string).includes('creator'));
  t.true((log.args[0][0] as string).includes('txHash'));
  t.true((log.args[0][0] as string).includes('1'));
});
