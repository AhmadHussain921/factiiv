# Steps to run the application

This project contains two folders:
 1> contains the contracts
 2> contains the server and basic frontend code (for testing it with metamask)

## Deploying contracts

 1> firstly attach local host ganache with the metamask.
 2> open remix and connect the local host code from the metaTransactions folder.
 3> Once metamask and remix connected with localhost, copy any private key of an address and import that account in the metamask, we will use this account to deploy the contracts.
 4> deploy the factsToken contract.
 5> deploy the factiiv contract with two values:
    1: factsToken contract address 
    2: use the same address of the user, to set him as the root user which will have all the roles.
 6> copy factiiv contract address and open the factsToken contract in remix. Add the value of factiiv contract address in the "setFactiiv" function.
 

## Configuring server
1> Copy factiiv contract address and paste it in the App.js & server.js.  Line 8 & Line 18 respectively.
2> Copy factsToken contract address and paste it in the App.js & server.js. Line 9 & Line 19 respectively.
3> Copy factiiv contract ABI and replace it in the businessContractABI.json. 
4> Copy factsToken contract ABI and replace it in the tokenContractABI.json.
5> Copy another private key of differnt account from the ganache, and add it in the senderAccount in the server.js line 16. This account will pay for the gas fee for meta Transaction. 
6> Open the terminal in meta directory, and  run ### `npm install`
7> Run ### `npm start`
8> Open another terminal and run ### `node server.js` to run the server.
9> A new tab will open in browser, connect an account of metamask which has 0 ETH and then click on the submit button. Sign the transaction.

## Verifying the transaction
1> you can see in the App.js, there is a function called "getData" which contains the harcoded value {function signature and the parameters in array}. This will trigger on clicking the submit button from frontend and call the contract. 
2> you can verify the same parameters, by going in to the contract in remix and see the value of the function, that was being called.


