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

export const SUPPORTED_NETWORKS: NetworkConfig[] = [
  {
    id: 'mainnet',
    name: 'Starknet Mainnet',
    chain: mainnet,
    rpcUrl: 'https://starknet-mainnet.public.blastapi.io/rpc/v0_8',
    explorerUrl: 'https://starkscan.co',
    isTestnet: false,
  },
  {
    id: 'sepolia',
    name: 'Starknet Sepolia',
    chain: sepolia,
    rpcUrl: 'https://starknet-sepolia.public.blastapi.io/rpc/v0_8',
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



