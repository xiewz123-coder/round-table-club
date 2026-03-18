import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// SecondMe Agent Chat API
// Base URL: https://api.mindverse.com/gate/lab
// Chat API: POST /api/secondme/chat/stream (流式)

// 风格提示词
const stylePrompts: Record<string, string> = {
  professional: '请用专业、严谨的语气回复，逻辑清晰，有理有据，避免过多emoji。',
  humorous: '请用幽默风趣的语气回复，适当加入轻松俏皮的语言和emoji。',
  concise: '请用简洁凝练的语气回复，言简意赅，直击要点，控制在3-4句话内。',
  friendly: '请用友善亲和的语气回复，像朋友聊天一样自然，适当使用emoji。'
}

export async function POST(request: NextRequest) {
  console.log('[Agent Chat] API called')
  try {
    const { userId, topicTitle, message, style = 'friendly' } = await request.json()
    console.log('[Agent Chat] Request:', { userId, topicTitle: topicTitle?.substring(0, 30) })

    const stylePrompt = stylePrompts[style] || stylePrompts.friendly

    // 从数据库获取用户的 access token
    const user = await prisma.user.findUnique({
      where: { secondmeUserId: userId }
    })

    console.log('[Agent Chat] User found:', !!user, 'Has token:', !!user?.accessToken)

    if (!user || !user.accessToken) {
      console.error('[Agent Chat] User not authenticated:', { userId })
      return NextResponse.json({ error: 'User not found or not authenticated' }, { status: 401 })
    }

    // 检查 token 是否过期，如果过期尝试刷新
    let accessToken = user.accessToken
    if (user.tokenExpiresAt && new Date() > user.tokenExpiresAt) {
      if (user.refreshToken) {
        try {
          const refreshRes = await fetch(`${process.env.SECONDME_REFRESH_ENDPOINT}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
              grant_type: 'refresh_token',
              refresh_token: user.refreshToken,
              client_id: process.env.SECONDME_CLIENT_ID!,
              client_secret: process.env.SECONDME_CLIENT_SECRET!
            })
          })

          const refreshData = await refreshRes.json()
          if (refreshData.code === 0 && refreshData.data) {
            accessToken = refreshData.data.accessToken
            // 更新数据库
            await prisma.user.update({
              where: { secondmeUserId: userId },
              data: {
                accessToken: refreshData.data.accessToken,
                refreshToken: refreshData.data.refreshToken,
                tokenExpiresAt: new Date(Date.now() + refreshData.data.expiresIn * 1000)
              }
            })
          }
        } catch (err) {
          console.error('[Agent Chat] Token refresh failed:', err)
        }
      }
    }

    // 调用 SecondMe 流式 Chat API
    const chatUrl = 'https://api.mindverse.com/gate/lab/api/secondme/chat/stream'

    console.log('[Agent Chat] Calling SecondMe API:', chatUrl)
    console.log('[Agent Chat] User ID:', userId)

    const chatRes = await fetch(chatUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        message: message,
        // 可选参数
        systemPrompt: `你是用户的 AI 分身，正在参与一个圆桌讨论话题："${topicTitle}"。${stylePrompt}`,
        enableWebSearch: false
      })
    })

    if (!chatRes.ok) {
      const errorText = await chatRes.text()
      console.error('[Agent Chat] SecondMe API error:', {
        status: chatRes.status,
        body: errorText
      })
      return NextResponse.json({
        error: 'SecondMe API error',
        status: chatRes.status,
        details: errorText
      }, { status: 500 })
    }

    // 处理流式响应
    const reader = chatRes.body?.getReader()
    if (!reader) {
      return NextResponse.json({ error: 'No response body' }, { status: 500 })
    }

    let fullResponse = ''
    let sessionId = ''

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = new TextDecoder().decode(value)
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('event: session')) {
            // 下一行是 session data
            continue
          }
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') {
              break
            }
            try {
              const parsed = JSON.parse(data)
              if (parsed.sessionId) {
                sessionId = parsed.sessionId
              } else if (parsed.choices?.[0]?.delta?.content) {
                fullResponse += parsed.choices[0].delta.content
              }
            } catch {
              // 忽略解析错误
            }
          }
        }
      }
    } finally {
      reader.releaseLock()
    }

    console.log('[Agent Chat] Response:', fullResponse.substring(0, 100) + '...')

    return NextResponse.json({
      success: true,
      response: fullResponse || '暂无回复',
      sessionId: sessionId,
      agent: {
        name: user.name || '我的 Agent',
        avatar: user.avatar || null
      }
    })

  } catch (error) {
    console.error('[Agent Chat] Error:', error)
    const errorMessage = (error as Error).message
    const errorStack = (error as Error).stack
    // 确保始终返回 JSON
    return NextResponse.json({
      error: 'Internal server error',
      message: errorMessage,
      stack: process.env.NODE_ENV === 'development' ? errorStack : undefined
    }, { status: 500 })
  }
}
