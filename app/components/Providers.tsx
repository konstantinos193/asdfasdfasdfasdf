'use client'

import dynamic from 'next/dynamic'
import { SessionProvider } from '../contexts/SessionContext'
import { WalletProvider as BaseWalletProvider } from '../providers/WalletProvider'
import { ReactNode } from 'react'

// Export WalletProvider
export { BaseWalletProvider as WalletProvider }

// Create a client-only version of DiscordProfile
const DynamicDiscordProfile = dynamic(
  () => import('./DiscordProfile'),
  { ssr: false }
)

// Create a wrapper component that includes both providers and the profile
const WrappedProviders = ({ children }: { children: ReactNode }) => (
  <SessionProvider>
    <BaseWalletProvider>
      {children}
    </BaseWalletProvider>
  </SessionProvider>
)

// Export a dynamic version of the wrapped providers
export const Providers = dynamic(
  () => Promise.resolve(WrappedProviders),
  { ssr: false }
)

// Export a pre-wrapped version of DiscordProfile
export function WrappedDiscordProfile() {
  return (
    <Providers>
      <DynamicDiscordProfile />
    </Providers>
  )
} 
