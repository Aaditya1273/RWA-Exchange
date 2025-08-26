// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Fraction is ERC20 {
    address public minter;

    modifier onlyMinter() {
        require(msg.sender == minter, "Only minter can call this function");
        _;
    }

    constructor(string memory name, string memory symbol, address _minter)
        ERC20(name, symbol)
    {
        minter = _minter;
    }

    function mint(address to, uint256 amount) public onlyMinter {
        _mint(to, amount);
    }

    function burn(uint256 amount) public onlyMinter {
        _burn(address(this), amount);
    }
}
