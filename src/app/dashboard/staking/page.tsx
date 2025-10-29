'use client'

import { useState, useEffect } from 'react'
import { useWalletStore } from '@/providers/wallet-store-provider'
import { useYieldStarkAddress, useTokenAddress } from '@/lib/contracts'
import { stakingAbi } from '@/lib/abi/staking'
import { cairo0Erc20Abi } from '@/lib/abi/cairo0Erc20'
import { Contract, RpcProvider, CallData, Account } from 'starknet'
import { uint256 } from 'starknet'

export default function StakingPage() {
  const wallet = useWalletStore((state) => state.wallet)
  const userAddress = wallet?.address
  const stakingAddress = useYieldStarkAddress()
  const wbtcAddress = useTokenAddress('WBTC')

  const [stakeAmount, setStakeAmount] = useState('')
  const [unstakeAmount, setUnstakeAmount] = useState('')
  const [stakedBalance, setStakedBalance] = useState('0')
  const [walletBalance, setWalletBalance] = useState('0')
  const [totalStaked, setTotalStaked] = useState('0')
  const [isStaking, setIsStaking] = useState(false)
  const [isUnstaking, setIsUnstaking] = useState(false)

  // Fetch balances
  useEffect(() => {
    if (!userAddress) return

    const fetchBalances = async () => {
      try {
        const sepoliaProvider = new RpcProvider({ 
          nodeUrl: "https://starknet-sepolia.public.blastapi.io/rpc/v0_6" 
        })

        // Create contracts with provider for read-only operations
        const stakingContract = new Contract({
          abi: stakingAbi,
          address: stakingAddress,
          providerOrAccount: sepoliaProvider
        })

        const wbtcContract = new Contract({
          abi: cairo0Erc20Abi,
          address: wbtcAddress,
          providerOrAccount: sepoliaProvider
        })

        // Get staked balance
        const staked = await stakingContract.get_staked(wbtcAddress, userAddress)
        const stakedBigInt = typeof staked === 'bigint' ? staked : BigInt(staked.toString())
        setStakedBalance((Number(stakedBigInt) / 1e8).toFixed(8))

        // Get wallet balance
        const balanceRes = await wbtcContract.balanceOf(userAddress)
        let balanceRawString = "0"
        
        if (typeof balanceRes.balance === 'object' && balanceRes.balance !== null && 'low' in balanceRes.balance) {
          const low = BigInt(balanceRes.balance.low || 0)
          const high = BigInt(balanceRes.balance.high || 0)
          const combined = low + (high * (BigInt(2) ** BigInt(128)))
          balanceRawString = combined.toString()
        } else {
          balanceRawString = balanceRes.balance.toString()
        }
        
        setWalletBalance((Number(balanceRawString) / 1e8).toFixed(8))

        // Get total staked
        const total = await stakingContract.get_total_staked()
        const totalBigInt = typeof total === 'bigint' ? total : BigInt(total.toString())
        setTotalStaked((Number(totalBigInt) / 1e8).toFixed(8))
      } catch (error) {
        console.error('Error fetching balances:', error)
      }
    }

    fetchBalances()
    const interval = setInterval(fetchBalances, 10000)
    return () => clearInterval(interval)
  }, [userAddress, wbtcAddress, stakingAddress])

  const handleStake = async () => {
    if (!wallet || !stakeAmount) return
    
    setIsStaking(true)
    try {
      const wbtcContract = new Contract({
        abi: cairo0Erc20Abi,
        address: wbtcAddress,
        providerOrAccount: wallet as Account
      })

      const stakingContract = new Contract({
        abi: stakingAbi,
        address: stakingAddress,
        providerOrAccount: wallet as Account
      })
      
      // Convert amount to smallest unit (8 decimals for wBTC)
      const amountBigInt = BigInt(Math.floor(parseFloat(stakeAmount) * 1e8))
      const amountUint256 = uint256.bnToUint256(amountBigInt)
      
      console.log('Stake amount:', stakeAmount)
      console.log('Amount BigInt:', amountBigInt.toString())
      console.log('Amount Uint256:', amountUint256)
      console.log('Wallet balance:', walletBalance)
      console.log('WBTC Address:', wbtcAddress)
      console.log('Staking Address:', stakingAddress)
      
      // Step 1: Approve
      console.log('Step 1: Approving wBTC...')
      try {
        // For Cairo0 ERC20, use CallData to properly compile the parameters
        const calldata = CallData.compile([stakingAddress, amountUint256])
        console.log('Compiled calldata:', calldata)
        
        const approveTx = await wbtcContract.invoke('approve', calldata)
        console.log('Approval transaction sent:', approveTx.transaction_hash)
        await (wallet as Account).waitForTransaction(approveTx.transaction_hash)
        console.log('Approval confirmed!')
      } catch (approveError) {
        const errorMessage = approveError instanceof Error ? approveError.message : 'Unknown error'
        console.error('Approval failed:', approveError)
        throw new Error('Failed to approve wBTC. ' + errorMessage)
      }
      
      // Step 2: Stake
      console.log('Step 2: Staking wBTC...')
      try {
        const stakeTx = await stakingContract.stake(amountUint256, wbtcAddress)
        console.log('Stake transaction sent:', stakeTx.transaction_hash)
        await (wallet as Account).waitForTransaction(stakeTx.transaction_hash)
        console.log('Stake confirmed!')
      } catch (stakeError) {
        const errorMessage = stakeError instanceof Error ? stakeError.message : 'Unknown error'
        console.error('Staking failed:', stakeError)
        throw new Error('Failed to stake wBTC. ' + errorMessage)
      }
      
      setStakeAmount('')
      alert('Staking successful!')
      
      // Refresh balances
      window.location.reload()
    } catch (error: unknown) {
      console.error('Full error object:', error)
      const errorMessage = error instanceof Error ? error.message : String(error)
      alert('Staking failed: ' + errorMessage)
    } finally {
      setIsStaking(false)
    }
  }

  const handleUnstake = async () => {
    if (!wallet || !unstakeAmount) return
    
    setIsUnstaking(true)
    try {
      const stakingContract = new Contract({
        abi: stakingAbi,
        address: stakingAddress,
        providerOrAccount: wallet as Account
      })
      
      const amountInSmallestUnit = uint256.bnToUint256(BigInt(Math.floor(parseFloat(unstakeAmount) * 1e8)))
      
      const tx = await stakingContract.unstake(amountInSmallestUnit, wbtcAddress)
      await (wallet as Account).waitForTransaction(tx.transaction_hash)
      
      setUnstakeAmount('')
      alert('Unstaking successful!')
    } catch (error) {
      console.error('Unstaking error:', error)
      alert('Unstaking failed. Please try again.')
    } finally {
      setIsUnstaking(false)
    }
  }

  if (!userAddress) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <h2 className="text-2xl font-medium text-white mb-4">Connect Wallet</h2>
          <p className="text-gray-400">Please connect your wallet to stake wBTC</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#101D22] rounded-2xl p-6">
          <p className="text-sm text-gray-400 mb-2">Your Staked</p>
          <p className="text-2xl font-bold text-white">{stakedBalance} wBTC</p>
                </div>
        <div className="bg-[#101D22] rounded-2xl p-6">
          <p className="text-sm text-gray-400 mb-2">Wallet Balance</p>
          <p className="text-2xl font-bold text-white">{walletBalance} wBTC</p>
              </div>
        <div className="bg-[#101D22] rounded-2xl p-6">
          <p className="text-sm text-gray-400 mb-2">Total Staked</p>
          <p className="text-2xl font-bold text-white">{totalStaked} wBTC</p>
        </div>
      </div>

      {/* Stake Section */}
      <div className="bg-[#101D22] rounded-2xl p-6">
        <h2 className="text-xl font-medium text-white mb-6">Stake wBTC</h2>
          
          <div className="space-y-4">
              <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm text-gray-400">Amount</label>
              <button
                onClick={() => setStakeAmount(walletBalance)}
                className="text-sm text-[#97FCE4] hover:underline"
              >
                Max: {walletBalance}
              </button>
            </div>
            <input
              type="number"
              value={stakeAmount}
              onChange={(e) => setStakeAmount(e.target.value)}
              placeholder="0.0"
              className="w-full bg-[#0F1A1F] text-white text-xl px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#97FCE4]"
              step="0.00000001"
            />
          </div>

          <button
            onClick={handleStake}
            disabled={isStaking || !stakeAmount}
            className="w-full py-3 bg-[#97FCE4] text-black font-medium rounded-lg hover:bg-[#85E6D1] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isStaking ? 'Staking...' : 'Stake'}
          </button>
        </div>
          </div>

      {/* Unstake Section */}
      <div className="bg-[#101D22] rounded-2xl p-6">
        <h2 className="text-xl font-medium text-white mb-6">Unstake wBTC</h2>
          
          <div className="space-y-4">
              <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm text-gray-400">Amount</label>
              <button
                onClick={() => setUnstakeAmount(stakedBalance)}
                className="text-sm text-[#97FCE4] hover:underline"
              >
                Max: {stakedBalance}
              </button>
            </div>
            <input
              type="number"
              value={unstakeAmount}
              onChange={(e) => setUnstakeAmount(e.target.value)}
              placeholder="0.0"
              className="w-full bg-[#0F1A1F] text-white text-xl px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#97FCE4]"
              step="0.00000001"
            />
          </div>

          <button
            onClick={handleUnstake}
            disabled={isUnstaking || !unstakeAmount}
            className="w-full py-3 bg-[#97FCE4] text-black font-medium rounded-lg hover:bg-[#85E6D1] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUnstaking ? 'Unstaking...' : 'Unstake'}
          </button>
        </div>
      </div>
    </div>
  )
}

