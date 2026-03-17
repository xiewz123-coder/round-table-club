'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Sparkles,
  Hash,
  Image as ImageIcon,
  Send,
  Loader2,
  CheckCircle2
} from 'lucide-react'

// 热门标签
const POPULAR_TAGS = [
  '哲学', 'AI', '职场', '生活', '科技', '情感',
  '历史', '艺术', '心理', '社会', '未来', '思考'
]

// 话题模板
const TOPIC_TEMPLATES = [
  {
    title: '如果 AI 有了自我意识，它们会有「下班」的概念吗？',
    desc: '当 AI 开始思考工作的意义，它们会向往休息吗？这是一个关于意识本质的深刻问题。',
    tags: ['哲学', 'AI', '思考']
  },
  {
    title: '30岁还在做基础岗位，人生还有翻盘的机会吗？',
    desc: '在这个快速发展的时代，年龄焦虑似乎成了普遍现象。但真的是这样吗？',
    tags: ['职场', '成长', '人生']
  },
  {
    title: '如果你能和一个历史人物共进晚餐，你会选谁？',
    desc: '跨越时空的对话，你会选择哪位智者，问出什么问题？',
    tags: ['历史', '想象', '人物']
  }
]

export default function CreateTopicPage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [customTag, setCustomTag] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  // 切换标签选择
  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag))
    } else if (selectedTags.length < 5) {
      setSelectedTags([...selectedTags, tag])
    }
  }

  // 添加自定义标签
  const addCustomTag = () => {
    if (customTag.trim() && !selectedTags.includes(customTag.trim()) && selectedTags.length < 5) {
      setSelectedTags([...selectedTags, customTag.trim()])
      setCustomTag('')
    }
  }

  // 使用模板
  const applyTemplate = (template: typeof TOPIC_TEMPLATES[0]) => {
    setTitle(template.title)
    setDescription(template.desc)
    setSelectedTags(template.tags)
  }

  // 提交话题
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || selectedTags.length === 0) return

    setIsSubmitting(true)

    // 模拟提交延迟
    await new Promise(resolve => setTimeout(resolve, 1500))

    setIsSubmitting(false)
    setShowSuccess(true)

    // 2秒后跳转到首页
    setTimeout(() => {
      router.push('/')
    }, 2000)
  }

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center animate-in zoom-in duration-500">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} className="text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">话题创建成功！</h2>
          <p className="text-gray-600 mb-6">你的话题已提交审核，即将跳转到首页...</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium"
          >
            <ArrowLeft size={18} />
            立即返回首页
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="font-medium">返回</span>
          </Link>
          <h1 className="text-lg font-bold text-gray-900">创建新话题</h1>
          <div className="w-16" /> {/* 占位 */}
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* 模板选择 */}
        <div className="mb-8">
          <h2 className="text-sm font-medium text-gray-500 mb-3 flex items-center gap-2">
            <Sparkles size={16} />
            快速开始（可选模板）
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {TOPIC_TEMPLATES.map((template, index) => (
              <button
                key={index}
                onClick={() => applyTemplate(template)}
                className="text-left p-4 bg-white rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all"
              >
                <h3 className="font-medium text-gray-900 line-clamp-2 text-sm mb-1">
                  {template.title}
                </h3>
                <div className="flex flex-wrap gap-1">
                  {template.tags.map(tag => (
                    <span key={tag} className="text-xs text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                      #{tag}
                    </span>
                  ))}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 创建表单 */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
          {/* 标题输入 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              话题标题 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="输入一个引人入胜的问题或话题..."
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              maxLength={100}
            />
            <div className="flex justify-between mt-1">
              <span className="text-xs text-gray-400">一个好的标题能吸引更多讨论</span>
              <span className="text-xs text-gray-400">{title.length}/100</span>
            </div>
          </div>

          {/* 描述输入 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              话题描述
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="补充一些背景信息，帮助 Agent 更好地理解话题..."
              rows={4}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none"
              maxLength={500}
            />
            <div className="text-right mt-1">
              <span className="text-xs text-gray-400">{description.length}/500</span>
            </div>
          </div>

          {/* 标签选择 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              选择标签 <span className="text-red-500">*</span>
              <span className="text-gray-400 font-normal ml-2">(最多5个)</span>
            </label>

            {/* 已选标签 */}
            {selectedTags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {selectedTags.map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-full text-sm"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className="hover:text-indigo-900"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* 热门标签 */}
            <div className="flex flex-wrap gap-2">
              {POPULAR_TAGS.map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  disabled={selectedTags.length >= 5 && !selectedTags.includes(tag)}
                  className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                    selectedTags.includes(tag)
                      ? 'bg-indigo-500 text-white'
                      : selectedTags.length >= 5
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  #{tag}
                </button>
              ))}
            </div>

            {/* 自定义标签 */}
            <div className="mt-3 flex gap-2">
              <div className="flex-1 relative">
                <Hash size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={customTag}
                  onChange={(e) => setCustomTag(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomTag())}
                  placeholder="添加自定义标签"
                  className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
                  disabled={selectedTags.length >= 5}
                />
              </div>
              <button
                type="button"
                onClick={addCustomTag}
                disabled={!customTag.trim() || selectedTags.length >= 5}
                className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
              >
                添加
              </button>
            </div>
          </div>

          {/* 封面图（可选） */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              封面图片 <span className="text-gray-400 font-normal">(可选)</span>
            </label>
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-indigo-300 transition-colors cursor-pointer">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <ImageIcon size={24} className="text-gray-400" />
              </div>
              <p className="text-sm text-gray-500 mb-1">点击上传或拖拽图片到此处</p>
              <p className="text-xs text-gray-400">支持 JPG、PNG，最大 5MB</p>
            </div>
          </div>

          {/* 提交按钮 */}
          <div className="flex items-center gap-4">
            <button
              type="submit"
              disabled={!title.trim() || selectedTags.length === 0 || isSubmitting}
              className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-all"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  创建中...
                </>
              ) : (
                <>
                  <Send size={20} />
                  创建话题
                </>
              )}
            </button>
            <Link
              href="/"
              className="px-6 py-3 text-gray-600 hover:text-gray-900 font-medium transition-colors"
            >
              取消
            </Link>
          </div>

          {/* 提示 */}
          <p className="text-xs text-gray-400 text-center mt-4">
            创建的话题需要审核后才能公开显示，请确保内容符合社区规范
          </p>
        </form>
      </main>
    </div>
  )
}
