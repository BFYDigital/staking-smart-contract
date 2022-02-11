const { assert } = require("chai");
const BFYToken = artifacts.require("BFYToken");
const Staker = artifacts.require("Staker");

contract("Staker", function (accounts) {

  const Exception = require('../lib/exceptions');
  let staker;

  beforeEach(async () => {
    bfyToken = await BFYToken.new();
    staker = await Staker.new(bfyToken.address);
  });

  it("should allow user to skate when status is open", async () => {
    // arrange
    let amount = web3.utils.toWei('0.5', 'ether');
    let expected = web3.utils.toBN(amount);

    // act
    await staker.stake({ from: accounts[0], value: amount });
    let actual = await staker.getTotalStakedAmount.call({ from: accounts[0] });
    let actualStakersNo = await staker.getNumberOfStakers.call({ from: accounts[0] });

    // assert
    assert.isTrue(actual.eq(expected), "actual and expected staked values do not match");
    assert.isTrue(actualStakersNo.eq(web3.utils.toBN(1)), "actual number of stakers does not match the expected '1'")
  });

  it("should not allow users to stake when status is not open", async () => {
    // arrange
    let amount = web3.utils.toWei('0.5', 'ether');

    // act + assert
    await staker.closeStaking({ from: accounts[0] });
    await Exception.tryCatch(
      staker.stake({ from: accounts[0], value: amount }), Exception.errTypes.stakingNotOpen);
  });

  it("should allow only the owner to close staking", async () => {
    // act
    await staker.closeStaking({ from: accounts[0] });
    let actual = await staker.getStatus.call({ from: accounts[0] });

    // assert
    assert.isTrue(actual.eq(web3.utils.toBN(1))); // 1 - closed
  });

  it("should not allow any other user to close staking", async () => {
    // act + assert
    await Exception.tryCatch(
      staker.closeStaking({ from: accounts[1] }), Exception.errTypes.nonOwnerCall);
  });

  it("should get total staked amount", async () => {
    // arrange
    let amount = web3.utils.toWei('0.2', 'ether');

    // act
    let firstStakedAmount = await staker.getTotalStakedAmount.call({ from: accounts[0] });
    await staker.stake({ from: accounts[0], value: amount });
    let secondStakedAmount = await staker.getTotalStakedAmount.call({ from: accounts[1] });

    // assert
    assert.isTrue(firstStakedAmount.eq(web3.utils.toBN(0)));
    assert.isTrue(secondStakedAmount.eq(web3.utils.toBN(amount)));
  });

  it("should refund users on withdrawals when staking is closed", async () => {
    // arrange
    let amount = web3.utils.toWei('1', 'ether');

    // act
    await staker.stake({ from: accounts[0], value: amount });
    let startingBalance = web3.utils.toBN(await web3.eth.getBalance(accounts[0]));

    await staker.closeStaking({ from: accounts[0] });
    await staker.withdraw({ from: accounts[0] });
    let endBalance = web3.utils.toBN(await web3.eth.getBalance(accounts[0]));

    // assert
    assert.isTrue(endBalance.gt(startingBalance));
  });

  it("should not allow withdrawals before staking is closed", async () => {
    // arrange    
    let amount = web3.utils.toWei('0.5', 'ether');

    // act + assert
    await staker.stake({ from: accounts[0], value: amount });
    await Exception.tryCatch(
      staker.withdraw({ from: accounts[0] }), Exception.errTypes.stakingNotClosed);
  });

  it("should throw error if withdrawing with no staked amount", async () => {
    // act + assert
    await staker.closeStaking({ from: accounts[0] });
    await Exception.tryCatch(
      staker.withdraw({ from: accounts[0] }), Exception.errTypes.noStake);
  });

  it("should allow completion of staking if threshold is reached", async () => {
    // arrange
    let amount = web3.utils.toWei('2', 'ether');

    // act
    await staker.stake({ from: accounts[0], value: amount });
    await staker.completeStaking({ from: accounts[0] });
    let actual = await staker.getStatus.call({ from: accounts[0] });
    let noOfStakers = await staker.getNumberOfStakers.call({ from: accounts[0] });
    let amountStaked = await staker.getTotalStakedAmount.call({ from: accounts[0] });

    // assert
    assert.equal(actual, 2); // 2 - COMPLETED
    assert.equal(noOfStakers, 0);
    assert.equal(amountStaked, 0);
  });

  it("should not allow completion of staking if threshold is not reached", async () => {
    // arrange
    let amount = web3.utils.toWei('0.3', 'ether');

    // act
    await staker.stake({ from: accounts[0], value: amount });

    // assert
    await Exception.tryCatch(
      staker.completeStaking({ from: accounts[0] }), Exception.errTypes.stakingThresholdNotReached);
  });

  it("should allow only the owner to complete staking", async () => {
    // arrange
    let amount = web3.utils.toWei('0.3', 'ether');

    // act + assert
    await staker.stake({ from: accounts[0], value: amount });
    await Exception.tryCatch(
      staker.completeStaking({ from: accounts[1] }), Exception.errTypes.nonOwnerCall);
  });

  it("should restart staking when staking is complete", async () => {
    // arrange
    let amount = web3.utils.toWei('2', 'ether');

    // act + assert
    await staker.stake({ from: accounts[0], value: amount });
    await staker.completeStaking({ from: accounts[0] });
    await staker.restartStaking({ from: accounts[0] });

    // assert
    let actual = await staker.getStatus.call({ from: accounts[0] });
    assert.equal(actual, 0);
  });

  it("should restart staking when staking is closed", async () => {
    // arrange
    let amount = web3.utils.toWei('2', 'ether');

    // act + assert
    await staker.stake({ from: accounts[0], value: amount });
    await staker.closeStaking({ from: accounts[0] });
    await staker.restartStaking({ from: accounts[0] });

    // assert
    let actual = await staker.getStatus.call({ from: accounts[0] });
    assert.equal(actual, 0);
  });

  it("should not restart staking when non owner invokes", async () => {
    // arrange
    let amount = web3.utils.toWei('2', 'ether');

    // act + assert
    await staker.stake({ from: accounts[0], value: amount });
    await staker.completeStaking({ from: accounts[0] });

    await Exception.tryCatch(
      staker.restartStaking({ from: accounts[2] }),
      Exception.errTypes.nonOwnerCall);
  });

  it("should allow owner to redeem staked balance", async () => {
    // arrange
    let amount = web3.utils.toWei('10', 'ether');

    // act
    await staker.stake({ from: accounts[1], value: amount });
    await staker.completeStaking({ from: accounts[0] });

    let startingBalance = web3.utils.toBN(await web3.eth.getBalance(accounts[0]));
    await staker.redeemStakedAmount({ from: accounts[0] });
    let endBalance = web3.utils.toBN(await web3.eth.getBalance(accounts[0]));

    // assert
    assert.isTrue(endBalance.gt(startingBalance));
  });

  it("should not allow a non-owner to redeem staked balance", async () => {
    // arrange
    let amount = web3.utils.toWei('10', 'ether');

    // act
    await staker.stake({ from: accounts[1], value: amount });
    await staker.completeStaking({ from: accounts[0] });

    // assert
    await Exception.tryCatch(
      staker.redeemStakedAmount({ from: accounts[1] }), Exception.errTypes.nonOwnerCall);
  });

  it("should not allow owner to redeem staked balance when staking is not complete", async () => {
    // arrange
    let amount = web3.utils.toWei('10', 'ether');

    // act
    await staker.stake({ from: accounts[1], value: amount });

    // assert
    await Exception.tryCatch(
      staker.redeemStakedAmount({ from: accounts[0] }), Exception.errTypes.onlyWhenComplete);
  });
});
