'use client'

import { useState, useEffect } from 'react'
import { useAccount } from '@starknet-react/core'
import { useWalletStore } from '@/providers/wallet-store-provider'
import { Gift, Droplet, CheckCircle, AlertCircle, ExternalLink, Copy, Loader2, Coins } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'

export default function FaucetPage() {
  const { address } = useAccount()
  const wallet = useWalletStore((state) => state.wallet)
  const isConnected = useWalletStore((state) => state.isConnected)
  const [claiming, setClaiming] = useState(false)
  const [claimed, setClaimed] = useState(false)
  const [txHash, setTxHash] = useState<string | null>(null)
  const [copiedAddress, setCopiedAddress] = useState(false)

  const CLAIM_AMOUNT = '1'
  const CLAIM_AMOUNT_DISPLAY = '1'

  // Better connection detection - check both hooks
  const isWalletConnected = isConnected && (address || wallet?.address)
  const userAddress = address || wallet?.address

  useEffect(() => {
    // Check if user has already claimed (you can store this in localStorage or backend)
    const claimedAddresses = localStorage.getItem('claimedAddresses')
    if (claimedAddresses && userAddress) {
      const addresses = JSON.parse(claimedAddresses)
      if (addresses.includes(userAddress.toLowerCase())) {
        setClaimed(true)
      }
    }
  }, [userAddress])

  useEffect(() => {
    // Debug connection state
    console.log('Faucet connection state:', {
      isConnected,
      address,
      walletAddress: wallet?.address,
      isWalletConnected
    })
  }, [isConnected, address, wallet, isWalletConnected])

  const handleCopyAddress = async () => {
    if (userAddress) {
      await navigator.clipboard.writeText(userAddress)
      setCopiedAddress(true)
      toast.success('Address copied!')
      setTimeout(() => setCopiedAddress(false), 2000)
    }
  }

  const handleClaim = async () => {
    if (!isWalletConnected || !userAddress) {
      toast.error('Please connect your wallet first')
      return
    }

    setClaiming(true)
    try {
      // Call faucet API
      const response = await fetch('/api/faucet/claim', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address: userAddress,
          amount: CLAIM_AMOUNT
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to claim tokens')
      }

      setTxHash(data.txHash)
      setClaimed(true)
      
      // Store claimed address (with null check)
      if (userAddress) {
        const claimedAddresses = localStorage.getItem('claimedAddresses')
        const addresses = claimedAddresses ? JSON.parse(claimedAddresses) : []
        addresses.push(userAddress.toLowerCase())
        localStorage.setItem('claimedAddresses', JSON.stringify(addresses))
      }

      toast.success('WBTC claimed successfully!')
      
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to claim tokens'
      console.error('Claim failed:', error)
      toast.error(errorMessage)
    } finally {
      setClaiming(false)
    }
  }

  const stats = [
    { label: 'Claim Amount', value: `${CLAIM_AMOUNT_DISPLAY} WBTC`, icon: Coins },
    { label: 'Claims Today', value: '247', icon: Gift },
    { label: 'Total Distributed', value: '12.5 WBTC', icon: Droplet },
  ]

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-[#101D22] rounded-4xl p-6">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-12 h-12 bg-gradient-to-r from-[#F7931A] to-[#FFB84D] rounded-full flex items-center justify-center">
            <Gift className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-medium text-white">Testnet Faucet</h1>
            <p className="text-gray-400">Get free WBTC to test YieldStark</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-[#0F1A1F] rounded-xl p-4"
            >
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-8 h-8 bg-[#97FCE4]/10 rounded-lg flex items-center justify-center">
                  <stat.icon className="w-4 h-4 text-[#97FCE4]" />
                </div>
                <p className="text-sm text-gray-400">{stat.label}</p>
              </div>
              <p className="text-xl font-bold text-white ml-11">{stat.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Info Banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl p-4"
        >
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-blue-300 text-sm">
                <span className="font-medium">Testnet tokens have no real value.</span> They are provided free for testing purposes only. 
                Limited to one claim per address.
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Main Claim Section */}
      <div className="bg-[#101D22] rounded-4xl p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto"
        >
          <AnimatePresence mode="wait">
            {!claimed ? (
              <motion.div
                key="claim-form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                {/* Claim Card */}
                <div className="bg-[#0F1A1F] rounded-xl p-8 text-center">
                  {/* Bitcoin Icon */}
                  <div className="relative inline-block mb-6">
                    <div className="w-24 h-24 bg-gradient-to-br from-[#F7931A] to-[#FFB84D] rounded-full flex items-center justify-center">
                      <span className="text-5xl">₿</span>
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-[#97FCE4] rounded-full flex items-center justify-center">
                      <Gift className="w-5 h-5 text-black" />
                    </div>
                  </div>

                  <h2 className="text-3xl font-bold text-white mb-2">
                    Claim {CLAIM_AMOUNT_DISPLAY} WBTC
                  </h2>
                  <p className="text-gray-400 mb-8">Free testnet tokens to get started</p>

                  {/* Connected Address */}
                  {isWalletConnected && userAddress ? (
                    <div className="mb-6 p-4 bg-[#101D22] rounded-lg">
                      <p className="text-sm text-gray-400 mb-2">Connected Wallet</p>
                      <div className="flex items-center justify-center space-x-2">
                        <p className="text-white font-mono">{formatAddress(userAddress)}</p>
                        <button
                          onClick={handleCopyAddress}
                          className="p-1 hover:bg-gray-700 rounded transition-colors"
                        >
                          {copiedAddress ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : (
                            <Copy className="w-4 h-4 text-gray-400" />
                          )}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                      <AlertCircle className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
                      <p className="text-yellow-500 text-sm">Connect your wallet to claim tokens</p>
                    </div>
                  )}

                  {/* Claim Button */}
                  <button
                    onClick={handleClaim}
                    disabled={!isWalletConnected || claiming}
                    className={`w-full py-4 rounded-xl font-medium transition-all duration-200 ${
                      isWalletConnected && !claiming
                        ? 'bg-[#97FCE4] text-black hover:bg-[#85E6D1] shadow-lg shadow-[#97FCE4]/20'
                        : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {claiming ? (
                      <span className="flex items-center justify-center space-x-2">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Processing Claim...</span>
                      </span>
                    ) : (
                      <span className="flex items-center justify-center space-x-2">
                        <Gift className="w-5 h-5" />
                        <span>Claim {CLAIM_AMOUNT_DISPLAY} WBTC</span>
                      </span>
                    )}
                  </button>
                </div>

                {/* Features */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-[#0F1A1F] rounded-xl p-4">
                    <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center mb-3">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    </div>
                    <h3 className="text-white font-medium mb-1">Instant Transfer</h3>
                    <p className="text-sm text-gray-400">Tokens sent directly to your wallet</p>
                  </div>

                  <div className="bg-[#0F1A1F] rounded-xl p-4">
                    <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center mb-3">
                      <Droplet className="w-5 h-5 text-blue-500" />
                    </div>
                    <h3 className="text-white font-medium mb-1">Testnet Only</h3>
                    <p className="text-sm text-gray-400">Safe testing environment</p>
                  </div>

                  <div className="bg-[#0F1A1F] rounded-xl p-4">
                    <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center mb-3">
                      <Coins className="w-5 h-5 text-purple-500" />
                    </div>
                    <h3 className="text-white font-medium mb-1">One Per Address</h3>
                    <p className="text-sm text-gray-400">Fair distribution system</p>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-[#0F1A1F] rounded-xl p-8 text-center"
              >
                {/* Success Animation */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6"
                >
                  <CheckCircle className="w-10 h-10 text-white" />
                </motion.div>

                <h3 className="text-2xl font-bold text-white mb-2">Successfully Claimed!</h3>
                <p className="text-gray-400 mb-6">
                  Transaction submitted! Your {CLAIM_AMOUNT_DISPLAY} WBTC will arrive in ~30-60 seconds
                </p>

                {/* Transaction Details */}
                {txHash && (
                  <div className="bg-[#101D22] rounded-lg p-4 mb-6">
                    <p className="text-sm text-gray-400 mb-2">Transaction Hash</p>
                    <div className="flex items-center justify-center space-x-2 mb-3">
                      <p className="text-xs text-[#97FCE4] font-mono break-all">{formatAddress(txHash)}</p>
                      <a
                        href={`https://sepolia.voyager.online/tx/${txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1 hover:bg-gray-700 rounded transition-colors"
                      >
                        <ExternalLink className="w-4 h-4 text-[#97FCE4]" />
                      </a>
                    </div>
                    
                    <div className="flex items-center justify-center space-x-2 p-2 bg-blue-500/10 rounded-lg">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                      <p className="text-xs text-blue-300">Processing on Starknet testnet...</p>
                    </div>
                  </div>
                )}

                {/* Next Steps */}
                <div className="space-y-3 text-left">
                  <p className="text-sm font-medium text-white text-center mb-4">What&apos;s Next?</p>
                  
                  <div className="flex items-start space-x-3 p-3 bg-[#101D22] rounded-lg">
                    <div className="w-6 h-6 bg-[#97FCE4] rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-black font-bold text-sm">1</span>
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm">Deposit to YieldStark</p>
                      <p className="text-xs text-gray-400">Head to the dashboard and deposit your WBTC</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 p-3 bg-[#101D22] rounded-lg">
                    <div className="w-6 h-6 bg-[#97FCE4] rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-black font-bold text-sm">2</span>
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm">Start Earning Yield</p>
                      <p className="text-xs text-gray-400">Watch your funds grow across protocols</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 p-3 bg-[#101D22] rounded-lg">
                    <div className="w-6 h-6 bg-[#97FCE4] rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-black font-bold text-sm">3</span>
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm">Track Performance</p>
                      <p className="text-xs text-gray-400">Monitor your earnings in real-time</p>
                    </div>
                  </div>
                </div>

                {/* Go to Dashboard Button */}
                <button
                  onClick={() => window.location.href = '/dashboard'}
                  className="w-full mt-6 py-3 bg-[#97FCE4] text-black font-medium rounded-xl hover:bg-[#85E6D1] transition-colors"
                >
                  Go to Dashboard
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* How to Use Section */}
      <div className="bg-[#101D22] rounded-4xl p-6">
        <h3 className="text-xl font-medium text-white mb-6">How to Use Your Testnet WBTC</h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-4">
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-[#97FCE4] rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-black font-bold text-sm">1</span>
              </div>
              <div>
                <h4 className="text-white font-medium mb-1">Claim Your Tokens</h4>
                <p className="text-sm text-gray-400">
                  Connect your wallet and claim {CLAIM_AMOUNT_DISPLAY} WBTC tokens instantly
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-[#97FCE4] rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-black font-bold text-sm">2</span>
              </div>
              <div>
                <h4 className="text-white font-medium mb-1">Deposit to Vault</h4>
                <p className="text-sm text-gray-400">
                  Navigate to the dashboard and deposit your WBTC into the YieldStark vault
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-[#97FCE4] rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-black font-bold text-sm">3</span>
              </div>
              <div>
                <h4 className="text-white font-medium mb-1">Watch It Grow</h4>
                <p className="text-sm text-gray-400">
                  Your funds are automatically deployed to the highest-yielding protocols
                </p>
              </div>
            </div>
          </div>

          {/* Right Column - Quick Links */}
          <div className="bg-[#0F1A1F] rounded-xl p-6">
            <h4 className="text-white font-medium mb-4">Quick Links</h4>
            <div className="space-y-3">
              <a
                href="/dashboard"
                className="flex items-center justify-between p-3 bg-[#101D22] rounded-lg hover:bg-gray-800 transition-colors"
              >
                <span className="text-gray-300 text-sm">Dashboard</span>
                <ExternalLink className="w-4 h-4 text-gray-400" />
              </a>
              <a
                href="/dashboard/opportunities"
                className="flex items-center justify-between p-3 bg-[#101D22] rounded-lg hover:bg-gray-800 transition-colors"
              >
                <span className="text-gray-300 text-sm">Opportunities</span>
                <ExternalLink className="w-4 h-4 text-gray-400" />
              </a>
              <a
                href="/dashboard/staking"
                className="flex items-center justify-between p-3 bg-[#101D22] rounded-lg hover:bg-gray-800 transition-colors"
              >
                <span className="text-gray-300 text-sm">Staking</span>
                <ExternalLink className="w-4 h-4 text-gray-400" />
              </a>
              <a
                href="https://sepolia.voyager.online/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 bg-[#101D22] rounded-lg hover:bg-gray-800 transition-colors"
              >
                <span className="text-gray-300 text-sm">Block Explorer</span>
                <ExternalLink className="w-4 h-4 text-gray-400" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

