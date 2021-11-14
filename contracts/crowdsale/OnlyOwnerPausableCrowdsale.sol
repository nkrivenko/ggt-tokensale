// SPDX-License-Identifier: MIT
pragma solidity 0.5.17;

import "@openzeppelin/contracts/crowdsale/validation/PausableCrowdsale.sol";


contract OnlyOwnerPausableCrowdsale is PausableCrowdsale {
    constructor () internal {
        // _addPauser(_msgSender());
    }

    // solhint-disable-next-line
    function addPauser(address unused) public onlyPauser {
        revert("OnlyOwnerPausableCrowdsale: addPauser is not available");
    }

    function renouncePauser() public {
        revert("OnlyOwnerPausableCrowdsale: renouncePauser is not available");
    }
}
