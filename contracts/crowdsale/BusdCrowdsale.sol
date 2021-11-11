pragma solidity 0.5.17;

import "@openzeppelin/contracts/crowdsale/Crowdsale.sol";
import "../price/BinanceOracle.sol";


contract BusdCrowdsale is Crowdsale {

    uint256 internal constant BUSD_DECIMALS = 1 ether;

    /**
     * @dev Validates purchase using the busd rate
     */
    // solhint-disable-next-line
    function _validateBusdPurchase(address beneficiary, uint256 weiAmount, uint256 busdRate) internal view {
    }

    function _getBusdFromBnb(uint256 weiAmount, uint256 bnbbusdRate) internal pure returns(uint256) {
        return weiAmount.mul(bnbbusdRate).div(BUSD_DECIMALS);
    }
}
