'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [isLoading, setIsLoading] = useState(true)
  const [displayChildren, setDisplayChildren] = useState(children)

  useEffect(() => {
    // 页面切换时显示加载状态
    setIsLoading(true)

    // 短暂延迟后显示新内容
    const timer = setTimeout(() => {
      setDisplayChildren(children)
      setIsLoading(false)
    }, 150)

    return () => clearTimeout(timer)
  }, [pathname, children])

  return (
    <div className="relative">
      {/* 加载指示器 */}
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm transition-opacity duration-300">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-3 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
            <span className="text-sm text-gray-500">加载中...</span>
          </div>
        </div>
      )}

      {/* 页面内容 */}
      <div
        className={`transition-all duration-500 ${
          isLoading ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
        }`}
      >
        {displayChildren}
      </div>
    </div>
  )
}
