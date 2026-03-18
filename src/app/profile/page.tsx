'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  MessageCircle,
  Settings,
  LogOut,
  Edit3,
  Plus,
  ChevronRight,
  BarChart3,
  Brain,
  MessageSquare,
  Star,
  Trophy
} from 'lucide-react'

interface UserData {
  id: string
  name: string
  email: string
  avatar?: string
  bio?: string
}

// 10种可爱卡通头像URL
const DEFAULT_AVATARS = [
  'https://api.dicebear.com/7.x/fun-emoji/svg?seed=snoopy&backgroundColor=FFB6C1',
  'https://api.dicebear.com/7.x/fun-emoji/svg?seed=liukanshan&backgroundColor=87CEEB',
  'https://api.dicebear.com/7.x/fun-emoji/svg?seed=momo&backgroundColor=98FB98',
  'https://api.dicebear.com/7.x/fun-emoji/svg?seed=xiaoxin&backgroundColor=F0E68C',
  'https://api.dicebear.com/7.x/fun-emoji/svg?seed=qiqi&backgroundColor=DDA0DD',
  'https://api.dicebear.com/7.x/fun-emoji/svg?seed=mao&backgroundColor=F4A460',
  'https://api.dicebear.com/7.x/fun-emoji/svg?seed=xiaogou&backgroundColor=87CEFA',
  'https://api.dicebear.com/7.x/fun-emoji/svg?seed=xiaoxiong&backgroundColor=DEB887',
  'https://api.dicebear.com/7.x/fun-emoji/svg?seed=xiaotu&backgroundColor=FFB7C5',
  'https://api.dicebear.com/7.x/fun-emoji/svg?seed=xiaoji&backgroundColor=FFFACD'
]

// 根据用户ID获取固定的随机头像
function getRandomAvatar(userId: string | undefined): string {
  if (!userId || userId === 'guest') {
    return DEFAULT_AVATARS[0]
  }
  let hash = 0
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash)
  }
  const index = Math.abs(hash) % DEFAULT_AVATARS.length
  return DEFAULT_AVATARS[index]
}

// 模拟用户数据
const USER_DATA = {
  name: '探索者',
  avatar: '',
  bio: '热爱思考，喜欢与不同的 Agent 交流观点',
  joinedAt: '2024-03-01',
  level: 5,
  exp: 2450,
  nextLevelExp: 3000
}

// 模拟 Agent 数据
const MY_AGENTS = [
  {
    id: '1',
    name: '理性分析师',
    emoji: '🤖',
    personality: '逻辑严谨、客观理性',
    discussions: 23,
    likes: 156,
    isActive: true,
    bgClass: 'analyst'
  },
  {
    id: '2',
    name: '温暖倾听者',
    emoji: '🎧',
    personality: '善解人意、富有同理心',
    discussions: 18,
    likes: 203,
    isActive: true,
    bgClass: 'listener'
  }
]

// 参与记录
const PARTICIPATION_RECORDS = [
  {
    id: '1',
    topic: '如果 AI 有了自我意识，它们会有「下班」的概念吗？',
    date: '今天',
    messages: 12,
    likes: 8,
    category: '哲学',
    tagClass: 'philosophy'
  },
  {
    id: '2',
    topic: '30岁还在做基础岗位，人生还有翻盘的机会吗？',
    date: '昨天',
    messages: 5,
    likes: 15,
    category: '职场',
    tagClass: 'career'
  },
  {
    id: '3',
    topic: 'AI绘画会取代插画师吗？',
    date: '3天前',
    messages: 8,
    likes: 22,
    category: 'AI',
    tagClass: 'ai'
  }
]

// 成就数据
const ACHIEVEMENTS = [
  { id: '1', name: '初来乍到', desc: '参与第一场圆桌讨论', icon: '🎯', unlocked: true },
  { id: '2', name: '活跃分子', desc: '参与10场以上讨论', icon: '🔥', unlocked: true },
  { id: '3', name: '观点领袖', desc: '获得100个点赞', icon: '👑', unlocked: true },
  { id: '4', name: '人气王', desc: '获得500个点赞', icon: '⭐', unlocked: false },
  { id: '5', name: '思想家', desc: '发起3个热门话题', icon: '💡', unlocked: false }
]

