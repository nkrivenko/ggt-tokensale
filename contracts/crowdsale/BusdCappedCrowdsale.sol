pragma solidity 0.5.17;

import "@openzeppelin/contracts/crowdsale/validation/CappedCrowdsale.sol";
import "../price/BinanceOracle.sol";


contract BusdCappedCrowdsale is Crowdsale {
    using SafeMath for uint256;

    uint256 private constant BNBBUSD_DECIMAL = 1 ether;

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

        uint256 busdRaised = weiRaised().mul(currentPrice).div(BNBBUSD_DECIMAL);

        return busdRaised >= _busdCap;
    }

    function busdRemaining() public view returns (uint256) {
        uint256 currentPrice = _oracle.getPrice();

        uint256 busdRaised = weiRaised().mul(currentPrice).div(BNBBUSD_DECIMAL);

        return _busdCap < busdRaised ? _busdCap.sub(busdRaised) : 0;
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

    //solhint-disable-next-line
    function _checkBusdCap(address beneficiary, uint256 weiAmount, uint256 busdRate) internal view {
        uint256 newBusdAmount = weiRaised().add(weiAmount).mul(busdRate).div(BNBBUSD_DECIMAL);
        require(newBusdAmount <= _busdCap.add(_acceptableDelta), "BusdCappedCrowdsale: cap exceeded");
    }
}
