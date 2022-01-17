import React, { useState, useEffect } from "react";
import "./App.css";
import Web3 from "web3";
import tokenContractABI from "./tokenContractABI.json";
import businessContractABI from "./businessContractABI.json";
import axios from "axios";

const tokenContractAddress = "0xD1DC24265ca09f2a37b4De6Bf8b96D00fE2C5c29"; // factToken.sol
const businessContractAddress = "0x0CA2f64de8A1f3A1Ec942ca227f8172F410EB8a3"; // factiiv.sol

function App() {
  const [web3, setWeb3] = useState();
  const [account, setAccount] = useState();

  useEffect(() => {
    const metamask = async () => {
      let accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      setWeb3(new Web3(window.ethereum));
      setAccount(accounts[0]);
    };
    metamask();
  }, []);

  const getData = (functionName, args) => {
    let businessContract = new web3.eth.Contract(
      businessContractABI,
      businessContractAddress
    );

    switch (functionName) {
      case "setMinimumAmount":
        return businessContract.methods.setMinimumAmount(...args).encodeABI();

      case "createRelationshipType":
        return businessContract.methods
          .createRelationshipType(...args)
          .encodeABI();

      case "updateRelationshipType":
        return businessContract.methods
          .updateRelationshipType(...args)
          .encodeABI();

      case "createAttestationType":
        return businessContract.methods
          .createAttestationType(...args)
          .encodeABI();

      case "updateAttestationType":
        return businessContract.methods
          .updateAttestationType(...args)
          .encodeABI();

      case "createAttestation":
        return businessContract.methods.createAttestation(...args).encodeABI();

      case "updateAttestation":
        return businessContract.methods.updateAttestation(...args).encodeABI();

      case "createRelationship":
        return businessContract.methods.createRelationship(...args).encodeABI();

      case "updateRelationship":
        return businessContract.methods.updateRelationship(...args).encodeABI();

      case "deleteRelationship":
        return businessContract.methods.deleteRelationship(...args).encodeABI();
    }
  };

  const metaTransfer = async () => {
    let tokenContract = new web3.eth.Contract(
      tokenContractABI,
      tokenContractAddress
    );

    let nonce = await tokenContract.methods.replayNonce(account).call();

    const data = getData("setMinimumAmount", [67]);//function and hash

    let hash = web3.utils.keccak256(data); //metaTransferHash
    let sig = await web3.eth.personal.sign("" + hash, account);

    let postData = {
      data: data,
      sig: sig,
      address: account,
      nonce: nonce,
      validity: Math.floor((Date.now() + 86400000) / 1000), //in seconds
    };
    console.log("postData:", postData);

    axios
      .post("http://localhost:9999/tx", postData, {
        headers: {
          "Content-Type": "application/json",
        },
      })
      .then(async (response) => {
  
        console.log("res ", JSON.stringify(response.data));
      })
      .catch((error) => {
        console.log(error);
      });
  };


  return (
    <div className="App">
      <div className="popupbody">
        <div className="popupcontainer">
          <button
            onClick={metaTransfer}
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
