// SPDX-License-Identifier: MIT
pragma solidity 0.5.17;

import "@openzeppelin/contracts/token/ERC20/ERC20Detailed.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20Capped.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20Mintable.sol";


contract GGTToken is ERC20Detailed, ERC20Mintable, ERC20Capped {

    uint8 private constant DECIMALS = 18;

    address private _owner;

    constructor(string memory name, string memory symbol, uint256 cap, address owner_) public
        ERC20Detailed(name, symbol, DECIMALS) ERC20Capped(cap) {
        _owner = owner_;
    }

    modifier onlyOwner() {
        require(_msgSender() == _owner, "GGTToken: caller is not the owner");
        _;
    }

    modifier onlyMinterOrOwner() {
        address sender = msg.sender;
        require(sender == _owner || isMinter(sender), "GGTToken: only MINTER or owner can call this method");
        _;
    }

    function getOwner() external view returns (address) {
        return _owner;
    }

    function mint(address account, uint256 amount) public onlyMinterOrOwner returns (bool) {
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

    event Debug(address indexed sender, bool isMinter);

    function renounceMinter() public {
        super.renounceMinter();
    }
}
