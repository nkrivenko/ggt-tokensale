// SPDX-License-Identifier: MIT
pragma solidity 0.5.5;

import "@openzeppelin/contracts/ownership/Ownable.sol";


contract GodjiGamePreSaleStep is Ownable {
    constructor(address owner_) public {
        _transferOwnership(owner_);
    }
}
