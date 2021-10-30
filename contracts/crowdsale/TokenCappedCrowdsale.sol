// SPDX-License-Identifier: MIT
pragma solidity 0.5.17;

import "@openzeppelin/contracts/crowdsale/emission/MintedCrowdsale.sol";


/**
 * @title TokenCappedCrowdsale
 * @dev Crowdsale with a limit for tokens minted.
 */
contract TokenCappedCrowdsale is MintedCrowdsale {

    uint256 private _tokenCap;
    uint256 private _tokensMinted;

    /**
     * @dev Constructor, takes maximum amount of tokens (in smallest divisible units) accepted in the crowdsale.
     * Also, initializes the _tokensMinted field.
     *
     * @param tokenCap_ Max amount of tokens (in smallest divisible units) to be contributed
     */
    constructor (uint256 tokenCap_) public {
        require(tokenCap_ > 0, "TokenCappedCrowdsale: Token cap is 0");

        _tokenCap = tokenCap_;
        _tokensMinted = 0;
    }

    /**
     * @return Maximum amount of tokens (in smallest divisible units) accepted in the crowdsale.
     */
    function tokenCap() public view returns(uint256) {
        return _tokenCap;
    }

    /**
     * @return Amount of tokens (in smallest divisible units) already accepted.
     */
    function tokensMinted() public view returns(uint256) {
        return _tokensMinted;
    }

    /**
     * @dev We put the token cap check here as we also need to modify the state of contract
     * and _preValidatePurchase is a view function.
     */
    function _processPurchase(address beneficiary, uint256 tokenAmount) internal {
        require(_tokensMinted.add(tokenAmount) <= _tokenCap, "TokenCappedCrowdsale: token cap exceeded");
        super._processPurchase(beneficiary, tokenAmount);

        _tokensMinted += tokenAmount;
    }
}
