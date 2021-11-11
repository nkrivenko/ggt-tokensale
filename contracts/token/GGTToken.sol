// SPDX-License-Identifier: MIT
pragma solidity 0.5.17;

import "@openzeppelin/contracts/token/ERC20/ERC20Detailed.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20Capped.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20Mintable.sol";
import "@openzeppelin/contracts/ownership/Ownable.sol";


contract GGTToken is ERC20Detailed, ERC20Mintable, ERC20Capped, Ownable {

    uint8 private constant DECIMALS = 18;

    bool private _mintingFinished = false;

    constructor(string memory name, string memory symbol, uint256 cap_) public
        ERC20Detailed(name, symbol, DECIMALS) ERC20Capped(cap_) ERC20Mintable() {
    }

    modifier onlyMinterOrOwner() {
        address sender = msg.sender;
        address owner = owner();
        require(sender == owner || isMinter(sender), "GGTToken: only MINTER or owner can call this method");
        _;
    }

    /**
     * @dev This function created for compatibility with BEP20 token
     */
    function getOwner() external view returns (address) {
        return owner();
    }

    function mint(address account, uint256 amount) public onlyMinterOrOwner returns (bool) {
        require(!_mintingFinished, "GGTToken: minting finished");

        _mint(account, amount);
        return true;
    }

    function addMinter(address account) public onlyOwner {
        require(!isMinter(account), "GGTToken: Specified address is already a minter");
        _addMinter(account);
    }

    function removeMinter(address account) public onlyOwner {
        require(isMinter(account), "GGTToken: Specified address is not a minter");

        _removeMinter(account);
    }

    function renounceMinter() public {
        super.renounceMinter();
    }

    function finishMinting() public onlyMinterOrOwner {
        require(!_mintingFinished, "GGTToken: minting finished");
        _mintingFinished = true;
    }
}
