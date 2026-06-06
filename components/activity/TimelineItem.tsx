// components/activity/TimelineItem.tsx
'use client'
import { ActivityLog, getActionMeta } from '@/lib/types/activity.types'

interface Props {
  log:      ActivityLog
  isLast:   boolean
  showProject?: string   // optional project name label
}

export default function TimelineItem({ log, isLast, showProject }: Props) {
  const meta = getActionMeta(log.action)

  const timeStr = log.timestamp.toLocaleTimeString('en-BD', {
    hour: '2-digit', minute: '2-digit',
  })

  return (
    <div className="flex gap-3 relative">
      {/* Vertical line */}
      {!isLast && (
        <div className="absolute left-[18px] top-9 bottom-0 w-0.5 bg-gray-100" />
      )}

      {/* Icon bubble */}
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center
          flex-shrink-0 text-base z-10"
        style={{ backgroundColor: meta.bg }}
      >
        {meta.icon}
      </div>

      {/* Content */}
      <div className={`flex-1 pb-4 ${isLast ? '' : ''}`}>
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-sm font-semibold text-gray-900 leading-snug">
              {log.description}
            </p>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span
                className="text-xs font-medium px-2 py-0.5 rounded-full"
                style={{ backgroundColor: meta.bg, color: meta.color }}
              >
                {meta.label}
              </span>
              {showProject && (
                <span className="text-xs text-gray-400 truncate max-w-[140px]">
                  {showProject}
                </span>
              )}
            </div>
          </div>
          <span className="text-xs text-gray-400 flex-shrink-0 mt-0.5">{timeStr}</span>
        </div>
      </div>
    </div>
  )
}
