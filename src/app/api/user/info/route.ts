import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const userId = request.cookies.get('user_id')?.value

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const user = await prisma.user.findFirst({
      where: { secondmeUserId: userId }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      data: {
        id: user.secondmeUserId,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio
      }
    })
  } catch (error) {
    console.error('Get user info error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
