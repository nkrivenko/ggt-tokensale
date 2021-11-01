pragma solidity 0.5.17;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/crowdsale/emission/MintedCrowdsale.sol";
import "../price/BinanceOracle.sol";
import "../crowdsale/BusdThresholdAllowlistCrowdsale.sol";


contract BusdThresholdAllowlistCrowdsaleImpl is BusdThresholdAllowlistCrowdsale, MintedCrowdsale {

    uint256 private constant ONE_HUNDRED_PERCENT = 100;
    uint256 private constant BNBBUSD_DECIMALS = 10 ** 18;

    BinanceOracle private _oracle;

    constructor (uint256 rate, address payable wallet, IERC20 token, BinanceOracle oracle, uint256 bnbThreshold, address owner) public
        BusdThresholdAllowlistCrowdsale(bnbThreshold, owner) Crowdsale(rate, wallet, token) {
        _oracle = oracle;
    }

    function _getTokenAmount(uint256 weiAmount) internal view returns (uint256) {
        uint256 bnbbusd = _oracle.getPrice();

        // We check allowlist here as we need to use 
        // the same price for check and token amount calcualtion
        _checkTokens(_msgSender(), weiAmount, bnbbusd);

        return weiAmount.mul(bnbbusd).div(ONE_HUNDRED_PERCENT)
            .div(rate()).div(BNBBUSD_DECIMALS);
    }
}
