const BFYToken = artifacts.require("./BFYToken.sol");
const Staker = artifacts.require("./Staker.sol");

module.exports = function (deployer) {
  deployer.deploy(BFYToken).then(() => {
    return deployer.deploy(Staker, BFYToken.address);
  });
};
