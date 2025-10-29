'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAccount } from '@starknet-react/core'
import { useWalletStore } from '@/providers/wallet-store-provider'
import { ExternalLink, Clock, TrendingUp, ArrowDownCircle, ArrowUpCircle, RefreshCw, Inbox } from 'lucide-react'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import { fetchUserTransactionHistory, Transaction } from '@/lib/utils/transactionHistory'

export default function HistoryPage() {
  const { address } = useAccount()
  const wallet = useWalletStore((state) => state.wallet)
  const isConnected = useWalletStore((state) => state.isConnected)
  const userAddress = address || wallet?.address

  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTransactionHistory = useCallback(async () => {
    if (!userAddress) return

    setLoading(true)
    setError(null)

    try {
      // Use the utility function to fetch transaction history
      const txHistory = await fetchUserTransactionHistory(userAddress)
      setTransactions(txHistory)
    } catch (err: unknown) {
      console.error('Error fetching transaction history:', err)
      setError('Failed to load transaction history')
    } finally {
      setLoading(false)
    }
  }, [userAddress])

  useEffect(() => {
    if (userAddress) {
      fetchTransactionHistory()
    } else {
      setLoading(false)
    }
  }, [userAddress, fetchTransactionHistory])

  const formatDate = (timestamp: number) => {
    try {
      return format(new Date(timestamp * 1000), 'dd-MMM-yyyy HH:mm')
    } catch {
      return 'Unknown date'
    }
  }

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return <ArrowDownCircle className="w-5 h-5 text-green-500" />
      case 'withdraw':
        return <ArrowUpCircle className="w-5 h-5 text-orange-500" />
      case 'transfer':
        return <RefreshCw className="w-5 h-5 text-blue-500" />
      default:
        return <Clock className="w-5 h-5 text-gray-500" />
    }
  }

  const getTransactionDescription = (tx: Transaction) => {
    const shortHash = `${tx.hash.slice(0, 6)}...${tx.hash.slice(-4)}`
    
    if (tx.type === 'deposit') {
      return `Deposited WBTC to Vesu pool`
    } else if (tx.type === 'withdraw') {
      return `Withdrew WBTC from Vesu pool`
    } else {
      return `Transaction ${shortHash}`
    }
  }

  if (!isConnected || !userAddress) {
    return (
      <div className="space-y-6">
        <div className="bg-[#101D22] rounded-4xl p-6">
          <h1 className="text-3xl font-medium text-white mb-4">Transaction History</h1>
          <div className="flex flex-col items-center justify-center py-16">
            <Clock className="w-16 h-16 text-gray-600 mb-4" />
            <p className="text-gray-400 text-center">
              Connect your wallet to view transaction history
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#101D22] rounded-4xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-[#97FCE4] to-[#8B5CF6] rounded-full flex items-center justify-center">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-medium text-white">Transaction History</h1>
              <p className="text-gray-400">Your WBTC deposit and withdrawal history</p>
            </div>
          </div>
          
          <button
            onClick={fetchTransactionHistory}
            disabled={loading}
            className="p-3 bg-[#0F1A1F] text-[#97FCE4] rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#0F1A1F] rounded-xl p-4">
            <div className="flex items-center space-x-3 mb-2">
              <TrendingUp className="w-5 h-5 text-[#97FCE4]" />
              <p className="text-sm text-gray-400">Total Transactions</p>
            </div>
            <p className="text-2xl font-bold text-white">{transactions.length}</p>
          </div>
          
          <div className="bg-[#0F1A1F] rounded-xl p-4">
            <div className="flex items-center space-x-3 mb-2">
              <ArrowDownCircle className="w-5 h-5 text-green-500" />
              <p className="text-sm text-gray-400">Deposits</p>
            </div>
            <p className="text-2xl font-bold text-white">
              {transactions.filter(tx => tx.type === 'deposit').length}
            </p>
          </div>
          
          <div className="bg-[#0F1A1F] rounded-xl p-4">
            <div className="flex items-center space-x-3 mb-2">
              <ArrowUpCircle className="w-5 h-5 text-orange-500" />
              <p className="text-sm text-gray-400">Withdrawals</p>
            </div>
            <p className="text-2xl font-bold text-white">
              {transactions.filter(tx => tx.type === 'withdraw').length}
            </p>
          </div>
        </div>
      </div>

      {/* Transaction List */}
      <div className="bg-[#101D22] rounded-4xl p-6">
        <h2 className="text-xl font-medium text-white mb-6">Recent Activity</h2>
        
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <RefreshCw className="w-12 h-12 text-[#97FCE4] animate-spin mb-4" />
            <p className="text-gray-400">Loading transactions...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Clock className="w-12 h-12 text-red-500 mb-4" />
            <p className="text-red-400">{error}</p>
            <button
              onClick={fetchTransactionHistory}
              className="mt-4 px-6 py-2 bg-[#97FCE4] text-black rounded-lg hover:bg-[#85E6D1] transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-20 h-20 bg-[#0F1A1F] rounded-full flex items-center justify-center mb-4">
              <Inbox className="w-10 h-10 text-gray-600" />
            </div>
            <h3 className="text-xl font-medium text-white mb-2">No Transactions Yet</h3>
            <p className="text-gray-400 text-center mb-6 max-w-md">
              You haven&apos;t made any deposits or withdrawals yet. Start by depositing WBTC to earn yield!
            </p>
            <button
              onClick={() => window.location.href = '/dashboard'}
              className="px-8 py-3 bg-[#97FCE4] text-black font-medium rounded-xl hover:bg-[#85E6D1] transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.map((tx, index) => (
              <motion.div
                key={tx.hash}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-start justify-between p-4 bg-[#0F1A1F] rounded-xl hover:bg-gray-800 transition-colors"
              >
                <div className="flex items-start space-x-4 flex-1">
                  <div className="mt-1">
                    {getTransactionIcon(tx.type)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <p className="text-white font-medium">{getTransactionDescription(tx)}</p>
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        tx.status === 'success' 
                          ? 'bg-green-500/10 text-green-500' 
                          : 'bg-gray-500/10 text-gray-500'
                      }`}>
                        {tx.status}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-400">
                      <span>{formatDate(tx.timestamp)}</span>
                      <span>•</span>
                      <span className="font-mono">{tx.hash.slice(0, 10)}...{tx.hash.slice(-8)}</span>
                    </div>
                  </div>
                </div>
                
                <a
                  href={`https://sepolia.voyager.online/tx/${tx.hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1 text-[#97FCE4] hover:text-[#85E6D1] transition-colors ml-4"
                >
                  <span className="text-sm hidden sm:block">Explorer</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Info Box */}
      {transactions.length > 0 && (
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
          <div className="flex items-start space-x-3">
            <Clock className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-blue-300 text-sm">
                Transaction history shows your deposits and withdrawals to the Vesu protocol. 
                All transactions are recorded on Starknet Sepolia testnet.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
