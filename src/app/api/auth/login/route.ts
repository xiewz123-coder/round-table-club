import { NextResponse } from 'next/server'
import crypto from 'crypto'

export async function GET() {
  const state = crypto.randomBytes(32).toString('hex')

  const params = new URLSearchParams({
    client_id: process.env.SECONDME_CLIENT_ID!,
    redirect_uri: process.env.SECONDME_REDIRECT_URI!,
    response_type: 'code',
    scope: 'identity profile chat note',
    state: state
  })

  const response = NextResponse.redirect(`${process.env.SECONDME_OAUTH_URL}?${params}`)
  response.cookies.set('oauth_state', state, { httpOnly: true, maxAge: 600 })

  return response
}
