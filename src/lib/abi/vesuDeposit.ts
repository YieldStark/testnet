import { Contract, WalletAccount, Call, RpcProvider, uint256, AccountInterface } from "starknet";
import { shortString } from "starknet";

// Addresses and ABIs
import { WBTC as WBTC_1 } from "@/lib/utils/Constants";
const VWBTC_ADDRESS = "0x076ce66eba78210a836fca94ab91828c0f6941ad88585a700f3e473a9b4af870";
const RPC_URL = "https://starknet-sepolia.public.blastapi.io";

// Minimal ABIs
const erc20Abi = [
  {
    "type": "impl",
    "name": "Mintable",
    "interface_name": "vesu::test::mock_asset::IMintable"
  },
  {
    "type": "struct",
    "name": "core::integer::u256",
    "members": [
      {
        "name": "low",
        "type": "core::integer::u128"
      },
      {
        "name": "high",
        "type": "core::integer::u128"
      }
    ]
  },
  {
    "type": "enum",
    "name": "core::bool",
    "variants": [
      {
        "name": "False",
        "type": "()"
      },
      {
        "name": "True",
        "type": "()"
      }
    ]
  },
  {
    "type": "interface",
    "name": "vesu::test::mock_asset::IMintable",
    "items": [
      {
        "type": "function",
        "name": "mint",
        "inputs": [
          {
            "name": "recipient",
            "type": "core::starknet::contract_address::ContractAddress"
          },
          {
            "name": "amount",
            "type": "core::integer::u256"
          }
        ],
        "outputs": [
          {
            "type": "core::bool"
          }
        ],
        "state_mutability": "external"
      }
    ]
  },
  {
    "type": "impl",
    "name": "ERC20Impl",
    "interface_name": "vesu::vendor::erc20::IERC20"
  },
  {
    "type": "interface",
    "name": "vesu::vendor::erc20::IERC20",
    "items": [
      {
        "type": "function",
        "name": "total_supply",
        "inputs": [],
        "outputs": [
          {
            "type": "core::integer::u256"
          }
        ],
        "state_mutability": "view"
      },
      {
        "type": "function",
        "name": "balance_of",
        "inputs": [
          {
            "name": "account",
            "type": "core::starknet::contract_address::ContractAddress"
          }
        ],
        "outputs": [
          {
            "type": "core::integer::u256"
          }
        ],
        "state_mutability": "view"
      },
      {
        "type": "function",
        "name": "allowance",
        "inputs": [
          {
            "name": "owner",
            "type": "core::starknet::contract_address::ContractAddress"
          },
          {
            "name": "spender",
            "type": "core::starknet::contract_address::ContractAddress"
          }
        ],
        "outputs": [
          {
            "type": "core::integer::u256"
          }
        ],
        "state_mutability": "view"
      },
      {
        "type": "function",
        "name": "transfer",
        "inputs": [
          {
            "name": "recipient",
            "type": "core::starknet::contract_address::ContractAddress"
          },
          {
            "name": "amount",
            "type": "core::integer::u256"
          }
        ],
        "outputs": [
          {
            "type": "core::bool"
          }
        ],
        "state_mutability": "external"
      },
      {
        "type": "function",
        "name": "transfer_from",
        "inputs": [
          {
            "name": "sender",
            "type": "core::starknet::contract_address::ContractAddress"
          },
          {
            "name": "recipient",
            "type": "core::starknet::contract_address::ContractAddress"
          },
          {
            "name": "amount",
            "type": "core::integer::u256"
          }
        ],
        "outputs": [
          {
            "type": "core::bool"
          }
        ],
        "state_mutability": "external"
      },
      {
        "type": "function",
        "name": "approve",
        "inputs": [
          {
            "name": "spender",
            "type": "core::starknet::contract_address::ContractAddress"
          },
          {
            "name": "amount",
            "type": "core::integer::u256"
          }
        ],
        "outputs": [
          {
            "type": "core::bool"
          }
        ],
        "state_mutability": "external"
      }
    ]
  },
  {
    "type": "impl",
    "name": "ERC20MetadataImpl",
    "interface_name": "vesu::vendor::erc20::IERC20Metadata"
  },
  {
    "type": "interface",
    "name": "vesu::vendor::erc20::IERC20Metadata",
    "items": [
      {
        "type": "function",
        "name": "name",
        "inputs": [],
        "outputs": [
          {
            "type": "core::felt252"
          }
        ],
        "state_mutability": "view"
      },
      {
        "type": "function",
        "name": "symbol",
        "inputs": [],
        "outputs": [
          {
            "type": "core::felt252"
          }
        ],
        "state_mutability": "view"
      },
      {
        "type": "function",
        "name": "decimals",
        "inputs": [],
        "outputs": [
          {
            "type": "core::integer::u8"
          }
        ],
        "state_mutability": "view"
      }
    ]
  },
  {
    "type": "impl",
    "name": "ERC20CamelOnlyImpl",
    "interface_name": "vesu::vendor::erc20::IERC20CamelOnly"
  },
  {
    "type": "interface",
    "name": "vesu::vendor::erc20::IERC20CamelOnly",
    "items": [
      {
        "type": "function",
        "name": "totalSupply",
        "inputs": [],
        "outputs": [
          {
            "type": "core::integer::u256"
          }
        ],
        "state_mutability": "view"
      },
      {
        "type": "function",
        "name": "balanceOf",
        "inputs": [
          {
            "name": "account",
            "type": "core::starknet::contract_address::ContractAddress"
          }
        ],
        "outputs": [
          {
            "type": "core::integer::u256"
          }
        ],
        "state_mutability": "view"
      },
      {
        "type": "function",
        "name": "transferFrom",
        "inputs": [
          {
            "name": "sender",
            "type": "core::starknet::contract_address::ContractAddress"
          },
          {
            "name": "recipient",
            "type": "core::starknet::contract_address::ContractAddress"
          },
          {
            "name": "amount",
            "type": "core::integer::u256"
          }
        ],
        "outputs": [
          {
            "type": "core::bool"
          }
        ],
        "state_mutability": "external"
      }
    ]
  },
  {
    "type": "constructor",
    "name": "constructor",
    "inputs": [
      {
        "name": "name",
        "type": "core::felt252"
      },
      {
        "name": "symbol",
        "type": "core::felt252"
      },
      {
        "name": "decimals",
        "type": "core::integer::u8"
      },
      {
        "name": "initial_supply",
        "type": "core::integer::u256"
      },
      {
        "name": "recipient",
        "type": "core::starknet::contract_address::ContractAddress"
      }
    ]
  },
  {
    "type": "event",
    "name": "vesu::vendor::erc20_component::ERC20Component::Transfer",
    "kind": "struct",
    "members": [
      {
        "name": "from",
        "type": "core::starknet::contract_address::ContractAddress",
        "kind": "key"
      },
      {
        "name": "to",
        "type": "core::starknet::contract_address::ContractAddress",
        "kind": "key"
      },
      {
        "name": "value",
        "type": "core::integer::u256",
        "kind": "data"
      }
    ]
  },
  {
    "type": "event",
    "name": "vesu::vendor::erc20_component::ERC20Component::Approval",
    "kind": "struct",
    "members": [
      {
        "name": "owner",
        "type": "core::starknet::contract_address::ContractAddress",
        "kind": "key"
      },
      {
        "name": "spender",
        "type": "core::starknet::contract_address::ContractAddress",
        "kind": "key"
      },
      {
        "name": "value",
        "type": "core::integer::u256",
        "kind": "data"
      }
    ]
  },
  {
    "type": "event",
    "name": "vesu::vendor::erc20_component::ERC20Component::Event",
    "kind": "enum",
    "variants": [
      {
        "name": "Transfer",
        "type": "vesu::vendor::erc20_component::ERC20Component::Transfer",
        "kind": "nested"
      },
      {
        "name": "Approval",
        "type": "vesu::vendor::erc20_component::ERC20Component::Approval",
        "kind": "nested"
      }
    ]
  },
  {
    "type": "event",
    "name": "vesu::test::mock_asset::MockAsset::Event",
    "kind": "enum",
    "variants": [
      {
        "name": "ERC20Event",
        "type": "vesu::vendor::erc20_component::ERC20Component::Event",
        "kind": "flat"
      }
    ]
  }
];

