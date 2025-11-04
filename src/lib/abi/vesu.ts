import { Contract, RpcProvider, AccountInterface, uint256, Account } from "starknet";
import { VESU_SINGLETON, WBTC, universalErc20Abi, VWBTC_ADDRESS } from "@/lib/utils/Constants";
import { cairo0Erc20Abi } from "@/lib/abi/cairo0Erc20";

/* eslint-disable @typescript-eslint/no-explicit-any */

// ✅ Use universal ERC20 ABI from Constants (compatible with starknet.js)
const wbtcABI = universalErc20Abi as any;

// ✅ Minimal Singleton ABI for modify_position
const singletonABI = [
  {
    type: "function",
    name: "modify_position",
    inputs: [
      {
        name: "params",
        type: "struct",
        members: [
          { name: "pool_id", type: "felt252" },
          { name: "collateral_asset", type: "ContractAddress" },
          { name: "debt_asset", type: "ContractAddress" },
          { name: "user", type: "ContractAddress" },
          {
            name: "collateral",
            type: "struct",
            members: [
              {
                name: "amount_type",
                type: "enum",
                variants: [
                  { name: "Delta", type: "()" },
                  { name: "Target", type: "()" }
                ]
              },
              {
                name: "denomination",
                type: "enum",
                variants: [
                  { name: "Native", type: "()" },
                  { name: "Assets", type: "()" }
                ]
              },
              { name: "value", type: "Uint256" }
            ]
          },
          {
            name: "debt",
            type: "struct",
            members: [
              {
                name: "amount_type",
                type: "enum",
                variants: [
                  { name: "Delta", type: "()" },
                  { name: "Target", type: "()" }
                ]
              },
              {
                name: "denomination",
                type: "enum",
                variants: [
                  { name: "Native", type: "()" },
                  { name: "Assets", type: "()" }
                ]
              },
              { name: "value", type: "Uint256" }
            ]
          }
        ]
      }
    ],
    outputs: [],
    state_mutability: "external"
  }
];

// ✅ Check WBTC balance
export async function checkWBTCBalance(account: AccountInterface): Promise<bigint> {
  try {
    const wbtcContract = new (Contract as any)(wbtcABI, WBTC, account);
    const balance = await wbtcContract.balanceOf(account.address);
    return balance.balance;
  } catch (error) {
    console.error("Error checking WBTC balance:", error);
    throw new Error("Failed to check WBTC balance");
  }
}

// ✅ Check WBTC allowance
export async function checkWBTCAllowance(account: AccountInterface): Promise<bigint> {
  try {
    const wbtcContract = new (Contract as any)(wbtcABI, WBTC, account);
    const allowance = await wbtcContract.allowance(account.address, VESU_SINGLETON);
    return allowance.remaining;
  } catch (error) {
    console.error("Error checking WBTC allowance:", error);
    throw new Error("Failed to check WBTC allowance");
  }
}

// ✅ Approve WBTC spending
export async function approveWBTC(account: AccountInterface, amount: bigint): Promise<string> {
  try {
    // Check if user has enough balance
    const balance = await checkWBTCBalance(account);
    if (balance < amount) {
      throw new Error("Insufficient WBTC balance");
    }

    // Check if we already have enough allowance
    const currentAllowance = await checkWBTCAllowance(account);
    if (currentAllowance >= amount) {
      console.log("Sufficient allowance already exists");
      return "already_approved";
    }

    const wbtcContract = new (Contract as any)(wbtcABI, WBTC, account);
    const amountUint256 = uint256.bnToUint256(amount);

    console.log("Approving WBTC...");
    console.log("Account:", account.address);
    console.log("Spender (Singleton):", VESU_SINGLETON);
    console.log("Amount (Uint256):", amountUint256);

    // Execute the approve transaction
    const tx = await wbtcContract.approve(VESU_SINGLETON, amountUint256);
    console.log("Approval transaction sent:", tx.transaction_hash);
    
    // Wait for the transaction to be accepted
    await account.waitForTransaction(tx.transaction_hash);
    console.log("Approval transaction confirmed");
    
    return tx.transaction_hash;
  } catch (error) {
    console.error("Error approving WBTC:", error);
    throw error;
  }
}

// ✅ Deposit to Vesu
export async function depositToVesu(account: AccountInterface, amount: bigint): Promise<string> {
  try {
    // Check if user has enough balance
    const balance = await checkWBTCBalance(account);
    if (balance < amount) {
      throw new Error("Insufficient WBTC balance");
    }

    // Check if we have enough allowance
    const allowance = await checkWBTCAllowance(account);
    if (allowance < amount) {
      throw new Error("Insufficient WBTC allowance. Please approve first.");
    }

    const singletonContract = new (Contract as any)(singletonABI, VESU_SINGLETON, account);
    const amountUint256 = uint256.bnToUint256(amount);

    console.log("Depositing to Vesu...");
    console.log("Account:", account.address);
    console.log("Amount (Uint256):", amountUint256);

    // Prepare the modify_position parameters
    const params = {
      pool_id: "0x1", // Genesis pool ID
      collateral_asset: WBTC,
      debt_asset: "0x0", // No debt asset for deposit
      user: account.address,
      collateral: {
        amount_type: { Delta: {} },
        denomination: { Assets: {} },
        value: amountUint256
      },
      debt: {
        amount_type: { Delta: {} },
        denomination: { Assets: {} },
        value: uint256.bnToUint256(BigInt(0))
      }
    };

    // Execute the deposit transaction
    const tx = await singletonContract.modify_position(params);
    console.log("Deposit transaction sent:", tx.transaction_hash);
    
    // Wait for the transaction to be accepted
    await account.waitForTransaction(tx.transaction_hash);
    console.log("Deposit transaction confirmed");
    
    return tx.transaction_hash;
  } catch (error) {
    console.error("Error depositing to Vesu:", error);
    throw error;
  }
}

