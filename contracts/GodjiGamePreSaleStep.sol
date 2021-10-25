// SPDX-License-Identifier: MIT
pragma solidity 0.5.17;

import "@openzeppelin/contracts/ownership/Ownable.sol";
import "./OnlyOwnerPausableCrowdsale.sol";
import "./price/BinanceOracle.sol";


contract GodjiGamePreSaleStep is Ownable, OnlyOwnerPausableCrowdsale {

    BinanceOracle private _binanceOracle;

    constructor(uint256 rate, address payable wallet, IERC20 token, address owner_, BinanceOracle binanceOracle)
        OnlyOwnerPausableCrowdsale(owner_)
        Crowdsale(rate, wallet, token) public {
        
        _binanceOracle = binanceOracle;
        _transferOwnership(owner_);
    }
}
