// SPDX-License-Identifier: MIT
pragma solidity 0.5.17;

import "@openzeppelin/contracts/crowdsale/emission/MintedCrowdsale.sol";
import "@openzeppelin/contracts/ownership/Ownable.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "./OnlyOwnerPausableCrowdsale.sol";
import "../price/BinanceOracle.sol";


contract GodjiGamePreSaleStep is Ownable, OnlyOwnerPausableCrowdsale, MintedCrowdsale {

    using SafeMath for uint256;

    uint256 private constant BNBBUSD_DECIMALS = 10 ** 18;
    uint256 private constant ONE_HUNDRED_PERCENT = 100;

    BinanceOracle private _binanceOracle;

    uint256 private _bonusCoeffPercent;

    event NewBonusCoefficient(uint256 bonusCoeff);

    constructor(uint256 rate, address payable wallet, IERC20 token, address owner_, BinanceOracle binanceOracle,
        uint256 bonusCoeffPercent_) public 
    OnlyOwnerPausableCrowdsale(owner_) Crowdsale(rate, wallet, token) {
        require(bonusCoeffPercent_ > 0, "GodjiGamePreSaleStep: bonusCoeffPercent must be positive number");

        _binanceOracle = binanceOracle;
        _bonusCoeffPercent = bonusCoeffPercent_;

        _transferOwnership(owner_);
    }

    function setBonusCoeff(uint256 bonusCoeffPercent_) public onlyOwner {
        _bonusCoeffPercent = bonusCoeffPercent_;

        emit NewBonusCoefficient(_bonusCoeffPercent);
    }

    function _getTokenAmount(uint256 weiAmount) internal view returns (uint256) {
        uint256 bnbbusd = _binanceOracle.getPrice();
        uint256 ggtbusd = rate();

        return weiAmount.mul(bnbbusd).mul(_bonusCoeffPercent).div(ONE_HUNDRED_PERCENT)
            .div(ggtbusd).div(BNBBUSD_DECIMALS);
    }
}
