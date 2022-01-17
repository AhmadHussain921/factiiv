// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";

contract FactsToken is ERC20, Ownable, ERC20Burnable{

    address private factiiv;
    mapping (address => uint256) public replayNonce;
    event Response(bool, bytes);

    constructor() ERC20("FACTIIV", "FACTS") {
        mint(owner(), 100000000000);
    }

    function setFactiiv(address contractAddress)  external onlyOwner 
    {
        factiiv = contractAddress;
    }
    function decimals() public view virtual override returns (uint8) {
        return 2;
    }

    function mint(address account, uint256 amount) public onlyOwner {
        _mint(account, amount);
    }

    function metaTransfer(
        bytes memory signature,
        bytes memory data,
        uint256 nonce,
        uint256 validTill
    ) public {
        //Checking transaction validity
        require(block.timestamp < validTill,"Transaction validity expired");

        //bytes32 metaHash = metaTransferHash(data);
        address signer = getSigner(metaTransferHash(data), signature);

        //make sure signer doesn't come back as 0x0
        require(signer != address(0),"Address is 0");

        //checking nonce
        require(nonce == replayNonce[signer],"Invalid Nonce");
        replayNonce[signer]++;

        bytes memory modifiedData = bytes.concat(data,abi.encode(signer));

        (bool success, bytes memory resData) = factiiv.call(modifiedData);

        emit Response(success,resData);
    }

    

    function metaTransferHash(bytes memory data) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(data));
    }

    function getSigner(bytes32 _hash, bytes memory _signature)
        internal
        pure
        returns (address)
    {
        bytes32 r;
        bytes32 s;
        uint8 v;
        if (_signature.length != 65) {
            return address(0);
        }
        assembly {
            r := mload(add(_signature, 32))
            s := mload(add(_signature, 64))
            v := byte(0, mload(add(_signature, 96)))
        }
        if (v < 27) {
            v += 27;
        }
        if (v != 27 && v != 28) {
            return address(0);
        } else {
            return
                ecrecover(
                    keccak256(
                        abi.encodePacked(
                            "\x19Ethereum Signed Message:\n32",
                            _hash
                        )
                    ),
                    v,
                    r,
                    s
                );
        }
    }
}
