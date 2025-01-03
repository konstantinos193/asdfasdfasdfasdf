'use client'

import dynamic from 'next/dynamic'
import { useSession } from '../contexts/SessionContext'
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
  // Extract the session data
  const { session } = useSession()

  // Provide default values if session data is undefined
  const sessionId = session?.id || ''
  const username = session?.username || ''
  const discordId = session?.discordId || ''

  // If any required prop is still an empty string, we could show an error or a fallback
  if (!sessionId || !username || !discordId) {
    return <div>Session data is missing</div>
  }

  return (
    <Providers>
      {/* Pass the required props to the DynamicDiscordProfile component */}
      <DynamicDiscordProfile sessionId={sessionId} username={username} discordId={discordId} />
    </Providers>
  )
}
