// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import '@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol';

contract MockERC721 is ERC721Enumerable {
    string private _baseTokenURI;

    constructor(string memory name, string memory symbol)
        ERC721(name, symbol)
    {}

    function mint(address to, uint256 tokenId) public {
        _mint(to, tokenId);
    }
}