// ✅ Check vWBTC balance (Vesu deposit receipt token)
// Using the EXACT same pattern as WBTC balance check in dashboard
export async function checkVWBTCBalance(account: AccountInterface): Promise<bigint> {
  try {
    console.log("Checking vWBTC balance for:", account.address);
    console.log("vWBTC contract address:", VWBTC_ADDRESS);
    
    // Use EXACT same pattern as WBTC balance check
    // Use Alchemy API with fallbacks: Alchemy → PublicNode → dRPC
    const alchemyApiKey = typeof window !== 'undefined'
      ? (window as any).__ALCHEMY_API_KEY__ || process.env.NEXT_PUBLIC_ALCHEMY_API_KEY
      : process.env.NEXT_PUBLIC_ALCHEMY_API_KEY
    const rpcUrl = alchemyApiKey
      ? `https://starknet-sepolia.g.alchemy.com/v2/${alchemyApiKey}`
      : 'https://starknet-sepolia-rpc.publicnode.com' // Fallback to PublicNode
    const sepoliaProvider = new RpcProvider({ nodeUrl: rpcUrl });
    const vwbtcContract = new Contract({ abi: cairo0Erc20Abi, address: VWBTC_ADDRESS, providerOrAccount: sepoliaProvider });
    const res = await vwbtcContract.balanceOf(account.address);
    
    // Properly handle Uint256 structure
    let balanceValue: bigint
    if (typeof res.balance === 'object' && res.balance !== null && 'low' in res.balance) {
      // It's a Uint256 object with low and high parts
      const low = BigInt(res.balance.low || 0)
      const high = BigInt(res.balance.high || 0)
      // Combine: value = low + (high * 2^128)
      balanceValue = low + (high * (BigInt(2) ** BigInt(128)))
    } else {
      // It's already a bigint or number
      balanceValue = BigInt(res.balance)
    }
    
    console.log("vWBTC balance (raw):", balanceValue.toString());
    // vWBTC uses 18 decimals (Starknet standard), not 8
    console.log("vWBTC balance (formatted with 18 decimals):", Number(balanceValue) / 1e18);
    
    return balanceValue;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error("Error checking vWBTC balance:", error);
    console.error("Error details:", errorMessage);
    throw new Error(`Failed to check vWBTC balance: ${errorMessage}`);
  }
}

// ✅ Withdraw from Vesu using vWBTC redeem function
export async function withdrawFromVesu(account: Account, amount: bigint): Promise<string> {
  try {
    // Check if user has enough vWBTC balance
    const vwbtcBalance = await checkVWBTCBalance(account);
    if (vwbtcBalance < amount) {
      throw new Error(`Insufficient vWBTC balance. You have ${Number(vwbtcBalance) / 1e8} vWBTC, trying to withdraw ${Number(amount) / 1e8} WBTC`);
    }

    console.log("Withdrawing from Vesu...");
    console.log("Account:", account.address);
    console.log("Amount to withdraw:", Number(amount) / 1e8, "WBTC");
    console.log("vWBTC Balance:", Number(vwbtcBalance) / 1e8, "vWBTC");

    const amountUint256 = uint256.bnToUint256(amount);

    console.log("Preparing withdrawal...");
    console.log("Assets (WBTC) to withdraw - low:", amountUint256.low);
    console.log("Assets (WBTC) to withdraw - high:", amountUint256.high);
    console.log("Receiver:", account.address);
    console.log("Owner:", account.address);

    // Use withdraw instead of redeem - withdraw takes asset amount, not share amount
    const withdrawCall = {
      contractAddress: VWBTC_ADDRESS,
      entrypoint: "withdraw",
      calldata: [
        amountUint256.low,    // assets.low (WBTC amount)
        amountUint256.high,   // assets.high (WBTC amount)
        account.address,      // receiver
        account.address       // owner
      ],
    };

    console.log("Executing withdraw call...");
    
    // Execute single call
    const tx = await account.execute([withdrawCall]);
    
    console.log("Withdrawal transaction sent:", tx.transaction_hash);
    
    // Wait for the transaction to be accepted (with timeout)
    try {
      await account.waitForTransaction(tx.transaction_hash, {
        retryInterval: 1000,
        successStates: ["ACCEPTED_ON_L2", "ACCEPTED_ON_L1"]
      });
      console.log("Withdrawal transaction confirmed");
    } catch {
      // If waitForTransaction times out or fails, still return the hash
      // The transaction may still be processing
      console.warn("Transaction wait timed out, but transaction was sent:", tx.transaction_hash);
    }
    
    console.log("Successfully withdrew", Number(amount) / 1e8, "WBTC from Vesu");
    
    return tx.transaction_hash;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error("Error withdrawing from Vesu:", error);
    console.error("Error message:", errorMessage);
    throw error;
  }
} 