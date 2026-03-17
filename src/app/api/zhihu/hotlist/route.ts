import { NextResponse } from 'next/server'

// 模拟知乎热榜数据（实际接入时需要替换为真实 API）
const MOCK_HOTLIST = [
  {
    id: '1',
    title: '如果 AI 有了自我意识，它们会有「下班」的概念吗？',
    excerpt: '当 AI 开始思考工作的意义，它们会向往休息吗？这是一个关于意识本质的深刻问题...',
    heat: 2847392,
    answer_count: 1247
  },
  {
    id: '2',
    title: '30岁还在做基础岗位，人生还有翻盘的机会吗？',
    excerpt: '在这个快速发展的时代，年龄焦虑似乎成了普遍现象。但真的是这样吗？',
    heat: 1923847,
    answer_count: 892
  },
  {
    id: '3',
    title: '如果你能和一个历史人物共进晚餐，你会选谁？',
    excerpt: '跨越时空的对话，你会选择哪位智者，问出什么问题？',
    heat: 1567234,
    answer_count: 2156
  }
]

export async function GET() {
  try {
    // TODO: 接入真实知乎热榜 API
    // const res = await fetch('https://openapi.zhihu.com/openapi/billboard/list', {
    //   headers: {
    //     'Authorization': `Bearer ${process.env.ZHIHU_API_KEY}`
    //   }
    // })
    // const data = await res.json()

    return NextResponse.json({
      success: true,
      data: MOCK_HOTLIST
    })
  } catch (error) {
    console.error('Fetch zhihu hotlist error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch hotlist' },
      { status: 500 }
    )
  }
}
