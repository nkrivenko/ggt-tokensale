// SPDX-License-Identifier: MIT
pragma solidity 0.5.17;

import "@openzeppelin/contracts/crowdsale/Crowdsale.sol";


/**
 * @title OpeningTimeCrowdsale
 * @dev Crowdsale with the certain start date.
 */
contract OpeningTimeCrowdsale is Crowdsale {

    uint256 private _startDateTimestamp;

    /**
     * @dev Constructor, takes UNIX timestamp (seconds) of start date.
     */
    constructor(uint256 startDateTimestamp_) public {
        _startDateTimestamp = startDateTimestamp_;
    }

    /**
     * @return If current time is after the start date.
     */
    function opened() public view returns (bool) {
        return _startDateTimestamp <= block.timestamp;
    }

    function _preValidatePurchase(address beneficiary, uint256 weiAmount) internal view {
        require(opened(), "OpeningTimeCrowdsale: opening time hasn't come");
        super._preValidatePurchase(beneficiary, weiAmount);
    }
}
