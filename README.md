# Staking Smart Contract dApp
Staking smart contract dapp is a staking platform where you and other user can stake ether. The goal is to collectively stake 1 ethereum. Afterwards, the total staked amount can be awarded to a specified account.
## Running
To run the application in a development enviroment:
* Copy the project using: `git clone https://github.com/BFYDigital/staking-smart-contract`
* Run a local blockchain: 
```bash
truffle develop
migrate
```
* change into the client directory: `cd client`
* install package dependencies `npm install`
* Start the project: `npm run start`

## Testing 
* To run tests, simply run: `truffle test`