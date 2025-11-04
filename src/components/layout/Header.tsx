'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { ChevronDown, Menu } from 'lucide-react'
import { connect, disconnect } from '@starknet-io/get-starknet'
import { WalletAccount } from 'starknet'
import { useWalletStore } from '@/providers/wallet-store-provider'
import { useSwitchChain } from '@starknet-react/core'
import { sepolia, mainnet } from '@starknet-react/chains'

interface HeaderProps {
  onMenuClick: () => void
}

const Header = ({ onMenuClick }: HeaderProps) => {
  const pathname = usePathname()
  const [isChainDropdownOpen, setIsChainDropdownOpen] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [currentChain, setCurrentChain] = useState<typeof mainnet | typeof sepolia>(sepolia)
  
  const { switchChain } = useSwitchChain({})
  
  const { isConnected, connectWallet, disconnectWallet } = useWalletStore(
    (state) => state,
  )

  const navigationItems = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Swap', href: '/swap' },
    { name: 'Docs', href: '/docs' },
    { name: 'Support', href: '/support' },
  ]

  const chains = [
    { name: 'Mainnet', id: 'mainnet', chain: mainnet },
    { name: 'Sepolia', id: 'sepolia', chain: sepolia },
  ]

  // Check for existing connection on component mount
  useEffect(() => {
    const checkExistingConnection = async () => {
      try {
        // Check if there's already a connected wallet
        const lastWallet = await connect({ modalMode: 'neverAsk' })
        if (lastWallet) {
          console.log('Found existing wallet connection:', lastWallet)
          // Build WalletAccount for unified handling - Use Alchemy API with fallbacks
          const alchemyApiKey = typeof window !== 'undefined' 
            ? ((window as Window & { __ALCHEMY_API_KEY__?: string }).__ALCHEMY_API_KEY__ || process.env.NEXT_PUBLIC_ALCHEMY_API_KEY)
            : process.env.NEXT_PUBLIC_ALCHEMY_API_KEY
          const rpcUrl = currentChain?.id === mainnet.id 
            ? (alchemyApiKey 
                ? `https://starknet-mainnet.g.alchemy.com/v2/${alchemyApiKey}`
                : 'https://starknet-mainnet.public.blastapi.io/rpc/v0_8')
            : (alchemyApiKey
                ? `https://starknet-sepolia.g.alchemy.com/v2/${alchemyApiKey}`
                : 'https://starknet-sepolia-rpc.publicnode.com') // Fallback to PublicNode
          const myWalletAccount = await WalletAccount.connect(
            { nodeUrl: rpcUrl },
            lastWallet
          )
          connectWallet(myWalletAccount)
        }
      } catch {
        console.log('No existing wallet connection found')
      }
    }

    checkExistingConnection()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleConnectWallet = async () => {
    try {
      setIsConnecting(true)

      // Use the standard UI to select a wallet with DARK theme
      const selectedWalletSWO = await connect({ 
        modalMode: 'alwaysAsk',
        modalTheme: 'dark'
      })

      if (selectedWalletSWO) {
        // Connect to the selected wallet with the current chain's RPC URL - Use Alchemy API with fallbacks
        const alchemyApiKey = typeof window !== 'undefined'
          ? ((window as Window & { __ALCHEMY_API_KEY__?: string }).__ALCHEMY_API_KEY__ || process.env.NEXT_PUBLIC_ALCHEMY_API_KEY)
          : process.env.NEXT_PUBLIC_ALCHEMY_API_KEY
        const rpcUrl = currentChain?.id === mainnet.id 
          ? (alchemyApiKey
              ? `https://starknet-mainnet.g.alchemy.com/v2/${alchemyApiKey}`
              : 'https://starknet-mainnet.public.blastapi.io/rpc/v0_8')
          : (alchemyApiKey
              ? `https://starknet-sepolia.g.alchemy.com/v2/${alchemyApiKey}`
              : 'https://starknet-sepolia-rpc.publicnode.com') // Fallback to PublicNode
        const myWalletAccount = await WalletAccount.connect(
          { nodeUrl: rpcUrl },
          selectedWalletSWO
        )

        connectWallet(myWalletAccount)
        console.log('Wallet connected:', myWalletAccount.address)
        
        // 🔍 Environment Variables Check (for deployment verification)
        console.log('=== Environment Variables Status ===')
        console.log('Client-side (browser):')
        console.log('  NEXT_PUBLIC_RPC_URL:', process.env.NEXT_PUBLIC_RPC_URL || '❌ Not set')
        console.log('\nServer-side (check browser network tab for API responses):')
        console.log('  Note: Server-side env vars (FAUCET_*, RPC_URL) are only visible in API route logs')
        console.log('  To verify: Check browser Network tab when using faucet feature')
        console.log('=====================================')
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error)
    } finally {
      setIsConnecting(false)
    }
  }


  const handleDisconnectWallet = async () => {
    try {
      await disconnect()
      disconnectWallet()
      console.log('Wallet disconnected')
    } catch (error) {
      console.error('Failed to disconnect wallet:', error)
    }
  }

  const handleChainSelect = async (chainOption: { name: string; id: string; chain: typeof mainnet | typeof sepolia }) => {
    try {
      if (switchChain && chainOption.chain) {
        await switchChain({ chainId: `0x${chainOption.chain.id.toString(16)}` })
        setCurrentChain(chainOption.chain)
        console.log('Switched to chain:', chainOption.name)
      }
    } catch (error) {
      console.error('Failed to switch chain:', error)
    } finally {
      setIsChainDropdownOpen(false)
    }
  }

  // Close chain dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      
      if (isChainDropdownOpen && !target.closest('.chain-selector')) {
        setIsChainDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isChainDropdownOpen])

  return (
    <header className="w-full bg-[#0F1A1F] border-b border-gray-800 mb-10">
      <div className="max-w-10image.pngxl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="flex justify-between items-center h-20">
          {/* Logo and Mobile Menu Button */}
          <div className="flex items-center space-x-4">
            {/* Mobile Menu Button */}
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 text-white hover:bg-gray-800 rounded-lg transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
            
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-4">
              <Image
                src="/brand/yieldstark.jpg"
                alt="YieldStark"
                width={40}
                height={40}
                className="rounded-full"
              />
              <span className="text-2xl font-medium" style={{ fontFamily: 'var(--font-median)' }}>
                YieldStark
              </span>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="hidden lg:flex space-x-12">
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`text-base font-medium transition-colors duration-200 ${
                  pathname === item.href
                    ? 'text-[#97FCE4] border-b-2 border-[#97FCE4] pb-1'
                    : 'text-white hover:text-[#97FCE4]'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-3 lg:space-x-6">
            {/* Chain Selector */}
            <div className="relative chain-selector">
              <button
                onClick={() => setIsChainDropdownOpen(!isChainDropdownOpen)}
                className="flex items-center space-x-2 lg:space-x-3 px-3 lg:px-4 py-2 lg:py-3 bg-[#101D22] text-white rounded-full border border-gray-700 hover:border-gray-600 transition-colors"
              >
                <div className="w-4 lg:w-5 h-4 lg:h-5 rounded-full flex items-center justify-center">
                  <Image
                    src="/supported_chains/starknet.png"
                    alt="Starknet"
                    width={20}
                    height={20}
                    className="rounded-full"
                  />
                </div>
                <span className="text-sm lg:text-base font-medium hidden sm:block">
                  {currentChain?.name || 'Starknet'}
                </span>
                <ChevronDown className="w-3 lg:w-4 h-3 lg:h-4" />
              </button>
              
              {isChainDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-[#101D22] border border-gray-700 rounded-lg shadow-lg z-50">
                  <div className="py-1">
                    {chains.map((chainOption) => (
                      <button
                        key={chainOption.id}
                        onClick={() => handleChainSelect(chainOption)}
                        className={`w-full text-left px-4 py-2 text-sm transition-colors flex items-center space-x-3 ${
                          currentChain?.id === chainOption.chain.id
                            ? 'text-[#97FCE4] bg-gray-800'
                            : 'text-white hover:bg-gray-800'
                        }`}
                      >
                        <Image
                          src="/supported_chains/starknet.png"
                          alt="Starknet"
                          width={16}
                          height={16}
                          className="rounded-full"
                        />
                        <span>{chainOption.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Connect/Disconnect Wallet Button */}
            {isConnected ? (
              <button
                onClick={handleDisconnectWallet}
                className="px-4 lg:px-8 py-2 lg:py-3 bg-[#97FCE4] text-black font-medium rounded-full hover:bg-[#85E6D1] transition-colors text-sm lg:text-base"
              >
                <span className="hidden sm:block">Disconnect</span>
                <span className="sm:hidden">Disconnect</span>
              </button>
            ) : (
              <button
                onClick={handleConnectWallet}
                disabled={isConnecting}
                className="px-4 lg:px-8 py-2 lg:py-3 bg-[#97FCE4] text-black font-medium rounded-full hover:bg-[#85E6D1] transition-colors text-sm lg:text-base disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isConnecting ? (
                  <span className="hidden sm:block">Connecting...</span>
                ) : (
                  <>
                    <span className="hidden sm:block">Connect Wallet</span>
                    <span className="sm:hidden">Connect</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
