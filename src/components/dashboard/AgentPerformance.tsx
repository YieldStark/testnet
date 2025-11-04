'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAccount } from '@starknet-react/core'
import { useWalletStore } from '@/providers/wallet-store-provider'
import { Contract, RpcProvider } from 'starknet'
import { VWBTC_ADDRESS } from '@/lib/utils/Constants'
import { cairo0Erc20Abi } from '@/lib/abi/cairo0Erc20'
import { Loader2 } from 'lucide-react'

const AgentPerformance = () => {
  const { address } = useAccount()
  const wallet = useWalletStore((state) => state.wallet)
  const userAddress = address || wallet?.address

  const [vesuBalance, setVesuBalance] = useState('0.0000')
  const [ekuboBalance, setEkuboBalance] = useState('0.0000')
  const [loading, setLoading] = useState(true)

  // Fixed APY values
  const vesuAPY = '3.14'
  const ekuboAPY = '2.00'

  // Format balance function - BigInt-safe for large numbers
  const formatBalance = (balanceRawString: string, decimals: number = 18) => {
    if (!balanceRawString) return "0";
    
    // Use BigInt for safe math with large numbers
    const rawBalance = BigInt(balanceRawString);
    const DIVISOR = BigInt(10) ** BigInt(decimals);

    // Get the whole number part
    const wholePart = rawBalance / DIVISOR;
    
    // Get the fractional part
    const fractionalPart = rawBalance % DIVISOR;

    // Convert fractional part to string and pad with leading zeros
    const fractionalString = fractionalPart.toString().padStart(decimals, '0');

    // Combine whole and fractional
    const result = `${wholePart}.${fractionalString}`;

    // Remove trailing zeros after decimal
    const [w, f] = result.split('.');
    
    // Trim trailing zeros from fractional part
    const trimmedFractional = f ? f.replace(/0+$/, '') : '';

    if (trimmedFractional.length === 0) {
        return w; // Return only the whole number if fraction is zero
    }
    
    // Return whole part and trimmed fraction
    return `${w}.${trimmedFractional}`;
  };

  const fetchRealData = useCallback(async () => {
    if (!userAddress) return

    setLoading(true)

    try {
      // Fetch real vWBTC balance from blockchain - THIS IS THE PRIMARY SOURCE
      let balanceRawString = "0"
      try {
        // Use exact same pattern as dashboard WBTC balance fetch
        // Use Alchemy API with fallbacks: Alchemy → PublicNode → dRPC
        const alchemyApiKey = typeof window !== 'undefined'
          ? ((window as Window & { __ALCHEMY_API_KEY__?: string }).__ALCHEMY_API_KEY__ || process.env.NEXT_PUBLIC_ALCHEMY_API_KEY)
          : process.env.NEXT_PUBLIC_ALCHEMY_API_KEY
        const rpcUrl = alchemyApiKey
          ? `https://starknet-sepolia.g.alchemy.com/v2/${alchemyApiKey}`
          : 'https://starknet-sepolia-rpc.publicnode.com' // Fallback to PublicNode
        const sepoliaProvider = new RpcProvider({ 
          nodeUrl: rpcUrl
        })
        const vwbtcContract = new Contract({ 
          abi: cairo0Erc20Abi, 
          address: VWBTC_ADDRESS, 
          providerOrAccount: sepoliaProvider 
        })
        const res = await vwbtcContract.balanceOf(userAddress)
        
        // Convert to string - handle both bigint and object responses
        if (typeof res.balance === 'object' && res.balance !== null && 'low' in res.balance) {
          // It's a Uint256 object
          const low = BigInt(res.balance.low || 0)
          const high = BigInt(res.balance.high || 0)
          const combined = low + (high * (BigInt(2) ** BigInt(128)))
          balanceRawString = combined.toString()
        } else {
          // It's already a bigint
          balanceRawString = res.balance.toString()
        }
      } catch (err) {
        console.error('Error fetching blockchain balance:', err)
      }

      // Use blockchain balance as the source of truth - format with 18 decimals (Starknet standard)
      const vesuBalanceFormatted = formatBalance(balanceRawString, 18)
      setVesuBalance(vesuBalanceFormatted)

      // Ekubo not implemented yet
      setEkuboBalance('0.0000')

    } catch (error) {
      console.error('Error fetching agent performance:', error)
    } finally {
      setLoading(false)
    }
  }, [userAddress])

  useEffect(() => {
    if (userAddress) {
      fetchRealData()
      
      // Auto-refresh every 15 seconds to catch new deposits
      const interval = setInterval(() => {
        fetchRealData()
      }, 15000) // 15 seconds
      
      return () => clearInterval(interval)
    } else {
      setLoading(false)
    }
  }, [userAddress, fetchRealData])

  if (loading) {
    return (
      <div className="bg-[#101D22] rounded-lg p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 text-[#97FCE4] animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="bg-[#101D22] rounded-lg p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-300">Total $wbtc in vesu:</span>
          <span className="text-sm text-white font-medium">{vesuBalance}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-300">Total $wbtc in ekubo:</span>
          <span className="text-sm text-white font-medium">{ekuboBalance}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-300">Vesu APY:</span>
          <span className="text-sm text-[#97FCE4] font-medium">{vesuAPY}%</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-300">Ekubo APY:</span>
          <span className="text-sm text-purple-400 font-medium">{ekuboAPY}%</span>
        </div>
        
        <div className="flex items-center space-x-2 pt-2 border-t border-gray-800">
          <div className="w-2 h-2 bg-[#97FCE4] rounded-full animate-pulse"></div>
          <span className="text-sm text-[#97FCE4] font-medium">Yieldstark Agent Active</span>
        </div>
      </div>
    </div>
  )
}

export default AgentPerformance