const vTokenAbi = [
  {
    "type": "impl",
    "name": "VToken",
    "interface_name": "vesu::v_token::IVToken"
  },
  {
    "type": "struct",
    "name": "core::integer::u256",
    "members": [
      {
        "name": "low",
        "type": "core::integer::u128"
      },
      {
        "name": "high",
        "type": "core::integer::u128"
      }
    ]
  },
  {
    "type": "enum",
    "name": "core::bool",
    "variants": [
      {
        "name": "False",
        "type": "()"
      },
      {
        "name": "True",
        "type": "()"
      }
    ]
  },
  {
    "type": "interface",
    "name": "vesu::v_token::IVToken",
    "items": [
      {
        "type": "function",
        "name": "extension",
        "inputs": [],
        "outputs": [
          {
            "type": "core::starknet::contract_address::ContractAddress"
          }
        ],
        "state_mutability": "view"
      },
      {
        "type": "function",
        "name": "pool_id",
        "inputs": [],
        "outputs": [
          {
            "type": "core::felt252"
          }
        ],
        "state_mutability": "view"
      },
      {
        "type": "function",
        "name": "approve_extension",
        "inputs": [],
        "outputs": [],
        "state_mutability": "external"
      },
      {
        "type": "function",
        "name": "mint_v_token",
        "inputs": [
          {
            "name": "recipient",
            "type": "core::starknet::contract_address::ContractAddress"
          },
          {
            "name": "amount",
            "type": "core::integer::u256"
          }
        ],
        "outputs": [
          {
            "type": "core::bool"
          }
        ],
        "state_mutability": "external"
      },
      {
        "type": "function",
        "name": "burn_v_token",
        "inputs": [
          {
            "name": "from",
            "type": "core::starknet::contract_address::ContractAddress"
          },
          {
            "name": "amount",
            "type": "core::integer::u256"
          }
        ],
        "outputs": [
          {
            "type": "core::bool"
          }
        ],
        "state_mutability": "external"
      }
    ]
  },
  {
    "type": "impl",
    "name": "IERC4626",
    "interface_name": "vesu::v_token::IERC4626"
  },
  {
    "type": "interface",
    "name": "vesu::v_token::IERC4626",
    "items": [
      {
        "type": "function",
        "name": "asset",
        "inputs": [],
        "outputs": [
          {
            "type": "core::starknet::contract_address::ContractAddress"
          }
        ],
        "state_mutability": "view"
      },
      {
        "type": "function",
        "name": "total_assets",
        "inputs": [],
        "outputs": [
          {
            "type": "core::integer::u256"
          }
        ],
        "state_mutability": "view"
      },
      {
        "type": "function",
        "name": "convert_to_shares",
        "inputs": [
          {
            "name": "assets",
            "type": "core::integer::u256"
          }
        ],
        "outputs": [
          {
            "type": "core::integer::u256"
          }
        ],
        "state_mutability": "view"
      },
      {
        "type": "function",
        "name": "convert_to_assets",
        "inputs": [
          {
            "name": "shares",
            "type": "core::integer::u256"
          }
        ],
        "outputs": [
          {
            "type": "core::integer::u256"
          }
        ],
        "state_mutability": "view"
      },
      {
        "type": "function",
        "name": "max_deposit",
        "inputs": [
          {
            "name": "receiver",
            "type": "core::starknet::contract_address::ContractAddress"
          }
        ],
        "outputs": [
          {
            "type": "core::integer::u256"
          }
        ],
        "state_mutability": "view"
      },
      {
        "type": "function",
        "name": "preview_deposit",
        "inputs": [
          {
            "name": "assets",
            "type": "core::integer::u256"
          }
        ],
        "outputs": [
          {
            "type": "core::integer::u256"
          }
        ],
        "state_mutability": "view"
      },
      {
        "type": "function",
        "name": "deposit",
        "inputs": [
          {
            "name": "assets",
            "type": "core::integer::u256"
          },
          {
            "name": "receiver",
            "type": "core::starknet::contract_address::ContractAddress"
          }
        ],
        "outputs": [
          {
            "type": "core::integer::u256"
          }
        ],
        "state_mutability": "external"
      },
      {
        "type": "function",
        "name": "max_mint",
        "inputs": [
          {
            "name": "receiver",
            "type": "core::starknet::contract_address::ContractAddress"
          }
        ],
        "outputs": [
          {
            "type": "core::integer::u256"
          }
        ],
        "state_mutability": "view"
      },
      {
        "type": "function",
        "name": "preview_mint",
        "inputs": [
          {
            "name": "shares",
            "type": "core::integer::u256"
          }
        ],
        "outputs": [
          {
            "type": "core::integer::u256"
          }
        ],
        "state_mutability": "view"
      },
      {
        "type": "function",
        "name": "mint",
        "inputs": [
          {
            "name": "shares",
            "type": "core::integer::u256"
          },
          {
            "name": "receiver",
            "type": "core::starknet::contract_address::ContractAddress"
          }
        ],
        "outputs": [
          {
            "type": "core::integer::u256"
          }
        ],
        "state_mutability": "external"
      },
      {
        "type": "function",
        "name": "max_withdraw",
        "inputs": [
          {
            "name": "owner",
            "type": "core::starknet::contract_address::ContractAddress"
          }
        ],
        "outputs": [
          {
            "type": "core::integer::u256"
          }
        ],
        "state_mutability": "view"
      },
      {
        "type": "function",
        "name": "preview_withdraw",
        "inputs": [
          {
            "name": "assets",
            "type": "core::integer::u256"
          }
        ],
        "outputs": [
          {
            "type": "core::integer::u256"
          }
        ],
        "state_mutability": "view"
      },
      {
        "type": "function",
        "name": "withdraw",
        "inputs": [
          {
            "name": "assets",
            "type": "core::integer::u256"
          },
          {
            "name": "receiver",
            "type": "core::starknet::contract_address::ContractAddress"
          },
          {
            "name": "owner",
            "type": "core::starknet::contract_address::ContractAddress"
          }
        ],
        "outputs": [
          {
            "type": "core::integer::u256"
          }
        ],
        "state_mutability": "external"
      },
      {
        "type": "function",
        "name": "max_redeem",
        "inputs": [
          {
            "name": "owner",
            "type": "core::starknet::contract_address::ContractAddress"
          }
        ],
        "outputs": [
          {
            "type": "core::integer::u256"
          }
        ],
        "state_mutability": "view"
      },
      {
        "type": "function",
        "name": "preview_redeem",
        "inputs": [
          {
            "name": "shares",
            "type": "core::integer::u256"
          }
        ],
        "outputs": [
          {
            "type": "core::integer::u256"
          }
        ],
        "state_mutability": "view"
      },
      {
        "type": "function",
        "name": "redeem",
        "inputs": [
          {
            "name": "shares",
            "type": "core::integer::u256"
          },
          {
            "name": "receiver",
            "type": "core::starknet::contract_address::ContractAddress"
          },
          {
            "name": "owner",
            "type": "core::starknet::contract_address::ContractAddress"
          }
        ],
        "outputs": [
          {
            "type": "core::integer::u256"
          }
        ],
        "state_mutability": "external"
      }
    ]
  },
  {
    "type": "impl",
    "name": "ERC20Impl",
    "interface_name": "vesu::vendor::erc20::IERC20"
  },
  {
    "type": "interface",
    "name": "vesu::vendor::erc20::IERC20",
    "items": [
      {
        "type": "function",
        "name": "total_supply",
        "inputs": [],
        "outputs": [
          {
            "type": "core::integer::u256"
          }
        ],
        "state_mutability": "view"
      },
      {
        "type": "function",
        "name": "balance_of",
        "inputs": [
          {
            "name": "account",
            "type": "core::starknet::contract_address::ContractAddress"
          }
        ],
        "outputs": [
          {
            "type": "core::integer::u256"
          }
        ],
        "state_mutability": "view"
      },
      {
        "type": "function",
        "name": "allowance",
        "inputs": [
          {
            "name": "owner",
            "type": "core::starknet::contract_address::ContractAddress"
          },
          {
            "name": "spender",
            "type": "core::starknet::contract_address::ContractAddress"
          }
        ],
        "outputs": [
          {
            "type": "core::integer::u256"
          }
        ],
        "state_mutability": "view"
      },
      {
        "type": "function",
        "name": "transfer",
        "inputs": [
          {
            "name": "recipient",
            "type": "core::starknet::contract_address::ContractAddress"
          },
          {
            "name": "amount",
            "type": "core::integer::u256"
          }
        ],
        "outputs": [
          {
            "type": "core::bool"
          }
        ],
        "state_mutability": "external"
      },
      {
        "type": "function",
        "name": "transfer_from",
        "inputs": [
          {
            "name": "sender",
            "type": "core::starknet::contract_address::ContractAddress"
          },
          {
            "name": "recipient",
            "type": "core::starknet::contract_address::ContractAddress"
          },
          {
            "name": "amount",
            "type": "core::integer::u256"
          }
        ],
        "outputs": [
          {
            "type": "core::bool"
          }
        ],
        "state_mutability": "external"
      },
      {
        "type": "function",
        "name": "approve",
        "inputs": [
          {
            "name": "spender",
            "type": "core::starknet::contract_address::ContractAddress"
          },
          {
            "name": "amount",
            "type": "core::integer::u256"
          }
        ],
        "outputs": [
          {
            "type": "core::bool"
          }
        ],
        "state_mutability": "external"
      }
    ]
  },
  {
    "type": "impl",
    "name": "ERC20MetadataImpl",
    "interface_name": "vesu::vendor::erc20::IERC20Metadata"
  },
  {
    "type": "interface",
    "name": "vesu::vendor::erc20::IERC20Metadata",
    "items": [
      {
        "type": "function",
        "name": "name",
        "inputs": [],
        "outputs": [
          {
            "type": "core::felt252"
          }
        ],
        "state_mutability": "view"
      },
      {
        "type": "function",
        "name": "symbol",
        "inputs": [],
        "outputs": [
          {
            "type": "core::felt252"
          }
        ],
        "state_mutability": "view"
      },
      {
        "type": "function",
        "name": "decimals",
        "inputs": [],
        "outputs": [
          {
            "type": "core::integer::u8"
          }
        ],
        "state_mutability": "view"
      }
    ]
  },
  {
    "type": "impl",
    "name": "ERC20CamelOnlyImpl",
    "interface_name": "vesu::vendor::erc20::IERC20CamelOnly"
  },
  {
    "type": "interface",
    "name": "vesu::vendor::erc20::IERC20CamelOnly",
    "items": [
      {
        "type": "function",
        "name": "totalSupply",
        "inputs": [],
        "outputs": [
          {
            "type": "core::integer::u256"
          }
        ],
        "state_mutability": "view"
      },
      {
        "type": "function",
        "name": "balanceOf",
        "inputs": [
          {
            "name": "account",
            "type": "core::starknet::contract_address::ContractAddress"
          }
        ],
        "outputs": [
          {
            "type": "core::integer::u256"
          }
        ],
        "state_mutability": "view"
      },
      {
        "type": "function",
        "name": "transferFrom",
        "inputs": [
          {
            "name": "sender",
            "type": "core::starknet::contract_address::ContractAddress"
          },
          {
            "name": "recipient",
            "type": "core::starknet::contract_address::ContractAddress"
          },
          {
            "name": "amount",
            "type": "core::integer::u256"
          }
        ],
        "outputs": [
          {
            "type": "core::bool"
          }
        ],
        "state_mutability": "external"
      }
    ]
  },
  {
    "type": "constructor",
    "name": "constructor",
    "inputs": [
      {
        "name": "name",
        "type": "core::felt252"
      },
      {
        "name": "symbol",
        "type": "core::felt252"
      },
      {
        "name": "decimals",
        "type": "core::integer::u8"
      },
      {
        "name": "pool_id",
        "type": "core::felt252"
      },
      {
        "name": "extension",
        "type": "core::starknet::contract_address::ContractAddress"
      },
      {
        "name": "asset",
        "type": "core::starknet::contract_address::ContractAddress"
      }
    ]
  },
  {
    "type": "event",
    "name": "vesu::vendor::erc20_component::ERC20Component::Transfer",
    "kind": "struct",
    "members": [
      {
        "name": "from",
        "type": "core::starknet::contract_address::ContractAddress",
        "kind": "key"
      },
      {
        "name": "to",
        "type": "core::starknet::contract_address::ContractAddress",
        "kind": "key"
      },
      {
        "name": "value",
        "type": "core::integer::u256",
        "kind": "data"
      }
    ]
  },
  {
    "type": "event",
    "name": "vesu::vendor::erc20_component::ERC20Component::Approval",
    "kind": "struct",
    "members": [
      {
        "name": "owner",
        "type": "core::starknet::contract_address::ContractAddress",
        "kind": "key"
      },
      {
        "name": "spender",
        "type": "core::starknet::contract_address::ContractAddress",
        "kind": "key"
      },
      {
        "name": "value",
        "type": "core::integer::u256",
        "kind": "data"
      }
    ]
  },
  {
    "type": "event",
    "name": "vesu::vendor::erc20_component::ERC20Component::Event",
    "kind": "enum",
    "variants": [
      {
        "name": "Transfer",
        "type": "vesu::vendor::erc20_component::ERC20Component::Transfer",
        "kind": "nested"
      },
      {
        "name": "Approval",
        "type": "vesu::vendor::erc20_component::ERC20Component::Approval",
        "kind": "nested"
      }
    ]
  },
  {
    "type": "event",
    "name": "vesu::v_token::VToken::Deposit",
    "kind": "struct",
    "members": [
      {
        "name": "sender",
        "type": "core::starknet::contract_address::ContractAddress",
        "kind": "key"
      },
      {
        "name": "owner",
        "type": "core::starknet::contract_address::ContractAddress",
        "kind": "key"
      },
      {
        "name": "assets",
        "type": "core::integer::u256",
        "kind": "data"
      },
      {
        "name": "shares",
        "type": "core::integer::u256",
        "kind": "data"
      }
    ]
  },
  {
    "type": "event",
    "name": "vesu::v_token::VToken::Withdraw",
    "kind": "struct",
    "members": [
      {
        "name": "sender",
        "type": "core::starknet::contract_address::ContractAddress",
        "kind": "key"
      },
      {
        "name": "receiver",
        "type": "core::starknet::contract_address::ContractAddress",
        "kind": "key"
      },
      {
        "name": "owner",
        "type": "core::starknet::contract_address::ContractAddress",
        "kind": "key"
      },
      {
        "name": "assets",
        "type": "core::integer::u256",
        "kind": "data"
      },
      {
        "name": "shares",
        "type": "core::integer::u256",
        "kind": "data"
      }
    ]
  },
  {
    "type": "event",
    "name": "vesu::v_token::VToken::Event",
    "kind": "enum",
    "variants": [
      {
        "name": "ERC20Event",
        "type": "vesu::vendor::erc20_component::ERC20Component::Event",
        "kind": "flat"
      },
      {
        "name": "Deposit",
        "type": "vesu::v_token::VToken::Deposit",
        "kind": "nested"
      },
      {
        "name": "Withdraw",
        "type": "vesu::v_token::VToken::Withdraw",
        "kind": "nested"
      }
    ]
  }
];


