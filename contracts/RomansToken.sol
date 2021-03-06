pragma solidity ^0.5.0;

import "./IERC20.sol";

contract RomansToken{ 
    
    uint256 public totalSupply;
    mapping(address => uint256) public balanceOf;
    string public name = "RomanCoin";
    string public symbol = "RSP";
    mapping (address => mapping(address => uint256)) public allowance;
 
    event Transfer(
        address indexed _from,
        address indexed _to,
        uint256 _value
    );

    event Approval(
        address indexed _owner, 
        address indexed _spender,
        uint256 _value
     );

    constructor (uint256 _initialSupply) public {
        totalSupply = _initialSupply; 
        balanceOf[msg.sender] = _initialSupply;
    }

    function approve(address _spender, uint256 _value) external returns (bool){
        allowance[msg.sender][_spender] = _value;
        emit Approval(msg.sender, _spender, _value);
        return true;
    }

    function transferFrom(address _from, address _to, uint256 _value) external returns (bool){
        require(_value <= balanceOf[_from]);
        require(_value <= allowance[_from][msg.sender]);
        balanceOf[_from] -= _value;
        balanceOf[_to] += _value;
        allowance[_from][msg.sender] -= _value;
        emit Transfer(_from, _to, _value);
        return true;
    }

    function transfer(address _to, uint256 _value) external returns (bool success){
        require(balanceOf[msg.sender] >= _value, "You don't have enough coins to transfer!");
        balanceOf[msg.sender] -= _value;
        balanceOf[_to] += _value;
        emit Transfer(msg.sender, _to, _value);
        return true;
    }


}