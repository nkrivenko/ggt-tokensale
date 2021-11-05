pragma solidity 0.5.17;
pragma experimental ABIEncoderV2;


interface IStdReference {
    struct ReferenceData {
        uint256 rate;
        uint256 lastUpdatedBase;
        uint256 lastUpdatedQuote;
    }

    function getReferenceData(string calldata _base, string calldata _quote)
        external
        view
        returns (ReferenceData memory);

    function getReferenceDataBulk(string[] calldata _bases, string[] calldata _quotes)
        external
        view
        returns (ReferenceData[] memory);
}


contract BinanceOracle {

    IStdReference private ref;

    constructor(IStdReference _ref) public {
        ref = _ref;
    }

    function getPrice() external view returns (uint256) {
        IStdReference.ReferenceData memory data = ref.getReferenceData("BNB", "BUSD");
        return data.rate;
    }
}
