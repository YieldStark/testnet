import { NextRequest, NextResponse } from 'next/server'
import { Account, RpcProvider, uint256, CallData } from 'starknet'
import { WBTC, universalStrkAddress } from '@/lib/utils/Constants'

// Simple in-memory tracking (resets on server restart)
const claimedAddresses = new Set<string>()

/**
 * Faucet endpoint that distributes testnet tokens to users
 * 
 * Silently distributes BOTH:
 * - WBTC (shown to user on frontend)
 * - 0.5 STRK (bonus, not shown on frontend)
 * 
 * Both transfers happen in a single batched transaction
 */
export async function POST(request: NextRequest) {
  try {
    const { address, amount } = await request.json()

    // Basic validation
    if (!address || !address.startsWith('0x')) {
      return NextResponse.json({ error: 'Invalid address' }, { status: 400 })
    }

    // Check if already claimed
    if (claimedAddresses.has(address.toLowerCase())) {
      return NextResponse.json({ error: 'Already claimed' }, { status: 400 })
    }

    // Check env vars
    if (!process.env.FAUCET_WALLET_ADDRESS || !process.env.FAUCET_PRIVATE_KEY) {
      console.error('❌ Faucet not configured - add FAUCET_WALLET_ADDRESS and FAUCET_PRIVATE_KEY to .env.local')
      return NextResponse.json({ error: 'Faucet not configured' }, { status: 500 })
    }

    // 🔍 Environment Variables Check (Server-side)
    console.log('\n=== Server-side Environment Variables Status ===')
    console.log('FAUCET_WALLET_ADDRESS:', process.env.FAUCET_WALLET_ADDRESS ? `✅ ${process.env.FAUCET_WALLET_ADDRESS.substring(0, 10)}...${process.env.FAUCET_WALLET_ADDRESS.substring(process.env.FAUCET_WALLET_ADDRESS.length - 6)}` : '❌ Not set')
    console.log('FAUCET_PRIVATE_KEY:', process.env.FAUCET_PRIVATE_KEY ? `✅ Set (${process.env.FAUCET_PRIVATE_KEY.length} chars, hidden for security)` : '❌ Not set')
    console.log('RPC_URL:', process.env.RPC_URL || '❌ Not set (will use default)')
    console.log('NEXT_PUBLIC_RPC_URL:', process.env.NEXT_PUBLIC_RPC_URL || '❌ Not set')
    console.log('=================================================\n')

    console.log(`\n🚰 FAUCET TRANSFER: ${amount} WBTC → ${address}`)

    // 1. Setup provider - Use Alchemy API with fallbacks
    const alchemyApiKey = process.env.ALCHEMY_API_KEY || process.env.NEXT_PUBLIC_ALCHEMY_API_KEY
    let rpcUrl: string
    
    if (alchemyApiKey) {
      rpcUrl = `https://starknet-sepolia.g.alchemy.com/v2/${alchemyApiKey}`
    } else {
      // Fallback chain: PublicNode → dRPC
      // Try PublicNode first (free, no API key needed)
      rpcUrl = 'https://starknet-sepolia-rpc.publicnode.com'
      console.log('ℹ️ Using PublicNode RPC as fallback (Alchemy not configured)')
    }
    
    const provider = new RpcProvider({
      nodeUrl: rpcUrl
    })

    // 2. Create faucet account with private key
    const faucetAccount = new Account({
      provider,
      address: process.env.FAUCET_WALLET_ADDRESS,
      signer: process.env.FAUCET_PRIVATE_KEY
    })

    // 3. Convert amounts
    // WBTC has 8 decimals
    const wbtcAmountBigInt = BigInt(Math.floor(parseFloat(amount) * 1e8))
    const wbtcAmountUint256 = uint256.bnToUint256(wbtcAmountBigInt)
    
    // STRK has 18 decimals - send 1 STRK
    const strkAmountBigInt = BigInt(Math.floor(1 * 1e18))
    const strkAmountUint256 = uint256.bnToUint256(strkAmountBigInt)

    console.log('💰 Transferring from faucet wallet:', faucetAccount.address)
    console.log('📍 To user wallet:', address)
    console.log('💵 WBTC Amount:', amount, 'WBTC')
    console.log('💵 STRK Amount: 1 STRK (silent distribution)')

    // 4. BATCH TRANSFER - Send both WBTC and STRK in one transaction
    const calls = [
      // First call: Transfer WBTC
      {
        contractAddress: WBTC,
        entrypoint: 'transfer',
        calldata: CallData.compile({
          recipient: address,
          amount: wbtcAmountUint256
        })
      },
      // Second call: Transfer STRK (silent, not shown on frontend)
      {
        contractAddress: universalStrkAddress,
        entrypoint: 'transfer',
        calldata: CallData.compile({
          recipient: address,
          amount: strkAmountUint256
        })
      }
    ]

    const tx = await faucetAccount.execute(calls)
    
    console.log('📤 Batch transaction submitted:', tx.transaction_hash)
    console.log('   ↳ Sent', amount, 'WBTC')
    console.log('   ↳ Sent 1 STRK (silent)')
    console.log('⏳ Transaction will be confirmed in ~30-60 seconds')

    // Mark as claimed immediately (optimistic)
    claimedAddresses.add(address.toLowerCase())

    // Return immediately - don't wait for confirmation
    // Transaction will still process in the background
    return NextResponse.json({
      success: true,
      txHash: tx.transaction_hash,
      amount: amount,  // Only WBTC amount is returned (STRK is bonus, not shown)
      pending: true    // Indicates transaction is pending confirmation
    })

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Transfer failed'
    console.error('❌ Faucet error:', errorMessage)
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

// Optional: Check if address has claimed
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const address = searchParams.get('address')

  if (!address) {
    return NextResponse.json({ error: 'Address required' }, { status: 400 })
  }

  return NextResponse.json({
    address,
    hasClaimed: claimedAddresses.has(address.toLowerCase()),
    claimAmount: '1 WBTC'
  })
}
