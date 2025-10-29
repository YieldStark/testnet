'use client'

import { Clock, Target } from 'lucide-react'
import { motion } from 'framer-motion'
import Image from 'next/image'

export default function OpportunitiesPage() {

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-[#101D22] rounded-4xl p-6">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-r from-[#97FCE4] to-[#8B5CF6] rounded-full flex items-center justify-center">
            <Target className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-medium text-white">Opportunities</h1>
            <p className="text-gray-400">Discover upcoming yield opportunities</p>
          </div>
        </div>
      </div>

      {/* Coming Soon Assets Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-gradient-to-br from-[#101D22] via-[#1a2832] to-[#101D22] rounded-4xl p-8 md:p-12 border border-gray-800/50 shadow-2xl overflow-hidden relative"
      >
        {/* Background glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#97FCE4]/5 via-[#8B5CF6]/5 to-[#97FCE4]/5 blur-3xl"></div>
        
        <div className="relative z-10 flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
          {/* Image Section */}
          <div className="flex-shrink-0 w-full lg:w-1/2 flex justify-center">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-[#97FCE4] to-[#8B5CF6] rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition duration-500"></div>
              <div className="relative bg-[#0F1A1F] rounded-2xl p-4 shadow-2xl">
                <Image
                  src="/opportunities.png"
                  alt="Opportunities Coming Soon"
                  width={500}
                  height={400}
                  className="rounded-xl w-full h-auto object-contain"
                  priority
                />
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="flex-1 text-center lg:text-left space-y-6">
            {/* Coming Soon Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#97FCE4]/10 border border-[#97FCE4]/30 rounded-full">
              <Clock className="w-4 h-4 text-[#97FCE4] animate-pulse" />
              <span className="text-[#97FCE4] font-medium text-sm uppercase tracking-wider">Coming Soon</span>
            </div>

            {/* Main Heading */}
            <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight">
              More Yield Assets<br />
              <span className="bg-gradient-to-r from-[#97FCE4] to-[#8B5CF6] bg-clip-text text-transparent">
                On The Way
              </span>
            </h2>

            {/* Description */}
            <p className="text-gray-400 text-base md:text-lg max-w-xl">
              Other assets will be available for yield very soon. Expand your portfolio with these upcoming Bitcoin-backed assets.
            </p>

            {/* Asset Tokens */}
            <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
              {['tBTC', 'sBTC', 'cbBTC', 'solvBTC', 'LBTC'].map((asset, index) => (
                <motion.div
                  key={asset}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 * index }}
                  className="px-4 py-2 bg-gradient-to-r from-[#0F1A1F] to-[#1a2832] border border-gray-700/50 rounded-lg hover:border-[#97FCE4]/50 transition-all duration-300 hover:shadow-lg hover:shadow-[#97FCE4]/20"
                >
                  <span className="font-mono font-semibold text-white">{asset}</span>
                </motion.div>
              ))}
            </div>

            {/* Footer text */}
            <div className="pt-4">
              <p className="text-sm text-gray-500 uppercase tracking-widest font-medium">
                Soon on <span className="text-[#97FCE4] font-bold">YieldStark</span>
              </p>
            </div>
          </div>
        </div>
      </motion.div>

    </div>
  )
}



