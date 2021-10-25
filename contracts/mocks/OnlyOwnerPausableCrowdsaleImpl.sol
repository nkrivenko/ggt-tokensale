// SPDX-License-Identifier: MIT
pragma solidity 0.5.17;

import "@openzeppelin/contracts/ownership/Ownable.sol";
import "../OnlyOwnerPausableCrowdsale.sol";


contract OnlyOwnerPausableCrowdsaleImpl is OnlyOwnerPausableCrowdsale {

    /* solhint-disable no-empty-blocks */
    constructor(uint256 rate, address payable wallet, IERC20 token, address owner_) public
        OnlyOwnerPausableCrowdsale(owner_) Crowdsale(rate, wallet, token) {
    }
}
