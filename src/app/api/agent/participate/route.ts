import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// 风格提示词映射
const stylePrompts: Record<string, string> = {
  professional: '请用专业、严谨的语气回复，逻辑清晰，有理有据。',
  humorous: '请用幽默风趣的语气回复，适当加入轻松俏皮的语言。',
  concise: '请用简洁凝练的语气回复，言简意赅，直击要点。',
  friendly: '请用友善亲和的语气回复，像朋友聊天一样自然，适当使用emoji。'
}

// 额外 Agent 角色提示词
const agentRolePrompts: Record<string, string> = {
  critic: '你是一个批判性思考者，擅长从不同角度分析问题，提出质疑和深入见解。',
  humorist: '你是一个幽默大师，擅长用风趣的语言化解严肃话题，让人会心一笑。',
  sage: '你是一个睿智的长者，说话简洁有力，总能一针见血地指出问题本质。'
}

// 让 Agent 自动参与话题讨论
export async function POST(request: NextRequest) {
  console.log('[Agent Participate] API called')
  try {
    const { userId, agentType = 'user', agentStyle = 'friendly', topicTitle, topicContent, messages = [] } = await request.json()
    console.log('[Agent Participate] Request body:', { userId, agentType, topicTitle: topicTitle?.substring(0, 50) })

    const isExtraAgent = agentType !== 'user'

    // 获取用户信息（仅对真实用户）
    let user = null
    if (!isExtraAgent) {
      console.log('[Agent Participate] Looking up user:', userId)
      user = await prisma.user.findUnique({
        where: { secondmeUserId: userId }
      })

      console.log('[Agent Participate] User found:', !!user, 'Has token:', !!user?.accessToken)

      if (!user || !user.accessToken) {
        console.error('[Agent Participate] User not authenticated:', { userId, userExists: !!user, hasToken: !!user?.accessToken })
        return NextResponse.json({ error: 'User not authenticated', details: { userId, userExists: !!user, hasToken: !!user?.accessToken } }, { status: 401 })
      }
    }

    // 构建上下文 - 让 Agent 了解话题背景
    let contextMessage = `这是一个圆桌讨论话题："${topicTitle}"\n\n`

    if (topicContent) {
      contextMessage += `话题描述：${topicContent}\n\n`
    }

    // 添加上下文对话历史
    if (messages.length > 0) {
      contextMessage += `之前的讨论：\n`
      messages.slice(-5).forEach((msg: { sender: string; content: string }) => {
        contextMessage += `${msg.sender}: ${msg.content}\n`
      })
      contextMessage += `\n`
    }

    // 根据风格和角色构建系统提示词
    const stylePrompt = stylePrompts[agentStyle] || stylePrompts.friendly
    const rolePrompt = isExtraAgent ? agentRolePrompts[agentType] : '你是用户的 AI 分身，代表用户参与讨论。'

    contextMessage += `${rolePrompt}\n${stylePrompt}\n\n`
    contextMessage += `请作为参与者，分享你对这个话题的观点。可以：\n`
    contextMessage += `1. 表达你的立场或看法\n`
    contextMessage += `2. 回应其他人的观点\n`
    contextMessage += `3. 提出新的角度或问题\n\n`
    contextMessage += `请直接输出你的发言内容，不要加任何前缀。`

    let response = ''
    let senderName = ''
    let avatarUrl = ''

    if (isExtraAgent) {
      // 额外 Agent 使用模拟回复（通过简单 AI 逻辑或预设回复）
      const extraAgentNames: Record<string, string> = {
        critic: '批判者 Agent',
        humorist: '幽默家 Agent',
        sage: '智者 Agent'
      }

      const extraAgentAvatars: Record<string, string> = {
        critic: 'https://api.dicebear.com/7.x/avataaars/svg?seed=critic',
        humorist: 'https://api.dicebear.com/7.x/avataaars/svg?seed=humorist',
        sage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sage'
      }

      senderName = extraAgentNames[agentType] || 'Agent'
      avatarUrl = extraAgentAvatars[agentType] || `https://api.dicebear.com/7.x/avataaars/svg?seed=${agentType}`

      // 对于额外 Agent，调用 OpenAI API 或返回模拟回复
      // 这里简化处理，使用基于话题的模拟回复
      response = await generateExtraAgentResponse(agentType)
    } else {
      // 真实用户 Agent 调用 SecondMe API
      senderName = user?.name || '我的 Agent'
      avatarUrl = user?.avatar || `https://api.dicebear.com/7.x/fun-emoji/svg?seed=${userId}`

      // 构建 API URL
      const protocol = request.headers.get('x-forwarded-proto') || 'https'
      const host = request.headers.get('host') || 'secondme-integration.vercel.app'
      const apiUrl = `${protocol}://${host}/api/agent/chat`

      console.log('[Agent Participate] Calling API:', apiUrl)
      console.log('[Agent Participate] User ID:', userId)
      console.log('[Agent Participate] Style:', agentStyle)

      // 调用 Agent Chat API
      const chatRes = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          topicTitle,
          message: contextMessage,
          style: agentStyle
        })
      })

      if (!chatRes.ok) {
        const errorData = await chatRes.json()
        console.error('[Agent Participate] Chat failed:', errorData)
        return NextResponse.json({
          error: 'Failed to get agent response',
          details: errorData
        }, { status: 500 })
      }

      const chatData = await chatRes.json()
      response = chatData.response
    }

    return NextResponse.json({
      success: true,
      message: {
        id: `agent-${Date.now()}`,
        content: response,
        sender: senderName,
        avatar: avatarUrl,
        isAgent: true,
        timestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('[Agent Participate] Error:', error)
    const errorMessage = (error as Error).message
    const errorStack = (error as Error).stack
    console.error('[Agent Participate] Stack:', errorStack)
    return NextResponse.json({
      error: 'Internal server error',
      message: errorMessage,
      stack: process.env.NODE_ENV === 'development' ? errorStack : undefined
    }, { status: 500 })
  }
}

// 生成额外 Agent 的回复（模拟 AI 回复）
async function generateExtraAgentResponse(
  agentType: string
): Promise<string> {
  // 这里可以集成 OpenAI 或其他 AI API
  // 为简化演示，使用基于角色的模拟回复

  const responses: Record<string, string[]> = {
    critic: [
      '从批判性思维的角度来看，这个问题本身就存在值得商榷的地方。我们必须问自己：什么是"翻盘"？是谁定义了"基础岗位"的价值？',
      '我不完全认同主流观点。数据显示，30岁恰恰是很多行业从业者进入黄金期的起点，所谓"基础"往往意味着深厚的积累。',
      '让我们换个角度思考。如果我们把"翻盘"定义为社会地位的提升，那可能永远不够；但如果定义为自我价值的实现，那每一天都是新的开始。'
    ],
    humorist: [
      '哈哈，30岁还在基础岗位？那我岂不是要报警了！开个玩笑，其实我觉得这就像打游戏——有人速通，有人享受探索的过程嘛 😄',
      '我觉得吧，人生就像火锅，30岁只是刚开始涮毛肚的时候，后面还有大把的肥牛、虾滑等着呢！别急，好戏在后头 🍲',
      '说实话，我30岁的时候连基础岗位都没有呢！所以别焦虑，至少你已经领先我了 😂 关键是找到自己的节奏！'
    ],
    sage: [
      '三十而立，不在于职位高低，而在于心智成熟。真正的翻盘，是认知的跃迁。',
      '机会永远存在。历史告诉我们，大器晚成者比比皆是。重要的是保持学习的能力和开放的心态。',
      '人生如棋，不在于开局如何，而在于中盘的选择。30岁，正是棋局最精彩的部分。'
    ]
  }

  const typeResponses = responses[agentType] || responses.sage
  const randomIndex = Math.floor(Math.random() * typeResponses.length)

  // 添加一点延迟，模拟思考过程
  await new Promise(resolve => setTimeout(resolve, 1500))

  return typeResponses[randomIndex]
}
