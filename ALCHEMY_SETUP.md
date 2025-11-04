# 🔧 Alchemy API Setup Guide

## Why Alchemy?

Blast API for Starknet has been deprecated and is no longer available. This application has been migrated to use **Alchemy's Starknet RPC API** with automatic fallbacks to PublicNode and dRPC.

## Quick Setup

### Step 1: Get Your Alchemy API Key

1. Go to [https://alchemy.com](https://alchemy.com)
2. Sign up for a free account (or log in if you already have one)
3. Create a new app:
   - Select **Starknet** as the blockchain
   - Select **Sepolia** as the network (for testnet)
   - Give it a name (e.g., "YieldStark Testnet")
4. Copy your API key from the dashboard

### Step 2: Add API Key to Environment Variables

Create or update your `.env.local` file in the project root:

```env
# Alchemy API Key (REQUIRED)
NEXT_PUBLIC_ALCHEMY_API_KEY=your_alchemy_api_key_here

# For server-side API routes (optional, but recommended)
ALCHEMY_API_KEY=your_alchemy_api_key_here
```

### Step 3: Restart Your Development Server

After adding the API key, restart your Next.js development server:

```bash
npm run dev
```

## RPC Fallback Chain

The application uses a smart fallback system for RPC endpoints:

1. **Alchemy** (if API key provided) - Best performance and reliability
2. **PublicNode** - Free, no API key needed ([https://starknet-sepolia-rpc.publicnode.com](https://starknet-sepolia-rpc.publicnode.com))
3. **dRPC** - Secondary backup ([https://starknet-sepolia.drpc.org](https://starknet-sepolia.drpc.org))

If Alchemy is not configured, the app automatically uses PublicNode as a fallback.

## Environment Variables Explained

- **`NEXT_PUBLIC_ALCHEMY_API_KEY`**: Used for client-side components (exposed to browser)
- **`ALCHEMY_API_KEY`**: Used for server-side API routes (more secure, not exposed to browser)

**Recommendation**: Set both to the same value for full functionality. However, the app will work without them using PublicNode as a fallback.

## Production Deployment

For production deployments (Vercel, Netlify, etc.):

1. Add `NEXT_PUBLIC_ALCHEMY_API_KEY` to your platform's environment variables
2. Add `ALCHEMY_API_KEY` to your platform's environment variables
3. Redeploy your application

### Vercel Example

```bash
vercel env add NEXT_PUBLIC_ALCHEMY_API_KEY
vercel env add ALCHEMY_API_KEY
```

## Troubleshooting

### "No Alchemy API key found" Warning

- Make sure you've added the API key to `.env.local`
- Restart your development server after adding the key
- Check that the variable name is exactly `NEXT_PUBLIC_ALCHEMY_API_KEY` or `ALCHEMY_API_KEY`

### "RPC Error" or "Failed to analyze tip statistics"

- Verify your API key is correct
- Check that your Alchemy app is configured for the correct network (Sepolia for testnet)
- Ensure your Alchemy account is active and not rate-limited

### Rate Limits

Alchemy's free tier includes generous rate limits. If you exceed them:
- Check your Alchemy dashboard for usage statistics
- Consider upgrading to a paid plan for higher limits
- Implement request caching to reduce API calls

## Free Tier Limits

Alchemy's free tier typically includes:
- 300 million compute units per month
- Rate limits suitable for most dApps
- Access to both mainnet and testnet

## Support

For Alchemy-specific issues:
- [Alchemy Documentation](https://docs.alchemy.com/)
- [Alchemy Support](https://support.alchemy.com/)

For application-specific issues:
- Check the main README
- Review the FAUCET_SETUP.md guide


