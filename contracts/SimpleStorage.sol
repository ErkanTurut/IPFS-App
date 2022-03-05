// SPDX-License-Identifier: MIT
pragma solidity >=0.4.21 <8.10.0;

contract SimpleStorage {

struct hash{
  string x;
}

   
    // Mapping owner address to token count
    mapping(address => uint256) public _balances;

 // Mapping from owner to list of owned token IDs
    mapping(address => hash[]) public _ownedTokens;

  function set(string memory x) public {

      _ownedTokens[msg.sender].push(hash(x));
      _balances[msg.sender] = _balances[msg.sender] + 1;
   }

   function balanceOf(address owner)
        public
        view
        returns (uint256)
    {
        require(
            owner != address(0),
            "ERC721: balance query for the zero address"
        );
        return _balances[owner];
    }



  /*
  string ipfsHash;

  function set(string memory x) public {
    ipfsHash = x;

  }

  function get() public view returns (string memory) {
    return ipfsHash;
  }
  */
}
