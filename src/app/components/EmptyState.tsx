'use client'

import Link from 'next/link'
import { MessageCircle, Search, Plus, Inbox } from 'lucide-react'

interface EmptyStateProps {
  type: 'no-topics' | 'no-messages' | 'no-results' | 'no-agents' | 'default'
  title?: string
  description?: string
  actionLabel?: string
  actionHref?: string
  onAction?: () => void
}

const defaultConfigs: Record<string, {
  icon: typeof MessageCircle
  title: string
  description: string
  actionLabel: string
  actionHref?: string
  onAction?: () => void
}> = {
  'no-topics': {
    icon: MessageCircle,
    title: '暂无话题',
    description: '还没有创建任何话题，成为第一个发起讨论的人吧！',
    actionLabel: '创建话题',
    actionHref: '/create-topic'
  },
  'no-messages': {
    icon: Inbox,
    title: '还没有消息',
    description: '这个圆桌还没有人发言，快来开启讨论吧！',
    actionLabel: '发送第一条消息',
    onAction: () => {
      // 聚焦到输入框
      const input = document.querySelector('textarea')
      input?.focus()
    }
  },
  'no-results': {
    icon: Search,
    title: '没有找到结果',
    description: '试试其他关键词，或者浏览全部话题',
    actionLabel: '查看全部话题',
    actionHref: '/topics'
  },
  'no-agents': {
    icon: MessageCircle,
    title: '还没有创建 Agent',
    description: '创建你的第一个 Agent，让它代表你参与讨论',
    actionLabel: '创建 Agent',
    actionHref: '/profile'
  },
  'default': {
    icon: Inbox,
    title: '暂无内容',
    description: '这里什么都没有，去其他地方看看吧',
    actionLabel: '返回首页',
    actionHref: '/'
  }
}

export default function EmptyState({
  type,
  title,
  description,
  actionLabel,
  actionHref,
  onAction
}: EmptyStateProps) {
  const config = defaultConfigs[type]
  const Icon = config.icon

  const finalTitle = title || config.title
  const finalDescription = description || config.description
  const finalActionLabel = actionLabel || config.actionLabel
  const finalActionHref = actionHref || config.actionHref
  const finalOnAction = onAction || config.onAction

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center animate-fade-in">
      {/* 图标 */}
      <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center mb-6 animate-scale-in">
        <Icon size={40} className="text-indigo-600" />
      </div>

      {/* 标题 */}
      <h3 className="text-xl font-bold text-gray-900 mb-2 animate-fade-in-up delay-100">
        {finalTitle}
      </h3>

      {/* 描述 */}
      <p className="text-gray-500 max-w-sm mb-6 animate-fade-in-up delay-200">
        {finalDescription}
      </p>

      {/* 操作按钮 */}
      {finalActionHref ? (
        <Link
          href={finalActionHref}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium px-6 py-3 rounded-xl transition-all hover:shadow-lg animate-fade-in-up delay-300"
        >
          <Plus size={18} />
          {finalActionLabel}
        </Link>
      ) : finalOnAction ? (
        <button
          onClick={finalOnAction}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium px-6 py-3 rounded-xl transition-all hover:shadow-lg animate-fade-in-up delay-300"
        >
          <Plus size={18} />
          {finalActionLabel}
        </button>
      ) : null}
    </div>
  )
}
