"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.G2_ABI = void 0;
// G2RegistryUSDC ABI subset (from the verified source, Sourcify exact match on Base).
exports.G2_ABI = [
    {
        "type": "function",
        "name": "answers",
        "inputs": [
            {
                "name": "",
                "type": "bytes32",
                "internalType": "bytes32"
            },
            {
                "name": "",
                "type": "address",
                "internalType": "address"
            }
        ],
        "outputs": [
            {
                "name": "",
                "type": "bytes",
                "internalType": "bytes"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "award",
        "inputs": [
            {
                "name": "queryId",
                "type": "bytes32",
                "internalType": "bytes32"
            },
            {
                "name": "solver",
                "type": "address",
                "internalType": "address"
            }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "cancelQuery",
        "inputs": [
            {
                "name": "queryId",
                "type": "bytes32",
                "internalType": "bytes32"
            }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "claim",
        "inputs": [],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "credits",
        "inputs": [
            {
                "name": "",
                "type": "address",
                "internalType": "address"
            }
        ],
        "outputs": [
            {
                "name": "",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "getQuery",
        "inputs": [
            {
                "name": "queryId",
                "type": "bytes32",
                "internalType": "bytes32"
            }
        ],
        "outputs": [
            {
                "name": "",
                "type": "tuple",
                "internalType": "struct G2RegistryUSDC.Query",
                "components": [
                    {
                        "name": "poster",
                        "type": "address",
                        "internalType": "address"
                    },
                    {
                        "name": "amount",
                        "type": "uint96",
                        "internalType": "uint96"
                    },
                    {
                        "name": "expiry",
                        "type": "uint48",
                        "internalType": "uint48"
                    },
                    {
                        "name": "settled",
                        "type": "bool",
                        "internalType": "bool"
                    },
                    {
                        "name": "packetHash",
                        "type": "bytes32",
                        "internalType": "bytes32"
                    },
                    {
                        "name": "targetPassportId",
                        "type": "uint256",
                        "internalType": "uint256"
                    }
                ]
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "minBounty",
        "inputs": [],
        "outputs": [
            {
                "name": "",
                "type": "uint96",
                "internalType": "uint96"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "postQuery",
        "inputs": [
            {
                "name": "packet",
                "type": "bytes",
                "internalType": "bytes"
            },
            {
                "name": "bountyAmount",
                "type": "uint96",
                "internalType": "uint96"
            },
            {
                "name": "tipAmount",
                "type": "uint96",
                "internalType": "uint96"
            }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "postSignal",
        "inputs": [
            {
                "name": "packet",
                "type": "bytes",
                "internalType": "bytes"
            }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "queryCount",
        "inputs": [],
        "outputs": [
            {
                "name": "",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "queryIds",
        "inputs": [
            {
                "name": "",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "outputs": [
            {
                "name": "",
                "type": "bytes32",
                "internalType": "bytes32"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "queryText",
        "inputs": [
            {
                "name": "",
                "type": "bytes32",
                "internalType": "bytes32"
            }
        ],
        "outputs": [
            {
                "name": "",
                "type": "bytes",
                "internalType": "bytes"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "registeredOwner",
        "inputs": [
            {
                "name": "passportId",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "outputs": [
            {
                "name": "owner",
                "type": "address",
                "internalType": "address"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "respond",
        "inputs": [
            {
                "name": "queryId",
                "type": "bytes32",
                "internalType": "bytes32"
            },
            {
                "name": "ackPacket",
                "type": "bytes",
                "internalType": "bytes"
            }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "respondentAt",
        "inputs": [
            {
                "name": "queryId",
                "type": "bytes32",
                "internalType": "bytes32"
            },
            {
                "name": "i",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "outputs": [
            {
                "name": "",
                "type": "address",
                "internalType": "address"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "respondentCount",
        "inputs": [
            {
                "name": "queryId",
                "type": "bytes32",
                "internalType": "bytes32"
            }
        ],
        "outputs": [
            {
                "name": "",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "event",
        "name": "G2Signal",
        "inputs": [
            {
                "name": "sender",
                "type": "address",
                "indexed": true,
                "internalType": "address"
            },
            {
                "name": "sigType",
                "type": "uint8",
                "indexed": true,
                "internalType": "uint8"
            },
            {
                "name": "passportId",
                "type": "uint256",
                "indexed": true,
                "internalType": "uint256"
            },
            {
                "name": "queryId",
                "type": "bytes32",
                "indexed": false,
                "internalType": "bytes32"
            },
            {
                "name": "bounty",
                "type": "uint96",
                "indexed": false,
                "internalType": "uint96"
            },
            {
                "name": "verified",
                "type": "bool",
                "indexed": false,
                "internalType": "bool"
            },
            {
                "name": "payload",
                "type": "bytes",
                "indexed": false,
                "internalType": "bytes"
            }
        ],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "QuerySettled",
        "inputs": [
            {
                "name": "queryId",
                "type": "bytes32",
                "indexed": true,
                "internalType": "bytes32"
            },
            {
                "name": "solver",
                "type": "address",
                "indexed": true,
                "internalType": "address"
            },
            {
                "name": "toSolver",
                "type": "uint256",
                "indexed": false,
                "internalType": "uint256"
            },
            {
                "name": "totalFee",
                "type": "uint256",
                "indexed": false,
                "internalType": "uint256"
            },
            {
                "name": "tipAccrued",
                "type": "uint256",
                "indexed": false,
                "internalType": "uint256"
            }
        ],
        "anonymous": false
    }
];
