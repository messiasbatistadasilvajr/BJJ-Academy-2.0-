import React, { ErrorInfo, ReactNode } from 'react';
import { RefreshCw, Trash2, ShieldAlert } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary caught error]:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleResetStorage = () => {
    try {
      localStorage.clear();
      window.location.reload();
    } catch {
      window.location.reload();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-900 border border-red-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-red-950/40 text-center space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-red-500/20 border border-red-500/50 mx-auto flex items-center justify-center text-red-400">
              <ShieldAlert className="w-9 h-9 animate-pulse" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-black tracking-tight text-white">
                Instabilidade Temporária no Tatame
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Detectamos uma falha inesperada durante a execução. O sistema de proteção do tatame isolou a falha para proteger seus dados.
              </p>
            </div>

            {this.state.error && (
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-left overflow-hidden">
                <p className="text-[11px] font-mono text-red-400 truncate">
                  {this.state.error.name}: {this.state.error.message}
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="flex-1 py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-lg shadow-amber-950/40"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Recarregar Tatame</span>
              </button>

              <button
                type="button"
                onClick={this.handleResetStorage}
                className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 hover:text-white font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer border border-slate-700"
                title="Restaura os dados originais e limpa cache"
              >
                <Trash2 className="w-4 h-4 text-slate-400" />
                <span>Restaurar Padrões</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
