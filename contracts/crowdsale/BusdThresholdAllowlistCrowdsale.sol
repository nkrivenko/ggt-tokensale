pragma solidity 0.5.17;

import "@openzeppelin/contracts/access/roles/WhitelistedRole.sol";
import "@openzeppelin/contracts/crowdsale/Crowdsale.sol";
import "../price/BinanceOracle.sol";


/**
 * @title BnbThresholdAllowlistCrowdsale.
 * @dev Crowdsale where only allowlisted users can deposit BNBs more than threshold
 */
contract BusdThresholdAllowlistCrowdsale is WhitelistedRole, Crowdsale {

    uint256 private _bnbThreshold;

    constructor (uint256 bnbThreshold_, address owner) internal {
        require(bnbThreshold_ > 0, "BusdThresholdAllowlistCrowdsale: bnbThreshold is 0");
        require(owner != address(0), "BusdThresholdAllowlistCrowdsale: owner is 0");

        _bnbThreshold = bnbThreshold_;

        _addWhitelistAdmin(owner);
        _removeWhitelistAdmin(_msgSender());
    }

    function bnbThreshold() public view returns (uint256) {
        return _bnbThreshold;
    }

    function _checkTokens(address beneficiary, uint256 weiAmount, uint256 bnbbusdRate) internal view {
        uint256 busd = weiAmount.mul(bnbbusdRate).div(10 ** 18);

        if (busd >= _bnbThreshold) {
            require(isWhitelisted(beneficiary), "BusdThresholdAllowlistCrowdsale: address is not allowlisted");
        }
    }
}
