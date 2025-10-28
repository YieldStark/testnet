'use client'

import { Contract } from 'starknet'
import { VAULT_ABI } from '@/lib/abi/vault'
import { CONTRACTS } from '@/lib/config'
import { useNetworkStore } from '@/stores/network-store'

export type NetworkId = 'sepolia' | 'mainnet'

export function getYieldStarkAddressById(networkId: NetworkId): string {
  return (CONTRACTS as any).YIELDSTARK[networkId] as string
}

export function getTokenAddressById(token: 'WBTC', networkId: NetworkId): string {
  return (CONTRACTS as any).TOKENS[token][networkId] as string
}

export function useYieldStarkAddress(): string {
  const current = useNetworkStore((s) => s.currentNetwork)
  return getYieldStarkAddressById(current.id as NetworkId)
}

export function useTokenAddress(token: 'WBTC'): string {
  const current = useNetworkStore((s) => s.currentNetwork)
  return getTokenAddressById(token, current.id as NetworkId)
}

export function getYieldStarkContract(address: string, accountOrProvider: any) {
  // Stop constructing this contract entirely; deposit path now uses Vesu only.
  // We keep the function to avoid imports breaking, but throw if called.
  throw new Error('YieldStark vault path disabled; use Vesu helpers instead')
}



