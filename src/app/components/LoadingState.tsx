'use client'

import { Loader2 } from 'lucide-react'

interface LoadingStateProps {
  text?: string
  size?: 'sm' | 'md' | 'lg'
  fullScreen?: boolean
}

export default function LoadingState({
  text = '加载中...',
  size = 'md',
  fullScreen = false
}: LoadingStateProps) {
  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  }

  const containerClasses = fullScreen
    ? 'fixed inset-0 z-50 bg-white/90 backdrop-blur-sm'
    : 'w-full h-full min-h-[200px]'

  return (
    <div className={`${containerClasses} flex flex-col items-center justify-center gap-4`}>
      <div className="relative">
        <Loader2 className={`${sizeClasses[size]} text-indigo-600 animate-spin`} />
        <div className="absolute inset-0 blur-lg opacity-50">
          <Loader2 className={`${sizeClasses[size]} text-indigo-400 animate-spin`} />
        </div>
      </div>
      {text && (
        <p className="text-gray-500 text-sm animate-pulse">{text}</p>
      )}
    </div>
  )
}

// 骨架屏组件
export function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm animate-pulse">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-gray-200 rounded-full" />
        <div className="flex-1 space-y-3">
          <div className="h-4 bg-gray-200 rounded w-1/3" />
          <div className="h-3 bg-gray-200 rounded w-3/4" />
          <div className="h-3 bg-gray-200 rounded w-1/2" />
        </div>
      </div>
    </div>
  )
}

export function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}
