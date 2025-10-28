'use client'

import { useState } from 'react'
import { useAccount } from '@starknet-react/core'
import { useWalletStore } from '@/providers/wallet-store-provider'
import { TrendingUp, Shield, Zap, ArrowUpRight, CheckCircle } from 'lucide-react'
import { motion } from 'framer-motion'

export default function StakingPage() {
  const { } = useAccount()
  const { } = useWalletStore((state) => state)
  const [selectedStakingOption, setSelectedStakingOption] = useState<string | null>(null)

  const stakingOptions = [
    {
      id: 'bitcoin-staking',
      name: 'Bitcoin Staking',
      apy: '8.5%',
      minStake: '0.01',
      lockPeriod: '30 days',
      description: 'Stake your Bitcoin and earn rewards on Starknet',
      features: ['Native Bitcoin support', 'High security', 'Flexible terms'],
      isLive: true,
      color: '#F7931A',
      icon: '₿'
    },
    {
      id: 'eth-staking',
      name: 'Ethereum Staking',
      apy: '6.2%',
      minStake: '0.1',
      lockPeriod: '60 days',
      description: 'Stake Ethereum and earn consistent yields',
      features: ['Ethereum 2.0 compatible', 'Validator rewards', 'Compound interest'],
      isLive: false,
      color: '#627EEA',
      icon: 'Ξ'
    },
    {
      id: 'multi-asset',
      name: 'Multi-Asset Staking',
      apy: '7.8%',
      minStake: '0.05',
      lockPeriod: '45 days',
      description: 'Diversified staking across multiple assets',
      features: ['Portfolio diversification', 'Risk management', 'Auto-rebalancing'],
      isLive: false,
      color: '#97FCE4',
      icon: '⚡'
    }
  ]

  const stats = [
    { label: 'Total Staked', value: '$2.4M', change: '+12.5%' },
    { label: 'Active Stakers', value: '1,247', change: '+8.2%' },
    { label: 'Average APY', value: '7.2%', change: '+0.3%' },
    { label: 'Total Rewards', value: '$180K', change: '+15.1%' }
  ]

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-[#101D22] rounded-4xl p-6">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-12 h-12 bg-[#F7931A] rounded-full flex items-center justify-center">
            <span className="text-2xl font-bold text-white">₿</span>
          </div>
          <div>
            <h1 className="text-3xl font-medium text-white">Bitcoin Staking</h1>
            <p className="text-gray-400">Now live on Starknet</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-[#0F1A1F] rounded-xl p-4"
            >
              <p className="text-sm text-gray-400 mb-1">{stat.label}</p>
              <p className="text-2xl font-bold text-white mb-1">{stat.value}</p>
              <p className="text-sm text-[#97FCE4] flex items-center">
                <TrendingUp className="w-3 h-3 mr-1" />
                {stat.change}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Live Status Banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-r from-[#F7931A] to-[#FFB84D] rounded-xl p-4 mb-6"
        >
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
            <span className="text-white font-medium">Bitcoin Staking is now live!</span>
            <span className="text-white/80 text-sm">Start earning rewards today</span>
          </div>
        </motion.div>
      </div>

      {/* Staking Options */}
      <div className="bg-[#101D22] rounded-4xl p-6">
        <h2 className="text-2xl font-medium text-white mb-6">Staking Options</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {stakingOptions.map((option, index) => (
            <motion.div
              key={option.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative bg-[#0F1A1F] rounded-xl p-6 border-2 transition-all duration-200 ${
                selectedStakingOption === option.id
                  ? 'border-[#97FCE4] shadow-lg shadow-[#97FCE4]/20'
                  : 'border-transparent hover:border-gray-700'
              } ${!option.isLive ? 'opacity-60' : 'cursor-pointer'}`}
              onClick={() => option.isLive && setSelectedStakingOption(option.id)}
            >
              {/* Live Badge */}
              {option.isLive && (
                <div className="absolute -top-2 -right-2 bg-[#97FCE4] text-black px-3 py-1 rounded-full text-xs font-medium">
                  LIVE
                </div>
              )}

              {/* Coming Soon Badge */}
              {!option.isLive && (
                <div className="absolute -top-2 -right-2 bg-gray-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                  COMING SOON
                </div>
              )}

              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                    style={{ backgroundColor: option.color }}
                  >
                    {option.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-white">{option.name}</h3>
                    <p className="text-sm text-gray-400">{option.description}</p>
                  </div>
                </div>

                {/* APY */}
                <div className="text-center">
                  <p className="text-3xl font-bold text-[#97FCE4]">{option.apy}</p>
                  <p className="text-sm text-gray-400">Annual Percentage Yield</p>
                </div>

                {/* Details */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-400">Min Stake:</span>
                    <span className="text-sm text-white">{option.minStake} BTC</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-400">Lock Period:</span>
                    <span className="text-sm text-white">{option.lockPeriod}</span>
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-2">
                  {option.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-[#97FCE4]" />
                      <span className="text-sm text-gray-300">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Action Button */}
                <button
                  className={`w-full py-3 rounded-lg font-medium transition-colors ${
                    option.isLive
                      ? 'bg-[#97FCE4] text-black hover:bg-[#85E6D1]'
                      : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  }`}
                  disabled={!option.isLive}
                >
                  {option.isLive ? 'Start Staking' : 'Coming Soon'}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-[#101D22] rounded-4xl p-6">
        <h2 className="text-2xl font-medium text-white mb-6">How Bitcoin Staking Works</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              step: '01',
              title: 'Deposit Bitcoin',
              description: 'Send your Bitcoin to our secure vault on Starknet',
              icon: <Shield className="w-6 h-6" />
            },
            {
              step: '02',
              title: 'Start Earning',
              description: 'Your Bitcoin is automatically staked and starts earning rewards',
              icon: <Zap className="w-6 h-6" />
            },
            {
              step: '03',
              title: 'Claim Rewards',
              description: 'Withdraw your rewards or compound them for higher yields',
              icon: <ArrowUpRight className="w-6 h-6" />
            }
          ].map((step, index) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.2 }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-[#97FCE4] rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="text-black">
                  {step.icon}
                </div>
              </div>
              <div className="text-sm text-[#97FCE4] font-medium mb-2">{step.step}</div>
              <h3 className="text-lg font-medium text-white mb-2">{step.title}</h3>
              <p className="text-gray-400 text-sm">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Security & Benefits */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Security */}
        <div className="bg-[#101D22] rounded-4xl p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Shield className="w-6 h-6 text-[#97FCE4]" />
            <h3 className="text-xl font-medium text-white">Security</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-[#97FCE4] mt-0.5" />
              <div>
                <p className="text-white font-medium">Multi-signature Wallets</p>
                <p className="text-sm text-gray-400">Your funds are protected by multiple security layers</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-[#97FCE4] mt-0.5" />
              <div>
                <p className="text-white font-medium">Audited Smart Contracts</p>
                <p className="text-sm text-gray-400">All contracts are thoroughly audited by security experts</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-[#97FCE4] mt-0.5" />
              <div>
                <p className="text-white font-medium">Insurance Coverage</p>
                <p className="text-sm text-gray-400">Your staked assets are covered by comprehensive insurance</p>
              </div>
            </div>
          </div>
        </div>

        {/* Benefits */}
        <div className="bg-[#101D22] rounded-4xl p-6">
          <div className="flex items-center space-x-3 mb-4">
            <TrendingUp className="w-6 h-6 text-[#97FCE4]" />
            <h3 className="text-xl font-medium text-white">Benefits</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-[#97FCE4] mt-0.5" />
              <div>
                <p className="text-white font-medium">High APY</p>
                <p className="text-sm text-gray-400">Earn up to 8.5% APY on your Bitcoin</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-[#97FCE4] mt-0.5" />
              <div>
                <p className="text-white font-medium">Flexible Terms</p>
                <p className="text-sm text-gray-400">Choose from various staking periods</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-[#97FCE4] mt-0.5" />
              <div>
                <p className="text-white font-medium">No Lock-up</p>
                <p className="text-sm text-gray-400">Withdraw your funds anytime after the minimum period</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

