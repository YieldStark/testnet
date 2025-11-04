/**
 * Get RPC URL for Starknet networks with fallback chain
 * Priority: Alchemy (if API key provided) → PublicNode → dRPC
 * Supports both client-side and server-side usage
 */

export const getAlchemyRpcUrl = (network: 'mainnet' | 'sepolia'): string => {
  // Server-side: Check process.env directly
  if (typeof window === 'undefined') {
    const apiKey = process.env.ALCHEMY_API_KEY || process.env.NEXT_PUBLIC_ALCHEMY_API_KEY
    if (apiKey) {
      return network === 'mainnet'
        ? `https://starknet-mainnet.g.alchemy.com/v2/${apiKey}`
        : `https://starknet-sepolia.g.alchemy.com/v2/${apiKey}`
    }
  } else {
    // Client-side: Check window variable or NEXT_PUBLIC env var
    const apiKey = ((window as Window & { __ALCHEMY_API_KEY__?: string }).__ALCHEMY_API_KEY__ || process.env.NEXT_PUBLIC_ALCHEMY_API_KEY)
    if (apiKey) {
      return network === 'mainnet'
        ? `https://starknet-mainnet.g.alchemy.com/v2/${apiKey}`
        : `https://starknet-sepolia.g.alchemy.com/v2/${apiKey}`
    }
  }
  
  // Fallback chain for Sepolia: PublicNode → dRPC
  if (network === 'sepolia') {
    // Use PublicNode as primary fallback (free, no API key needed)
    // If PublicNode fails, code can switch to dRPC: https://starknet-sepolia.drpc.org
    console.log('ℹ️ Using PublicNode RPC as fallback (Alchemy not configured)')
    return 'https://starknet-sepolia-rpc.publicnode.com'
  }
  
  // Mainnet fallbacks (if needed in future)
  console.warn('⚠️ No Alchemy API key found. Using fallback RPC (may have rate limits)')
  return network === 'mainnet'
    ? 'https://starknet-mainnet.public.blastapi.io/rpc/v0_8'
    : 'https://starknet-sepolia-rpc.publicnode.com'
}

/**
 * Get fallback RPC URLs for Sepolia (in order of preference)
 */
export const getSepoliaFallbackRPCs = (): string[] => {
  return [
    'https://starknet-sepolia-rpc.publicnode.com', // Primary backup
    'https://starknet-sepolia.drpc.org', // Secondary backup
  ]
}


