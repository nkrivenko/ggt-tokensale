pragma solidity 0.5.17;

import "@openzeppelin/contracts/crowdsale/Crowdsale.sol";


contract IndividualTokenCapCrowdsale is Crowdsale {

    mapping(address => uint256) private _contributions;
    uint256 private _presaleTokenCap;

    constructor(uint256 presaleTokenCap) public {
        _presaleTokenCap = presaleTokenCap;
    }

    function presaleTokenCap() public view returns (uint256) {
        return _presaleTokenCap;
    }

    function tokensRemaining(address beneficiary) public view returns (uint256) {
        return _presaleTokenCap.sub(_contributions[beneficiary]);
    }

    function _processPurchase(address beneficiary, uint256 tokenAmount) internal {
        uint256 newTokenAmount = _contributions[beneficiary].add(tokenAmount);
        require(newTokenAmount <= _presaleTokenCap, "IndividualTokenCapCrowdsale: step token cap exceeded");

        _contributions[beneficiary] = _contributions[beneficiary].add(tokenAmount);
        super._processPurchase(beneficiary, tokenAmount);
    }
}
