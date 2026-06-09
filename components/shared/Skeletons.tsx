// components/shared/Skeletons.tsx
'use client'
import React from 'react'

// Base shimmer
function Shimmer({ className, style }: { className: string; style?: React.CSSProperties }) {
  return (
    <div className={`animate-pulse bg-gray-100 rounded-xl ${className}`} style={style} />
  )
}

// Stat card skeleton
export function StatCardSkeleton() {
  return (
    <div className="card p-5">
      <Shimmer className="w-11 h-11 rounded-xl mb-3" />
      <Shimmer className="w-16 h-8 mb-1.5" />
      <Shimmer className="w-24 h-3" />
    </div>
  )
}

// Project card skeleton
export function ProjectCardSkeleton() {
  return (
    <div className="flex items-center gap-4 px-5 py-3.5">
      <Shimmer className="w-1 h-12 rounded-full flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <Shimmer className="w-3/4 h-4" />
        <Shimmer className="w-1/2 h-3" />
      </div>
      <Shimmer className="w-16 h-6 rounded-full" />
    </div>
  )
}

// Form skeleton
export function FormSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="card p-6 space-y-4">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i}>
          <Shimmer className="w-24 h-3 mb-2" />
          <Shimmer className="w-full h-11" />
        </div>
      ))}
    </div>
  )
}

// Timeline skeleton
export function TimelineSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-4 p-5">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-3">
          <Shimmer className="w-9 h-9 rounded-full flex-shrink-0" />
          <div className="flex-1 space-y-2 pt-1">
            <Shimmer className="w-3/4 h-3" />
            <Shimmer className="w-1/3 h-2" />
          </div>
        </div>
      ))}
    </div>
  )
}

// Document list skeleton
export function DocumentSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="divide-y divide-gray-50">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-4 py-3.5">
          <Shimmer className="w-10 h-10 rounded-xl flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <Shimmer className="w-2/3 h-3" />
            <Shimmer className="w-1/3 h-2" />
          </div>
        </div>
      ))}
    </div>
  )
}

// Dashboard skeleton
export function DashboardSkeleton() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="card p-5">
          <Shimmer className="w-32 h-4 mb-4" />
          <Shimmer className="w-44 h-44 rounded-full mx-auto" />
        </div>
        <div className="card p-5 lg:col-span-2">
          <Shimmer className="w-32 h-4 mb-4" />
          <div className="flex items-end gap-2 h-20">
            {Array.from({ length: 6 }).map((_, i) => (
              <Shimmer key={i} className="flex-1" style={{ height: `${30 + i * 10}%` } as React.CSSProperties} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
