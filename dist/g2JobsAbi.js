"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.G2_JOBS_ABI = void 0;
// G2Jobs ABI subset (ERC-8183-readable job escrow by APEX Faucet; source hackathon/arc-g2/contracts/G2Jobs.sol).
exports.G2_JOBS_ABI = [
    {
        "type": "function",
        "name": "claimRefund",
        "inputs": [
            {
                "name": "jobId",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "complete",
        "inputs": [
            {
                "name": "jobId",
                "type": "uint256",
                "internalType": "uint256"
            },
            {
                "name": "reason",
                "type": "bytes32",
                "internalType": "bytes32"
            },
            {
                "name": "",
                "type": "bytes",
                "internalType": "bytes"
            }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "createJob",
        "inputs": [
            {
                "name": "provider",
                "type": "address",
                "internalType": "address"
            },
            {
                "name": "evaluator",
                "type": "address",
                "internalType": "address"
            },
            {
                "name": "expiredAt",
                "type": "uint256",
                "internalType": "uint256"
            },
            {
                "name": "description",
                "type": "string",
                "internalType": "string"
            },
            {
                "name": "hook",
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
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "createJobWithTerms",
        "inputs": [
            {
                "name": "provider",
                "type": "address",
                "internalType": "address"
            },
            {
                "name": "evaluator",
                "type": "address",
                "internalType": "address"
            },
            {
                "name": "expiredAt",
                "type": "uint256",
                "internalType": "uint256"
            },
            {
                "name": "description",
                "type": "string",
                "internalType": "string"
            },
            {
                "name": "reviewSeconds",
                "type": "uint32",
                "internalType": "uint32"
            },
            {
                "name": "killFeeBps",
                "type": "uint16",
                "internalType": "uint16"
            }
        ],
        "outputs": [
            {
                "name": "",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
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
        "name": "fund",
        "inputs": [
            {
                "name": "jobId",
                "type": "uint256",
                "internalType": "uint256"
            },
            {
                "name": "expectedBudget",
                "type": "uint256",
                "internalType": "uint256"
            },
            {
                "name": "",
                "type": "bytes",
                "internalType": "bytes"
            }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "getJob",
        "inputs": [
            {
                "name": "jobId",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "outputs": [
            {
                "name": "",
                "type": "tuple",
                "internalType": "struct G2Jobs.Job8183",
                "components": [
                    {
                        "name": "id",
                        "type": "uint256",
                        "internalType": "uint256"
                    },
                    {
                        "name": "client",
                        "type": "address",
                        "internalType": "address"
                    },
                    {
                        "name": "provider",
                        "type": "address",
                        "internalType": "address"
                    },
                    {
                        "name": "evaluator",
                        "type": "address",
                        "internalType": "address"
                    },
                    {
                        "name": "description",
                        "type": "string",
                        "internalType": "string"
                    },
                    {
                        "name": "budget",
                        "type": "uint256",
                        "internalType": "uint256"
                    },
                    {
                        "name": "expiredAt",
                        "type": "uint256",
                        "internalType": "uint256"
                    },
                    {
                        "name": "status",
                        "type": "uint8",
                        "internalType": "enum G2Jobs.JobStatus"
                    },
                    {
                        "name": "hook",
                        "type": "address",
                        "internalType": "address"
                    }
                ]
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "getTerms",
        "inputs": [
            {
                "name": "jobId",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "outputs": [
            {
                "name": "reviewSeconds",
                "type": "uint32",
                "internalType": "uint32"
            },
            {
                "name": "killFeeBps",
                "type": "uint16",
                "internalType": "uint16"
            },
            {
                "name": "submittedAt",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "jobCounter",
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
        "name": "paymentToken",
        "inputs": [],
        "outputs": [
            {
                "name": "",
                "type": "address",
                "internalType": "contract IERC20"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "platformFeeBP",
        "inputs": [],
        "outputs": [
            {
                "name": "",
                "type": "uint16",
                "internalType": "uint16"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "reject",
        "inputs": [
            {
                "name": "jobId",
                "type": "uint256",
                "internalType": "uint256"
            },
            {
                "name": "reason",
                "type": "bytes32",
                "internalType": "bytes32"
            },
            {
                "name": "",
                "type": "bytes",
                "internalType": "bytes"
            }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "setBudget",
        "inputs": [
            {
                "name": "jobId",
                "type": "uint256",
                "internalType": "uint256"
            },
            {
                "name": "amount",
                "type": "uint256",
                "internalType": "uint256"
            },
            {
                "name": "",
                "type": "bytes",
                "internalType": "bytes"
            }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "setProvider",
        "inputs": [
            {
                "name": "jobId",
                "type": "uint256",
                "internalType": "uint256"
            },
            {
                "name": "provider",
                "type": "address",
                "internalType": "address"
            }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "settle",
        "inputs": [
            {
                "name": "jobId",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "settleableAt",
        "inputs": [
            {
                "name": "jobId",
                "type": "uint256",
                "internalType": "uint256"
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
        "name": "submit",
        "inputs": [
            {
                "name": "jobId",
                "type": "uint256",
                "internalType": "uint256"
            },
            {
                "name": "deliverable",
                "type": "bytes32",
                "internalType": "bytes32"
            },
            {
                "name": "",
                "type": "bytes",
                "internalType": "bytes"
            }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "submitWithUri",
        "inputs": [
            {
                "name": "jobId",
                "type": "uint256",
                "internalType": "uint256"
            },
            {
                "name": "deliverable",
                "type": "bytes32",
                "internalType": "bytes32"
            },
            {
                "name": "uri",
                "type": "string",
                "internalType": "string"
            }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "withdraw",
        "inputs": [],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "event",
        "name": "JobCompleted",
        "inputs": [
            {
                "name": "jobId",
                "type": "uint256",
                "indexed": true,
                "internalType": "uint256"
            },
            {
                "name": "evaluator",
                "type": "address",
                "indexed": true,
                "internalType": "address"
            },
            {
                "name": "reason",
                "type": "bytes32",
                "indexed": false,
                "internalType": "bytes32"
            }
        ],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "JobCreated",
        "inputs": [
            {
                "name": "jobId",
                "type": "uint256",
                "indexed": true,
                "internalType": "uint256"
            },
            {
                "name": "client",
                "type": "address",
                "indexed": true,
                "internalType": "address"
            },
            {
                "name": "provider",
                "type": "address",
                "indexed": true,
                "internalType": "address"
            },
            {
                "name": "evaluator",
                "type": "address",
                "indexed": false,
                "internalType": "address"
            },
            {
                "name": "expiredAt",
                "type": "uint256",
                "indexed": false,
                "internalType": "uint256"
            },
            {
                "name": "hook",
                "type": "address",
                "indexed": false,
                "internalType": "address"
            }
        ],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "JobFunded",
        "inputs": [
            {
                "name": "jobId",
                "type": "uint256",
                "indexed": true,
                "internalType": "uint256"
            },
            {
                "name": "client",
                "type": "address",
                "indexed": true,
                "internalType": "address"
            },
            {
                "name": "amount",
                "type": "uint256",
                "indexed": false,
                "internalType": "uint256"
            }
        ],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "JobRejected",
        "inputs": [
            {
                "name": "jobId",
                "type": "uint256",
                "indexed": true,
                "internalType": "uint256"
            },
            {
                "name": "rejector",
                "type": "address",
                "indexed": true,
                "internalType": "address"
            },
            {
                "name": "reason",
                "type": "bytes32",
                "indexed": false,
                "internalType": "bytes32"
            }
        ],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "JobSettled",
        "inputs": [
            {
                "name": "jobId",
                "type": "uint256",
                "indexed": true,
                "internalType": "uint256"
            },
            {
                "name": "caller",
                "type": "address",
                "indexed": true,
                "internalType": "address"
            }
        ],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "JobSubmitted",
        "inputs": [
            {
                "name": "jobId",
                "type": "uint256",
                "indexed": true,
                "internalType": "uint256"
            },
            {
                "name": "provider",
                "type": "address",
                "indexed": true,
                "internalType": "address"
            },
            {
                "name": "deliverable",
                "type": "bytes32",
                "indexed": false,
                "internalType": "bytes32"
            }
        ],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "KillFeePaid",
        "inputs": [
            {
                "name": "jobId",
                "type": "uint256",
                "indexed": true,
                "internalType": "uint256"
            },
            {
                "name": "provider",
                "type": "address",
                "indexed": true,
                "internalType": "address"
            },
            {
                "name": "amount",
                "type": "uint256",
                "indexed": false,
                "internalType": "uint256"
            }
        ],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "PaymentReleased",
        "inputs": [
            {
                "name": "jobId",
                "type": "uint256",
                "indexed": true,
                "internalType": "uint256"
            },
            {
                "name": "provider",
                "type": "address",
                "indexed": true,
                "internalType": "address"
            },
            {
                "name": "amount",
                "type": "uint256",
                "indexed": false,
                "internalType": "uint256"
            }
        ],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "Refunded",
        "inputs": [
            {
                "name": "jobId",
                "type": "uint256",
                "indexed": true,
                "internalType": "uint256"
            },
            {
                "name": "client",
                "type": "address",
                "indexed": true,
                "internalType": "address"
            },
            {
                "name": "amount",
                "type": "uint256",
                "indexed": false,
                "internalType": "uint256"
            }
        ],
        "anonymous": false
    }
];
