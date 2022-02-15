![staking-dapp-screenshot](https://user-images.githubusercontent.com/98951489/153860863-3556df6a-06da-4998-9c48-7ec8c6dc9fd8.png)

# Staking Smart Contract dApp
Staking smart contract dapp is a staking platform where you and other user can stake ether. The goal is to collectively stake at least 1 ethereum. If the threshold is successfully reached, the contract owner with 'complete' staking and then every staker is awarded BFY Tokens depending on how much ether they staked.

You can view the demo [here](http://test-blockchain.bfydigital.com/staker/ "Staking dApp demo").
## Running
To run the application in a development enviroment:
* Copy the project using: `git clone https://github.com/BFYDigital/staking-smart-contract`
* Install package dependencies `npm install`
* Rename `secrets.example.json` in the root to `secrets.json`
* Run a local blockchain: 
```bash
truffle develop
migrate
```
* Change into the client directory: `cd client`
* Install package dependencies `npm install`
* Start the project: `npm run start`

## Testing 
* To run tests, simply run: `truffle test`
## Deploying to a testnet
This project uses infura. Modify the `networks` property in `truffle-config.js` to use other providers.
* Replace the `mnemonic` property with your wallet's backup phrase
* Place you infura project key into the `infura_project_id` property.
* Run truffle's migration command
```bash
truffle migrate --network <your target network>
```