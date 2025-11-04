import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { sepolia, mainnet, Chain } from '@starknet-react/chains'

export interface NetworkConfig {
  id: string
  name: string
  chain: Chain
  rpcUrl: string
  explorerUrl: string
  isTestnet: boolean
}

// Get RPC URL with fallback chain: Alchemy → PublicNode → dRPC
const getAlchemyRpcUrl = (network: 'mainnet' | 'sepolia') => {
  const apiKey = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY || process.env.ALCHEMY_API_KEY
  if (apiKey) {
    return network === 'mainnet' 
      ? `https://starknet-mainnet.g.alchemy.com/v2/${apiKey}`
      : `https://starknet-sepolia.g.alchemy.com/v2/${apiKey}`
  }
  // Fallback chain for Sepolia: PublicNode → dRPC
  if (network === 'sepolia') {
    return 'https://starknet-sepolia-rpc.publicnode.com'
  }
  // Mainnet fallback (if needed)
  return 'https://starknet-mainnet.public.blastapi.io/rpc/v0_8'
}

export const SUPPORTED_NETWORKS: NetworkConfig[] = [
  {
    id: 'mainnet',
    name: 'Starknet Mainnet',
    chain: mainnet,
    rpcUrl: typeof window !== 'undefined' 
      ? ((window as Window & { __ALCHEMY_RPC_MAINNET__?: string }).__ALCHEMY_RPC_MAINNET__ || getAlchemyRpcUrl('mainnet'))
      : getAlchemyRpcUrl('mainnet'),
    explorerUrl: 'https://starkscan.co',
    isTestnet: false,
  },
  {
    id: 'sepolia',
    name: 'Starknet Sepolia',
    chain: sepolia,
    rpcUrl: typeof window !== 'undefined'
      ? ((window as Window & { __ALCHEMY_RPC_SEPOLIA__?: string }).__ALCHEMY_RPC_SEPOLIA__ || getAlchemyRpcUrl('sepolia'))
      : getAlchemyRpcUrl('sepolia'),
    explorerUrl: 'https://sepolia.starkscan.co',
    isTestnet: true,
  },
]

interface NetworkStore {
  currentNetwork: NetworkConfig
  setCurrentNetwork: (network: NetworkConfig) => void
  getNetworkById: (id: string) => NetworkConfig | undefined
  isNetworkSupported: (chainId: string) => boolean
}

export const useNetworkStore = create<NetworkStore>()(
  persist(
    (set) => ({
      currentNetwork: SUPPORTED_NETWORKS[1], // Default to Sepolia
      
      setCurrentNetwork: (network: NetworkConfig) => {
        set({ currentNetwork: network })
      },
      
      getNetworkById: (id: string) => {
        return SUPPORTED_NETWORKS.find(network => network.id === id)
      },
      
      isNetworkSupported: (chainId: string) => {
        return SUPPORTED_NETWORKS.some(network => network.chain.id.toString() === chainId)
      },
    }),
    {
      name: 'network-storage',
      partialize: (state) => ({ currentNetwork: state.currentNetwork }),
    }
  )
)



