import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an unhandled error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full bg-slate-950 flex flex-col items-center justify-center p-6 text-slate-100 font-sans select-none">
          <div className="max-w-md w-full bg-slate-900 border border-red-500/30 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-400">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-100">
                  {this.props.fallbackTitle || 'Đã xảy ra lỗi giao diện'}
                </h2>
                <p className="text-xs text-slate-400">Hệ thống đã bắt lỗi an toàn (không bị trắng trang).</p>
              </div>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono text-red-300 overflow-x-auto max-h-36">
              {this.state.error?.message || 'Lỗi không xác định'}
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={this.handleReset}
                className="flex-1 py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition"
              >
                Thử lại
              </button>
              <button
                onClick={this.handleReload}
                className="flex-1 py-2 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-xs font-bold text-slate-950 flex items-center justify-center gap-1.5 transition shadow-lg shadow-amber-500/20"
              >
                <RefreshCw size={13} />
                Tải lại trang
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
