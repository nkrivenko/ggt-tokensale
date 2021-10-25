// SPDX-License-Identifier: MIT
pragma solidity 0.5.17;

import "@openzeppelin/contracts/ownership/Ownable.sol";
import "../OnlyOwnerPausableCrowdsale.sol";


contract OnlyOwnerPausableCrowdsaleImpl is OnlyOwnerPausableCrowdsale {
    constructor(uint256 rate, address payable wallet, IERC20 token, address owner_)
        OnlyOwnerPausableCrowdsale(owner_)
        Crowdsale(rate, wallet, token) public {
    }
}
