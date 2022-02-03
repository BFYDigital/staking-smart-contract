const { assert } = require("chai");
const CompletionContract = artifacts.require("CompletionContract");

contract("CompletionContract", function (accounts) {

  const Exception = require('../lib/exceptions');
  let completionContract;

  beforeEach(async () => {
    completionContract = await CompletionContract.new();
  });

  it("should allow owner to award stakes to a user", async () => {
    // arrange
    let amount = web3.utils.toWei('10', 'ether');
    let initialBalance = web3.utils.toBN(await web3.eth.getBalance(accounts[1]));

    // act    
    await completionContract.send(amount, { from: accounts[0] });
    await completionContract.transferStakedBalance(accounts[1]);

    let finalBalance = web3.utils.toBN(await web3.eth.getBalance(accounts[1]));
    let pastReceivers = await completionContract.getPastReceivers.call({ from: accounts[0] });
    let lastReceiver = await completionContract.getLastReciver.call({ from: accounts[0] });

    // assert
    assert.isTrue(finalBalance.gt(initialBalance));
    assert.equal(pastReceivers.length, 1);
    assert.equal(lastReceiver.receiverAddress, accounts[1]);
  });

  it("should not allow non owner to award stakes to a user", async () => {
    // arrange
    let amount = web3.utils.toWei('10', 'ether');

    // act + assert
    await completionContract.send(amount, { from: accounts[0] });
    await Exception.tryCatch(
      completionContract.transferStakedBalance(accounts[0], { from: accounts[1] }),
      Exception.errTypes.nonOwnerCall);
  });
});
