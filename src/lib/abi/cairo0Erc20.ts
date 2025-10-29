export const cairo0Erc20Abi = [
  {
    "name": "balanceOf",
    "type": "function",
    "inputs": [{ "name": "account", "type": "felt" }],
    "outputs": [{ "name": "balance", "type": "Uint256" }],
    "stateMutability": "view"
  },
  {
    "name": "decimals",
    "type": "function",
    "inputs": [],
    "outputs": [{ "name": "decimals", "type": "felt" }],
    "stateMutability": "view"
  },
  {
    "name": "symbol",
    "type": "function",
    "inputs": [],
    "outputs": [{ "name": "symbol", "type": "felt" }],
    "stateMutability": "view"
  },
  {
    "name": "name",
    "type": "function",
    "inputs": [],
    "outputs": [{ "name": "name", "type": "felt" }],
    "stateMutability": "view"
  },
  {
    "name": "approve",
    "type": "function",
    "inputs": [
      { "name": "spender", "type": "felt" },
      { "name": "amount", "type": "Uint256" }
    ],
    "outputs": [{ "name": "success", "type": "felt" }],
    "stateMutability": "external"
  },
  {
    "name": "allowance",
    "type": "function",
    "inputs": [
      { "name": "owner", "type": "felt" },
      { "name": "spender", "type": "felt" }
    ],
    "outputs": [{ "name": "remaining", "type": "Uint256" }],
    "stateMutability": "view"
  },
  {
    "name": "transfer",
    "type": "function",
    "inputs": [
      { "name": "recipient", "type": "felt" },
      { "name": "amount", "type": "Uint256" }
    ],
    "outputs": [{ "name": "success", "type": "felt" }],
    "stateMutability": "external"
  }
] as const;






