'use client'

import { useState } from 'react'
import { Mail, MessageCircle, Copy, Check, ExternalLink, HeadphonesIcon } from 'lucide-react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'

export default function SupportPage() {
  const [copiedEmail, setCopiedEmail] = useState(false)

  const handleCopyEmail = async () => {
    await navigator.clipboard.writeText('yieldstark.xyz@gmail.com')
    setCopiedEmail(true)
    toast.success('Email copied to clipboard!')
    setTimeout(() => setCopiedEmail(false), 2000)
  }

  const contactMethods = [
    {
      icon: Mail,
      title: 'Email Support',
      description: 'Send us an email and we\'ll get back to you within 24 hours',
      contact: 'yieldstark.xyz@gmail.com',
      action: handleCopyEmail,
      actionLabel: copiedEmail ? 'Copied!' : 'Copy Email',
      actionIcon: copiedEmail ? Check : Copy,
      gradient: 'from-[#97FCE4] to-[#85E6D1]',
      bgGradient: 'from-[#97FCE4]/10 to-[#85E6D1]/10'
    },
    {
      icon: MessageCircle,
      title: 'DM on X (Twitter)',
      description: 'Reach out to mankind for quick support and updates',
      contact: '@thatweb3gee',
      action: () => window.open('https://x.com/thatweb3gee', '_blank'),
      actionLabel: 'Send DM',
      actionIcon: ExternalLink,
      gradient: 'from-[#8B5CF6] to-[#A78BFA]',
      bgGradient: 'from-[#8B5CF6]/10 to-[#A78BFA]/10'
    }
  ]

  const faqs = [
    {
      question: 'How do I deposit WBTC?',
      answer: 'Connect your wallet, navigate to the Dashboard, and click the Deposit button. Enter the amount and confirm the transaction.'
    },
    {
      question: 'When can I withdraw my funds?',
      answer: 'You can withdraw your funds at any time from the Dashboard by clicking the Withdraw button.'
    },
    {
      question: 'What networks are supported?',
      answer: 'Currently, YieldStark operates on Starknet Sepolia (testnet) and will support Mainnet soon.'
    },
    {
      question: 'How do I get testnet tokens?',
      answer: 'Visit the Faucet page in the dashboard to claim free testnet WBTC for testing purposes.'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-[#101D22] rounded-4xl p-6">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-12 h-12 bg-gradient-to-r from-[#97FCE4] to-[#8B5CF6] rounded-full flex items-center justify-center">
            <HeadphonesIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-medium text-white">Support & Help</h1>
            <p className="text-gray-400">We&apos;re here to help you with any questions</p>
          </div>
        </div>

        {/* Welcome Message */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl p-6"
        >
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0">
              <HeadphonesIcon className="w-5 h-5 text-blue-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-white font-medium mb-2">Get Help & Support</h3>
              <p className="text-blue-300 text-sm leading-relaxed">
                Have questions about YieldStark? Need help with deposits or withdrawals? 
                Our team is ready to assist you. Choose your preferred contact method below.
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Contact Methods */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {contactMethods.map((method, index) => (
          <motion.div
            key={method.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-[#101D22] rounded-4xl p-6"
          >
            <div className={`bg-gradient-to-r ${method.bgGradient} rounded-xl p-6`}>
              {/* Icon */}
              <div className={`w-14 h-14 bg-gradient-to-r ${method.gradient} rounded-full flex items-center justify-center mb-4`}>
                <method.icon className="w-7 h-7 text-white" />
              </div>

              {/* Title & Description */}
              <h3 className="text-xl font-bold text-white mb-2">{method.title}</h3>
              <p className="text-gray-400 text-sm mb-4">{method.description}</p>

              {/* Contact Info */}
              <div className="bg-[#0F1A1F] rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-400 mb-1">Contact</p>
                <p className="text-white font-mono text-lg">{method.contact}</p>
              </div>

              {/* Action Button */}
              <button
                onClick={method.action}
                className={`w-full py-3 bg-gradient-to-r ${method.gradient} text-black font-medium rounded-xl hover:opacity-90 transition-all duration-200 shadow-lg flex items-center justify-center space-x-2`}
              >
                <method.actionIcon className="w-4 h-4" />
                <span>{method.actionLabel}</span>
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* FAQ Section */}
      <div className="bg-[#101D22] rounded-4xl p-6">
        <h2 className="text-2xl font-medium text-white mb-6">Frequently Asked Questions</h2>
        
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              className="bg-[#0F1A1F] rounded-xl p-5 border border-gray-800 hover:border-gray-700 transition-colors"
            >
              <h3 className="text-white font-medium mb-2 flex items-start">
                <span className="text-[#97FCE4] mr-2">Q:</span>
                {faq.question}
              </h3>
              <p className="text-gray-400 text-sm pl-6">
                <span className="text-[#8B5CF6] mr-2">A:</span>
                {faq.answer}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Additional Resources */}
      <div className="bg-[#101D22] rounded-4xl p-6">
        <h2 className="text-2xl font-medium text-white mb-4">Additional Resources</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/docs"
            className="bg-[#0F1A1F] rounded-xl p-4 hover:bg-gray-800 transition-colors group"
          >
            <div className="w-10 h-10 bg-[#97FCE4]/10 rounded-lg flex items-center justify-center mb-3 group-hover:bg-[#97FCE4]/20 transition-colors">
              <svg className="w-5 h-5 text-[#97FCE4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-white font-medium mb-1">Documentation</h3>
            <p className="text-gray-400 text-sm">Learn how to use YieldStark</p>
          </a>

          <a
            href="/dashboard/faucet"
            className="bg-[#0F1A1F] rounded-xl p-4 hover:bg-gray-800 transition-colors group"
          >
            <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center mb-3 group-hover:bg-blue-500/20 transition-colors">
              <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-white font-medium mb-1">Testnet Faucet</h3>
            <p className="text-gray-400 text-sm">Get free testnet tokens</p>
          </a>

          <a
            href="/dashboard"
            className="bg-[#0F1A1F] rounded-xl p-4 hover:bg-gray-800 transition-colors group"
          >
            <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center mb-3 group-hover:bg-purple-500/20 transition-colors">
              <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-white font-medium mb-1">Dashboard</h3>
            <p className="text-gray-400 text-sm">View your positions</p>
          </a>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="bg-gradient-to-r from-[#101D22] to-[#0F1A1F] rounded-4xl p-8 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-medium text-white mb-4">Still Need Help?</h2>
          <p className="text-gray-400 mb-6">
            Our support team is available to assist you. Reach out via email or Twitter/X and we&apos;ll respond as soon as possible.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleCopyEmail}
              className="px-8 py-3 bg-[#97FCE4] text-black font-medium rounded-xl hover:bg-[#85E6D1] transition-colors shadow-lg flex items-center justify-center space-x-2"
            >
              {copiedEmail ? <Check className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
              <span>{copiedEmail ? 'Email Copied!' : 'Copy Email Address'}</span>
            </button>
            <button
              onClick={() => window.open('https://x.com/thatweb3gee', '_blank')}
              className="px-8 py-3 bg-transparent border border-gray-600 text-white font-medium rounded-xl hover:bg-gray-800 transition-colors flex items-center justify-center space-x-2"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Message on X</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

