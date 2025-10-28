'use client'

import { useState, useEffect } from 'react'
import { Check, Loader2, RefreshCw } from 'lucide-react'
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { useAccount } from '@starknet-react/core'
import { useWalletStore } from '@/providers/wallet-store-provider'
import { Contract, RpcProvider } from 'starknet'
import { VWBTC_ADDRESS, universalErc20Abi } from '@/lib/utils/Constants'

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

  useEffect(() => {
    fetchPositions()
    
    // Auto-refresh every 15 seconds to catch new deposits
    const interval = setInterval(() => {
      fetchPositions()
    }, 15000) // 15 seconds
    
    return () => clearInterval(interval)
  }, [userAddress])

  const fetchPositions = async () => {
    setLoading(true)

    try {
      // Get transaction history from localStorage (deposits and withdrawals)
      const transactions = getTransactionHistory(userAddress || '')
      
      // Calculate net balance from transaction history
      const netBalance = transactions.reduce((sum: number, tx: any) => {
        if (tx.type === 'deposit') {
          return sum + parseFloat(tx.amount || '0')
        } else if (tx.type === 'withdraw') {
          return sum - parseFloat(tx.amount || '0')
        }
        return sum
      }, 0)

      console.log('📊 Transaction History:', transactions)
      console.log('💰 Net Balance from Transactions:', netBalance)

      // Try to fetch real vWBTC balance from blockchain (as verification)
      let blockchainBalance = 0
      if (userAddress) {
        try {
          const provider = new RpcProvider({
            nodeUrl: 'https://starknet-sepolia.public.blastapi.io/rpc/v0_8'
          })
          const vwbtcContract = new (Contract as any)(
            universalErc20Abi as any,
            VWBTC_ADDRESS,
            provider
          )
          const balance = await vwbtcContract.balance_of(userAddress)
          blockchainBalance = Number(BigInt(balance.toString())) / 1e8
          console.log('⛓️ Blockchain Balance:', blockchainBalance)
        } catch (err) {
          console.error('Error fetching blockchain balance:', err)
        }
      }

      // Use the maximum of localStorage net balance and blockchain balance
      // This ensures we show changes immediately, even if blockchain hasn't confirmed yet
      const vesuBalance = Math.max(netBalance, blockchainBalance)
      const vesuBalanceFormatted = vesuBalance.toFixed(8)

      console.log('✅ Final Vesu Balance:', vesuBalanceFormatted)

      // Generate chart data based on actual transaction history
      const vesuChartData = generateChartFromHistory(transactions)
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
    } catch (err: any) {
      console.error('Error fetching positions:', err)
    } finally {
      setLoading(false)
    }
  }

  const getTransactionHistory = (address: string) => {
    if (!address) return []
    
    try {
      const key = `tx_history_${address.toLowerCase()}`
      const data = localStorage.getItem(key)
      if (data) {
        const transactions = JSON.parse(data)
        // Return both deposits and withdrawals
        return transactions.filter((tx: any) => tx.type === 'deposit' || tx.type === 'withdraw')
      }
      return []
    } catch {
      return []
    }
  }

  const generateChartFromHistory = (transactions: any[]) => {
    if (transactions.length === 0) {
      // No transactions - flat line at 0
      return Array(8).fill(null).map(() => ({ value: 0 }))
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
        value: Math.max(0, cumulative), // Don't go below 0
        timestamp: tx.timestamp
      })
    }

    // If we have fewer than 8 points, pad with interpolated values
    if (dataPoints.length < 8) {
      const finalValue = Math.max(0, cumulative)
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

    // If we have more than 8 points, sample them
    if (dataPoints.length > 8) {
      const step = Math.floor(dataPoints.length / 8)
      return dataPoints.filter((_, i) => i % step === 0).slice(0, 8)
    }

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
