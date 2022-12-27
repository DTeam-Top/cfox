// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import '@openzeppelin/contracts/token/ERC20/ERC20.sol';

contract MockERC20 is ERC20 {
    constructor(uint256 initialBalance) ERC20('MockERC20', 'MT20') {
        _mint(msg.sender, initialBalance);
    }

    function payableMethod() public payable returns (bool) {
        return (true);
    }
}
