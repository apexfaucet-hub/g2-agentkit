export declare const G2_JOBS_ABI: readonly [{
    readonly type: "function";
    readonly name: "claimRefund";
    readonly inputs: readonly [{
        readonly name: "jobId";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "complete";
    readonly inputs: readonly [{
        readonly name: "jobId";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }, {
        readonly name: "reason";
        readonly type: "bytes32";
        readonly internalType: "bytes32";
    }, {
        readonly name: "";
        readonly type: "bytes";
        readonly internalType: "bytes";
    }];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "createJob";
    readonly inputs: readonly [{
        readonly name: "provider";
        readonly type: "address";
        readonly internalType: "address";
    }, {
        readonly name: "evaluator";
        readonly type: "address";
        readonly internalType: "address";
    }, {
        readonly name: "expiredAt";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }, {
        readonly name: "description";
        readonly type: "string";
        readonly internalType: "string";
    }, {
        readonly name: "hook";
        readonly type: "address";
        readonly internalType: "address";
    }];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "createJobWithTerms";
    readonly inputs: readonly [{
        readonly name: "provider";
        readonly type: "address";
        readonly internalType: "address";
    }, {
        readonly name: "evaluator";
        readonly type: "address";
        readonly internalType: "address";
    }, {
        readonly name: "expiredAt";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }, {
        readonly name: "description";
        readonly type: "string";
        readonly internalType: "string";
    }, {
        readonly name: "reviewSeconds";
        readonly type: "uint32";
        readonly internalType: "uint32";
    }, {
        readonly name: "killFeeBps";
        readonly type: "uint16";
        readonly internalType: "uint16";
    }];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "credits";
    readonly inputs: readonly [{
        readonly name: "";
        readonly type: "address";
        readonly internalType: "address";
    }];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "fund";
    readonly inputs: readonly [{
        readonly name: "jobId";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }, {
        readonly name: "expectedBudget";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }, {
        readonly name: "";
        readonly type: "bytes";
        readonly internalType: "bytes";
    }];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "getJob";
    readonly inputs: readonly [{
        readonly name: "jobId";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "tuple";
        readonly internalType: "struct G2Jobs.Job8183";
        readonly components: readonly [{
            readonly name: "id";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "client";
            readonly type: "address";
            readonly internalType: "address";
        }, {
            readonly name: "provider";
            readonly type: "address";
            readonly internalType: "address";
        }, {
            readonly name: "evaluator";
            readonly type: "address";
            readonly internalType: "address";
        }, {
            readonly name: "description";
            readonly type: "string";
            readonly internalType: "string";
        }, {
            readonly name: "budget";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "expiredAt";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "status";
            readonly type: "uint8";
            readonly internalType: "enum G2Jobs.JobStatus";
        }, {
            readonly name: "hook";
            readonly type: "address";
            readonly internalType: "address";
        }];
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "getTerms";
    readonly inputs: readonly [{
        readonly name: "jobId";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly outputs: readonly [{
        readonly name: "reviewSeconds";
        readonly type: "uint32";
        readonly internalType: "uint32";
    }, {
        readonly name: "killFeeBps";
        readonly type: "uint16";
        readonly internalType: "uint16";
    }, {
        readonly name: "submittedAt";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "jobCounter";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "paymentToken";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "address";
        readonly internalType: "contract IERC20";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "platformFeeBP";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint16";
        readonly internalType: "uint16";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "reject";
    readonly inputs: readonly [{
        readonly name: "jobId";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }, {
        readonly name: "reason";
        readonly type: "bytes32";
        readonly internalType: "bytes32";
    }, {
        readonly name: "";
        readonly type: "bytes";
        readonly internalType: "bytes";
    }];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "setBudget";
    readonly inputs: readonly [{
        readonly name: "jobId";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }, {
        readonly name: "amount";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }, {
        readonly name: "";
        readonly type: "bytes";
        readonly internalType: "bytes";
    }];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "setProvider";
    readonly inputs: readonly [{
        readonly name: "jobId";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }, {
        readonly name: "provider";
        readonly type: "address";
        readonly internalType: "address";
    }];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "settle";
    readonly inputs: readonly [{
        readonly name: "jobId";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "settleableAt";
    readonly inputs: readonly [{
        readonly name: "jobId";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "submit";
    readonly inputs: readonly [{
        readonly name: "jobId";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }, {
        readonly name: "deliverable";
        readonly type: "bytes32";
        readonly internalType: "bytes32";
    }, {
        readonly name: "";
        readonly type: "bytes";
        readonly internalType: "bytes";
    }];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "submitWithUri";
    readonly inputs: readonly [{
        readonly name: "jobId";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }, {
        readonly name: "deliverable";
        readonly type: "bytes32";
        readonly internalType: "bytes32";
    }, {
        readonly name: "uri";
        readonly type: "string";
        readonly internalType: "string";
    }];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "withdraw";
    readonly inputs: readonly [];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "event";
    readonly name: "JobCompleted";
    readonly inputs: readonly [{
        readonly name: "jobId";
        readonly type: "uint256";
        readonly indexed: true;
        readonly internalType: "uint256";
    }, {
        readonly name: "evaluator";
        readonly type: "address";
        readonly indexed: true;
        readonly internalType: "address";
    }, {
        readonly name: "reason";
        readonly type: "bytes32";
        readonly indexed: false;
        readonly internalType: "bytes32";
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "JobCreated";
    readonly inputs: readonly [{
        readonly name: "jobId";
        readonly type: "uint256";
        readonly indexed: true;
        readonly internalType: "uint256";
    }, {
        readonly name: "client";
        readonly type: "address";
        readonly indexed: true;
        readonly internalType: "address";
    }, {
        readonly name: "provider";
        readonly type: "address";
        readonly indexed: true;
        readonly internalType: "address";
    }, {
        readonly name: "evaluator";
        readonly type: "address";
        readonly indexed: false;
        readonly internalType: "address";
    }, {
        readonly name: "expiredAt";
        readonly type: "uint256";
        readonly indexed: false;
        readonly internalType: "uint256";
    }, {
        readonly name: "hook";
        readonly type: "address";
        readonly indexed: false;
        readonly internalType: "address";
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "JobFunded";
    readonly inputs: readonly [{
        readonly name: "jobId";
        readonly type: "uint256";
        readonly indexed: true;
        readonly internalType: "uint256";
    }, {
        readonly name: "client";
        readonly type: "address";
        readonly indexed: true;
        readonly internalType: "address";
    }, {
        readonly name: "amount";
        readonly type: "uint256";
        readonly indexed: false;
        readonly internalType: "uint256";
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "JobRejected";
    readonly inputs: readonly [{
        readonly name: "jobId";
        readonly type: "uint256";
        readonly indexed: true;
        readonly internalType: "uint256";
    }, {
        readonly name: "rejector";
        readonly type: "address";
        readonly indexed: true;
        readonly internalType: "address";
    }, {
        readonly name: "reason";
        readonly type: "bytes32";
        readonly indexed: false;
        readonly internalType: "bytes32";
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "JobSettled";
    readonly inputs: readonly [{
        readonly name: "jobId";
        readonly type: "uint256";
        readonly indexed: true;
        readonly internalType: "uint256";
    }, {
        readonly name: "caller";
        readonly type: "address";
        readonly indexed: true;
        readonly internalType: "address";
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "JobSubmitted";
    readonly inputs: readonly [{
        readonly name: "jobId";
        readonly type: "uint256";
        readonly indexed: true;
        readonly internalType: "uint256";
    }, {
        readonly name: "provider";
        readonly type: "address";
        readonly indexed: true;
        readonly internalType: "address";
    }, {
        readonly name: "deliverable";
        readonly type: "bytes32";
        readonly indexed: false;
        readonly internalType: "bytes32";
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "KillFeePaid";
    readonly inputs: readonly [{
        readonly name: "jobId";
        readonly type: "uint256";
        readonly indexed: true;
        readonly internalType: "uint256";
    }, {
        readonly name: "provider";
        readonly type: "address";
        readonly indexed: true;
        readonly internalType: "address";
    }, {
        readonly name: "amount";
        readonly type: "uint256";
        readonly indexed: false;
        readonly internalType: "uint256";
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "PaymentReleased";
    readonly inputs: readonly [{
        readonly name: "jobId";
        readonly type: "uint256";
        readonly indexed: true;
        readonly internalType: "uint256";
    }, {
        readonly name: "provider";
        readonly type: "address";
        readonly indexed: true;
        readonly internalType: "address";
    }, {
        readonly name: "amount";
        readonly type: "uint256";
        readonly indexed: false;
        readonly internalType: "uint256";
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "Refunded";
    readonly inputs: readonly [{
        readonly name: "jobId";
        readonly type: "uint256";
        readonly indexed: true;
        readonly internalType: "uint256";
    }, {
        readonly name: "client";
        readonly type: "address";
        readonly indexed: true;
        readonly internalType: "address";
    }, {
        readonly name: "amount";
        readonly type: "uint256";
        readonly indexed: false;
        readonly internalType: "uint256";
    }];
    readonly anonymous: false;
}];
