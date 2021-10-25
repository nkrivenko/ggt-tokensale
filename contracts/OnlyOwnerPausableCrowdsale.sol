// SPDX-License-Identifier: MIT
pragma solidity 0.5.17;

import "@openzeppelin/contracts/crowdsale/validation/PausableCrowdsale.sol";


contract OnlyOwnerPausableCrowdsale is PausableCrowdsale {
    constructor (address owner_) internal {
        _addPauser(owner_);
        _removePauser(_msgSender());
    }

    function addPauser(address account) public onlyPauser {
        revert("OnlyOwnerPausableCrowdsale: addPauser is not available");
    }

    function renouncePauser() public {
        revert("OnlyOwnerPausableCrowdsale: renouncePauser is not available");
    }
}
