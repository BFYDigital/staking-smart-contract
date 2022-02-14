// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract BFYToken is Ownable, ERC20 {
    constructor() ERC20("BFY Token", "BFY") {
        _mint(msg.sender, 10000 * 10**uint256(decimals()));
    }
}
