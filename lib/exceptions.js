// source: https://ethereum.stackexchange.com/a/48629

const PREFIX = "Reason given: ";

module.exports.errTypes = {
  onlyWhenComplete: "staking is currently not complete",
  stakingNotOpen: "staking is currently not open",
  stakingNotClosed: "staking is currently not closed. cannot withdraw",
  noStake: "cannot withdraw, you have not staked any amount",
  nonOwnerCall: "Ownable: caller is not the owner",
  stakingThresholdNotReached: "staked amount has not reached threshold"
}

module.exports.tryCatch = async function (promise, errType) {
  try {
    await promise;
    throw null;
  }
  catch (error) {
    assert(error, "Expected an error but did not get one");
    assert(error.message.includes(PREFIX + errType), "Expected an error including with '" + PREFIX + errType + "' but got '" + error.message + "' instead");
  }
};