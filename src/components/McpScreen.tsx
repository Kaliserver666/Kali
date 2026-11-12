import React, { useState } from 'react';
import {
  Network,
  Plus,
  Trash2,
  Edit2,
  Plug,
  Unplug,
  Wrench,
  Activity,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { McpServerConfig, McpTool } from '../types';
import { McpClientService } from '../services/mcpClient';

interface McpScreenProps {
  servers: McpServerConfig[];
  onUpdateServers: (servers: McpServerConfig[]) => void;
  onOpenDiagnosticsForUrl: (url: string) => void;
}

export const McpScreen: React.FC<McpScreenProps> = ({
  servers,
  onUpdateServers,
  onOpenDiagnosticsForUrl,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [nameInput, setNameInput] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [transportInput, setTransportInput] = useState<'streamable-http' | 'http-sse'>('streamable-http');
  const [authTokenInput, setAuthTokenInput] = useState('');
  const [connectingId, setConnectingId] = useState<string | null>(null);
  const [expandedServerId, setExpandedServerId] = useState<string | null>(null);
  const [discoveredToolsMap, setDiscoveredToolsMap] = useState<Record<string, McpTool[]>>({});

  const handleSaveServer = () => {
    if (!nameInput.trim() || !urlInput.trim()) return;

    if (editingId) {
      const updated = servers.map(s =>
        s.id === editingId
          ? {
              ...s,
              name: nameInput.trim(),
              url: urlInput.trim(),
              transport: transportInput,
              authToken: authTokenInput.trim() || undefined,
            }
          : s
      );
      onUpdateServers(updated);
      setEditingId(null);
    } else {
      const newServer: McpServerConfig = {
        id: `mcp-${Date.now()}`,
        name: nameInput.trim(),
        url: urlInput.trim(),
        transport: transportInput,
        authToken: authTokenInput.trim() || undefined,
        enabled: true,
        status: 'disconnected',
        protocolVersion: '2024-11-05',
      };
      onUpdateServers([...servers, newServer]);
    }

    setNameInput('');
    setUrlInput('');
    setAuthTokenInput('');
    setIsAdding(false);
  };

  const handleDeleteServer = (id: string) => {
    onUpdateServers(servers.filter(s => s.id !== id));
  };

  const handleConnect = async (server: McpServerConfig) => {
    setConnectingId(server.id);

    // Optimistically set connecting
    onUpdateServers(
      servers.map(s => (s.id === server.id ? { ...s, status: 'connecting', errorMessage: undefined } : s))
    );

    const result = await McpClientService.connectAndDiscover(server);

    setConnectingId(null);
    if (result.success) {
      setDiscoveredToolsMap(prev => ({
        ...prev,
        [server.id]: result.tools,
      }));
      onUpdateServers(
        servers.map(s =>
          s.id === server.id
            ? {
                ...s,
                status: 'connected',
                discoveredToolsCount: result.tools.length,
                protocolVersion: result.protocolVersion,
                lastConnected: Date.now(),
                errorMessage: undefined,
              }
            : s
        )
      );
      setExpandedServerId(server.id);
    } else {
      onUpdateServers(
        servers.map(s =>
          s.id === server.id
            ? {
                ...s,
                status: 'error',
                errorMessage: result.error,
              }
            : s
        )
      );
    }
  };

  const handleDisconnect = (serverId: string) => {
    onUpdateServers(
      servers.map(s =>
        s.id === serverId ? { ...s, status: 'disconnected', errorMessage: undefined } : s
      )
    );
  };

  const startEdit = (server: McpServerConfig) => {
    setEditingId(server.id);
    setNameInput(server.name);
    setUrlInput(server.url);
    setTransportInput(server.transport);
    setAuthTokenInput(server.authToken || '');
    setIsAdding(true);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Network className="w-6 h-6 text-cyan-400" />
            Model Context Protocol (MCP) Manager
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Connect Vladimir AI to real MCP servers via Streamable HTTP or HTTP+SSE.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingId(null);
            setNameInput('');
            setUrlInput('');
            setAuthTokenInput('');
            setIsAdding(!isAdding);
          }}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-cyan-400 text-black font-bold text-xs hover:bg-cyan-300 transition-all shadow-[0_0_15px_rgba(0,240,255,0.3)] shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add MCP Server</span>
        </button>
      </div>

      {/* Add / Edit Form */}
      {isAdding && (
        <div className="p-6 rounded-2xl bg-[#0b0f19] border border-cyan-500/40 space-y-4 shadow-xl">
          <h3 className="font-bold text-sm text-cyan-300">
            {editingId ? 'Edit MCP Server' : 'Configure New MCP Server'}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-400 block mb-1">Server Name</label>
              <input
                type="text"
                value={nameInput}
                onChange={e => setNameInput(e.target.value)}
                placeholder="e.g. My Laptop MCP Server"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Transport</label>
              <select
                value={transportInput}
                onChange={e => setTransportInput(e.target.value as any)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-cyan-400"
              >
                <option value="streamable-http">Streamable HTTP (JSON-RPC POST - Recommended)</option>
                <option value="http-sse">Legacy HTTP + SSE (Server-Sent Events)</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="text-xs text-slate-400 block mb-1">
                Server URL (Local Wi-Fi IP or Remote Gateway)
              </label>
              <input
                type="text"
                value={urlInput}
                onChange={e => setUrlInput(e.target.value)}
                placeholder="http://192.168.1.100:8000 or https://mcp.domain.com"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono outline-none focus:border-cyan-400"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                💡 <strong>Important:</strong> <code>127.0.0.1</code> refers to the Android device. Use your computer's local Wi-Fi IP (<code>192.168.x.x</code>) when hosting on PC/Mac.
              </p>
            </div>

            <div className="md:col-span-2">
              <label className="text-xs text-slate-400 block mb-1">
                Bearer Auth Token (Optional)
              </label>
              <input
                type="password"
                value={authTokenInput}
                onChange={e => setAuthTokenInput(e.target.value)}
                placeholder="Optional API token for protected endpoints"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-2">
            <button
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveServer}
              className="px-5 py-2 rounded-xl bg-cyan-400 text-black font-bold text-xs hover:bg-cyan-300 shadow-md"
            >
              Save Server
            </button>
          </div>
        </div>
      )}

      {/* Server Cards List */}
      <div className="space-y-4">
        {servers.map(server => {
          const isConnected = server.status === 'connected';
          const isConnecting = server.status === 'connecting' || connectingId === server.id;
          const isError = server.status === 'error';
          const isExpanded = expandedServerId === server.id;
          const tools = discoveredToolsMap[server.id] || [];

          return (
            <div
              key={server.id}
              className={`p-5 rounded-2xl bg-[#090d16] border transition-all ${
                isConnected
                  ? 'border-cyan-500/40 shadow-[0_0_20px_rgba(0,240,255,0.08)]'
                  : isError
                  ? 'border-rose-500/40'
                  : 'border-slate-800'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2.5">
                    <h3 className="font-bold text-white text-base">{server.name}</h3>
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                        isConnected
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : isConnecting
                          ? 'bg-amber-500/10 text-amber-300 border-amber-500/30 animate-pulse'
                          : isError
                          ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      {isConnecting ? 'CONNECTING...' : server.status.toUpperCase()}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded">
                      {server.transport}
                    </span>
                  </div>

                  <p className="font-mono text-xs text-slate-400 break-all">{server.url}</p>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    onClick={() => onOpenDiagnosticsForUrl(server.url)}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-purple-300 text-xs flex items-center gap-1.5 transition-all"
                    title="Run Network Diagnostic on this server"
                  >
                    <Activity className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Diagnostic</span>
                  </button>

                  {isConnected ? (
                    <button
                      onClick={() => handleDisconnect(server.id)}
                      className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all"
                    >
                      <Unplug className="w-3.5 h-3.5" />
                      <span>Disconnect</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleConnect(server)}
                      disabled={isConnecting}
                      className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30 text-xs font-bold transition-all disabled:opacity-50"
                    >
                      <Plug className="w-3.5 h-3.5" />
                      <span>{isConnecting ? 'Connecting...' : 'Connect & Discover'}</span>
                    </button>
                  )}

                  <button
                    onClick={() => startEdit(server)}
                    className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDeleteServer(server.id)}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {server.errorMessage && (
                <div className="mt-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                  <div>
                    <span className="font-bold">Connection Failed: </span>
                    {server.errorMessage}
                    <div className="mt-1">
                      <button
                        onClick={() => onOpenDiagnosticsForUrl(server.url)}
                        className="text-cyan-400 underline hover:text-cyan-300"
                      >
                        Run 10-Point Diagnostic to troubleshoot →
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Connected Details & Tool List Toggle */}
              {isConnected && (
                <div className="mt-4 pt-3 border-t border-slate-800/80">
                  <button
                    onClick={() => setExpandedServerId(isExpanded ? null : server.id)}
                    className="flex items-center justify-between w-full text-xs font-semibold text-cyan-400 hover:text-cyan-300"
                  >
                    <span className="flex items-center gap-1.5">
                      <Wrench className="w-3.5 h-3.5" />
                      Discovered Tools ({tools.length > 0 ? tools.length : server.discoveredToolsCount || 0})
                    </span>
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>

                  {isExpanded && (
                    <div className="mt-3 space-y-2">
                      {tools.length === 0 ? (
                        <p className="text-xs text-slate-400 italic">
                          Handshake completed with protocol version {server.protocolVersion}. No tools advertised by server.
                        </p>
                      ) : (
                        tools.map((t, idx) => (
                          <div
                            key={idx}
                            className="p-3 rounded-xl bg-slate-900 border border-slate-800 font-mono text-xs space-y-1"
                          >
                            <div className="text-cyan-300 font-bold">{t.name}</div>
                            <div className="text-slate-400 font-sans text-xs">{t.description}</div>
                            <pre className="text-[11px] text-slate-500 overflow-x-auto">
                              Schema: {JSON.stringify(t.inputSchema.properties || {}, null, 2)}
                            </pre>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
