'use client'

import { ReactNode } from 'react'
import { 
  StarknetConfig, 
  publicProvider, 
  useInjectedConnectors,
  ready,
  braavos
} from '@starknet-react/core'
import { sepolia, mainnet } from '@starknet-react/chains'

interface StarknetProviderProps {
  children: ReactNode
}

function StarknetProviderInner({ children }: StarknetProviderProps) {
  const { connectors } = useInjectedConnectors({
    // Show these connectors if the user has no connector installed.
    recommended: [ready(), braavos()],
    // Hide recommended connectors if the user has any connector installed.
    includeRecommended: "onlyIfNoConnectors",
    // Randomize the order of the connectors.
    order: "random",
  })

  const chains = [sepolia, mainnet]
  const provider = publicProvider()

  return (
    <StarknetConfig
      chains={chains}
      provider={provider}
      connectors={connectors}
      autoConnect={true}
    >
      {children}
    </StarknetConfig>
  )
}

export default function StarknetProvider({ children }: StarknetProviderProps) {
  return (
    <StarknetProviderInner>
      {children}
    </StarknetProviderInner>
  )
}


