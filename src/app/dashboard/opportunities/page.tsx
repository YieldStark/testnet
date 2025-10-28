'use client'

import { useState } from 'react'
import { Clock, Star, ArrowRight, Zap, Shield, Target } from 'lucide-react'
import { motion } from 'framer-motion'
import Image from 'next/image'

export default function OpportunitiesPage() {
  const [selectedCategory, setSelectedCategory] = useState('all')

  const categories = [
    { id: 'all', name: 'All Opportunities', count: 12 },
    { id: 'defi', name: 'DeFi Protocols', count: 8 },
    { id: 'staking', name: 'Staking', count: 3 },
    { id: 'liquidity', name: 'Liquidity Mining', count: 5 }
  ]

  const upcomingOpportunities = [
    {
      id: 1,
      name: 'Uniswap V4 Integration',
      category: 'defi',
      apy: '12.5%',
      launchDate: 'Q2 2024',
      description: 'Advanced AMM with concentrated liquidity and hooks',
      features: ['Concentrated liquidity', 'Custom hooks', 'Gas optimization'],
      status: 'coming-soon',
      color: '#FF007A',
      logo: '/supported_platforms/vesu_brand.png'
    },
    {
      id: 2,
      name: 'Compound V3 Lending',
      category: 'defi',
      apy: '9.8%',
      launchDate: 'Q2 2024',
      description: 'Next-generation lending protocol with isolated markets',
      features: ['Isolated markets', 'High capital efficiency', 'Risk management'],
      status: 'coming-soon',
      color: '#00D395',
      logo: '/supported_platforms/ekubo.png'
    },
    {
      id: 3,
      name: 'Ethereum 2.0 Staking',
      category: 'staking',
      apy: '6.2%',
      launchDate: 'Q3 2024',
      description: 'Native Ethereum staking with validator rewards',
      features: ['Validator rewards', 'Slashing protection', 'Auto-compound'],
      status: 'coming-soon',
      color: '#627EEA',
      logo: '/supported_chains/starknet.png'
    },
    {
      id: 4,
      name: 'Curve Finance Pools',
      category: 'liquidity',
      apy: '15.3%',
      launchDate: 'Q2 2024',
      description: 'Stablecoin and pegged asset trading with low slippage',
      features: ['Low slippage', 'Stablecoin focus', 'Governance tokens'],
      status: 'coming-soon',
      color: '#3465A4',
      logo: '/supported_platforms/vesu_brand.png'
    }
  ]

  const stats = [
    { label: 'Upcoming Protocols', value: '12', change: '+3 this month' },
    { label: 'Expected APY', value: '8.5%', change: 'Average across all' },
    { label: 'Launch Timeline', value: 'Q2-Q3 2024', change: 'Next 6 months' },
    { label: 'Total Value', value: '$50M+', change: 'Expected TVL' }
  ]

  const filteredOpportunities = selectedCategory === 'all' 
    ? upcomingOpportunities 
    : upcomingOpportunities.filter(opp => opp.category === selectedCategory)

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-[#101D22] rounded-4xl p-6">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-12 h-12 bg-gradient-to-r from-[#97FCE4] to-[#8B5CF6] rounded-full flex items-center justify-center">
            <Target className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-medium text-white">Opportunities</h1>
            <p className="text-gray-400">Discover upcoming yield opportunities</p>
          </div>
        </div>

        {/* Stats Grid */}
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
              <p className="text-sm text-[#97FCE4]">{stat.change}</p>
            </motion.div>
          ))}
        </div>

        {/* Coming Soon Banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-r from-[#8B5CF6] to-[#97FCE4] rounded-xl p-4"
        >
          <div className="flex items-center space-x-3">
            <Clock className="w-5 h-5 text-white" />
            <span className="text-white font-medium">New opportunities launching soon!</span>
            <span className="text-white/80 text-sm">Be the first to access high-yield protocols</span>
          </div>
        </motion.div>
      </div>

      {/* Category Filter */}
      <div className="bg-[#101D22] rounded-4xl p-6">
        <h2 className="text-xl font-medium text-white mb-4">Filter by Category</h2>
        
        <div className="flex flex-wrap gap-3">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedCategory === category.id
                  ? 'bg-[#97FCE4] text-black'
                  : 'bg-[#0F1A1F] text-white hover:bg-gray-700'
              }`}
            >
              {category.name} ({category.count})
            </button>
          ))}
        </div>
      </div>

      {/* Opportunities Grid */}
      <div className="bg-[#101D22] rounded-4xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-medium text-white">Upcoming Opportunities</h2>
          <div className="flex items-center space-x-2 text-sm text-gray-400">
            <Clock className="w-4 h-4" />
            <span>Launching Q2-Q3 2024</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredOpportunities.map((opportunity, index) => (
            <motion.div
              key={opportunity.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-[#0F1A1F] rounded-xl p-6 border border-gray-800 hover:border-gray-700 transition-colors"
            >
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center overflow-hidden">
                      <Image
                        src={opportunity.logo}
                        alt={opportunity.name}
                        width={48}
                        height={48}
                        className="object-contain"
                      />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-white">{opportunity.name}</h3>
                      <p className="text-sm text-gray-400">{opportunity.description}</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-2xl font-bold text-[#97FCE4]">{opportunity.apy}</div>
                    <div className="text-xs text-gray-400">Expected APY</div>
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-2">
                  {opportunity.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-[#97FCE4] rounded-full"></div>
                      <span className="text-sm text-gray-300">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Launch Info */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-800">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-400">Launch: {opportunity.launchDate}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button className="px-3 py-1 bg-gray-700 text-white text-sm rounded-lg hover:bg-gray-600 transition-colors">
                      Notify Me
                    </button>
                    <button className="p-2 bg-[#97FCE4] text-black rounded-lg hover:bg-[#85E6D1] transition-colors">
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Benefits Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Early Access */}
        <div className="bg-[#101D22] rounded-4xl p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-[#97FCE4] rounded-full flex items-center justify-center">
              <Star className="w-4 h-4 text-black" />
            </div>
            <h3 className="text-lg font-medium text-white">Early Access</h3>
          </div>
          <p className="text-gray-400 text-sm">
            Get exclusive early access to new protocols and earn higher yields before they become widely available.
          </p>
        </div>

        {/* Risk Management */}
        <div className="bg-[#101D22] rounded-4xl p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-lg font-medium text-white">Risk Management</h3>
          </div>
          <p className="text-gray-400 text-sm">
            All opportunities are thoroughly vetted and audited to ensure maximum security for your investments.
          </p>
        </div>

        {/* Auto-Optimization */}
        <div className="bg-[#101D22] rounded-4xl p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-lg font-medium text-white">Auto-Optimization</h3>
          </div>
          <p className="text-gray-400 text-sm">
            Our AI agent automatically moves your funds to the highest-yielding opportunities as they become available.
          </p>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-gradient-to-r from-[#101D22] to-[#0F1A1F] rounded-4xl p-8 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-medium text-white mb-4">Stay Ahead of the Curve</h2>
          <p className="text-gray-400 mb-6">
            Be the first to know about new yield opportunities. Get notified when high-APY protocols launch.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-3 bg-[#97FCE4] text-black font-medium rounded-lg hover:bg-[#85E6D1] transition-colors">
              Enable Notifications
            </button>
            <button className="px-8 py-3 bg-transparent border border-gray-600 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors">
              Learn More
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}



