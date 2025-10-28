'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle } from 'lucide-react'

interface WithdrawModalProps {
  isOpen: boolean
  onClose: () => void
  onWithdraw: (amount: string) => Promise<string>
}

const WithdrawModal = ({ isOpen, onClose, onWithdraw }: WithdrawModalProps) => {
  const [amount, setAmount] = useState('')
  const [isWithdrawing, setIsWithdrawing] = useState(false)
  const [error, setError] = useState('')
  const [txHash, setTxHash] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)

  const isValidAmount = amount && parseFloat(amount) > 0

  const handleWithdraw = async () => {
    if (!isValidAmount) return
    setIsWithdrawing(true)
    setError('')
    try {
      const hash = await onWithdraw(amount)
      if (hash) {
        setTxHash(hash)
        setIsSuccess(true)
        console.log('Withdrawal successful! Transaction hash:', hash)
        
        // Close modal after a short delay to show success
        setTimeout(() => {
          onClose()
          setAmount('')
          setTxHash(null)
          setIsSuccess(false)
          setError('')
        }, 5000) // 5 seconds
      }
    } catch (err: any) {
      setError(err.message || 'Withdrawal failed. Please try again.')
      console.error('Withdrawal error:', err)
    } finally {
      setIsWithdrawing(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
            onClick={onClose}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="bg-[#101D22] rounded-2xl p-8 w-full max-w-2xl mx-auto border border-gray-800"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-white">Withdraw from Vault</h2>
                <button onClick={onClose} className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              {/* Success State */}
              {isSuccess && txHash ? (
                <div className="text-center py-6">
                  <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">Withdrawal Successful!</h3>
                  <p className="text-gray-300 mb-4">Your transaction has been submitted to the network.</p>
                  <div className="bg-[#0F1A1F] rounded-lg p-3 border border-gray-700">
                    <p className="text-sm text-gray-400 mb-1">Transaction Hash:</p>
                    <p className="text-xs text-[#97FCE4] font-mono break-all">
                      {txHash}
                    </p>
                    <a
                      href={`https://sepolia.starkscan.co/tx/${txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-400 hover:text-blue-300 underline mt-2 inline-block"
                    >
                      View on Starkscan →
                    </a>
                  </div>
                </div>
              ) : (
                <>
                  <div className="mb-6">
                    <label className="block text-sm text-gray-300 mb-2">Amount (wBTC)</label>
                    <input
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.0"
                      type="number"
                      step="0.00000001"
                      className="w-full bg-[#0b161a] border border-gray-800 rounded-xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-[#97FCE4]"
                    />
                    {error && (
                      <div className="mt-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                        <p className="text-sm text-red-400">{error}</p>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={handleWithdraw}
                    disabled={!isValidAmount || isWithdrawing}
                    className={`w-full py-4 rounded-xl font-medium transition-all duration-200 ${
                      isValidAmount && !isWithdrawing
                        ? 'bg-[#97FCE4] text-black hover:bg-[#85E6D1] shadow-lg shadow-[#97FCE4]/20'
                        : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {isWithdrawing ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                        <span>Processing Withdrawal...</span>
                      </div>
                    ) : (
                      `Withdraw ${amount || '0.00'} wBTC`
                    )}
                  </button>
                </>
              )}
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default WithdrawModal











