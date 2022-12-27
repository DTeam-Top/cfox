export const ERC20_ABI = [
  'function name() public view returns (string)',
  'function symbol() public view returns (string)',
  'function decimals() external pure returns (uint8)',
  'function totalSupply() public view returns (uint256)',
  'function balanceOf(address) external view returns (uint256)',
  'function transfer(address, uint256) returns (bool)',
];

export const ERC721_ABI = [
  'function name() public view returns (string)',
  'function symbol() public view returns (string)',
  'function tokenURI(uint256) public view returns (string)',
  'function contractURI() public view returns (string)',
  'function balanceOf(address) public view returns (uint256)',
  'function tokenOfOwnerByIndex(address, uint256) external view returns (uint256)',
  'function ownerOf(uint256) public view returns (address)',
  'function safeTransferFrom(address, address, uint256) external',
];
