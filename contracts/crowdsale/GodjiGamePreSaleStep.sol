// SPDX-License-Identifier: MIT
pragma solidity 0.5.17;

import "@openzeppelin/contracts/crowdsale/emission/MintedCrowdsale.sol";
import "@openzeppelin/contracts/crowdsale/validation/CappedCrowdsale.sol";
import "@openzeppelin/contracts/ownership/Ownable.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "./OnlyOwnerPausableCrowdsale.sol";
import "./OpeningTimeCrowdsale.sol";
import "./TokenCappedCrowdsale.sol";
import "./BusdThresholdAllowlistCrowdsale.sol";
import "../price/BinanceOracle.sol";


contract GodjiGamePreSaleStep is Ownable, OnlyOwnerPausableCrowdsale, MintedCrowdsale,
    OpeningTimeCrowdsale, BusdThresholdAllowlistCrowdsale, TokenCappedCrowdsale, CappedCrowdsale {

    using SafeMath for uint256;

    uint256 private constant BNBBUSD_DECIMALS = 10 ** 18;
    uint256 private constant ONE_HUNDRED_PERCENT = 100;

    BinanceOracle private _binanceOracle;

    uint256 private _bonusCoeffPercent;
    uint256 private _ggtBusdRate;

    event BonusCoefficientChanged(address indexed changer, uint256 bonusCoeff);
    event RateChanged(address indexed changer, uint256 newRate);

    constructor(uint256 rate, address payable wallet, IERC20 token, address owner_, BinanceOracle binanceOracle,
        uint256 bonusCoeffPercent_, uint256 startTimeUnix, uint256 cap_,
        uint256 tokenCap_, uint256 busdThreshold_) public 
        OnlyOwnerPausableCrowdsale(owner_) OpeningTimeCrowdsale(startTimeUnix) 
        BusdThresholdAllowlistCrowdsale(busdThreshold_, owner_)
        CappedCrowdsale(cap_) TokenCappedCrowdsale(tokenCap_) Crowdsale(rate, wallet, token) {

        require(bonusCoeffPercent_ > 0, "GodjiGamePreSaleStep: bonusCoeffPercent must be positive number");

        _binanceOracle = binanceOracle;
        _bonusCoeffPercent = bonusCoeffPercent_;
        _ggtBusdRate = rate;

        _transferOwnership(owner_);
    }

    function rate() public view returns (uint256) {
        return _ggtBusdRate;
    }

    function setBonusCoeff(uint256 bonusCoeffPercent_) public onlyOwner {
        require(bonusCoeffPercent_ > 0, "GodjiGamePreSaleStep: Bonus coeff is 0");

        _bonusCoeffPercent = bonusCoeffPercent_;

        emit BonusCoefficientChanged(_msgSender(), _bonusCoeffPercent);
    }

    function setRate(uint256 ggtBusdRate_) public onlyOwner {
        require(ggtBusdRate_ > 0, "GodjiGamePreSaleStep: GGT.BUSD is 0");

        _ggtBusdRate = ggtBusdRate_;

        emit RateChanged(_msgSender(), _ggtBusdRate);
    }

    function _getTokenAmount(uint256 weiAmount) internal view returns (uint256) {
        uint256 bnbbusd = _binanceOracle.getPrice();

        // We check allowlist here as we need to use 
        // the same price for check and token amount calcualtion
        _checkTokens(_msgSender(), weiAmount, bnbbusd);

        return weiAmount.mul(bnbbusd).mul(_bonusCoeffPercent).div(ONE_HUNDRED_PERCENT)
            .div(_ggtBusdRate).div(BNBBUSD_DECIMALS);
    }
}
