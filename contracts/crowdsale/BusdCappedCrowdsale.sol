pragma solidity 0.5.17;

import "@openzeppelin/contracts/math/SafeMath.sol";
import "../price/BinanceOracle.sol";
import "./BusdCrowdsale.sol";


contract BusdCappedCrowdsale is BusdCrowdsale {
    using SafeMath for uint256;

    BinanceOracle private _oracle;
    uint256 private _busdCap;

    uint256 private _acceptableDelta;

    constructor (uint256 busdCap, BinanceOracle oracle, uint256 acceptableDelta) internal {
        require(busdCap > 0, "BusdCappedCrowdsale: cap is 0");

        _oracle = oracle;
        _busdCap = busdCap;
        _acceptableDelta = acceptableDelta;
    }

    function capReached() public view returns (bool) {
        uint256 currentPrice = _oracle.getPrice();

        uint256 busdRaised = weiRaised().mul(currentPrice).div(BUSD_DECIMALS);

        return busdRaised >= _busdCap;
    }

    function busdRemaining() public view returns (uint256) {
        uint256 currentPrice = _oracle.getPrice();

        uint256 busdRaised = weiRaised().mul(currentPrice).div(BUSD_DECIMALS);

        return _busdCap >= busdRaised ? _busdCap.sub(busdRaised) : 0;
    }

    function acceptableDelta() public view returns (uint256) {
        return _acceptableDelta;
    }

    function cap() public view returns (uint256) {
        return _busdCap;
    }

    function capWithAcceptableDelta() public view returns (uint256) {
        return _busdCap.add(_acceptableDelta);
    }

    function oracle() public view returns (BinanceOracle) {
        return _oracle;
    }

    function _validateBusdPurchase(address beneficiary, uint256 weiAmount, uint256 busdRate) internal view {
        super._validateBusdPurchase(beneficiary, weiAmount, busdRate);
        
        uint256 newBusdAmount = weiRaised().add(weiAmount).mul(busdRate).div(BUSD_DECIMALS);
        require(newBusdAmount <= _busdCap.add(_acceptableDelta), "BusdCappedCrowdsale: cap exceeded");
    }
}
