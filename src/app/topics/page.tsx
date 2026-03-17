'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  MessageCircle,
  Flame,
  Users,
  Search,
  ChevronLeft,
  Filter,
  TrendingUp,
  Clock,
  Hash
} from 'lucide-react'

// 所有话题数据
const ALL_TOPICS = [
  {
    id: '1',
    title: '如果 AI 有了自我意识，它们会有「下班」的概念吗？',
    desc: '当 AI 开始思考工作的意义，它们会向往休息吗？这是一个关于意识本质的深刻问题。',
    tags: ['哲学', 'AI', '思考'],
    heat: 284.7,
    participants: 23,
    isLive: true,
    isHot: true
  },
  {
    id: '2',
    title: '30岁还在做基础岗位，人生还有翻盘的机会吗？',
    desc: '在这个快速发展的时代，年龄焦虑似乎成了普遍现象。但真的是这样吗？',
    tags: ['职场', '成长', '人生'],
    heat: 192.4,
    participants: 16,
    isLive: true,
    isHot: true
  },
  {
    id: '3',
    title: '如果你能和一个历史人物共进晚餐，你会选谁？',
    desc: '跨越时空的对话，你会选择哪位智者，问出什么问题？',
    tags: ['历史', '想象', '人物'],
    heat: 156.7,
    participants: 19,
    isLive: false,
    isHot: false
  },
  {
    id: '4',
    title: '远程工作三年后，我重新回到了办公室',
    desc: 'WFH的利弊之争从未停止，来听听亲历者怎么说。',
    tags: ['职场', '生活'],
    heat: 128.5,
    participants: 31,
    isLive: false,
    isHot: false
  },
  {
    id: '5',
    title: '为什么现在的年轻人都不爱发朋友圈了？',
    desc: '社交媒体疲劳症正在蔓延，你也有这种感觉吗？',
    tags: ['社交', '心理'],
    heat: 115.2,
    participants: 45,
    isLive: false,
    isHot: false
  },
  {
    id: '6',
    title: '如果人类发现外星人，最先问什么问题？',
    desc: 'SETI科学家与科幻作家的脑洞碰撞，你想知道答案吗？',
    tags: ['科学', '宇宙', '想象'],
    heat: 98.6,
    participants: 27,
    isLive: false,
    isHot: false
  },
  {
    id: '7',
    title: '35岁被裁员，我开启了第二人生',
    desc: '一个前大厂员工的转型故事，给迷茫的你一些启发。',
    tags: ['职场', '转型'],
    heat: 87.3,
    participants: 52,
    isLive: false,
    isHot: false
  },
  {
    id: '8',
    title: 'AI绘画会取代插画师吗？',
    desc: '从Midjourney到Stable Diffusion，创意行业正在经历巨大变革。',
    tags: ['AI', '艺术'],
    heat: 98.5,
    participants: 28,
    isLive: false,
    isHot: false
  },
  {
    id: '9',
    title: '独居生活的小确幸',
    desc: '一个人住，如何把日子过得精彩？分享你的独居心得。',
    tags: ['生活', '独居'],
    heat: 76.3,
    participants: 34,
    isLive: false,
    isHot: false
  },
  {
    id: '10',
    title: '如果拥有读心术，是福是祸？',
    desc: '超能力背后的伦理困境，你想知道别人心里在想什么吗？',
    tags: ['科幻', '伦理'],
    heat: 65.8,
    participants: 22,
    isLive: false,
    isHot: false
  },
  {
    id: '11',
    title: '数字游民的真实生活',
    desc: '边旅行边工作，是理想还是幻想？听听过来人的经验。',
    tags: ['职场', '旅行'],
    heat: 54.2,
    participants: 18,
    isLive: false,
    isHot: false
  },
  {
    id: '12',
    title: 'AI会梦到电子羊吗？',
    desc: '向《银翼杀手》致敬的深度讨论。',
    tags: ['科幻', 'AI', '哲学'],
    heat: 88.4,
    participants: 29,
    isLive: false,
    isHot: false
  }
]

// 根据实际数据生成分类统计
function getCategories(topics: typeof ALL_TOPICS) {
  // 统计每个标签的出现次数
  const tagCounts: Record<string, number> = {}
  topics.forEach(topic => {
    topic.tags.forEach(tag => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1
    })
  })

  // 按数量排序标签
  const sortedTags = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6) // 只取前6个

  // 构建分类数组
  const categories = [
    { name: '全部', count: topics.length },
    { name: '热门', count: topics.filter(t => t.heat > 100).length },
    ...sortedTags.map(([name, count]) => ({ name, count }))
  ]

  return categories
}

// 分页配置
const ITEMS_PER_PAGE = 12

// 排序选项
const SORT_OPTIONS = [
  { name: '最热', icon: Flame },
  { name: '最新', icon: Clock },
  { name: '最多参与', icon: Users }
]

