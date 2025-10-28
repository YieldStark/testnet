import { AccountInterface, uint256 } from 'starknet'
import { WBTC, VWBTC_ADDRESS } from './utils/Constants'

export type DepositParams = {
  account: AccountInterface
  address: string
  amountStr: string
  signTypedDataAsync: (args: any) => Promise<any>
  useSignature?: boolean
}

export async function depositVesuFlow(params: DepositParams): Promise<string> {
  const { account, address, amountStr, signTypedDataAsync, useSignature = true } = params

  if (!account?.address) throw new Error('Wallet not connected.')
  if (!address) throw new Error('Receiver address missing.')

  const parsed = Number(amountStr)
  if (!isFinite(parsed) || parsed <= 0) throw new Error('Invalid amount.')

  // Convert to 8 decimals (WBTC) and uint256
  const amountBigInt = BigInt(Math.floor(parsed * 1e8))
  const amountUint256 = uint256.bnToUint256(amountBigInt)

  // Use the proven working vWBTC batched calls approach
  return await depositToVWBTC(account, address, amountUint256)
}

async function depositToVWBTC(account: AccountInterface, address: string, amountUint256: any): Promise<string> {
  // Prepare approve call
  const approveCall = {
    contractAddress: WBTC,
    entrypoint: "approve",
    calldata: [
      VWBTC_ADDRESS,
      amountUint256.low,
      amountUint256.high,
    ],
  }

  // Prepare deposit call
  const depositCall = {
    contractAddress: VWBTC_ADDRESS,
    entrypoint: "deposit",
    calldata: [
      amountUint256.low,
      amountUint256.high,
      address, // receiver
    ],
  }

  // Execute both calls in a single transaction (multiWrite)
  const tx = await account.execute([approveCall, depositCall])
  
  // Wait for confirmation
  await account.waitForTransaction(tx.transaction_hash)
  
  return tx.transaction_hash
}

export async function onClickDeposit({
  account,
  address,
  signTypedDataAsync,
  inputAmount,
  setPending,
  setSuccess,
  setError,
  useSignature,
  onAfterConfirm,
}: {
  account: AccountInterface
  address: string
  signTypedDataAsync: (args: any) => Promise<any>
  inputAmount: string
  setPending: (b: boolean) => void
  setSuccess: (b: boolean) => void
  setError: (msg: string | null) => void
  useSignature: boolean
  onAfterConfirm?: (txHash: string) => Promise<void> | void
}) {
  try {
    setError(null)
    setPending(true)
    const txHash = await depositVesuFlow({
      account,
      address,
      amountStr: inputAmount,
      signTypedDataAsync,
      useSignature,
    })
    setSuccess(true)
    if (onAfterConfirm) await onAfterConfirm(txHash)
    return txHash
  } catch (err: any) {
    setError(err?.message ?? 'Deposit failed')
    throw err
  } finally {
    setPending(false)
  }
}




