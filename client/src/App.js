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
    ipfsHash: [],
    balance: 0,
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

      await instance.methods
        ._balances(accounts[0])
        .call()
        .then((r) => {
          //get the value from the contract to prove it worked
          this.setState({ balance: r });
        });

      console.log(this.state.balance);

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState({ web3, accounts, contract: instance }, this.run);
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`
      );
      console.error(error);
    }
  };

  run = async () => {
    const { accounts, contract, balance } = this.state;

    //console.log(accounts[0]);

    //await contract.methods.set(5).send({ from: accounts[0] });
    //console.log(contract.methods._ownedTokens(accounts[0]).call());
    //console.log(contract.methods._balances(accounts[0]).call());
    for (let cpt = 0; cpt < balance; cpt++) {
      // Get the value from the contract to prove it worked.
      const response = await contract.methods
        ._ownedTokens(accounts[0], cpt)
        .call();
      console.log(response);
      var ipfsHash = this.state.ipfsHash;
      ipfsHash[cpt] = response;
      console.log(ipfsHash);
      // Update state with the result.
      this.setState({ ipfsHash });
    }
    console.log(this.state.ipfsHash.length);
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

  async onSubmit(event) {
    const { accounts, contract } = this.state;
    event.preventDefault();
    console.log(contract);
    //console.log("on submit...");
    await ipfs.files.add(this.state.buffer, async (error, result) => {
      if (error) {
        console.error(error);
        return;
      }
      await contract.methods
        .set(result[0].hash)
        .send({ from: accounts[0] })
        .then(async (r) => {
          //get the value from the contract to prove it worked
          var ipfsHash = this.state.ipfsHash;
          ipfsHash[this.state.ipfsHash.length] = result[0].hash;
          return this.setState({ ipfsHash });
          // return contract.methods.get().call();
        });
    });
    //console.log("ipfsHash", this.state.ipfsHash[this.state.balance]);
  }

  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    var galerie = [];

    for (var i = 0; i < this.state.ipfsHash.length; i++) {
      //console.log(i);
      //console.log(this.state.balance);
      var ipfsHash = this.state.ipfsHash[i];
      //console.log(this.state.ipfsHash[i]);
      galerie.push(
        <div className="ipfs-contracts">
          <div className="contract-thumbnail">
            <img
              className="ipfs-thumbnail"
              src={`https://ipfs.io/ipfs/${ipfsHash}`}
              alt=""
            />
          </div>
          <div className="contract-info">
            <h3>Contract information :</h3>
            <p>address : {this.state.contract._address}</p>
            <p>file hash : {ipfsHash}</p>
          </div>
        </div>
      );
    }
    //console.log(this.state.balance);
    return (
      <div className="App">
        <h1>Ipfs project n1 </h1>
        <p>
          L'image est stocké sur le protocol IPFS, elle est ensuite signé sur un
          smart contract sur la blockchain Ethereum.
        </p>
        <p>accounts : {this.state.accounts}</p>

        <div>{galerie}</div>

        <h2>Upload Image</h2>

        <form class="upload" onSubmit={this.onSubmit}>
          <input
            type="file"
            onChange={this.captureFile}
            accept="image/png, image/jpeg"
            class="file-button"
          />
          <input type="submit" class="submit-button" value="Signer" />
        </form>
      </div>
    );
  }
}

export default App;
