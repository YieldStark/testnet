# 🚰 Faucet Setup Guide

This guide will help you set up the testnet faucet for YieldStark.

## Prerequisites

1. A Starknet wallet with testnet WBTC tokens
2. The wallet's private key (will be used to send tokens)

## Setup Instructions

### 1. Configure Environment Variables

Copy the `.env.example` file to `.env.local`:

```bash
cp .env.example .env.local
```

### 2. Fill in Your Faucet Wallet Details

Edit `.env.local` and add your wallet information:

```env
# Your wallet address that will send testnet tokens
FAUCET_WALLET_ADDRESS=0x1234567890abcdef...

# Private key for the faucet wallet
FAUCET_PRIVATE_KEY=0xabcdef1234567890...

# RPC URL (optional)
NEXT_PUBLIC_RPC_URL=https://starknet-sepolia.public.blastapi.io/rpc/v0_8
```

⚠️ **Security Warning**: NEVER commit your `.env.local` file to version control!

### 3. Fund Your Faucet Wallet

Make sure your faucet wallet has enough testnet tokens to distribute:
- **WBTC**: Main token shown to users (currently 1 WBTC per claim)
- **STRK**: Bonus token distributed silently (0.5 STRK per claim, not shown on frontend)

You can get testnet tokens from:
- Starknet Sepolia Faucet
- Other testnet faucets
- Bridge from other testnets

**Note**: Each claim will transfer BOTH tokens in a single batched transaction

### 4. Configure Claim Amount

The default claim amount is `1 WBTC` per address. You can modify this in:
- `src/app/dashboard/faucet/page.tsx` - Line 19 (CLAIM_AMOUNT variable)

### 5. Test the Faucet

1. Start your development server:
```bash
npm run dev
```

2. Navigate to `/dashboard/faucet`
3. Connect your wallet (use a different address than the faucet wallet)
4. Click "Claim Testnet WBTC"

## How It Works

### Frontend (`src/app/dashboard/faucet/page.tsx`)
- Sleek UI following YieldStark design patterns
- Checks if address has already claimed
- Makes POST request to `/api/faucet/claim`
- Displays success state with transaction hash
- Guides users to next steps

### Backend (`src/app/api/faucet/claim/route.ts`)
- Validates address and prevents duplicate claims
- Uses your faucet wallet to send tokens
- Tracks claimed addresses (in-memory, resets on server restart)
- Returns transaction hash on success

### Claim Tracking

Currently, claimed addresses are stored:
1. In-memory on the backend (resets on restart)
2. In localStorage on the frontend (per browser)

For production, consider:
- Using Redis or a database for persistent storage
- Implementing rate limiting
- Adding CAPTCHA to prevent abuse
- IP-based tracking

## Customization

### Change Claim Amount
Edit `CLAIM_AMOUNT` in `src/app/dashboard/faucet/page.tsx`:
```typescript
const CLAIM_AMOUNT = '1' // Change this value (currently 1 WBTC)
```

### Update Stats
The stats cards on the faucet page are currently hardcoded. To make them dynamic:
1. Create a database to track claims
2. Add API endpoint to fetch stats
3. Update the `stats` array in the component

### Styling
The faucet page follows YieldStark's design system:
- Main background: `#101D22`
- Card background: `#0F1A1F`
- Primary color: `#97FCE4`
- Bitcoin orange: `#F7931A`

## Troubleshooting

### "Faucet has insufficient funds"
- Check your faucet wallet balance
- Fund it with more testnet WBTC

### "Address has already claimed"
- Each address can only claim once
- Clear localStorage or use a different address for testing

### "Transaction failed"
- Check that your private key is correct
- Ensure the faucet wallet has enough WBTC
- Verify the RPC URL is working

### Environment variables not loading
- Make sure the file is named `.env.local` (not `.env`)
- Restart your development server after changing env vars
- Check that variables start with `FAUCET_` or `NEXT_PUBLIC_`

## API Endpoints

### POST `/api/faucet/claim`
Claims testnet tokens for an address.

**Request Body:**
```json
{
  "address": "0x...",
  "amount": "0.001"
}
```

**Response:**
```json
{
  "success": true,
  "txHash": "0x...",
  "amount": "0.001",
  "message": "Successfully sent 0.001 WBTC to 0x..."
}
```

### GET `/api/faucet/claim?address=0x...`
Check if an address has already claimed.

**Response:**
```json
{
  "address": "0x...",
  "hasClaimed": false,
  "claimAmount": "0.001 WBTC"
}
```

## Security Best Practices

1. **Never expose your private key**
   - Keep it in `.env.local`
   - Add `.env.local` to `.gitignore`
   
2. **Limit claim amounts**
   - Keep the amount small to prevent abuse
   - Monitor your faucet wallet balance

3. **For production deployments:**
   - Use a database instead of in-memory storage
   - Implement rate limiting
   - Add CAPTCHA verification
   - Set up monitoring and alerts
   - Use a dedicated faucet service if handling high volume

## Next Steps

After setting up the faucet:
1. Users claim testnet WBTC
2. They deposit it into YieldStark vault
3. Funds are deployed to Vesu/Ekubo protocols
4. Users can track their yield in the dashboard

Enjoy testing YieldStark! 🚀

