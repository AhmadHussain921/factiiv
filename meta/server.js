const express = require('express');
const Web3 = require('web3');
const cors = require('cors')

//express server settings
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors())

const abi = require("./src/tokenContractABI.json")
let web3 = new Web3();

web3.setProvider(new web3.providers.WebsocketProvider("ws://127.0.0.1:7545"));
//its the forwarder who will pay the fee
let senderAccount = web3.eth.accounts.privateKeyToAccount('e1a4baef24f9c1c1015f3c429a3714262fb325c26edabc0eae07351c15c7ce17'); //ganache

let tokenContractAddress = "0xD1DC24265ca09f2a37b4De6Bf8b96D00fE2C5c29" // factToken.sol
let businessContractAddress = "0x0CA2f64de8A1f3A1Ec942ca227f8172F410EB8a3" // factiiv.sol

let contract = new web3.eth.Contract(abi, tokenContractAddress)

const subscription = web3.eth.subscribe('logs', { address: [tokenContractAddress] }, function (error, result) {
	if (error) {
		console.log(result);
	}
}).on("data", async function (log) {
	console.log("Log: ", log);
	console.log(await web3.eth.abi.decodeLog([
		{
			"indexed": false,
			"internalType": "bool",
			"name": "",
			"type": "bool"
		},
		{
			"indexed": false,
			"internalType": "bytes",
			"name": "",
			"type": "bytes"
		}
	],log.data,log.topics))
})

app.post('/tx', async (req, res) => {

	const sentAddress = req.body.address
	const data = req.body.data;
	const hash = await contract.methods.metaTransferHash(data).call();
	const sig = req.body.sig;

	const recoveredAddress = await web3.eth.accounts.recover("" + hash, sig);

	if (sentAddress.toLowerCase() == recoveredAddress.toLowerCase()) {

		console.log("Signature Matched")

		const validity = req.body.validity;
		const nonce = req.body.nonce;

		const tx = {
			from: senderAccount.address,
			to: tokenContractAddress,
			gas: 1999999,
			data: contract.methods.metaTransfer(sig, data, nonce, validity).encodeABI(),
		};

		const signPromise = senderAccount.signTransaction(tx);
		signPromise
			.then((signedTx) => {
				web3.eth.sendSignedTransaction(
					signedTx.rawTransaction,
					function (err, hash) {
						if (!err) {
							console.log(
								"The hash of your transaction is: ",
								hash,
							);
							res.send(JSON.stringify({ transactionHash: hash }));
						} else {
							console.log(
								"Something went wrong when submitting your transaction: ",
								err
							);
						}
					}
				);
			})
			.catch((err) => {
				console.log(" Promise failed:", err);
			});
	} else {
		res.send(JSON.stringify("failed"))
	}
});

app.listen(9999);
console.log(`http listening on 9999`);
