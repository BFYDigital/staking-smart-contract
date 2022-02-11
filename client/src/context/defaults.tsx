import { Contract } from 'web3-eth-contract';

interface IWebContext {
  stakerContract: Contract | null;
  accounts: Array<string>;
  networkId: number;
  setStakerContract(stakerContract: Contract | null): void;
  setAccounts(accounts: Array<string>): void;
  setNetworkId(networkId: number): void;
}

interface IDefaultContext {
  dapp: IWebContext;
}

const defaultContext: IDefaultContext = {
  dapp: {
    stakerContract: null,
    accounts: [],
    networkId: -1,
    setStakerContract(stakerContract: Contract | null) {
      this.stakerContract = stakerContract;
    },
    setAccounts(accounts: Array<string>) {
      this.accounts = accounts;
    },
    setNetworkId(networkId: number) {
      this.networkId = networkId;
    }
  }
};

export default defaultContext;