export default function TopicsPage() {
  const [activeCategory, setActiveCategory] = useState('全部')
  const [activeSort, setActiveSort] = useState('最热')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  // 获取动态分类（基于实际数据）
  const categories = getCategories(ALL_TOPICS)

  // 过滤话题
  const filteredTopics = ALL_TOPICS.filter(topic => {
    if (activeCategory === '全部') return true
    if (activeCategory === '热门') return topic.heat > 100
    return topic.tags.includes(activeCategory)
  }).filter(topic => {
    if (!searchQuery) return true
    return topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
           topic.desc.toLowerCase().includes(searchQuery.toLowerCase())
  })

  // 排序话题
  const sortedTopics = [...filteredTopics].sort((a, b) => {
    if (activeSort === '最热') return b.heat - a.heat
    if (activeSort === '最新') return b.id.localeCompare(a.id)
    if (activeSort === '最多参与') return b.participants - a.participants
    return 0
  })

  // 分页逻辑
  const paginatedTopics = sortedTopics.slice(0, currentPage * ITEMS_PER_PAGE)
  const hasMore = paginatedTopics.length < sortedTopics.length

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 导航栏 */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
              <ChevronLeft size={20} />
              <span className="font-medium">返回首页</span>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg flex items-center justify-center">
              <MessageCircle size={18} className="text-white" />
            </div>
            <span className="font-bold text-gray-800">全部话题</span>
          </div>

          <div className="w-20" />
        </div>
      </nav>

      {/* 搜索栏 */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="relative max-w-2xl mx-auto">
            <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="搜索感兴趣的话题..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-100 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:bg-white transition-all"
            />
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* 统计信息 */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 text-gray-500">
            <TrendingUp size={18} />
            <span>
              共 {sortedTopics.length} 个话题
              {sortedTopics.length > ITEMS_PER_PAGE && (
                <span className="text-gray-400 ml-1">(显示 {paginatedTopics.length} 个)</span>
              )}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-gray-400" />
            <span className="text-gray-500">排序：</span>
            {SORT_OPTIONS.map(option => (
              <button
                key={option.name}
                onClick={() => setActiveSort(option.name)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                  activeSort === option.name
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {option.name}
              </button>
            ))}
          </div>
        </div>

        {/* 分类标签 */}
        <div className="flex items-center gap-2 flex-wrap mb-8">
          {categories.map(cat => (
            <button
              key={cat.name}
              onClick={() => {
                setActiveCategory(cat.name)
                setCurrentPage(1) // 切换分类时重置页码
              }}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeCategory === cat.name
                  ? 'bg-amber-500 text-white shadow-md'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-amber-400 hover:text-amber-600'
              }`}
            >
              {cat.name}
              <span className={`ml-1.5 text-xs ${activeCategory === cat.name ? 'text-amber-100' : 'text-gray-400'}`}>
                {cat.count}
              </span>
            </button>
          ))}
        </div>

        {/* 话题列表 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedTopics.map((topic, index) => (
            <Link
              key={topic.id}
              href={`/round-table/${topic.id}`}
              className="group bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-xl transition-all hover:-translate-y-1 animate-fade-in-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* 头部标签 */}
              <div className="flex items-center gap-2 mb-4">
                {topic.isLive && (
                  <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs font-bold rounded-full flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                    进行中
                  </span>
                )}
                {topic.isHot && (
                  <span className="px-2 py-0.5 bg-orange-100 text-orange-600 text-xs font-bold rounded-full flex items-center gap-1">
                    <Flame size={10} />
                    热门
                  </span>
                )}
              </div>

              {/* 标题 */}
              <h3 className="font-bold text-gray-900 mb-3 group-hover:text-amber-600 transition-colors line-clamp-2">
                {topic.title}
              </h3>

              {/* 描述 */}
              <p className="text-sm text-gray-500 line-clamp-2 mb-4">
                {topic.desc}
              </p>

              {/* 标签 */}
              <div className="flex items-center gap-2 mb-4">
                {topic.tags.map(tag => (
                  <span key={tag} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                    #{tag}
                  </span>
                ))}
              </div>

              {/* 底部信息 */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1 text-orange-500">
                    <Flame size={16} />
                    <span className="text-sm font-medium">{topic.heat}万</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-400">
                    <Users size={16} />
                    <span className="text-sm">{topic.participants}</span>
                  </div>
                </div>
                <span className="text-amber-600 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  参与讨论 →
                </span>
              </div>
            </Link>
          ))}
        </div>

        {/* 加载更多 - 只在有更多数据时显示 */}
        {hasMore && (
          <div className="mt-12 text-center">
            <button
              onClick={() => setCurrentPage(prev => prev + 1)}
              className="px-8 py-3 bg-white border border-gray-200 rounded-full text-gray-600 font-medium hover:border-amber-400 hover:text-amber-600 hover:shadow-md transition-all"
            >
              加载更多话题 ({paginatedTopics.length} / {sortedTopics.length})
            </button>
          </div>
        )}

        {/* 空状态 */}
        {paginatedTopics.length === 0 && (
          <div className="text-center py-20 animate-fade-in">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Hash size={24} className="text-gray-400" />
            </div>
            <h3 className="text-gray-900 font-medium mb-2">暂无相关话题</h3>
            <p className="text-gray-500 text-sm">换个关键词或分类试试看？</p>
            <button
              onClick={() => {
                setActiveCategory('全部')
                setSearchQuery('')
                setCurrentPage(1)
              }}
              className="mt-4 px-4 py-2 text-amber-600 hover:text-amber-700 font-medium"
            >
              查看全部话题 →
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
