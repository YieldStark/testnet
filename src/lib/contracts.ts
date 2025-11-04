'use client'

import { CONTRACTS } from '@/lib/config'
import { useNetworkStore } from '@/stores/network-store'

export type NetworkId = 'sepolia' | 'mainnet'

interface ContractsConfig {
  YIELDSTARK: {
    [key in NetworkId]: string
  }
  TOKENS: {
    WBTC: {
      [key in NetworkId]: string
    }
  }
}

export function getYieldStarkAddressById(networkId: NetworkId): string {
  return (CONTRACTS as ContractsConfig).YIELDSTARK[networkId]
}

export function getTokenAddressById(token: 'WBTC', networkId: NetworkId): string {
  return (CONTRACTS as ContractsConfig).TOKENS[token][networkId]
}

export function useYieldStarkAddress(): string {
  const current = useNetworkStore((s) => s.currentNetwork)
  return getYieldStarkAddressById(current.id as NetworkId)
}

export function useTokenAddress(token: 'WBTC'): string {
  const current = useNetworkStore((s) => s.currentNetwork)
  return getTokenAddressById(token, current.id as NetworkId)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getYieldStarkContract(_address: string, _accountOrProvider: any) {
  // Stop constructing this contract entirely; deposit path now uses Vesu only.
  // We keep the function to avoid imports breaking, but throw if called.
  throw new Error('YieldStark vault path disabled; use Vesu helpers instead')
}



