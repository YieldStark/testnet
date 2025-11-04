// Get RPC URL for Sepolia with fallback chain
const getSepoliaRpcUrl = () => {
  let apiKey: string | undefined
  
  if (typeof window !== 'undefined') {
    apiKey = ((window as Window & { __ALCHEMY_API_KEY__?: string }).__ALCHEMY_API_KEY__ || process.env.NEXT_PUBLIC_ALCHEMY_API_KEY)
  } else {
    apiKey = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY
  }
  
  // Priority: Alchemy → PublicNode → dRPC
  if (apiKey) {
    return `https://starknet-sepolia.g.alchemy.com/v2/${apiKey}`
  }
  // Fallback to PublicNode (free, no API key needed)
  return 'https://starknet-sepolia-rpc.publicnode.com'
}

// Starknet Configuration - This will be dynamically set based on network selection
export const STARKNET_CONFIG = {
  // These are fallback values, actual values come from network store
  RPC_URL: getSepoliaRpcUrl(),
  CHAIN_ID: '0x534e5f5345504f4c4941', // Starknet Sepolia
  EXPLORER_URL: 'https://sepolia.starkscan.co',
}

// App Configuration
export const APP_CONFIG = {
  // Default vault address kept for backward compatibility (unused by new flow)
  VAULT_ADDRESS: '0x017b5442309bf987c91d5c855598867017da9be848078164d6b15805f16bbe70',
  SUPPORTED_TOKENS: ['wbtc', 'eth', 'usdc'],
  PROTOCOLS: {
    VESU: {
      name: 'Vesu',
      color: '#97FCE4',
      apy: 3.4,
    },
    EKUBO: {
      name: 'Ekubo',
      color: '#8B5CF6',
      apy: 2.4,
    },
  },
}

// Onchain contracts per network
export const CONTRACTS = {
  YIELDSTARK: {
    sepolia: '0x059f9e0c508dd608744e826f822ec39efdcb83410b2ab3a35a2f388eb3c12a29',
    mainnet: '', // fill if deployed
  },
  TOKENS: {
    WBTC: {
      sepolia: '0x00abbd6f1e590eb83addd87ba5ac27960d859b1f17d11a3c1cd6a0006704b141',
      mainnet: '', // fill if deployed
    },
  },
}


