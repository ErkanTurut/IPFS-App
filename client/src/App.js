import React, { Component } from "react";
import SimpleStorageContract from "./contracts/SimpleStorage.json";
import getWeb3 from "./getWeb3";
import ipfs from "./ipfs";

import "./App.css";

window.ethereum.on("accountsChanged", async () => {
  window.location.reload(false);
});

class App extends Component {
  state = {
    storageValue: 0,
    web3: null,
    accounts: null,
    contract: null,
    buffer: null,
    ipfsHash: "",
  };
  captureFile = this.captureFile.bind(this);
  onSubmit = this.onSubmit.bind(this);

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();

      // Get the contract instance.
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = SimpleStorageContract.networks[networkId];
      const instance = new web3.eth.Contract(
        SimpleStorageContract.abi,
        deployedNetwork && deployedNetwork.address
      );

      console.log(instance);

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState({ web3, accounts, contract: instance }, this.runExample);
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`
      );
      console.error(error);
    }
  };

  runExample = async () => {
    const { accounts, contract } = this.state;
    //console.log(ipfsHash);
    // Stores a given value, 5 by default.
    //console.log(accounts[0]);

    //await contract.methods.set(5).send({ from: accounts[0] });
    //console.log(accounts);

    // Get the value from the contract to prove it worked.
    const response = await contract.methods.get().call();

    // Update state with the result.
    this.setState({ ipfsHash: response });
    // this.setState({ storageValue: response });
  };

  captureFile(event) {
    //console.log("capture file...");
    event.preventDefault();
    const file = event.target.files[0];
    const reader = new window.FileReader();
    reader.readAsArrayBuffer(file);
    reader.onloadend = () => {
      this.setState({ buffer: Buffer(reader.result) });
      console.log("buffer", this.state.buffer);
    };
  }

  onSubmit(event) {
    const { accounts, contract } = this.state;
    event.preventDefault();
    console.log(contract);
    //console.log("on submit...");
    ipfs.files.add(this.state.buffer, (error, result) => {
      if (error) {
        console.error(error);
        return;
      }
      contract.methods
        .set(result[0].hash)
        .send({ from: accounts[0] })
        .then((r) => {
          //get the value from the contract to prove it worked
          return this.setState({ ipfsHash: result[0].hash });
          console.log("ipfsHash", this.state.ipfsHash);
          // return contract.methods.get().call();
        });
    });
  }

  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className="App">
        <h1>Votre image</h1>
        <p>
          Cette image est stocké sur l'IPFS et signé sur la blockchain Ethereum
        </p>
        <p>accounts : {this.state.accounts}</p>
        <div className="ipfs-contracts">
          <div className="contract-thumbnail">
            <img
              className="ipfs-thumbnail"
              src={`https://ipfs.io/ipfs/${this.state.ipfsHash}`}
              alt=""
            />
          </div>
          <div className="contract-info">
            <h3>Contract information :</h3>
            <p>
              address <br /> {this.state.contract._address}
            </p>
            <p>
              file hash <br /> {this.state.ipfsHash}
            </p>
          </div>
        </div>

        <h2>Upload Image</h2>
        <form onSubmit={this.onSubmit}>
          <input
            type="file"
            onChange={this.captureFile}
            accept="image/png, image/jpeg"
          />
          <input type="submit" />
        </form>
      </div>
    );
  }
}

export default App;
