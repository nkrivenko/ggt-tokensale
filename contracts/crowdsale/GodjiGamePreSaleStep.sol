// SPDX-License-Identifier: MIT
pragma solidity 0.5.17;

import "@openzeppelin/contracts/crowdsale/emission/MintedCrowdsale.sol";
import "@openzeppelin/contracts/ownership/Ownable.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "./OnlyOwnerPausableCrowdsale.sol";
import "./OpeningTimeCrowdsale.sol";
import "./BusdThresholdAllowlistCrowdsale.sol";
import "./BusdCappedCrowdsale.sol";
import "../price/BinanceOracle.sol";
import "../token/GGTToken.sol";


contract GodjiGamePreSaleStep is Ownable, OnlyOwnerPausableCrowdsale, MintedCrowdsale,
    OpeningTimeCrowdsale, BusdThresholdAllowlistCrowdsale, BusdCappedCrowdsale {

    using SafeMath for uint256;

    uint256 private constant BNBBUSD_DECIMALS = 10 ** 18;

    BinanceOracle private _binanceOracle;

    uint256 private _ggtBusdRate;

    event RateChanged(address indexed changer, uint256 newRate);

    constructor(uint256 rate, address payable wallet, ERC20Mintable token, address owner_, BinanceOracle binanceOracle,
        uint256 startTimeUnix, uint256 cap_, uint256 busdThreshold_) public 
        OnlyOwnerPausableCrowdsale(owner_) OpeningTimeCrowdsale(startTimeUnix) 
        BusdThresholdAllowlistCrowdsale(busdThreshold_, owner_)
        BusdCappedCrowdsale(cap_, binanceOracle) Crowdsale(rate, wallet, token) {

        _binanceOracle = binanceOracle;
        _ggtBusdRate = rate;

        _transferOwnership(owner_);
    }

    function rate() public view returns (uint256) {
        return _ggtBusdRate;
    }

    function setRate(uint256 ggtBusdRate_) public onlyOwner {
        require(ggtBusdRate_ > 0, "GodjiGamePreSaleStep: GGT.BUSD is 0");

        _ggtBusdRate = ggtBusdRate_;

        emit RateChanged(_msgSender(), _ggtBusdRate);
    }

    function finalizeCrowdsale() public onlyOwner {
        require(capReached(), "GodjiGamePreSaleStep: hardcaps are not reached");

        GGTToken(address(token())).renounceMinter();
    }

    function _checkTokens(address beneficiary, uint256 weiAmount, uint256 bnbbusdRate) internal view {
        require(isWhitelisted(beneficiary), "BusdThresholdAllowlistCrowdsale: address is not allowlisted");

        uint256 weiAmountInBusd = _getBusdFromBnb(weiAmount, bnbbusdRate);

        uint256 remaining = cap() - _getBusdFromBnb(weiRaised().add(weiAmount), bnbbusdRate);
        uint256 threshold = busdThreshold();

        require(remaining < threshold || threshold <= weiAmountInBusd, 
            "GodjiGamePreSaleStep: payment is below threshold");
    }

    function _getTokenAmount(uint256 weiAmount) internal view returns (uint256) {
        uint256 bnbbusd = _binanceOracle.getPrice();

        // We check allowlist here as we need to use 
        // the same price for check and token amount calcualtion
        _checkBusdCap(_msgSender(), weiAmount, bnbbusd);
        _checkTokens(_msgSender(), weiAmount, bnbbusd);

        return _getBusdFromBnb(weiAmount, bnbbusd).div(_ggtBusdRate);
    }

    function _getBusdFromBnb(uint256 weiAmount, uint256 bnbbusdRate) private pure returns(uint256) {
        return weiAmount.mul(bnbbusdRate).div(BNBBUSD_DECIMALS);
    }
}
