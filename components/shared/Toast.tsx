// components/shared/Toast.tsx
'use client'
import { useState, useEffect, createContext, useContext, useCallback } from 'react'
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react'

type ToastType = 'success' | 'error' | 'info'

interface ToastItem {
  id:      string
  message: string
  type:    ToastType
}

interface ToastCtx {
  toast: (message: string, type?: ToastType) => void
}

const ToastContext = createContext<ToastCtx>({ toast: () => {} })

export function useToast() {
  return useContext(ToastContext)
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const toast = useCallback((message: string, type: ToastType = 'success') => {
    const id = Math.random().toString(36).slice(2)
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 3500)
  }, [])

  const remove = (id: string) =>
    setToasts(prev => prev.filter(t => t.id !== id))

  const icons = {
    success: <CheckCircle size={18} className="text-green-500 flex-shrink-0" />,
    error:   <AlertCircle size={18} className="text-red-500   flex-shrink-0" />,
    info:    <Info        size={18} className="text-blue-500  flex-shrink-0" />,
  }

  const colors = {
    success: 'border-l-green-500',
    error:   'border-l-red-500',
    info:    'border-l-blue-500',
  }

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}

      {/* Toast container */}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-xs w-full">
        {toasts.map(t => (
          <div
            key={t.id}
            className={`flex items-start gap-3 bg-white rounded-2xl shadow-lg
              border border-gray-100 border-l-4 px-4 py-3
              animate-in slide-in-from-right-4 duration-300
              ${colors[t.type]}`}
          >
            {icons[t.type]}
            <p className="text-sm text-gray-800 flex-1 leading-snug">{t.message}</p>
            <button onClick={() => remove(t.id)}
              className="text-gray-300 hover:text-gray-500 flex-shrink-0 mt-0.5">
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