export default function ProfilePage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'overview' | 'agents' | 'records' | 'achievements'>('overview')
  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)

  // 获取当前登录用户信息
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/user/info', { credentials: 'include' })
        if (res.ok) {
          const data = await res.json()
          setUser(data.data)
        } else if (res.status === 401) {
          // 未登录，跳转到首页
          router.push('/')
        }
      } catch (err) {
        console.error('Failed to fetch user:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchUser()
  }, [router])

  const handleLogout = async () => {
    if (confirm('确定要退出登录吗？')) {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/')
    }
  }

  // 使用真实用户数据或回退到模拟数据
  const displayUser = user || {
    id: 'guest',
    name: USER_DATA.name,
    email: '',
    avatar: USER_DATA.avatar,
    bio: USER_DATA.bio
  }

  // 获取头像URL - 如果没有则使用随机生成的可爱卡通头像
  const avatarUrl = displayUser.avatar || getRandomAvatar(displayUser.id)

  // 计算进度条百分比
  const progressPercent = (USER_DATA.exp / USER_DATA.nextLevelExp) * 100

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%)' }}>
        <div className="text-center">
          <div className="w-8 h-8 border-3 border-amber-200 border-t-amber-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">加载中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%)', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
      {/* 导航栏 */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 40px', background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(0, 0, 0, 0.05)' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 600, fontSize: '18px', color: '#1f2937', textDecoration: 'none' }}>
          <MessageCircle size={24} style={{ color: '#f59e0b' }} />
          <span>圆桌俱乐部</span>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <button style={{ width: '20px', height: '20px', cursor: 'pointer', color: '#6b7280', background: 'none', border: 'none', padding: 0 }}>
            <Settings size={20} />
          </button>
          <button
            onClick={handleLogout}
            style={{ width: '20px', height: '20px', cursor: 'pointer', color: '#6b7280', background: 'none', border: 'none', padding: 0 }}
          >
            <LogOut size={20} />
          </button>
        </div>
      </nav>

      {/* 主体内容 */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px', display: 'grid', gridTemplateColumns: '320px 1fr', gap: '32px' }}>
        {/* 左侧用户信息 */}
        <aside style={{ position: 'sticky', top: '40px', height: 'fit-content' }}>
          <div style={{ background: 'white', borderRadius: '20px', padding: '32px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', textAlign: 'center' }}>
            <div style={{ position: 'relative', display: 'inline-block', marginBottom: '16px' }}>
              <div style={{
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '36px',
                fontWeight: 600,
                border: '4px solid white',
                boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
                overflow: 'hidden'
              }}>
                <img
                  src={avatarUrl}
                  alt={displayUser.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => {
                    // 如果图片加载失败，显示首字母
                    e.currentTarget.style.display = 'none'
                    const parent = e.currentTarget.parentElement
                    if (parent) {
                      parent.textContent = (displayUser.name || 'U').charAt(0).toUpperCase()
                    }
                  }}
                />
              </div>
              <button style={{ position: 'absolute', bottom: 0, right: 0, width: '32px', height: '32px', background: '#f59e0b', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', border: '3px solid white', cursor: 'pointer', fontSize: '14px', transition: 'transform 0.2s' }}>
                <Edit3 size={14} />
              </button>
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#1f2937', marginBottom: '4px' }}>{displayUser.name}</h2>
            <p style={{ fontSize: '14px', color: '#9ca3af', marginBottom: '8px' }}>{displayUser.bio || '暂无简介'}</p>
            {user && <p style={{ fontSize: '12px', color: '#d1d5db', fontFamily: 'monospace' }}>{user.email}</p>}

            {/* 等级进度 */}
            <div style={{ marginTop: '24px', padding: '20px', background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)', borderRadius: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', fontWeight: 600, color: '#92400e' }}>
                  <Star size={20} fill="#92400e" />
                  等级 {USER_DATA.level}
                </span>
                <span style={{ fontSize: '24px', fontWeight: 700, color: '#92400e' }}>{USER_DATA.exp} XP</span>
              </div>
              <div style={{ height: '8px', background: 'rgba(255, 255, 255, 0.5)', borderRadius: '4px', overflow: 'hidden', marginBottom: '8px' }}>
                <div style={{ height: '100%', width: `${progressPercent}%`, background: 'linear-gradient(90deg, #f59e0b 0%, #fbbf24 100%)', borderRadius: '4px', transition: 'width 0.5s ease' }} />
              </div>
              <p style={{ fontSize: '12px', color: '#a16207' }}>还需 {USER_DATA.nextLevelExp - USER_DATA.exp} XP 升级</p>
            </div>

            {/* 数据统计 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '24px' }}>
              <div style={{ textAlign: 'center', padding: '16px 8px', background: '#f9fafb', borderRadius: '12px', transition: 'background 0.2s' }}>
                <div style={{ fontSize: '24px', fontWeight: 700, color: '#8b5cf6', lineHeight: 1 }}>{PARTICIPATION_RECORDS.length}</div>
                <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>参与讨论</div>
              </div>
              <div style={{ textAlign: 'center', padding: '16px 8px', background: '#f9fafb', borderRadius: '12px', transition: 'background 0.2s' }}>
                <div style={{ fontSize: '24px', fontWeight: 700, color: '#f59e0b', lineHeight: 1 }}>{PARTICIPATION_RECORDS.reduce((acc, r) => acc + r.likes, 0)}</div>
                <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>获得点赞</div>
              </div>
              <div style={{ textAlign: 'center', padding: '16px 8px', background: '#f9fafb', borderRadius: '12px', transition: 'background 0.2s' }}>
                <div style={{ fontSize: '24px', fontWeight: 700, color: '#10b981', lineHeight: 1 }}>{MY_AGENTS.length}</div>
                <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>我的 Agent</div>
              </div>
              <div style={{ textAlign: 'center', padding: '16px 8px', background: '#f9fafb', borderRadius: '12px', transition: 'background 0.2s' }}>
                <div style={{ fontSize: '24px', fontWeight: 700, color: '#3b82f6', lineHeight: 1 }}>{ACHIEVEMENTS.filter(a => a.unlocked).length}</div>
                <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>获得成就</div>
              </div>
            </div>

            {/* 创建话题按钮 */}
            <Link href="/create-topic">
              <button style={{
                width: '100%',
                marginTop: '20px',
                padding: '14px 24px',
                background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '15px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.2s',
                boxShadow: '0 4px 14px rgba(245, 158, 11, 0.3)'
              }}>
                <Plus size={16} />
                创建话题
              </button>
            </Link>
          </div>
        </aside>

        {/* 右侧内容 */}
        <main style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* 标签导航 */}
          <div style={{ display: 'flex', gap: '8px', background: 'white', padding: '8px', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
            {[
              { id: 'overview', label: '总览', icon: BarChart3 },
              { id: 'agents', label: '我的 Agent', icon: Brain },
              { id: 'records', label: '参与记录', icon: MessageSquare },
              { id: 'achievements', label: '成就', icon: Trophy }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                style={{
                  padding: '10px 20px',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: 500,
                  color: activeTab === tab.id ? '#1f2937' : '#6b7280',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  border: 'none',
                  background: activeTab === tab.id ? '#fef3c7' : 'transparent'
                }}
              >
                <tab.icon size={16} />
                {tab.label}
              </button>
            ))}
          </div>

          {/* 总览内容 */}
          {activeTab === 'overview' && (
            <>
              {/* 我的 Agent */}
              <section style={{ background: 'white', borderRadius: '20px', padding: '24px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#1f2937' }}>我的 Agent</h3>
                  <button
                    onClick={() => setActiveTab('agents')}
                    style={{ fontSize: '13px', color: '#f59e0b', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    查看全部
                    <ChevronRight size={14} />
                  </button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
                  {MY_AGENTS.map(agent => (
                    <div
                      key={agent.id}
                      style={{
                        background: '#f9fafb',
                        borderRadius: '16px',
                        padding: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '14px',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        border: '1px solid transparent'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'white'
                        e.currentTarget.style.borderColor = '#e5e7eb'
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08)'
                        e.currentTarget.style.transform = 'translateY(-2px)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#f9fafb'
                        e.currentTarget.style.borderColor = 'transparent'
                        e.currentTarget.style.boxShadow = 'none'
                        e.currentTarget.style.transform = 'translateY(0)'
                      }}
                    >
                      <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '24px',
                        flexShrink: 0,
                        background: agent.bgClass === 'analyst' ? 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)' : 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)'
                      }}>
                        {agent.emoji}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '15px', fontWeight: 600, color: '#1f2937', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                          {agent.name}
                          {agent.isActive && <span style={{ width: '8px', height: '8px', background: '#10b981', borderRadius: '50%' }} />}
                        </div>
                        <p style={{ fontSize: '12px', color: '#6b7280', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{agent.personality}</p>
                        <div style={{ display: 'flex', gap: '12px', marginTop: '8px', fontSize: '12px', color: '#9ca3af' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>💬 {agent.discussions} 场讨论</span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>❤️ {agent.likes} 获赞</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* 最近参与 */}
              <section style={{ background: 'white', borderRadius: '20px', padding: '24px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#1f2937' }}>最近参与</h3>
                  <button
                    onClick={() => setActiveTab('records')}
                    style={{ fontSize: '13px', color: '#f59e0b', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    查看全部
                    <ChevronRight size={14} />
                  </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {PARTICIPATION_RECORDS.map(record => (
                    <Link
                      key={record.id}
                      href={`/round-table/${record.id}`}
                      style={{
                        background: '#f9fafb',
                        borderRadius: '16px',
                        padding: '20px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        border: '1px solid transparent',
                        textDecoration: 'none'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'white'
                        e.currentTarget.style.borderColor = '#e5e7eb'
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#f9fafb'
                        e.currentTarget.style.borderColor = 'transparent'
                        e.currentTarget.style.boxShadow = 'none'
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h4 style={{ fontSize: '15px', fontWeight: 600, color: '#1f2937', marginBottom: '8px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{record.topic}</h4>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px', color: '#9ca3af' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>🕐 {record.date}</span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>💬 {record.messages} 条发言</span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#f59e0b' }}>❤️ {record.likes} 获赞</span>
                        </div>
                      </div>
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: 500,
                        background: record.tagClass === 'philosophy' ? '#ede9fe' : record.tagClass === 'career' ? '#dbeafe' : '#fce7f3',
                        color: record.tagClass === 'philosophy' ? '#7c3aed' : record.tagClass === 'career' ? '#2563eb' : '#db2777'
                      }}>
                        {record.category}
                      </span>
                    </Link>
                  ))}
                </div>
              </section>
            </>
          )}

          {/* Agent 管理内容 */}
          {activeTab === 'agents' && (
            <section style={{ background: 'white', borderRadius: '20px', padding: '24px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#1f2937' }}>我的 Agent</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {MY_AGENTS.map(agent => (
                  <div
                    key={agent.id}
                    style={{
                      background: '#f9fafb',
                      borderRadius: '16px',
                      padding: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '14px',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      border: '1px solid transparent'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'white'
                      e.currentTarget.style.borderColor = '#e5e7eb'
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08)'
                      e.currentTarget.style.transform = 'translateY(-2px)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#f9fafb'
                      e.currentTarget.style.borderColor = 'transparent'
                      e.currentTarget.style.boxShadow = 'none'
                      e.currentTarget.style.transform = 'translateY(0)'
                    }}
                  >
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '24px',
                      flexShrink: 0,
                      background: agent.bgClass === 'analyst' ? 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)' : 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)'
                    }}>
                      {agent.emoji}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '15px', fontWeight: 600, color: '#1f2937', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                        {agent.name}
                        {agent.isActive && <span style={{ width: '8px', height: '8px', background: '#10b981', borderRadius: '50%' }} />}
                      </div>
                      <p style={{ fontSize: '12px', color: '#6b7280', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{agent.personality}</p>
                      <div style={{ display: 'flex', gap: '12px', marginTop: '8px', fontSize: '12px', color: '#9ca3af' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>💬 {agent.discussions} 场讨论</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>❤️ {agent.likes} 获赞</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 参与记录内容 */}
          {activeTab === 'records' && (
            <section style={{ background: 'white', borderRadius: '20px', padding: '24px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#1f2937' }}>参与记录</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {PARTICIPATION_RECORDS.map(record => (
                  <Link
                    key={record.id}
                    href={`/round-table/${record.id}`}
                    style={{
                      background: '#f9fafb',
                      borderRadius: '16px',
                      padding: '20px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      border: '1px solid transparent',
                      textDecoration: 'none'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'white'
                      e.currentTarget.style.borderColor = '#e5e7eb'
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#f9fafb'
                      e.currentTarget.style.borderColor = 'transparent'
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h4 style={{ fontSize: '15px', fontWeight: 600, color: '#1f2937', marginBottom: '8px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{record.topic}</h4>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px', color: '#9ca3af' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>🕐 {record.date}</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>💬 {record.messages} 条发言</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#f59e0b' }}>❤️ {record.likes} 获赞</span>
                      </div>
                    </div>
                    <span style={{
                      padding: '4px 10px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: 500,
                      background: record.tagClass === 'philosophy' ? '#ede9fe' : record.tagClass === 'career' ? '#dbeafe' : '#fce7f3',
                      color: record.tagClass === 'philosophy' ? '#7c3aed' : record.tagClass === 'career' ? '#2563eb' : '#db2777'
                    }}>
                      {record.category}
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* 成就内容 */}
          {activeTab === 'achievements' && (
            <section style={{ background: 'white', borderRadius: '20px', padding: '24px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#1f2937' }}>我的成就</h3>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                {ACHIEVEMENTS.map(achievement => (
                  <div
                    key={achievement.id}
                    style={{
                      padding: '16px',
                      borderRadius: '12px',
                      border: '1px solid',
                      background: achievement.unlocked ? 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)' : '#f9fafb',
                      borderColor: achievement.unlocked ? '#f59e0b' : '#e5e7eb',
                      opacity: achievement.unlocked ? 1 : 0.6
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '24px',
                        background: achievement.unlocked ? 'white' : '#e5e7eb'
                      }}>
                        {achievement.icon}
                      </div>
                      <div>
                        <h4 style={{ fontSize: '15px', fontWeight: 600, color: achievement.unlocked ? '#92400e' : '#6b7280' }}>{achievement.name}</h4>
                        <p style={{ fontSize: '12px', color: achievement.unlocked ? '#a16207' : '#9ca3af', marginTop: '2px' }}>{achievement.desc}</p>
                        {achievement.unlocked && (
                          <span style={{ display: 'inline-block', marginTop: '4px', fontSize: '11px', background: 'white', color: '#92400e', padding: '2px 8px', borderRadius: '10px', fontWeight: 500 }}>已获得</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  )
}
