pragma solidity 0.5.17;

import "../crowdsale/BusdCappedCrowdsale.sol";
import "@openzeppelin/contracts/crowdsale/emission/MintedCrowdsale.sol";


contract BusdCappedCrowdsaleImpl is BusdCappedCrowdsale, MintedCrowdsale {

    uint256 private constant BNBBUSD_DECIMALS = 1 ether;
    uint256 private constant ONE_HUNDRED_PERCENT = 100;

    /* solhint-disable no-empty-blocks */
    constructor (uint256 rate, address payable wallet, IERC20 token, uint256 busdCap, BinanceOracle oracle) public
        BusdCappedCrowdsale(busdCap, oracle) Crowdsale(rate, wallet, token) {
    }

    function _getTokenAmount(uint256 weiAmount) internal view returns (uint256) {
        uint256 bnbbusd = oracle().getPrice();

        // We check allowlist here as we need to use 
        // the same price for check and token amount calcualtion
        _checkBusdCap(_msgSender(), weiAmount, bnbbusd);

        return weiAmount.mul(bnbbusd).div(ONE_HUNDRED_PERCENT)
            .div(rate()).div(BNBBUSD_DECIMALS);
    }
}
