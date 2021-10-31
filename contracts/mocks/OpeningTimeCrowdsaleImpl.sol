// SPDX-License-Identifier: MIT
pragma solidity 0.5.17;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/crowdsale/emission/MintedCrowdsale.sol";
import "../crowdsale/OpeningTimeCrowdsale.sol";


contract OpeningTimeCrowdsaleImpl is MintedCrowdsale, OpeningTimeCrowdsale {

    /* solhint-disable no-empty-blocks */
    constructor(uint256 rate, address payable wallet, IERC20 token, uint256 startingTimeUnixTimestamp) public
        OpeningTimeCrowdsale(startingTimeUnixTimestamp) Crowdsale(rate, wallet, token) {
    }
}
