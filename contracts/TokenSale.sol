pragma solidity ^0.5.0;

import "./RomansToken.sol";


contract TokenSale {

    address payable owner;
    RomansToken public tokenContract;
    uint256 public tokenPrice;
    uint256 public tokensSold;

    event Sell (
        address _buyer,
        uint256 _amount
    );

    constructor (RomansToken _tokenContract, uint256 _tokenPrice) public {
        owner = msg.sender;
        tokenPrice = _tokenPrice;
        tokenContract = _tokenContract;
    }

    function multiply(uint x, uint y) internal pure returns (uint z) {
        require(y == 0 || (z = x * y) / y == x, "number is too big!");
    }

    function buyTokens (uint256 _amount) public payable {
        require(tokenContract.balanceOf(address(this)) >= _amount, 'The contract does not have enough tokens!');
        require(msg.value == multiply(_amount, tokenPrice), 'The amount of ether transferred should match exactly following condition: the number of tokens * price of the token');
        require(tokenContract.transfer(msg.sender, _amount), 'Transaction was not successfull'); 
        tokensSold += _amount;
        emit Sell(msg.sender, _amount);       
    }

    function endSale() public {
        require(msg.sender == owner, 'You are not allowed to perform this operation!');
        require(tokenContract.transfer(owner, tokenContract.balanceOf(address(this))), 'Unable to end the sale!');
        selfdestruct(owner);
    }

}