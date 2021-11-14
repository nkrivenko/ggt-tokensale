pragma solidity 0.5.17;

import "@openzeppelin/contracts/crowdsale/emission/MintedCrowdsale.sol";
import "../crowdsale/IndividualTokenCapCrowdsale.sol";


contract IndividualTokenCapCrowdsaleImpl is IndividualTokenCapCrowdsale, MintedCrowdsale {

    /* solhint-disable no-empty-blocks */
    constructor (uint256 rate, address payable wallet, ERC20Mintable token, uint256 tokenCap) public
        IndividualTokenCapCrowdsale(tokenCap) Crowdsale(rate, wallet, token) {
        
    }

}
