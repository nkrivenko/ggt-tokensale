// SPDX-License-Identifier: MIT
pragma solidity 0.5.17;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../crowdsale/TokenCappedCrowdsale.sol";


contract TokenCappedCrowdsaleImpl is TokenCappedCrowdsale {

    /* solhint-disable no-empty-blocks */
    constructor(uint256 rate, address payable wallet, IERC20 token, uint256 tokenCap) public
        TokenCappedCrowdsale(tokenCap) Crowdsale(rate, wallet, token) {
    }
}
