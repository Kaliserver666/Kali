import React from 'react';
import { Cpu, Wifi, Mic, Shield, Sparkles, KeyRound } from 'lucide-react';
import { AppSettings, McpServerConfig } from '../types';

interface HeaderProps {
  settings: AppSettings;
  mcpServers: McpServerConfig[];
  onOpenSettings: () => void;
  onOpenDiagnostics: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  mcpServers,
  onOpenSettings,
  onOpenDiagnostics,
}) => {
  const connectedMcpCount = mcpServers.filter(s => s.status === 'connected').length;
  const hasKey = Boolean(settings.openRouterApiKey);

  return (
    <header className="h-16 border-b border-slate-800/80 bg-[#090d16]/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 select-none">
      {/* Brand & Identity */}
      <div className="flex items-center space-x-3">
        <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500/20 via-blue-500/10 to-purple-600/20 border border-cyan-500/30 text-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.2)]">
          <Cpu className="w-5 h-5 text-cyan-400 animate-pulse" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#00F0FF]" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="font-bold text-lg tracking-wider text-slate-100 flex items-center gap-1.5">
              VLADIMIR <span className="text-cyan-400 font-extrabold text-sm px-1.5 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20 tracking-normal">AI</span>
            </h1>
            <span className="hidden sm:inline-block text-[11px] font-mono text-slate-400 bg-slate-800/60 px-2 py-0.5 rounded border border-slate-700/50">
              Native Android Agent
            </span>
          </div>
          <p className="text-[11px] text-slate-400 hidden md:block">
            OpenRouter • Genuine MCP • Voice Interruption • Android 17 Security
          </p>
        </div>
      </div>

      {/* Real-time Status Badges */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        {/* Model Badge */}
        <div className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span className="font-mono text-[11px] truncate max-w-[150px]">
            {settings.selectedModel.split('/').pop()}
          </span>
        </div>

        {/* OpenRouter Key Status */}
        <button
          onClick={onOpenSettings}
          className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all border ${
            hasKey
              ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/30 hover:bg-emerald-900/40'
              : 'bg-amber-950/40 text-amber-300 border-amber-500/40 hover:bg-amber-900/40 animate-pulse'
          }`}
          title={hasKey ? 'OpenRouter API Key Configured' : 'Configure OpenRouter API Key'}
        >
          <KeyRound className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{hasKey ? 'OpenRouter Active' : 'Set API Key'}</span>
        </button>

        {/* MCP Status */}
        <button
          onClick={onOpenDiagnostics}
          className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all border ${
            connectedMcpCount > 0
              ? 'bg-cyan-950/40 text-cyan-400 border-cyan-500/30 hover:bg-cyan-900/40'
              : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
          }`}
          title="MCP Connection Diagnostics"
        >
          <Wifi className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">
            MCP: {connectedMcpCount > 0 ? `${connectedMcpCount} Connected` : 'Offline'}
          </span>
        </button>

        {/* Android 17 Local Network Status */}
        <button
          onClick={onOpenDiagnostics}
          className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300"
          title="Android 17 ACCESS_LOCAL_NETWORK Status"
        >
          <Shield className="w-3.5 h-3.5 text-purple-400" />
          <span className="hidden xl:inline text-[11px]">API 37 Shield</span>
        </button>
      </div>
    </header>
  );
};
