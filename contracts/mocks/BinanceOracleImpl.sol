pragma solidity 0.5.17;
pragma experimental ABIEncoderV2;

import "../price/BinanceOracle.sol";


contract BinanceOracleImpl is BinanceOracle {

    uint256 private rate;

    constructor(uint256 rate_) public BinanceOracle(IStdReference(0)) {
        rate = rate_;
    }

    function getPrice() external view returns (uint256) {
        return rate;
    }
}