// End of vToken Abi

// Main Functions
const getVTokenContract = (address: string, provider: RpcProvider | WalletAccount) =>
  new (Contract as any)(vTokenAbi as any, address, provider);

const getERC20Contract = (address: string, provider: RpcProvider | WalletAccount) =>
  new (Contract as any)(erc20Abi as any, address, provider);

// Prepare batched calls
export const getDepositCalls = (
  depositAmount: bigint,
  account: AccountInterface
): Call[] => {
  const provider = new RpcProvider({ nodeUrl: RPC_URL });
  const vtokenContract = getVTokenContract(VWBTC_ADDRESS, provider);
  const tokenContract = getERC20Contract(WBTC_1, provider);

  const approveVTokenCall = tokenContract.populate("approve", [
    VWBTC_ADDRESS,
    uint256.bnToUint256(depositAmount).low,
    uint256.bnToUint256(depositAmount).high
  ]);
  const depositVTokenCall = vtokenContract.populate("deposit", [
    uint256.bnToUint256(depositAmount).low,
    uint256.bnToUint256(depositAmount).high,
    account.address
  ]);

  return [approveVTokenCall, depositVTokenCall];
};

export async function vesuDepositWithSignature(
  account: AccountInterface, 
  address: string, 
  amount: string, 
  signTypedDataAsync: any
) {
  try {
    // 1. Request signature
    const signature = await signTypedDataAsync({
      domain: {
        name: "YieldStark",
        version: "1",
        chainId: shortString.encodeShortString("SN_SEPOLIA"),
      },
      types: {
        StarkNetDomain: [
          { name: "name", type: "string" },
          { name: "version", type: "string" },
          { name: "chainId", type: "string" },
        ],
        Deposit: [
          { name: "amount", type: "string" },
          { name: "receiver", type: "string" },
        ],
      },
      primaryType: "Deposit",
      message: {
        amount,
        receiver: address,
      },
    });

    if (!signature) {
      throw new Error("Signature was not provided.");
    }

    // 2. Execute deposit
    const depositAmount = BigInt(Math.floor(parseFloat(amount) * 1e8));
    const calls = getDepositCalls(depositAmount, account);
    
    // Execute the transaction using AccountInterface
    const tx = await account.execute(calls);
    console.log("Deposit transaction sent:", tx.transaction_hash);
    
    // Wait for transaction confirmation
    await account.waitForTransaction(tx.transaction_hash);
    console.log("Deposit transaction confirmed");
    
    return tx.transaction_hash;
  } catch (error) {
    console.error("Error in vesuDepositWithSignature:", error);
    throw error;
  }
} 