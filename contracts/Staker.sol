// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./CompletionContract.sol";
import "./ReceiverStruct.sol";

/** @title Staker */
contract Staker is Ownable {
    enum StakingStatus {
        OPEN,
        CLOSED,
        COMPLETED,
        AWARDED
    }

    StakingStatus public status;

    event Staked(address indexed _from, uint256 _value);
    event Withdraw(address indexed _from, uint256 _value);
    event StakingCompleted(uint256 _amountStaked);
    event Awarded(address _to, uint256 _value);

    // to keep track of the amount each user staked
    mapping(address => uint256) public stakedBalances;

    // array of users who have staked
    address[] public stakers;

    // quickly lookup if a user has staked before
    mapping(address => bool) private _userHasStaked;

    // minimum required amount for staking to be complete
    uint256 private constant _threshold = 1 ether;

    // the contract to send ethereum to when threshold has been reached
    CompletionContract public completionContract;

    address payable private _completionContractAddress;

    constructor() {
        completionContract = new CompletionContract();
        _completionContractAddress = payable(address(completionContract));
        status = StakingStatus.OPEN;
    }

    modifier onlyWhenOpen() {
        require(status == StakingStatus.OPEN, "staking is currently not open");
        _;
    }

    modifier onlyWhenCompleted() {
        require(
            status == StakingStatus.COMPLETED,
            "staking is currently not complete"
        );
        _;
    }

    receive() external payable {
        _stake();
    }

    fallback() external payable {
        _stake();
    }

    function stake() public payable {
        _stake();
    }

    function _stake() private onlyWhenOpen {
        if (_userHasStaked[msg.sender] == false) {
            stakers.push(msg.sender);
            _userHasStaked[msg.sender] = true;
        }

        stakedBalances[msg.sender] += msg.value;

        emit Staked(msg.sender, msg.value);
    }

    function getTotalStakedAmount() public view returns (uint256) {
        uint256 totalAmount = 0;
        for (uint256 i = 0; i < stakers.length; i++) {
            totalAmount += stakedBalances[stakers[i]];
        }
        return totalAmount;
    }

    function withdraw() public {
        require(
            status == StakingStatus.CLOSED,
            "staking is currently not closed. cannot withdraw"
        );

        uint256 stakedAmount = stakedBalances[msg.sender];

        require(
            stakedAmount >= address(this).balance,
            "insufficient balance! cannot issue withdrawal!"
        );
        require(
            stakedAmount > 0,
            "cannot withdraw, you have not staked any amount"
        );

        (bool success, ) = address(msg.sender).call{value: stakedAmount}("");
        require(success, "unable to complete withdrawal");

        stakedBalances[msg.sender] = 0;

        emit Withdraw(msg.sender, stakedAmount);
    }

    function closeStaking() public onlyOwner {
        status = StakingStatus.CLOSED;
    }

    function completeStaking() public onlyOwner {
        uint256 balance = address(this).balance;
        require(
            balance >= _threshold,
            "staked amount has not reached threshold"
        );
        _transfer(_completionContractAddress, balance);

        for (uint256 i = 0; i < stakers.length; i++) {
            // delete stakedBalances[stakers[i]];
            stakedBalances[stakers[i]] = 0;
            _userHasStaked[stakers[i]] = false;
        }

        stakers = new address[](0);
        status = StakingStatus.COMPLETED;

        emit StakingCompleted(balance);
    }

    function _transfer(address payable _to, uint256 _amount) private {
        (bool success, ) = _to.call{value: _amount}("");
        require(success, "failed to send Ether");
    }

    function getStatus() public view returns (uint8) {
        return uint8(status);
    }

    function getNumberOfStakers() public view returns (uint256) {
        return stakers.length;
    }

    function getUserStakedAmount(address _user) public view returns (uint256) {
        return stakedBalances[_user];
    }

    function awardStakedBalance(address payable _to)
        public
        onlyOwner
        onlyWhenCompleted
    {
        uint256 balance = address(completionContract).balance;
        completionContract.transferStakedBalance(_to);
        status = StakingStatus.AWARDED;

        emit Awarded(_to, balance);
    }

    function restartStaking() public onlyOwner {
        require(
            status == StakingStatus.AWARDED || status == StakingStatus.CLOSED,
            "staking must have been awarded or is closed"
        );
        status = StakingStatus.OPEN;
    }

    function getPastReceivers() public view returns (Receiver[] memory) {
        return completionContract.getPastReceivers();
    }

    function getLastReciver() public view returns (Receiver memory) {
        return completionContract.getLastReciver();
    }
}
