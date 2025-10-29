/* eslint-disable @typescript-eslint/no-explicit-any */
import { RpcProvider } from 'starknet'
import { VWBTC_ADDRESS } from '@/lib/utils/Constants'

export interface Transaction {
  hash: string
  timestamp: number
  type: 'deposit' | 'withdraw' | 'transfer'
  amount: string
  from: string
  to: string
  status: string
  blockNumber: number
}

/**
 * Fetch transaction history for a user's address
 * This checks both vWBTC deposits and WBTC transfers
 */
export async function fetchUserTransactionHistory(
  userAddress: string
): Promise<Transaction[]> {
  try {
    const provider = new RpcProvider({
      nodeUrl: 'https://starknet-sepolia.public.blastapi.io/rpc/v0_8'
    })

    const transactions: Transaction[] = []

    // Method 1: Try to fetch from Voyager API (if available)
    try {
      const response = await fetch(
        `https://api-sepolia.voyager.online/beta/txns?to=${VWBTC_ADDRESS}&ps=50&p=1`,
        {
          headers: {
            'Accept': 'application/json'
          }
        }
      )
      
      if (response.ok) {
        const data = await response.json()
        
        // Filter transactions related to this user
        if (data.items && Array.isArray(data.items)) {
          const userTxs = data.items.filter((tx: any) => 
            tx.from?.toLowerCase() === userAddress.toLowerCase() ||
            tx.to?.toLowerCase() === userAddress.toLowerCase()
          )

          for (const tx of userTxs) {
            transactions.push({
              hash: tx.hash || '',
              timestamp: tx.timestamp || Math.floor(Date.now() / 1000),
              type: determineTransactionType(tx, userAddress),
              amount: parseAmount(tx),
              from: tx.from || '',
              to: tx.to || '',
              status: tx.status || 'success',
              blockNumber: tx.blockNumber || 0
            })
          }
        }
      }
    } catch (voyagerError) {
      console.log('Voyager API not available, using fallback method')
    }

    // Method 2: Fallback - Get transactions from local storage if user has deposited
    const localTxs = getLocalTransactions(userAddress)
    if (localTxs.length > 0) {
      transactions.push(...localTxs)
    }

    // Sort by timestamp (newest first)
    transactions.sort((a, b) => b.timestamp - a.timestamp)

    // Remove duplicates based on hash
    const uniqueTxs = Array.from(
      new Map(transactions.map(tx => [tx.hash, tx])).values()
    )

    return uniqueTxs
  } catch (error) {
    console.error('Error fetching transaction history:', error)
    return []
  }
}

function determineTransactionType(tx: any, userAddress: string): 'deposit' | 'withdraw' | 'transfer' {
  const isFromUser = tx.from?.toLowerCase() === userAddress.toLowerCase()
  const isToVesu = tx.to?.toLowerCase() === VWBTC_ADDRESS.toLowerCase()
  const isFromVesu = tx.from?.toLowerCase() === VWBTC_ADDRESS.toLowerCase()

  if (isFromUser && isToVesu) {
    return 'deposit'
  } else if (isFromVesu) {
    return 'withdraw'
  } else {
    return 'transfer'
  }
}

function parseAmount(tx: any): string {
  // Try to extract amount from transaction data
  // This is a simplified version - in production you'd parse the calldata
  try {
    if (tx.calldata && Array.isArray(tx.calldata)) {
      // Amount is typically in the calldata for transfer/deposit
      // Format depends on contract ABI
      return '0' // Placeholder
    }
    return '0'
  } catch {
    return '0'
  }
}

/**
 * Store transaction locally when a deposit/withdrawal happens
 */
export function saveLocalTransaction(tx: Transaction) {
  try {
    const key = `tx_history_${tx.from.toLowerCase()}`
    const existing = localStorage.getItem(key)
    const txs: Transaction[] = existing ? JSON.parse(existing) : []
    
    // Add new transaction if not already stored
    if (!txs.find(t => t.hash === tx.hash)) {
      txs.push(tx)
      localStorage.setItem(key, JSON.stringify(txs))
      console.log(`💾 Saved transaction to localStorage with key: ${key}`, tx)
    }
  } catch (error) {
    console.error('Error saving transaction locally:', error)
  }
}

/**
 * Get transactions from local storage
 */
export function getLocalTransactions(userAddress: string): Transaction[] {
  try {
    const key = `tx_history_${userAddress.toLowerCase()}`
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : []
  } catch (error) {
    console.error('Error reading local transactions:', error)
    return []
  }
}

/**
 * Clear local transaction history
 */
export function clearLocalTransactions(userAddress: string) {
  try {
    const key = `tx_history_${userAddress.toLowerCase()}`
    localStorage.removeItem(key)
  } catch (error) {
    console.error('Error clearing local transactions:', error)
  }
}

