pragma solidity 0.5.17;

import "@openzeppelin/contracts/access/roles/WhitelistedRole.sol";
import "@openzeppelin/contracts/crowdsale/Crowdsale.sol";
import "../price/BinanceOracle.sol";


/**
 * @title BnbThresholdAllowlistCrowdsale.
 * @dev Crowdsale where only allowlisted users can deposit BNBs more than threshold
 */
contract BusdThresholdAllowlistCrowdsale is WhitelistedRole, Crowdsale {

    uint256 private constant BUSD_DECIMALS = 10 ** 18;
    uint256 private _busdThreshold;

    constructor (uint256 busdThreshold_, address owner) internal {
        require(busdThreshold_ > 0, "BusdThresholdAllowlistCrowdsale: bnbThreshold is 0");
        require(owner != address(0), "BusdThresholdAllowlistCrowdsale: owner is 0");

        _busdThreshold = busdThreshold_;

        address sender = _msgSender();
        if (sender != owner) {
            _addWhitelistAdmin(owner);
            _removeWhitelistAdmin(sender);
        }
    }

    function busdThreshold() public view returns (uint256) {
        return _busdThreshold;
    }

    function _checkTokens(address beneficiary, uint256 weiAmount, uint256 bnbbusdRate) internal view {
        uint256 busd = weiAmount.mul(bnbbusdRate).div(BUSD_DECIMALS);

        if (busd >= _busdThreshold) {
            require(isWhitelisted(beneficiary), "BusdThresholdAllowlistCrowdsale: address is not allowlisted");
        }
    }
}
