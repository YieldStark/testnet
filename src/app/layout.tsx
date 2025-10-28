import type { Metadata } from "next";
import "./globals.css";
import { WalletStoreProvider } from "@/providers/wallet-store-provider";
import { NetworkStoreProvider } from "@/providers/network-store-provider";
import StarknetProvider from "@/providers/starknet-provider";

export const metadata: Metadata = {
  title: "YieldStark - DeFi Yield Optimization on Starknet",
  description: "Optimize your DeFi yields with YieldStark's intelligent agent on Starknet",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <StarknetProvider>
          <NetworkStoreProvider>
            <WalletStoreProvider>
              {children}
            </WalletStoreProvider>
          </NetworkStoreProvider>
        </StarknetProvider>
      </body>
    </html>
  );
}
