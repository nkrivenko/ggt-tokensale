pragma solidity 0.5.17;

import "@openzeppelin/contracts/crowdsale/validation/CappedCrowdsale.sol";
import "../price/BinanceOracle.sol";


contract BusdCappedCrowdsale is Crowdsale {
    using SafeMath for uint256;

    uint256 private constant BNBBUSD_DECIMAL = 1 ether;

    BinanceOracle private _oracle;
    uint256 private _busdCap;

    constructor (uint256 busdCap, BinanceOracle oracle) internal {
        require(busdCap > 0, "BusdCappedCrowdsale, cap is 0");

        _oracle = oracle;
        _busdCap = busdCap;
    }

    function capReached() public view returns (bool) {
        uint256 currentPrice = _oracle.getPrice();

        uint256 busdRaised = weiRaised().mul(currentPrice).div(BNBBUSD_DECIMAL);

        return busdRaised >= _busdCap;
    }

    function cap() public view returns (uint256) {
        return _busdCap;
    }

    function oracle() public view returns (BinanceOracle) {
        return _oracle;
    }

    //solhint-disable-next-line
    function _checkBusdCap(address beneficiary, uint256 weiAmount, uint256 busdRate) internal view {
        uint256 newBusdAmount = weiRaised().add(weiAmount).mul(busdRate).div(BNBBUSD_DECIMAL);
        require(newBusdAmount <= _busdCap, "BusdCappedCrowdsale: cap exceeded");
    }
}
