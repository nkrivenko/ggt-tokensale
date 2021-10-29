// SPDX-License-Identifier: MIT
pragma solidity 0.5.17;

import "@openzeppelin/contracts/crowdsale/emission/MintedCrowdsale.sol";
import "@openzeppelin/contracts/ownership/Ownable.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "./OnlyOwnerPausableCrowdsale.sol";
import "../price/BinanceOracle.sol";


contract GodjiGamePreSaleStep is Ownable, OnlyOwnerPausableCrowdsale, MintedCrowdsale {

    using SafeMath for uint256;

    BinanceOracle private _binanceOracle;

    event Tokens(uint256 tokens);

    constructor(uint256 rate, address payable wallet, IERC20 token, address owner_, BinanceOracle binanceOracle) public 
    OnlyOwnerPausableCrowdsale(owner_) Crowdsale(rate, wallet, token) {
        _binanceOracle = binanceOracle;
        _transferOwnership(owner_);
    }

    function _getTokenAmount(uint256 weiAmount) internal view returns (uint256) {
        uint256 bnbbusd = _binanceOracle.getPrice();
        uint256 ggtbusd = rate();

        return weiAmount.mul(bnbbusd).div(ggtbusd).div(10 ** 18);
    }
}
