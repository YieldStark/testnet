import { NextResponse } from 'next/server'

/**
 * Health check endpoint to verify environment variables are loaded
 * Safe to call - doesn't expose sensitive values
 */
export async function GET() {
  const envStatus = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'unknown',
    nextPublicVars: {
      NEXT_PUBLIC_RPC_URL: process.env.NEXT_PUBLIC_RPC_URL ? '✅ Set' : '❌ Not set',
    },
    serverVars: {
      RPC_URL: process.env.RPC_URL ? '✅ Set' : '❌ Not set (will use default)',
      FAUCET_WALLET_ADDRESS: process.env.FAUCET_WALLET_ADDRESS 
        ? `✅ Set (${process.env.FAUCET_WALLET_ADDRESS.substring(0, 10)}...)`
        : '❌ Not set',
      FAUCET_PRIVATE_KEY: process.env.FAUCET_PRIVATE_KEY 
        ? `✅ Set (${process.env.FAUCET_PRIVATE_KEY.length} chars)` 
        : '❌ Not set',
    },
    status: (process.env.FAUCET_WALLET_ADDRESS && process.env.FAUCET_PRIVATE_KEY) 
      ? 'ready' 
      : 'incomplete',
  }

  // Also log to server console
  console.log('🏥 Health check called:', JSON.stringify(envStatus, null, 2))

  return NextResponse.json(envStatus, {
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  })
}

