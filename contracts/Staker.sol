// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./BFYToken.sol";

/** @title Staker */
contract Staker is Ownable {
    enum StakingStatus {
        OPEN,
        CLOSED,
        COMPLETED,
        TERMINATED
    }

    StakingStatus public status;

    // emitted when a user has staked ETH
    event Staked(address indexed _from, uint256 _value);

    // emitted wehen a user withdraws ETH
    event Withdraw(address indexed _from, uint256 _value);

    // emitted when owner 'completes' staking
    // only done when threshold has been reached
    event StakingCompleted(uint256 _amountStaked);

    // to keep track of the amount each user staked
    mapping(address => uint256) public stakedBalances;

    // array of users who have staked
    address[] public stakers;

    // quickly lookup if a user has staked before
    mapping(address => bool) private _userHasStaked;

    // minimum required amount for staking to be complete
    uint256 private constant _threshold = 1 ether;

    // the token to award stakers
    BFYToken private _bfyToken;

    constructor() {
        _bfyToken = new BFYToken();
        status = StakingStatus.OPEN;
    }

    modifier onlyWhenOpen() {
        require(status == StakingStatus.OPEN, "staking is currently not open");
        _;
    }

    modifier onlyWhenComplete() {
        require(
            status == StakingStatus.COMPLETED,
            "staking is currently not complete"
        );
        _;
    }

    modifier whenNotOpen() {
        require(status != StakingStatus.OPEN, "staking must not be open");
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
        uint256 balance = getTotalStakedAmount();

        // check if threshold has been reached
        require(
            balance >= _threshold,
            "staked amount has not reached threshold"
        );

        // award BFYTokens as reward and
        // reset staked balances to zero
        for (uint256 i = 0; i < stakers.length; i++) {
            uint256 amount = _getTokenNumToAward(stakedBalances[stakers[i]]);
            _bfyToken.transfer(stakers[i], amount);

            stakedBalances[stakers[i]] = 0;
            _userHasStaked[stakers[i]] = false;
        }

        // clear stakers and mark staking status as complete
        stakers = new address[](0);
        status = StakingStatus.COMPLETED;

        emit StakingCompleted(balance);
    }

    // TODO: make this function private during deployment
    function _getTokenNumToAward(uint256 _amount)
        public
        pure
        returns (uint256)
    {
        uint256 amount = 1000 * _amount;
        return amount;
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

    function restartStaking() public onlyOwner whenNotOpen {
        status = StakingStatus.OPEN;
    }

    function redeemStakedAmount() external onlyOwner onlyWhenComplete {
        address payable owner = payable(owner());
        _transfer(owner, address(this).balance);
    }

    function _transfer(address payable _to, uint256 _amount) private {
        (bool success, ) = _to.call{value: _amount}("");
        require(success, "failed to send Ether");
    }

    function terminateContract() external onlyOwner {
        _bfyToken.transferOwnership(owner());
        status = StakingStatus.TERMINATED;
    }

    function tokenBalanceOf(address _account) public view returns (uint256) {
        return _bfyToken.balanceOf(_account);
    }
}
