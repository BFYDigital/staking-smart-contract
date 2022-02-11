const path = require("path");

module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  contracts_build_directory: path.join(__dirname, "client/src/contracts"),
  networks: {
    develop: {
      host: "localhost",
      port: 8545,
      network_id: "1337"
    }
  },
  compilers: {
    solc: {
      version: "^0.8.0"
    }
  }
};
