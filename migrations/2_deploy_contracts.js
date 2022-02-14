const Staker = artifacts.require("./Staker.sol");

module.exports = function (deployer) {
  deployer.deploy(Staker);
};
