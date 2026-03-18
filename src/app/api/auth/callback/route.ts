import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const error = searchParams.get('error')
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'

  console.log('[OAuth Callback] Starting callback handler')
  console.log('[OAuth Callback] Base URL:', baseUrl)
  console.log('[OAuth Callback] Code present:', !!code)
  console.log('[OAuth Callback] Error from provider:', error)

  if (error) {
    console.error('[OAuth Callback] Provider returned error:', error)
    return NextResponse.redirect(`${baseUrl}/?error=${error}`)
  }

  if (!code) {
    console.error('[OAuth Callback] No code provided')
    return NextResponse.redirect(`${baseUrl}/?error=no_code`)
  }

  try {
    // Log environment variables (mask sensitive data)
    console.log('[OAuth Callback] SECONDME_TOKEN_ENDPOINT:', process.env.SECONDME_TOKEN_ENDPOINT)
    console.log('[OAuth Callback] SECONDME_CLIENT_ID:', process.env.SECONDME_CLIENT_ID?.substring(0, 8) + '...')
    console.log('[OAuth Callback] SECONDME_REDIRECT_URI:', process.env.SECONDME_REDIRECT_URI)

    // Exchange code for tokens
    console.log('[OAuth Callback] Exchanging code for tokens...')
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

    console.log('[OAuth Callback] Token response status:', tokenRes.status)
    console.log('[OAuth Callback] Token response headers:', Object.fromEntries(tokenRes.headers.entries()))

    const tokenData = await tokenRes.json()
    console.log('[OAuth Callback] Token response data:', JSON.stringify(tokenData, null, 2))

    if (tokenData.code !== 0) {
      console.error('[OAuth Callback] Token exchange failed:', tokenData)
      return NextResponse.redirect(`${baseUrl}/?error=token_failed&details=${encodeURIComponent(JSON.stringify(tokenData))}`)
    }

    if (!tokenData.data) {
      console.error('[OAuth Callback] Token data is missing:', tokenData)
      return NextResponse.redirect(`${baseUrl}/?error=token_data_missing`)
    }

    // SecondMe 使用驼峰命名 (accessToken) 或下划线命名 (access_token)
    const accessToken = tokenData.data.access_token || tokenData.data.accessToken
    const refreshToken = tokenData.data.refresh_token || tokenData.data.refreshToken
    const expiresIn = tokenData.data.expires_in || tokenData.data.expiresIn

    if (!accessToken) {
      console.error('[OAuth Callback] Access token not found in response:', tokenData.data)
      return NextResponse.redirect(`${baseUrl}/?error=access_token_missing&data=${encodeURIComponent(JSON.stringify(tokenData.data))}`)
    }

    console.log('[OAuth Callback] Got access token (first 20 chars):', accessToken.substring(0, 20) + '...')
    console.log('[OAuth Callback] Token expires in:', expiresIn)

    // Get user info
    const userInfoUrl = `${process.env.SECONDME_API_BASE_URL}/api/secondme/user/info`
    console.log('[OAuth Callback] Fetching user info from:', userInfoUrl)
    console.log('[OAuth Callback] Authorization header:', `Bearer ${accessToken?.substring(0, 20)}...`)

    const userRes = await fetch(userInfoUrl, {
      headers: { Authorization: `Bearer ${accessToken}` }
    })

    console.log('[OAuth Callback] User info response status:', userRes.status)
    console.log('[OAuth Callback] User info response headers:', Object.fromEntries(userRes.headers.entries()))

    if (!userRes.ok) {
      const errorText = await userRes.text()
      console.error('[OAuth Callback] User info request failed:', {
        status: userRes.status,
        statusText: userRes.statusText,
        body: errorText
      })
      return NextResponse.redirect(`${baseUrl}/?error=user_info_failed&status=${userRes.status}&details=${encodeURIComponent(errorText)}`)
    }

    let userData
    try {
      userData = await userRes.json()
      console.log('[OAuth Callback] User data received:', JSON.stringify(userData, null, 2))
    } catch (e) {
      console.error('[OAuth Callback] Failed to parse user data:', e)
      userData = null
    }

    // 尝试从响应中提取用户信息
    let userInfo: Record<string, string | undefined> = {}
    if (userData && userData.code === 0 && userData.data) {
      userInfo = userData.data as Record<string, string | undefined>
    }

    // 如果没有获取到用户信息，使用默认值
    if (!userInfo.id) {
      console.warn('[OAuth Callback] User info incomplete, using defaults. Data:', userData)
      // 从 access token 中提取用户 ID（如果是 JWT）或使用默认值
      const tokenParts = accessToken.split('.')
      if (tokenParts.length === 3) {
        try {
          const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString())
          userInfo.id = payload.sub || payload.userId || 'unknown'
          userInfo.name = payload.name || 'SecondMe User'
          userInfo.email = payload.email || ''
        } catch {
          userInfo.id = 'user_' + Date.now()
          userInfo.name = 'SecondMe User'
        }
      } else {
        userInfo.id = 'user_' + Date.now()
        userInfo.name = 'SecondMe User'
      }
    }

    console.log('[OAuth Callback] Using user info:', {
      id: userInfo.id,
      name: userInfo.name,
      email: userInfo.email
    })

    // 确保有用户ID
    const userId = userInfo.id || 'user_' + Date.now()
    const userName = userInfo.name || 'SecondMe User'
    const userEmail = userInfo.email || ''

    // Save to database
    console.log('[OAuth Callback] Saving user to database...')
    try {
      await prisma.user.upsert({
        where: { secondmeUserId: userId },
        update: {
          accessToken: accessToken,
          refreshToken: refreshToken,
          tokenExpiresAt: new Date(Date.now() + expiresIn * 1000),
          name: userName,
          avatar: userInfo.avatar || null
        },
        create: {
          secondmeUserId: userId,
          email: userEmail,
          name: userName,
          avatar: userInfo.avatar || null,
          bio: userInfo.bio || null,
          accessToken: accessToken,
          refreshToken: refreshToken,
          tokenExpiresAt: new Date(Date.now() + expiresIn * 1000)
        }
      })
      console.log('[OAuth Callback] User saved successfully')
    } catch (dbError) {
      console.error('[OAuth Callback] Database error:', dbError)
      return NextResponse.redirect(`${baseUrl}/?error=database_error&message=${encodeURIComponent((dbError as Error).message)}`)
    }

    const response = NextResponse.redirect(`${baseUrl}/profile`)
    // 设置 cookie 时指定 path 为根路径，确保所有页面都能访问
    response.cookies.set('user_id', userId, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production'
    })
    console.log('[OAuth Callback] Cookie set, redirecting to profile')
    return response
  } catch (err) {
    console.error('[OAuth Callback] Unexpected error:', err)
    console.error('[OAuth Callback] Error stack:', (err as Error).stack)
    return NextResponse.redirect(`${baseUrl}/?error=callback_error&message=${encodeURIComponent((err as Error).message)}`)
  }
}
