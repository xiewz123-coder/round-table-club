import { NextResponse } from 'next/server'

export async function POST() {
  const response = NextResponse.json({ success: true })
  // 清除 cookie 时指定 path，确保与设置时一致
  response.cookies.set('user_id', '', {
    httpOnly: true,
    maxAge: 0,
    path: '/',
    expires: new Date(0)
  })
  return response
}
