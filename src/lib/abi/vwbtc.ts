// vWBTC (Vesu WBTC) ABI - Minimal ABI for balance checking and withdrawal
// This is a vault token that represents deposits in the Vesu protocol

export const vwbtcAbi = [
  {
    "name": "balance_of",
    "type": "function",
    "inputs": [
      {
        "name": "account",
        "type": "felt"
      }
    ],
    "outputs": [
      {
        "name": "balance",
        "type": "Uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "name": "balanceOf",
    "type": "function",
    "inputs": [
      {
        "name": "account",
        "type": "felt"
      }
    ],
    "outputs": [
      {
        "name": "balance",
        "type": "Uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "name": "redeem",
    "type": "function",
    "inputs": [
      {
        "name": "shares",
        "type": "Uint256"
      },
      {
        "name": "receiver",
        "type": "felt"
      },
      {
        "name": "owner",
        "type": "felt"
      }
    ],
    "outputs": [
      {
        "name": "assets",
        "type": "Uint256"
      }
    ]
  },
  {
    "name": "withdraw",
    "type": "function",
    "inputs": [
      {
        "name": "assets",
        "type": "Uint256"
      },
      {
        "name": "receiver",
        "type": "felt"
      },
      {
        "name": "owner",
        "type": "felt"
      }
    ],
    "outputs": [
      {
        "name": "shares",
        "type": "Uint256"
      }
    ]
  }
];

