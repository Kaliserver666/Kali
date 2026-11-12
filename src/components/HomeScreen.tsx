import React from 'react';
import {
  Cpu,
  Wifi,
  Sparkles,
  Play,
  ArrowRight,
  Shield,
  FolderArchive,
  MessageSquare,
  Wrench,
  CheckCircle2,
  AlertCircle,
  Network,
} from 'lucide-react';
import { AppSettings, McpServerConfig, ChatMessage, AgentTask } from '../types';
import { ActiveScreen } from './Navigation';

interface HomeScreenProps {
  settings: AppSettings;
  mcpServers: McpServerConfig[];
  messages: ChatMessage[];
  tasks: AgentTask[];
  onNavigate: (screen: ActiveScreen) => void;
  onQuickPrompt: (prompt: string) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  settings,
  mcpServers,
  messages,
  tasks,
  onNavigate,
  onQuickPrompt,
}) => {
  const connectedMcpCount = mcpServers.filter(s => s.status === 'connected').length;
  const hasKey = Boolean(settings.openRouterApiKey);

  const quickPrompts = [
    {
      title: 'Analyze Local MCP Network',
      prompt: 'Vladimir, run a diagnostic on my local network MCP server at 192.168.1.100:8000 and explain 127.0.0.1 localhost vs Wi-Fi LAN addresses.',
      icon: Network,
      color: 'from-cyan-500/20 to-blue-500/20 text-cyan-400 border-cyan-500/30',
    },
    {
      title: 'OpenRouter Frontier Agent',
      prompt: 'Vladimir, explain how you leverage OpenRouter streaming SSE and tool calling to execute complex development tasks.',
      icon: Sparkles,
      color: 'from-purple-500/20 to-pink-500/20 text-purple-400 border-purple-500/30',
    },
    {
      title: 'File & Storage Tools',
      prompt: 'Vladimir, list all accessible files in my Android storage and show me the contents of welcome_guide.md.',
      icon: Wrench,
      color: 'from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/30',
    },
    {
      title: 'Multi-Step Task Planner',
      prompt: 'Vladimir, create a 4-step execution plan to connect to an MCP server, discover its tools, test calculate utility, and summarize the output.',
      icon: Play,
      color: 'from-amber-500/20 to-orange-500/20 text-amber-400 border-amber-500/30',
    },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-8">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0c1322] via-[#090e18] to-[#06080d] border border-cyan-500/30 p-6 sm:p-8 shadow-[0_0_50px_rgba(0,240,255,0.08)]">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span>VLADIMIR AI CORE ACTIVE • OPENROUTER INTEGRATED</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Elite Personal <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400">AI Agent</span> for Android
            </h2>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Native Android architecture integrating real <strong>OpenRouter</strong> frontier models with blazing-fast SSE streaming, genuine <strong>Model Context Protocol (MCP)</strong> client, and autonomous multi-step tool execution.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col gap-3 shrink-0">
            <button
              onClick={() => onNavigate('chat')}
              className="flex items-center justify-center space-x-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 text-black font-bold text-sm shadow-[0_0_25px_rgba(0,240,255,0.4)] hover:shadow-[0_0_35px_rgba(0,240,255,0.6)] hover:scale-[1.02] transition-all"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Launch Agent Chat</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>

            <button
              onClick={() => onNavigate('android')}
              className="flex items-center justify-center space-x-2 px-5 py-3 rounded-2xl bg-purple-950/40 hover:bg-purple-900/40 border border-purple-500/40 text-purple-300 text-sm font-semibold transition-all"
            >
              <FolderArchive className="w-4 h-4" />
              <span>Export Android Studio .ZIP</span>
            </button>
          </div>
        </div>
      </div>

      {/* System Status Dashboard Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* OpenRouter Status */}
        <div
          onClick={() => onNavigate('settings')}
          className="p-5 rounded-2xl bg-[#0b0f19] border border-slate-800/80 hover:border-cyan-500/40 cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">AI Provider</span>
            <div className={`p-2 rounded-xl ${hasKey ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
              <Cpu className="w-4 h-4" />
            </div>
          </div>
          <div className="text-base font-bold text-white flex items-center gap-1.5">
            OpenRouter
            {hasKey ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 text-amber-400 animate-pulse" />
            )}
          </div>
          <p className="text-xs text-slate-400 mt-1 font-mono truncate">
            {settings.selectedModel}
          </p>
          <div className="mt-3 text-[11px] text-cyan-400 group-hover:underline flex items-center gap-1">
            {hasKey ? 'Manage model & parameters' : 'Configure API key →'}
          </div>
        </div>

        {/* MCP Client Status */}
        <div
          onClick={() => onNavigate('mcp')}
          className="p-5 rounded-2xl bg-[#0b0f19] border border-slate-800/80 hover:border-cyan-500/40 cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">MCP Protocol</span>
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
              <Network className="w-4 h-4" />
            </div>
          </div>
          <div className="text-base font-bold text-white">
            {connectedMcpCount > 0 ? `${connectedMcpCount} Connected` : 'Disconnected'}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {mcpServers.length} configured servers (Streamable HTTP & SSE)
          </p>
          <div className="mt-3 text-[11px] text-cyan-400 group-hover:underline flex items-center gap-1">
            Manage MCP servers →
          </div>
        </div>

        {/* Local Network Protection */}
        <div
          onClick={() => onNavigate('diagnostics')}
          className="p-5 rounded-2xl bg-[#0b0f19] border border-slate-800/80 hover:border-cyan-500/40 cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Local Network</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
              <Shield className="w-4 h-4" />
            </div>
          </div>
          <div className="text-base font-bold text-white">
            API 37 Shield Active
          </div>
          <p className="text-xs text-slate-400 mt-1">
            127.0.0.1 vs Wi-Fi LAN analyzer
          </p>
          <div className="mt-3 text-[11px] text-purple-400 group-hover:underline flex items-center gap-1">
            Run 10-Point Diagnostics →
          </div>
        </div>

        {/* OpenRouter Frontier Router */}
        <div
          onClick={() => onNavigate('settings')}
          className="p-5 rounded-2xl bg-[#0b0f19] border border-slate-800/80 hover:border-cyan-500/40 cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Frontier Models</span>
            <div className="p-2 rounded-xl bg-pink-500/10 text-pink-400">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="text-base font-bold text-white">
            Claude • Gemini • DeepSeek
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Blazing fast SSE stream & tool loop
          </p>
          <div className="mt-3 text-[11px] text-pink-400 group-hover:underline flex items-center gap-1">
            Switch Frontier Model →
          </div>
        </div>
      </div>

      {/* Quick Launch Prompts */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            Quick Agent Operations
          </h3>
          <span className="text-xs text-slate-400">Tap any mission to launch</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quickPrompts.map((qp, idx) => {
            const Icon = qp.icon;
            return (
              <div
                key={idx}
                onClick={() => {
                  onQuickPrompt(qp.prompt);
                  onNavigate('chat');
                }}
                className={`p-4 rounded-2xl bg-gradient-to-r ${qp.color} bg-[#0a0e17] border cursor-pointer hover:scale-[1.01] transition-all flex items-start space-x-3.5`}
              >
                <div className="p-2.5 rounded-xl bg-black/40 shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-semibold text-slate-100 text-sm">{qp.title}</h4>
                  <p className="text-xs text-slate-400 line-clamp-2">{qp.prompt}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Architecture Highlights */}
      <div className="p-6 rounded-2xl bg-[#090d16] border border-slate-800 space-y-4">
        <h3 className="font-bold text-white text-base flex items-center gap-2">
          <Shield className="w-4 h-4 text-cyan-400" />
          Native Android Architecture Conformance (com.vladimir.ai)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-300">
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
            <span className="font-semibold text-cyan-300 block">Single Activity & Compose</span>
            <p className="text-slate-400">
              Modern declarative UI, Material 3 Dark theme, ViewModel state management with Coroutines.
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
            <span className="font-semibold text-cyan-300 block">Genuine MCP Protocol</span>
            <p className="text-slate-400">
              Complete JSON-RPC 2.0 handshake, dynamic tool discovery, and streamable HTTP/SSE transport.
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
            <span className="font-semibold text-cyan-300 block">Android 17 Local Network Fix</span>
            <p className="text-slate-400">
              Evaluates ACCESS_LOCAL_NETWORK permissions and clarifies why 127.0.0.1 must be switched to LAN IP.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
