const adminAbi = [
  { type: "constructor", inputs: [], stateMutability: "nonpayable" },
  {
    type: "function",
    name: "approveToken",
    inputs: [
      { name: "token", type: "address", internalType: "address" },
      { name: "spender", type: "address", internalType: "address" },
      { name: "amount", type: "uint256", internalType: "uint256" },
      { name: "_ownerId", type: "uint256", internalType: "uint256" },
      { name: "_passwdAddr", type: "address", internalType: "address" },
      { name: "_nonce", type: "uint256", internalType: "uint256" },
      { name: "_signature", type: "bytes", internalType: "bytes" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "chgAdmin",
    inputs: [
      { name: "_newAdmin", type: "address", internalType: "address" },
      { name: "_ownerId", type: "uint256", internalType: "uint256" },
      { name: "_passwdAddr", type: "address", internalType: "address" },
      { name: "_nonce", type: "uint256", internalType: "uint256" },
      { name: "_signature", type: "bytes", internalType: "bytes" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "chgOwner",
    inputs: [{ name: "_newOwner", type: "address", internalType: "address" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "chgOwnerId",
    inputs: [
      { name: "_newOwnerId", type: "uint256", internalType: "uint256" },
      { name: "_ownerId", type: "uint256", internalType: "uint256" },
      { name: "_passwdAddr", type: "address", internalType: "address" },
      { name: "_nonce", type: "uint256", internalType: "uint256" },
      { name: "_signature", type: "bytes", internalType: "bytes" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "chgPasswdAddr",
    inputs: [
      {
        name: "_newPasswdAddr",
        type: "address",
        internalType: "address",
      },
      { name: "_ownerId", type: "uint256", internalType: "uint256" },
      { name: "_passwdAddr", type: "address", internalType: "address" },
      { name: "_nonce", type: "uint256", internalType: "uint256" },
      { name: "_signature", type: "bytes", internalType: "bytes" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "newAccount",
    inputs: [
      { name: "_ownerId", type: "uint256", internalType: "uint256" },
      { name: "_passwdAddr", type: "address", internalType: "address" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "owner",
    inputs: [],
    outputs: [{ name: "", type: "address", internalType: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "queryAccount",
    inputs: [{ name: "_ownerId", type: "uint256", internalType: "uint256" }],
    outputs: [{ name: "", type: "address", internalType: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "transferETH",
    inputs: [
      { name: "to", type: "address", internalType: "address" },
      { name: "amount", type: "uint256", internalType: "uint256" },
      { name: "_ownerId", type: "uint256", internalType: "uint256" },
      { name: "_passwdAddr", type: "address", internalType: "address" },
      { name: "_nonce", type: "uint256", internalType: "uint256" },
      { name: "_signature", type: "bytes", internalType: "bytes" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "transferToken",
    inputs: [
      { name: "token", type: "address", internalType: "address" },
      { name: "to", type: "address", internalType: "address" },
      { name: "amount", type: "uint256", internalType: "uint256" },
      { name: "_ownerId", type: "uint256", internalType: "uint256" },
      { name: "_passwdAddr", type: "address", internalType: "address" },
      { name: "_nonce", type: "uint256", internalType: "uint256" },
      { name: "_signature", type: "bytes", internalType: "bytes" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
];

const queryAccount = adminAbi.filter((e) => e.name == "queryAccount");

const newAccount = adminAbi.filter((e) => e.name == "newAccount");

const transferETH = adminAbi.filter((e) => e.name == "transferETH");

export default { queryAccount, newAccount, transferETH };
