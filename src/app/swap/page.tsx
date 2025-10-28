'use client'

export default function SwapPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-[#101D22] rounded-lg p-8">
        <h1 className="text-2xl font-bold text-white mb-8">Swap</h1>
        
        <div className="space-y-6">
          {/* From Token */}
          <div className="bg-[#0F1A1F] rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 rounded-full"></div>
                <span className="text-white font-medium">Select token</span>
              </div>
              <span className="text-gray-400">0.0</span>
            </div>
          </div>
          
          {/* To Token */}
          <div className="bg-[#0F1A1F] rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
                <span className="text-white font-medium">Select token</span>
              </div>
              <span className="text-gray-400">0.0</span>
            </div>
          </div>
          
          {/* Connect Wallet Button */}
          <button className="w-full py-4 bg-[#97FCE4] text-black font-medium rounded-lg hover:bg-[#85E6D1] transition-colors">
            Connect Wallet
          </button>
        </div>
      </div>
    </div>
  )
}

