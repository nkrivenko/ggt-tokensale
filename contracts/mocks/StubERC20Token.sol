pragma solidity 0.5.17;

import "@openzeppelin/contracts/token/ERC20/ERC20Detailed.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20Mintable.sol";


/* solhint-disable no-empty-blocks */
contract StubERC20Token is ERC20Detailed, ERC20Mintable {
    uint8 internal constant DECIMALS = 18;

    constructor () public ERC20Detailed("GGT", "Godji Game Token", DECIMALS) {
        
    }
}
