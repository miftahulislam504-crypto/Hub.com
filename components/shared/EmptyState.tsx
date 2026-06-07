// components/shared/EmptyState.tsx
'use client'
import { LucideIcon } from 'lucide-react'

interface Props {
  icon:       LucideIcon
  title:      string
  desc?:      string
  action?:    { label: string; onClick: () => void }
  actionHref?: string
  actionLabel?: string
}

export default function EmptyState({ icon: Icon, title, desc, action }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center px-4">
      <div className="w-20 h-20 rounded-2xl bg-gray-50 flex items-center justify-center mb-4">
        <Icon size={36} className="text-gray-200" />
      </div>
      <h3 className="font-heading font-bold text-gray-700 text-lg mb-1">{title}</h3>
      {desc && <p className="text-gray-400 text-sm max-w-xs">{desc}</p>}
      {action && (
        <button
          onClick={action.onClick}
          className="mt-5 btn-primary text-sm px-5 py-2.5"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}
