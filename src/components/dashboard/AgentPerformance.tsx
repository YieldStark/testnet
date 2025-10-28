'use client'

import { useState, useEffect } from 'react'
import { useAccount } from '@starknet-react/core'
import { useWalletStore } from '@/providers/wallet-store-provider'
import { Contract, RpcProvider } from 'starknet'
import { VWBTC_ADDRESS, universalErc20Abi } from '@/lib/utils/Constants'
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
  }, [userAddress])

  const fetchRealData = async () => {
    if (!userAddress) return

    setLoading(true)

    try {
      // Get transaction history from localStorage (deposits and withdrawals)
      const transactions = getTransactionHistory(userAddress)
      
      // Calculate net balance from transaction history
      const netBalance = transactions.reduce((sum: number, tx: any) => {
        if (tx.type === 'deposit') {
          return sum + parseFloat(tx.amount || '0')
        } else if (tx.type === 'withdraw') {
          return sum - parseFloat(tx.amount || '0')
        }
        return sum
      }, 0)

      console.log('📊 Agent Performance - Transaction History:', transactions)
      console.log('💰 Agent Performance - Net Balance:', netBalance)

      // Try to fetch real vWBTC balance from blockchain (as verification)
      let blockchainBalance = 0
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
        console.log('⛓️ Agent Performance - Blockchain Balance:', blockchainBalance)
      } catch (err) {
        console.error('Error fetching blockchain balance:', err)
      }

      // Use the maximum of localStorage net balance and blockchain balance
      const vesuBalance = Math.max(netBalance, blockchainBalance)
      setVesuBalance(vesuBalance.toFixed(4))

      // Ekubo not implemented yet
      setEkuboBalance('0.0000')

    } catch (error) {
      console.error('Error fetching agent performance:', error)
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
