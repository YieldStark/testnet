'use client'

import { useEffect, useState, useCallback } from 'react'
import AgentPerformance from '@/components/dashboard/AgentPerformance'
import CurrentPositions from '@/components/dashboard/CurrentPositions'
import DepositModal from '@/components/ui/DepositModal'
import WithdrawModal from '@/components/ui/WithdrawModal'
import { useWalletStore } from '@/providers/wallet-store-provider'
import { useTokenAddress, useYieldStarkAddress } from '@/lib/contracts'
import { ERC20_ABI } from '@/lib/abi/erc20'
import { cairo0Erc20Abi } from '@/lib/abi/cairo0Erc20'
import { Contract, uint256, RpcProvider } from 'starknet'
import { toUint256FromDecimals, uint256ToDecimalString } from '@/lib/u256'
import { depositVesuFlow } from '@/lib/depositOrchestrator'
import { useNetworkStore } from '@/stores/network-store'
import { VWBTC_ADDRESS, WBTC } from '@/lib/utils/Constants'

export default function DashboardPage() {
  const vaultAddress = useWalletStore((state) => state.vaultAddress)
  const isConnected = useWalletStore((state) => state.isConnected)
  const wallet = useWalletStore((state) => state.wallet)
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false)
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false)
  const explorerUrl = useNetworkStore((s) => s.currentNetwork.explorerUrl)
  const yieldStarkAddress = useYieldStarkAddress()
  const wbtcAddress = useTokenAddress('WBTC')
  const [userStaked, setUserStaked] = useState<string>('0')
  const wbtcDecimals = 8 // Update if different on Starknet
  const [loading, setLoading] = useState(false)
  const [wbtcBalance, setWbtcBalance] = useState<string>('0')
  const [refreshKey, setRefreshKey] = useState(0) // Key to trigger component refresh
  
  // Debug logging
  console.log('Dashboard - vaultAddress:', vaultAddress)
  console.log('Dashboard - isConnected:', isConnected)


  // Format balance function (from previous working implementation)
  const formatBalance = (balance: string) => {
    if (!balance) return "0";
    // WBTC has 8 decimals
    const formattedBalance = (Number(balance) / 1e8).toFixed(8);
    // Remove trailing zeros after decimal
    return formattedBalance.replace(/\.?0+$/, '');
  };

  // WBTC BALANCE (using exact previous working implementation)
  const fetchBalance = useCallback(async () => {
    if (!wallet?.address) return;
    setLoading(true);
    try {
      // Fetch WBTC balance using the exact working approach from previous codebase
      const sepoliaProvider = new RpcProvider({ nodeUrl: "https://starknet-sepolia.public.blastapi.io/rpc/v0_6" });
      const erc20 = new Contract({ abi: cairo0Erc20Abi, address: WBTC, providerOrAccount: sepoliaProvider });
      const res = await erc20.balanceOf(wallet.address);
      setWbtcBalance(res.balance.toString());
    } catch (err) {
      console.error("Error fetching balance:", err);
      setWbtcBalance("0");
    } finally {
      setLoading(false);
    }
  }, [wallet?.address]);

  useEffect(() => {
    if (isConnected && wallet?.address) fetchBalance();
  }, [isConnected, wallet?.address, fetchBalance, refreshKey]);


  // Format address for display (show first 6 and last 4 characters)
  const formatAddress = (address: string) => {
    if (!address) return ''
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }


  // Copy address to clipboard
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(vaultAddress)
      // You could add a toast notification here
      console.log('Address copied to clipboard')
    } catch (err) {
      console.error('Failed to copy address:', err)
    }
  }

  // Handle deposit (route to Vesu vWBTC)
  const handleDeposit = async (amount: string) => {
    try {
      if (!wallet) throw new Error('Wallet not connected')
      // Use the proven working vWBTC batched calls approach
      const txHash = await depositVesuFlow({
        account: wallet as any,
        address: wallet.address,
        amountStr: amount,
        signTypedDataAsync: async () => ({}), // Not used in vWBTC path
        useSignature: true, // Use vWBTC path
      })
      
      console.log('Deposit successful! Transaction hash:', txHash)
      
      // Save transaction to local storage for history
      if (txHash && wallet.address) {
        try {
          const { saveLocalTransaction } = await import('@/lib/utils/transactionHistory')
          saveLocalTransaction({
            hash: txHash,
            timestamp: Math.floor(Date.now() / 1000),
            type: 'deposit',
            amount: amount,
            from: wallet.address,
            to: '0x076ce66eba78210a836fca94ab91828c0f6941ad88585a700f3e473a9b4af870', // vWBTC address
            status: 'success',
            blockNumber: 0
          })
        } catch (err) {
          console.error('Failed to save transaction locally:', err)
        }
      }
      
      await refreshUserStaked()
      
      // Trigger immediate refresh of both components
      setRefreshKey(prev => prev + 1)
      
      return txHash // Return the transaction hash
    } catch (error) {
      console.error('Deposit failed:', error)
      throw error // Re-throw to let the modal handle the error state
    }
  }

  // Handle withdraw from Vesu
  const handleWithdraw = async (amount: string) => {
    try {
      if (!wallet) throw new Error('Wallet not connected')
      
      // Import the withdrawal function
      const { withdrawFromVesu } = await import('@/lib/abi/vesu')
      
      // Convert amount to bigint (8 decimals for WBTC)
      const amountBigInt = BigInt(Math.floor(parseFloat(amount) * 1e8))
      
      console.log('Starting withdrawal...', amount, 'WBTC')
      
      // Execute withdrawal
      const txHash = await withdrawFromVesu(wallet as any, amountBigInt)
      
      console.log('Withdrawal successful! Transaction hash:', txHash)
      
      // Save transaction to local storage for history
      if (txHash && wallet.address) {
        try {
          const { saveLocalTransaction } = await import('@/lib/utils/transactionHistory')
          saveLocalTransaction({
            hash: txHash,
            timestamp: Math.floor(Date.now() / 1000),
            type: 'withdraw',
            amount: amount,
            from: '0x076ce66eba78210a836fca94ab91828c0f6941ad88585a700f3e473a9b4af870', // vWBTC address
            to: wallet.address,
            status: 'success',
            blockNumber: 0
          })
        } catch (err) {
          console.error('Failed to save transaction locally:', err)
        }
      }
      
      await refreshUserStaked()
      
      // Trigger immediate refresh of both components
      setRefreshKey(prev => prev + 1)
      
      return txHash
    } catch (error) {
      console.error('Withdrawal failed:', error)
      throw error
    }
  }

  const refreshUserStaked = async () => {
    try {
      if (!wallet?.address) return
      
      // Fetch WBTC balance using the exact working approach from previous codebase
      const sepoliaProvider = new RpcProvider({ nodeUrl: "https://starknet-sepolia.public.blastapi.io/rpc/v0_6" });
      const wbtcContract = new Contract({ abi: cairo0Erc20Abi, address: WBTC, providerOrAccount: sepoliaProvider });
      const res = await wbtcContract.balanceOf(wallet.address);
      const formattedBalance = formatBalance(res.balance.toString());
      setUserStaked(formattedBalance);
    } catch (error) {
      console.error('Failed to fetch WBTC balance:', error)
      // Keep previous value on error
    }
  }

  useEffect(() => {
    refreshUserStaked()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [yieldStarkAddress, wbtcAddress, wallet?.address])

  return (
    <div className="space-y-6">
      {/* Main Dashboard Block - Everything in ONE modal */}
      <div className="bg-[#101D22] rounded-4xl p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Vault Info and Balance */}
          <div className="lg:col-span-2 space-y-6">
            {/* Wallet and Vault Addresses */}
            <div>
              <h3 className="text-lg font-medium text-white mb-6">Your Wallet Address:</h3>
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-300 font-mono">
                  {isConnected && vaultAddress ? formatAddress(vaultAddress) : 'Not connected'}
                </span>
                {isConnected && vaultAddress && (
                  <>
                    <button 
                      onClick={copyToClipboard}
                      className="p-1 hover:bg-gray-700 rounded transition-colors"
                      title="Copy address"
                    >
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                    <button 
                      onClick={() => window.open(`${explorerUrl}/contract/${yieldStarkAddress}`, '_blank')}
                      className="p-1 hover:bg-gray-700 rounded transition-colors"
                      title="View Vault Contract"
                    >
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002-2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Total BTC Balance */}
            <div>
              <h3 className="text-lg font-medium text-white mb-4">Total BTC Balance:</h3>
              <div className="flex items-baseline space-x-2 mb-8">
                <span className="text-6xl font-medium text-white">
                {loading ? "Loading..." : formatBalance(wbtcBalance)}
                </span>
                <span className="text-lg text-gray-300">$wbtc</span>
              </div>
              
              <div className="flex space-x-4 mb-4">
                <button 
                  onClick={() => setIsDepositModalOpen(true)}
                  className="px-8 py-4 bg-[#97FCE4] text-black font-medium rounded-full hover:bg-[#85E6D1] transition-colors"
                >
                  Deposit
                </button>
                <button onClick={() => setIsWithdrawModalOpen(true)} className="px-6 py-2 bg-white text-black font-medium rounded-full hover:bg-gray-100 transition-colors">
                  Withdraw
                </button>
              </div>

              <div className="flex items-start space-x-2 text-sm text-gray-300">
                <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center mt-0.5">
                  <span className="text-xs text-white">i</span>
                </div>
                <p>
                  The current $wbtc asset shown has been{' '}
                  <span className="text-[#97FCE4] font-medium">yieldstarked</span>{' '}
                  into protocols with the highest yield.{' '}
                  <span className="text-[#97FCE4] font-medium cursor-pointer">Read More</span>
                </p>
              </div>
            </div>
          </div>
          
          {/* Right Column - Agent Performance */}
          <div className="lg:col-span-1">
            <AgentPerformance key={`agent-${refreshKey}`} />
          </div>
        </div>
      </div>
      
      {/* Current Positions - Separate Full Width Block */}
      <CurrentPositions key={`positions-${refreshKey}`} />

      {/* Deposit Modal */}
      <DepositModal
        isOpen={isDepositModalOpen}
        onClose={() => setIsDepositModalOpen(false)}
        onDeposit={handleDeposit}
      />

      {/* Withdraw Modal */}
      <WithdrawModal
        isOpen={isWithdrawModalOpen}
        onClose={() => setIsWithdrawModalOpen(false)}
        onWithdraw={handleWithdraw}
      />
    </div>
  )
}