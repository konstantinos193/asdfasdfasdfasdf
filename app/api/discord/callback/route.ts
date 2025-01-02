import { NextResponse } from 'next/server'
import { sessionStore } from '../../../lib/sessionStore'

const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET
const REDIRECT_URI = process.env.NEXT_PUBLIC_DISCORD_REDIRECT_URI

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const state = searchParams.get('state')

    if (!code || !state) {
      return NextResponse.redirect('/error?message=Invalid OAuth callback')
    }

    // Exchange code for access token
    const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: DISCORD_CLIENT_ID!,
        client_secret: DISCORD_CLIENT_SECRET!,
        grant_type: 'authorization_code',
        code,
        redirect_uri: REDIRECT_URI!,
      }),
    })

    const tokenData = await tokenResponse.json()

    if (!tokenResponse.ok) {
      console.error('Token exchange failed:', tokenData)
      // Redirect to the homepage instead of error page
      return NextResponse.redirect('/')
    }

    // Get user info
    const userResponse = await fetch('https://discord.com/api/users/@me', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    })

    const userData = await userResponse.json()

    if (!userResponse.ok) {
      console.error('User info fetch failed:', userData)
      // Redirect to the homepage instead of error page
      return NextResponse.redirect('/')
    }

    // Create a new session
    const sessionId = sessionStore.create({
      discordId: userData.id,
      username: userData.username,
      wallets: []
    })

    // Redirect to the profile page with session info
    const redirectUrl = new URL(`/discord/profile/${userData.id}`, process.env.NEXT_PUBLIC_APP_URL)
    redirectUrl.searchParams.set('sessionId', sessionId)
    redirectUrl.searchParams.set('username', userData.username)
    redirectUrl.searchParams.set('discordId', userData.id)

    return NextResponse.redirect(redirectUrl.toString())
  } catch (error) {
    console.error('Discord callback error:', error)
    // In case of any error (network, API failure, etc.), redirect to the homepage
    return NextResponse.redirect('/')
  }
}
