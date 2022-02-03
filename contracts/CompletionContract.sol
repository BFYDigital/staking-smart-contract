// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./ReceiverStruct.sol";

contract CompletionContract is Ownable {
    // event Transferred(address _receiver, uint256 _amount);

    Receiver[] public pastReceivers;

    constructor() payable {}

    receive() external payable {}

    fallback() external payable {}

    function transferStakedBalance(address payable _receiver) public onlyOwner {
        uint256 balance = address(this).balance;
        _transfer(_receiver, balance);
        pastReceivers.push(Receiver(_receiver, balance));

        // emit Transferred(_receiver, balance);
    }

    function _transfer(address payable _to, uint256 _amount) private {
        (bool success, ) = _to.call{value: _amount}("");
        require(success, "failed to send Ether");
    }

    function getPastReceivers() public view returns (Receiver[] memory) {
        return pastReceivers;
    }

    function getLastReciver() public view returns (Receiver memory) {
        return pastReceivers[pastReceivers.length - 1];
    }
}
