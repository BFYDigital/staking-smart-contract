const Staker = artifacts.require("./Staker.sol");
const CompletionContract = artifacts.require("./CompletionContract.sol");

module.exports = function (deployer) {
  deployer.deploy(Staker);
  deployer.deploy(CompletionContract);
};
