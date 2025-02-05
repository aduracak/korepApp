import { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
  children?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo)
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center p-4">
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-8 border border-white/10 max-w-md w-full">
            <h1 className="text-2xl font-bold text-white mb-4">Oops, došlo je do greške!</h1>
            <p className="text-gray-400 mb-6">
              {this.state.error?.message || 'Nešto je pošlo po zlu. Molimo pokušajte ponovo.'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full px-4 py-2 bg-gradient-to-r from-emerald-400 to-cyan-400 hover:from-emerald-500 hover:to-cyan-500 text-white rounded-lg font-medium transition-all duration-200"
            >
              Osvježi stranicu
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
} 