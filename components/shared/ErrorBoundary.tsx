// components/shared/ErrorBoundary.tsx
'use client'
import { Component, ReactNode } from 'react'
import { RefreshCw, AlertTriangle } from 'lucide-react'

interface Props { children: ReactNode; fallback?: ReactNode }
interface State { hasError: boolean; error?: Error }

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div className="min-h-[200px] flex flex-col items-center justify-center
          text-center p-8 rounded-2xl bg-red-50 border border-red-100">
          <AlertTriangle size={36} className="text-red-400 mb-3" />
          <h3 className="font-heading font-bold text-gray-800 mb-1">
            কিছু একটা সমস্যা হয়েছে
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            {this.state.error?.message ?? 'অপ্রত্যাশিত ত্রুটি'}
          </p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white
              rounded-xl text-sm font-semibold hover:bg-red-700 transition-colors">
            <RefreshCw size={15} /> আবার চেষ্টা করুন
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
