import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const error = searchParams.get('error')
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'

  if (error) {
    return NextResponse.redirect(`${baseUrl}/?error=${error}`)
  }

  if (!code) {
    return NextResponse.redirect(`${baseUrl}/?error=no_code`)
  }

  try {
    // Exchange code for tokens
    const tokenRes = await fetch(process.env.SECONDME_TOKEN_ENDPOINT!, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.SECONDME_CLIENT_ID!,
        client_secret: process.env.SECONDME_CLIENT_SECRET!,
        code,
        grant_type: 'authorization_code',
        redirect_uri: process.env.SECONDME_REDIRECT_URI!
      })
    })

    const tokenData = await tokenRes.json()

    if (tokenData.code !== 0) {
      console.error('Token error:', tokenData)
      return NextResponse.redirect(`${baseUrl}/?error=token_failed`)
    }

    const { access_token, refresh_token, expires_in } = tokenData.data

    // Get user info
    const userRes = await fetch(`${process.env.SECONDME_API_BASE_URL}/api/secondme/user`, {
      headers: { Authorization: `Bearer ${access_token}` }
    })

    if (!userRes.ok) {
      return NextResponse.redirect(`${baseUrl}/?error=user_info_failed`)
    }

    const userData = await userRes.json()
    const userInfo = userData.data

    // Save to database
    await prisma.user.upsert({
      where: { secondmeUserId: userInfo.id },
      update: {
        accessToken: access_token,
        refreshToken: refresh_token,
        tokenExpiresAt: new Date(Date.now() + expires_in * 1000),
        name: userInfo.name,
        avatar: userInfo.avatar
      },
      create: {
        secondmeUserId: userInfo.id,
        email: userInfo.email,
        name: userInfo.name,
        avatar: userInfo.avatar,
        bio: userInfo.bio,
        accessToken: access_token,
        refreshToken: refresh_token,
        tokenExpiresAt: new Date(Date.now() + expires_in * 1000)
      }
    })

    const response = NextResponse.redirect(`${baseUrl}/profile`)
    response.cookies.set('user_id', userInfo.id, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 })
    return response
  } catch (err) {
    console.error('Callback error:', err)
    return NextResponse.redirect(`${baseUrl}/?error=callback_error`)
  }
}
