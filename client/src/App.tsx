import React, { useState, useEffect } from 'react';
import SimpleStorageContract from './contracts/SimpleStorage.json';
import getWeb3 from './getWeb3';
import { AbiItem } from 'web3-utils';

import './App.css';

function App() {

  const [storageValue, setStorageValue] = useState(null as string | null);
  const [newValue, setNewValue] = useState("");

  useEffect(() => {
    const web3Init = async () => {
      const web3 = await getWeb3();
      const accounts = await web3.eth.getAccounts();
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = (SimpleStorageContract.networks as any)[networkId];

      const contract = new web3.eth.Contract(
        SimpleStorageContract.abi as AbiItem[],
        deployedNetwork?.address,
      );
      // console.log(instance);
      // await instance.methods.set("biscuit").send({ from: accounts[0] });

      const response = await contract.methods.get().call();
      setStorageValue(response);
    };
    web3Init().catch(console.log);
  }, []);

  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    // console.log(accounts);
  };

  return (
    <>
      {!storageValue && <div>Loading Web3, accounts, and contract...</div>}
      {storageValue && (
        <div className="App">
          <h1>Good to Go!</h1>
          <h2>Simple Storage</h2>
          <div>The stored value is: {storageValue}</div>
          <form onSubmit={handleSubmit}>
            <input type="text" value={newValue} />
            <input type="submit" />
          </form>
        </div>
      )}
    </>
  );
}

export default App;
