'use client'

import { useState, useEffect, useCallback } from 'react'
import { Check, Loader2, RefreshCw } from 'lucide-react'
import { AreaChart, Area, ResponsiveContainer } from 'recharts'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { useAccount } from '@starknet-react/core'
import { useWalletStore } from '@/providers/wallet-store-provider'
import { Contract, RpcProvider } from 'starknet'
import { VWBTC_ADDRESS } from '@/lib/utils/Constants'
import { cairo0Erc20Abi } from '@/lib/abi/cairo0Erc20'

interface Position {
  protocol: string
  balance: string
  apy: string
  data: { value: number; timestamp?: number }[]
  logoPath: string
  chartColor: string
  gradientId: string
}

const CurrentPositions = () => {
  const { address } = useAccount()
  const wallet = useWalletStore((state) => state.wallet)
  const userAddress = address || wallet?.address

  const [positions, setPositions] = useState<Position[]>([])
  const [loading, setLoading] = useState(true)

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

  const fetchPositions = useCallback(async () => {
    setLoading(true)

    try {
      // Fetch real vWBTC balance from blockchain - THIS IS THE PRIMARY SOURCE
      let balanceRawString = "0"
      if (userAddress) {
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
      }

      // Get transaction history from localStorage (for chart generation only)
      const transactions = getTransactionHistory(userAddress || '')

      // Use blockchain balance as the source of truth - format with 18 decimals (Starknet standard)
      const vesuBalanceFormatted = formatBalance(balanceRawString, 18)
      // Convert the formatted string back to a Number for chart generation
      const blockchainBalance = Number(vesuBalanceFormatted)

      // Generate chart data based on actual transaction history and real blockchain balance
      const vesuChartData = generateChartFromHistory(transactions, blockchainBalance)
      const ekuboChartData = generateEmptyChart()

      const newPositions: Position[] = [
        {
          protocol: 'Vesu',
          balance: vesuBalanceFormatted,
          apy: '3.14%',
          data: vesuChartData,
          logoPath: '/supported_platforms/vesu_brand.png',
          chartColor: '#97FCE4',
          gradientId: 'gradientVesu',
        },
        {
          protocol: 'Ekubo',
          balance: '0.00000000',
          apy: '2.00%',
          data: ekuboChartData,
          logoPath: '/supported_platforms/ekubo.png',
          chartColor: '#8B5CF6',
          gradientId: 'gradientEkubo',
        }
      ]

      setPositions(newPositions)
    } catch (err: unknown) {
      console.error('Error fetching positions:', err)
    } finally {
      setLoading(false)
    }
  }, [userAddress])

  useEffect(() => {
    fetchPositions()
    
    // Auto-refresh every 15 seconds to catch new deposits
    const interval = setInterval(() => {
      fetchPositions()
    }, 15000) // 15 seconds
    
    return () => clearInterval(interval)
  }, [fetchPositions])

  const getTransactionHistory = (address: string) => {
    if (!address) return []
    
    try {
      const key = `tx_history_${address.toLowerCase()}`
      const data = localStorage.getItem(key)
      if (data) {
        const transactions = JSON.parse(data) as Array<{type: string; timestamp: number; amount: string}>
        // Return both deposits and withdrawals
        return transactions.filter((tx) => tx.type === 'deposit' || tx.type === 'withdraw')
      }
      return []
    } catch {
      return []
    }
  }

  const generateChartFromHistory = (transactions: Array<{type: string; timestamp: number; amount: string}>, currentBalance: number) => {
    // If no balance, show flat line at 0
    if (currentBalance === 0) {
      return Array(8).fill(null).map(() => ({ value: 0 }))
    }

    if (transactions.length === 0) {
      // No transaction history but we have balance - show growth from 0 to current
      const points = 8
      const result = []
      
      for (let i = 0; i < points; i++) {
        const progress = i / (points - 1)
        const value = currentBalance * progress
        result.push({ value })
      }
      
      return result
    }

    // Sort transactions by timestamp
    const sortedTxs = [...transactions].sort((a, b) => a.timestamp - b.timestamp)
    
    // Build cumulative balance over time (deposits add, withdrawals subtract)
    let cumulative = 0
    const dataPoints = []
    
    for (const tx of sortedTxs) {
      if (tx.type === 'deposit') {
        cumulative += parseFloat(tx.amount || '0')
      } else if (tx.type === 'withdraw') {
        cumulative -= parseFloat(tx.amount || '0')
      }
      dataPoints.push({
        value: Math.max(0, cumulative),
        timestamp: tx.timestamp
      })
    }

    // Always use the blockchain balance as the final point
    const finalValue = currentBalance

    // If we have fewer than 8 points, pad with interpolated values to reach blockchain balance
    if (dataPoints.length < 8) {
      const startValue = 0
      const points = 8
      const result = []
      
      for (let i = 0; i < points; i++) {
        const progress = i / (points - 1)
        const value = startValue + (finalValue - startValue) * progress
        result.push({ value })
      }
      
      return result
    }

    // If we have more than 8 points, sample them and ensure last point is blockchain balance
    if (dataPoints.length > 8) {
      const step = Math.floor(dataPoints.length / 8)
      const sampled = dataPoints.filter((_, i) => i % step === 0).slice(0, 7)
      sampled.push({ value: finalValue, timestamp: Date.now() / 1000 })
      return sampled
    }

    // Update the last point to match blockchain balance
    dataPoints[dataPoints.length - 1].value = finalValue
    return dataPoints
  }

  const generateEmptyChart = () => {
    return Array(8).fill(null).map(() => ({ value: 0 }))
  }

  if (loading) {
    return (
      <div className="bg-[#101D22] rounded-4xl p-4 lg:p-6">
        <h3 className="text-base lg:text-lg font-medium text-white mb-4 lg:mb-6">Current Positions</h3>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-[#97FCE4] animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="bg-[#101D22] rounded-4xl p-4 lg:p-6">
      <div className="flex items-center justify-between mb-4 lg:mb-6">
        <h3 className="text-base lg:text-lg font-medium text-white">Current Positions</h3>
        <button
          onClick={fetchPositions}
          disabled={loading}
          className="p-2 hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50"
          title="Refresh positions"
        >
          <RefreshCw className={`w-4 h-4 text-[#97FCE4] ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        {positions.map((position, index) => (
          <motion.div
            key={position.protocol}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            whileHover={{ 
              scale: 1.02,
              boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
            }}
            className="bg-[#0F1A1F] rounded-xl p-4 lg:p-6 relative overflow-hidden"
          >
            <div className="space-y-4">
              {/* Top section: Balance and APY */}
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs lg:text-sm text-gray-400 mb-1">Deposited</p>
                  <span className="text-xl lg:text-2xl font-bold text-white">
                    {position.balance}
                  </span>
                  <span className="text-sm text-gray-400 ml-2">WBTC</span>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400 mb-1">APY</p>
                  <span className="text-base lg:text-lg font-semibold text-[#97FCE4]">
                    {position.apy}
                  </span>
                </div>
              </div>
              
              {/* Chart section - Upward trending based on deposits */}
              <div className="h-16 lg:h-20 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={position.data} margin={{ top: 5, right: 0, left: 0, bottom: 5 }}>
                    <defs>
                      <linearGradient id={position.gradientId} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={position.chartColor} stopOpacity={0.3}/>
                        <stop offset="95%" stopColor={position.chartColor} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke={position.chartColor}
                      fill={`url(#${position.gradientId})`}
                      strokeWidth={2}
                      dot={false}
                      activeDot={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              
              {/* Bottom section: Logo and Audited status */}
              <div className="flex justify-between items-center pt-2">
                <div className="flex items-center">
                  <Image
                    src={position.logoPath}
                    alt={position.protocol}
                    width={position.protocol === 'Vesu' ? 50 : 35}
                    height={35}
                    className="object-contain"
                  />
                </div>
                
                <div className="flex items-center space-x-1">
                  <Check className="w-3 lg:w-4 h-3 lg:h-4 text-[#97FCE4]" />
                  <span className="text-xs lg:text-sm text-gray-400">Audited</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      
      {/* Auto-refresh indicator */}
      {!loading && (
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            Auto-refreshes every 15 seconds • Click refresh icon to update now
          </p>
        </div>
      )}
    </div>
  )
}

export default CurrentPositions
