'use client'

import { useState } from 'react'
import { useWalletStore } from '@/providers/wallet-store-provider'
import { connect } from '@starknet-io/get-starknet'
import { WalletAccount } from 'starknet'
import { 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Database, 
  Download,
  Upload,
  Trash2,
  Save,
  Eye,
  EyeOff,
  Wallet,
  Plus,
  Copy,
  ExternalLink,
  AlertTriangle
} from 'lucide-react'

export default function SettingsPage() {
  const isConnected = useWalletStore((state) => state.isConnected)
  const vaultAddress = useWalletStore((state) => state.vaultAddress)
  const { } = useWalletStore((state) => state)
  const disconnectWallet = useWalletStore((state) => state.disconnectWallet)

  const [activeTab, setActiveTab] = useState('wallet')
  const [showPrivateKey, setShowPrivateKey] = useState(false)
  const [isConnectingBackup, setIsConnectingBackup] = useState(false)
  const [backupWallets, setBackupWallets] = useState<Array<{id: number, address: string, name: string, connectedAt: string, isActive: boolean}>>([])
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    sms: false,
    priceAlerts: true,
    securityAlerts: true
  })

  const [preferences, setPreferences] = useState({
    theme: 'dark',
    language: 'en',
    currency: 'USD',
    timezone: 'UTC'
  })

  const tabs = [
    { id: 'wallet', label: 'Wallet', icon: Wallet },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'preferences', label: 'Preferences', icon: Palette },
    { id: 'data', label: 'Data & Privacy', icon: Database }
  ]

  const formatAddress = (address: string) => {
    if (!address) return ''
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      // You could add a toast notification here
      console.log('Address copied to clipboard')
    } catch (err) {
      console.error('Failed to copy address:', err)
    }
  }

  const handleConnectBackupWallet = async () => {
    try {
      setIsConnectingBackup(true)

      // Use the standard UI to select a wallet with DARK theme
      const selectedWalletSWO = await connect({ 
        modalMode: 'alwaysAsk',
        modalTheme: 'dark'
      })

      if (selectedWalletSWO) {
        // Connect to the selected wallet
        // Use Alchemy API with fallbacks: Alchemy → PublicNode → dRPC
        const alchemyApiKey = typeof window !== 'undefined'
          ? ((window as Window & { __ALCHEMY_API_KEY__?: string }).__ALCHEMY_API_KEY__ || process.env.NEXT_PUBLIC_ALCHEMY_API_KEY)
          : process.env.NEXT_PUBLIC_ALCHEMY_API_KEY
        const rpcUrl = alchemyApiKey
          ? `https://starknet-mainnet.g.alchemy.com/v2/${alchemyApiKey}`
          : 'https://starknet-mainnet.public.blastapi.io/rpc/v0_8' // Mainnet fallback (no public node for mainnet yet)
        const myWalletAccount = await WalletAccount.connect(
          { nodeUrl: rpcUrl },
          selectedWalletSWO
        )

        // Add to backup wallets list
        const newBackupWallet = {
          id: Date.now(),
          address: myWalletAccount.address,
          name: selectedWalletSWO.name || 'Backup Wallet',
          connectedAt: new Date().toISOString(),
          isActive: false
        }

        setBackupWallets(prev => [...prev, newBackupWallet])
        console.log('Backup wallet connected:', myWalletAccount.address)
      }
    } catch (error) {
      console.error('Failed to connect backup wallet:', error)
    } finally {
      setIsConnectingBackup(false)
    }
  }

  const handleRemoveBackupWallet = (walletId: number) => {
    setBackupWallets(prev => prev.filter(wallet => wallet.id !== walletId))
  }

  const handleNotificationChange = (key: string, value: boolean) => {
    setNotifications(prev => ({ ...prev, [key]: value }))
  }

  const handlePreferenceChange = (key: string, value: string) => {
    setPreferences(prev => ({ ...prev, [key]: value }))
  }

  const handleExportData = () => {
    const data = {
      wallet: { isConnected, vaultAddress },
      backupWallets,
      notifications,
      preferences,
      timestamp: new Date().toISOString()
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'yieldstark-settings.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string)
          if (data.notifications) setNotifications(data.notifications)
          if (data.preferences) setPreferences(data.preferences)
          if (data.backupWallets) setBackupWallets(data.backupWallets)
          alert('Settings imported successfully!')
        } catch {
          alert('Error importing settings. Please check the file format.')
        }
      }
      reader.readAsText(file)
    }
  }

  const handleClearData = () => {
    if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      localStorage.clear()
      window.location.reload()
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#101D22] rounded-4xl p-6">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-12 h-12 bg-[#97FCE4] rounded-full flex items-center justify-center">
            <Wallet className="w-6 h-6 text-black" />
          </div>
          <div>
            <h1 className="text-3xl font-medium text-white">Settings</h1>
            <p className="text-gray-400">Manage your wallet and account preferences</p>
          </div>
        </div>

        {/* Connection Status */}
        <div className="bg-[#0F1A1F] rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-white">Primary Wallet</h3>
              <p className="text-sm text-gray-400">
                {isConnected ? `Connected: ${formatAddress(vaultAddress)}` : 'Not connected'}
              </p>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              isConnected 
                ? 'bg-green-500/20 text-green-400' 
                : 'bg-red-500/20 text-red-400'
            }`}>
              {isConnected ? 'Connected' : 'Disconnected'}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-[#101D22] rounded-4xl p-6">
            <nav className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                      activeTab === tab.id
                        ? 'bg-[#97FCE4] text-black'
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                )
              })}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <div className="bg-[#101D22] rounded-4xl p-6">
            {/* Wallet Tab */}
            {activeTab === 'wallet' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-medium text-white">Wallet Management</h2>
                
                {/* Primary Wallet */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-white">Primary Wallet</h3>
                  
                  {isConnected ? (
                    <div className="bg-[#0F1A1F] rounded-xl p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-[#97FCE4] rounded-full flex items-center justify-center">
                            <Wallet className="w-5 h-5 text-black" />
                          </div>
                          <div>
                            <h4 className="text-white font-medium">Connected Wallet</h4>
                            <p className="text-sm text-gray-400">Primary wallet for transactions</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm font-medium">
                            Active
                          </span>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Wallet Address
                          </label>
                          <div className="flex items-center space-x-3">
                            <span className="text-sm text-gray-300 font-mono bg-gray-800 px-3 py-2 rounded-lg flex-1">
                              {vaultAddress}
                            </span>
                            <button 
                              onClick={() => copyToClipboard(vaultAddress)}
                              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                              title="Copy address"
                            >
                              <Copy className="w-4 h-4 text-gray-400" />
                            </button>
                            <button 
                              onClick={() => window.open(`https://starkscan.co/contract/${vaultAddress}`, '_blank')}
                              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                              title="View on Starkscan"
                            >
                              <ExternalLink className="w-4 h-4 text-gray-400" />
                            </button>
                          </div>
                        </div>

                        <div className="flex space-x-3">
                          <button
                            onClick={disconnectWallet}
                            className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
                          >
                            Disconnect
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-[#0F1A1F] rounded-xl p-6 border-2 border-dashed border-gray-600">
                      <div className="text-center">
                        <Wallet className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h4 className="text-white font-medium mb-2">No Primary Wallet Connected</h4>
                        <p className="text-sm text-gray-400 mb-4">
                          Connect a wallet to start using YieldStark
                        </p>
                        <button
                          onClick={() => window.location.href = '/dashboard'}
                          className="px-6 py-3 bg-[#97FCE4] text-black font-medium rounded-lg hover:bg-[#85E6D1] transition-colors"
                        >
                          Connect Wallet
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Backup Wallets */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-white">Backup Wallets</h3>
                    <button
                      onClick={handleConnectBackupWallet}
                      disabled={isConnectingBackup}
                      className="px-4 py-2 bg-[#97FCE4] text-black font-medium rounded-lg hover:bg-[#85E6D1] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>{isConnectingBackup ? 'Connecting...' : 'Add Backup'}</span>
                    </button>
                  </div>

                  {backupWallets.length > 0 ? (
                    <div className="space-y-3">
                      {backupWallets.map((wallet) => (
                        <div key={wallet.id} className="bg-[#0F1A1F] rounded-xl p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                                <Wallet className="w-4 h-4 text-white" />
                              </div>
                              <div>
                                <h4 className="text-white font-medium">{wallet.name}</h4>
                                <p className="text-sm text-gray-400 font-mono">{formatAddress(wallet.address)}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => copyToClipboard(wallet.address)}
                                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                                title="Copy address"
                              >
                                <Copy className="w-4 h-4 text-gray-400" />
                              </button>
                              <button
                                onClick={() => window.open(`https://starkscan.co/contract/${wallet.address}`, '_blank')}
                                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                                title="View on Starkscan"
                              >
                                <ExternalLink className="w-4 h-4 text-gray-400" />
                              </button>
                              <button
                                onClick={() => handleRemoveBackupWallet(wallet.id)}
                                className="p-2 hover:bg-red-600/20 rounded-lg transition-colors"
                                title="Remove backup wallet"
                              >
                                <Trash2 className="w-4 h-4 text-red-400" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-[#0F1A1F] rounded-xl p-6 border-2 border-dashed border-gray-600">
                      <div className="text-center">
                        <Plus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h4 className="text-white font-medium mb-2">No Backup Wallets</h4>
                        <p className="text-sm text-gray-400 mb-4">
                          Add backup wallets for enhanced security and recovery options
                        </p>
                        <button
                          onClick={handleConnectBackupWallet}
                          disabled={isConnectingBackup}
                          className="px-6 py-3 bg-gray-700 text-white font-medium rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isConnectingBackup ? 'Connecting...' : 'Add First Backup'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Security Tips */}
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="w-5 h-5 text-blue-400 mt-0.5" />
                    <div>
                      <h4 className="text-blue-400 font-medium mb-2">Security Tips</h4>
                      <ul className="text-sm text-blue-300 space-y-1">
                        <li>• Always keep your private keys secure and never share them</li>
                        <li>• Use backup wallets for additional security</li>
                        <li>• Regularly check your wallet activity</li>
                        <li>• Enable 2FA when available</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-medium text-white">Profile Settings</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Display Name
                    </label>
                    <input
                      type="text"
                      placeholder="Enter your display name"
                      className="w-full px-4 py-3 bg-[#0F1A1F] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-[#97FCE4] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      placeholder="Enter your email"
                      className="w-full px-4 py-3 bg-[#0F1A1F] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-[#97FCE4] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Bio
                    </label>
                    <textarea
                      placeholder="Tell us about yourself"
                      rows={4}
                      className="w-full px-4 py-3 bg-[#0F1A1F] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-[#97FCE4] focus:outline-none resize-none"
                    />
                  </div>
                </div>

                <button className="px-6 py-3 bg-[#97FCE4] text-black font-medium rounded-lg hover:bg-[#85E6D1] transition-colors flex items-center space-x-2">
                  <Save className="w-5 h-5" />
                  <span>Save Changes</span>
                </button>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-medium text-white">Notification Settings</h2>
                
                <div className="space-y-4">
                  {Object.entries(notifications).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between p-4 bg-[#0F1A1F] rounded-lg">
                      <div>
                        <h3 className="text-white font-medium capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </h3>
                        <p className="text-sm text-gray-400">
                          {key === 'email' && 'Receive notifications via email'}
                          {key === 'push' && 'Receive push notifications in browser'}
                          {key === 'sms' && 'Receive SMS notifications'}
                          {key === 'priceAlerts' && 'Get notified about price changes'}
                          {key === 'securityAlerts' && 'Get notified about security events'}
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={value}
                          onChange={(e) => handleNotificationChange(key, e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#97FCE4]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#97FCE4]"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-medium text-white">Security Settings</h2>
                
                <div className="space-y-4">
                  <div className="p-4 bg-[#0F1A1F] rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-white font-medium">Two-Factor Authentication</h3>
                        <p className="text-sm text-gray-400">Add an extra layer of security to your account</p>
                      </div>
                      <button className="px-4 py-2 bg-[#97FCE4] text-black font-medium rounded-lg hover:bg-[#85E6D1] transition-colors">
                        Enable 2FA
                      </button>
                    </div>
                  </div>

                  <div className="p-4 bg-[#0F1A1F] rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-white font-medium">Private Key</h3>
                        <p className="text-sm text-gray-400">
                          {showPrivateKey ? 'Your private key is visible' : 'Your private key is hidden'}
                        </p>
                        {showPrivateKey && (
                          <p className="text-xs text-red-400 mt-1">
                            ⚠️ Never share your private key with anyone
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => setShowPrivateKey(!showPrivateKey)}
                        className="px-4 py-2 bg-gray-700 text-white font-medium rounded-lg hover:bg-gray-600 transition-colors flex items-center space-x-2"
                      >
                        {showPrivateKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        <span>{showPrivateKey ? 'Hide' : 'Show'}</span>
                      </button>
                    </div>
                    {showPrivateKey && (
                      <div className="mt-3 p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
                        <p className="text-red-400 font-mono text-sm break-all">
                          {vaultAddress || 'No private key available'}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="p-4 bg-[#0F1A1F] rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-white font-medium">Change Password</h3>
                        <p className="text-sm text-gray-400">Update your account password</p>
                      </div>
                      <button className="px-4 py-2 bg-[#97FCE4] text-black font-medium rounded-lg hover:bg-[#85E6D1] transition-colors">
                        Change
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Preferences Tab */}
            {activeTab === 'preferences' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-medium text-white">Preferences</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Theme
                    </label>
                    <select
                      value={preferences.theme}
                      onChange={(e) => handlePreferenceChange('theme', e.target.value)}
                      className="w-full px-4 py-3 bg-[#0F1A1F] border border-gray-700 rounded-lg text-white focus:border-[#97FCE4] focus:outline-none"
                    >
                      <option value="dark">Dark</option>
                      <option value="light">Light</option>
                      <option value="auto">Auto</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Language
                    </label>
                    <select
                      value={preferences.language}
                      onChange={(e) => handlePreferenceChange('language', e.target.value)}
                      className="w-full px-4 py-3 bg-[#0F1A1F] border border-gray-700 rounded-lg text-white focus:border-[#97FCE4] focus:outline-none"
                    >
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                      <option value="de">German</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Currency
                    </label>
                    <select
                      value={preferences.currency}
                      onChange={(e) => handlePreferenceChange('currency', e.target.value)}
                      className="w-full px-4 py-3 bg-[#0F1A1F] border border-gray-700 rounded-lg text-white focus:border-[#97FCE4] focus:outline-none"
                    >
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                      <option value="BTC">BTC</option>
                      <option value="ETH">ETH</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Timezone
                    </label>
                    <select
                      value={preferences.timezone}
                      onChange={(e) => handlePreferenceChange('timezone', e.target.value)}
                      className="w-full px-4 py-3 bg-[#0F1A1F] border border-gray-700 rounded-lg text-white focus:border-[#97FCE4] focus:outline-none"
                    >
                      <option value="UTC">UTC</option>
                      <option value="EST">Eastern Time</option>
                      <option value="PST">Pacific Time</option>
                      <option value="GMT">Greenwich Mean Time</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Data & Privacy Tab */}
            {activeTab === 'data' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-medium text-white">Data & Privacy</h2>
                
                <div className="space-y-4">
                  <div className="p-4 bg-[#0F1A1F] rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-white font-medium">Export Data</h3>
                        <p className="text-sm text-gray-400">Download a copy of your settings and preferences</p>
                      </div>
                      <button
                        onClick={handleExportData}
                        className="px-4 py-2 bg-[#97FCE4] text-black font-medium rounded-lg hover:bg-[#85E6D1] transition-colors flex items-center space-x-2"
                      >
                        <Download className="w-4 h-4" />
                        <span>Export</span>
                      </button>
                    </div>
                  </div>

                  <div className="p-4 bg-[#0F1A1F] rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-white font-medium">Import Data</h3>
                        <p className="text-sm text-gray-400">Import settings from a previously exported file</p>
                      </div>
                      <label className="px-4 py-2 bg-gray-700 text-white font-medium rounded-lg hover:bg-gray-600 transition-colors flex items-center space-x-2 cursor-pointer">
                        <Upload className="w-4 h-4" />
                        <span>Import</span>
                        <input
                          type="file"
                          accept=".json"
                          onChange={handleImportData}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>

                  <div className="p-4 bg-[#0F1A1F] rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-white font-medium">Clear All Data</h3>
                        <p className="text-sm text-gray-400">Permanently delete all your data and settings</p>
                      </div>
                      <button
                        onClick={handleClearData}
                        className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Clear Data</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

