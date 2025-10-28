'use client'

import { ReactNode } from 'react'
import { useNetworkStore } from '@/stores/network-store'

interface NetworkStoreProviderProps {
  children: ReactNode
}

export function NetworkStoreProvider({ children }: NetworkStoreProviderProps) {
  // Initialize the network store
  useNetworkStore.getState()
  
  return <>{children}</>
}














