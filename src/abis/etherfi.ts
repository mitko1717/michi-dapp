export const ClaimContractAbi = [{
    "inputs": [{
        "internalType": "address",
        "name": "token_",
        "type": "address"
    }, {"internalType": "bytes32", "name": "merkleRoot_", "type": "bytes32"}, {
        "internalType": "uint256",
        "name": "endTime_",
        "type": "uint256"
    }], "stateMutability": "nonpayable", "type": "constructor"
}, {
    "inputs": [{"internalType": "address", "name": "target", "type": "address"}],
    "name": "AddressEmptyCode",
    "type": "error"
}, {
    "inputs": [{"internalType": "address", "name": "account", "type": "address"}],
    "name": "AddressInsufficientBalance",
    "type": "error"
}, {"inputs": [], "name": "AlreadyClaimed", "type": "error"}, {
    "inputs": [],
    "name": "ClaimWindowFinished",
    "type": "error"
}, {"inputs": [], "name": "EndTimeInPast", "type": "error"}, {
    "inputs": [],
    "name": "FailedInnerCall",
    "type": "error"
}, {"inputs": [], "name": "InvalidProof", "type": "error"}, {
    "inputs": [],
    "name": "NoWithdrawDuringClaim",
    "type": "error"
}, {
    "inputs": [{"internalType": "address", "name": "owner", "type": "address"}],
    "name": "OwnableInvalidOwner",
    "type": "error"
}, {
    "inputs": [{"internalType": "address", "name": "account", "type": "address"}],
    "name": "OwnableUnauthorizedAccount",
    "type": "error"
}, {
    "inputs": [{"internalType": "address", "name": "token", "type": "address"}],
    "name": "SafeERC20FailedOperation",
    "type": "error"
}, {
    "anonymous": false,
    "inputs": [{"indexed": false, "internalType": "uint256", "name": "index", "type": "uint256"}, {
        "indexed": false,
        "internalType": "address",
        "name": "account",
        "type": "address"
    }, {"indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256"}],
    "name": "Claimed",
    "type": "event"
}, {
    "anonymous": false,
    "inputs": [{
        "indexed": true,
        "internalType": "address",
        "name": "previousOwner",
        "type": "address"
    }, {"indexed": true, "internalType": "address", "name": "newOwner", "type": "address"}],
    "name": "OwnershipTransferred",
    "type": "event"
}, {
    "inputs": [{"internalType": "uint256", "name": "index", "type": "uint256"}, {
        "internalType": "address",
        "name": "account",
        "type": "address"
    }, {"internalType": "uint256", "name": "amount", "type": "uint256"}, {
        "internalType": "bytes32[]",
        "name": "merkleProof",
        "type": "bytes32[]"
    }], "name": "claim", "outputs": [], "stateMutability": "nonpayable", "type": "function"
}, {
    "inputs": [],
    "name": "endTime",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
}, {
    "inputs": [{"internalType": "uint256", "name": "index", "type": "uint256"}],
    "name": "isClaimed",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
}, {
    "inputs": [],
    "name": "merkleRoot",
    "outputs": [{"internalType": "bytes32", "name": "", "type": "bytes32"}],
    "stateMutability": "view",
    "type": "function"
}, {
    "inputs": [],
    "name": "owner",
    "outputs": [{"internalType": "address", "name": "", "type": "address"}],
    "stateMutability": "view",
    "type": "function"
}, {
    "inputs": [],
    "name": "renounceOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
}, {
    "inputs": [],
    "name": "token",
    "outputs": [{"internalType": "address", "name": "", "type": "address"}],
    "stateMutability": "view",
    "type": "function"
}, {
    "inputs": [{"internalType": "address", "name": "newOwner", "type": "address"}],
    "name": "transferOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
}, {"inputs": [], "name": "withdraw", "outputs": [], "stateMutability": "nonpayable", "type": "function"}]