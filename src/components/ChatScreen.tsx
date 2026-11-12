import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  StopCircle,
  Copy,
  Check,
  RotateCcw,
  Paperclip,
  Cpu,
  Wrench,
  Sparkles,
  Bot,
  User,
  AlertTriangle,
  ChevronDown,
} from 'lucide-react';
import { ChatMessage, ToolCall, AppSettings } from '../types';
import { AgentEngine, AgentStepEvent } from '../services/agentEngine';

interface ChatScreenProps {
  messages: ChatMessage[];
  settings: AppSettings;
  onSendMessage: (text: string) => Promise<string | void>;
  onClearChat: () => void;
  onRequestApproval: (toolName: string, args: Record<string, any>, explanation: string) => Promise<boolean>;
  onOpenSettings: () => void;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
}

export const ChatScreen: React.FC<ChatScreenProps> = ({
  messages,
  settings,
  onSendMessage,
  onClearChat,
  onOpenSettings,
  onUpdateSettings,
}) => {
  const [inputText, setInputText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [attachedFileName, setAttachedFileName] = useState<string | null>(null);
  const [attachedFileContent, setAttachedFileContent] = useState<string | null>(null);
  const [currentStepStatus, setCurrentStepStatus] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, currentStepStatus]);

  const handleSend = async () => {
    if ((!inputText.trim() && !attachedFileContent) || isGenerating) return;

    let fullPrompt = inputText.trim();
    if (attachedFileContent && attachedFileName) {
      fullPrompt = `[Attached File: ${attachedFileName}]\n\`\`\`\n${attachedFileContent}\n\`\`\`\n\n${fullPrompt}`;
    }

    setInputText('');
    setAttachedFileName(null);
    setAttachedFileContent(null);
    setIsGenerating(true);
    setCurrentStepStatus('Agent reasoning & planning...');

    try {
      await onSendMessage(fullPrompt);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
      setCurrentStepStatus(null);
    }
  };

  const handleStop = () => {
    AgentEngine.abort();
    setIsGenerating(false);
    setCurrentStepStatus(null);
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setAttachedFileName(file.name);
      setAttachedFileContent(content);
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-5xl mx-auto p-2 sm:p-4">
      {/* Chat Toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#090d16] border border-slate-800 rounded-2xl mb-3 shrink-0">
        <div className="flex items-center space-x-2">
          <Bot className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-semibold text-slate-200">Vladimir Agent Session</span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
            {settings.selectedModel.split('/').pop()}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              const md = messages.map(m => `### ${m.role.toUpperCase()} (${new Date(m.timestamp).toLocaleTimeString()}):\n${m.content}\n`).join('\n---\n\n');
              const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `vladimir-chat-export-${Date.now()}.md`;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
            }}
            className="text-xs text-cyan-400 hover:text-cyan-300 px-2.5 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/20 hover:bg-cyan-500/20 transition-all cursor-pointer"
            title="Export conversation as Markdown"
          >
            Export Markdown
          </button>
          <button
            onClick={onClearChat}
            className="text-xs text-slate-400 hover:text-slate-200 px-2.5 py-1 rounded-lg hover:bg-slate-800/60 transition-all cursor-pointer"
            title="Clear conversation history"
          >
            Clear History
          </button>
        </div>
      </div>

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto space-y-4 px-2 sm:px-4 py-2 scrollbar-thin">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          const isTool = msg.role === 'tool';

          if (isTool) {
            return (
              <div key={msg.id} className="my-2 p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 font-mono text-xs max-w-3xl mx-auto space-y-1.5">
                <div className="flex items-center justify-between text-slate-400 border-b border-slate-800 pb-1">
                  <span className="flex items-center gap-1.5 text-cyan-400 font-bold">
                    <Wrench className="w-3.5 h-3.5" />
                    Verified Tool Output: {msg.name}
                  </span>
                  <span className="text-[10px] text-slate-400">{new Date(msg.timestamp).toLocaleTimeString()}</span>
                </div>
                <pre className="text-emerald-400 overflow-x-auto max-h-48 whitespace-pre-wrap leading-relaxed">
                  {msg.content}
                </pre>
              </div>
            );
          }

          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                  isUser
                    ? 'bg-blue-600 text-white shadow-[0_0_10px_rgba(59,130,246,0.5)]'
                    : 'bg-cyan-950 border border-cyan-500/40 text-cyan-300 shadow-[0_0_12px_rgba(0,240,255,0.25)]'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              {/* Message Bubble */}
              <div
                className={`group relative max-w-[85%] sm:max-w-2xl p-4 rounded-2xl text-sm leading-relaxed ${
                  isUser
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-tr-none'
                    : 'bg-[#0d121e] border border-slate-800 text-slate-200 rounded-tl-none shadow-md'
                }`}
              >
                {/* Tool calls indicator */}
                {msg.tool_calls && msg.tool_calls.length > 0 && (
                  <div className="mb-3 space-y-1.5">
                    {msg.tool_calls.map((tc, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-lg bg-black/40 border border-cyan-500/30 text-xs font-mono text-cyan-300 flex items-center justify-between"
                      >
                        <span className="flex items-center gap-1.5">
                          <Wrench className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                          Executing: {tc.function.name}()
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                          MCP / SAF
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Text Content */}
                <div className="whitespace-pre-wrap font-sans text-sm break-words">
                  {msg.content}
                </div>

                {/* Bottom metadata & Copy */}
                <div className="mt-2 pt-1 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/40">
                  <span className="font-mono text-[10px]">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <button
                    onClick={() => handleCopy(msg.id, msg.content)}
                    className="opacity-0 group-hover:opacity-100 hover:text-cyan-400 transition-opacity p-1"
                    title="Copy response"
                  >
                    {copiedId === msg.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {/* Live Step Status */}
        {isGenerating && currentStepStatus && (
          <div className="flex items-center space-x-3 p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/30 text-xs text-cyan-300 max-w-md mx-auto animate-pulse">
            <Cpu className="w-4 h-4 text-cyan-400 animate-spin" />
            <span>{currentStepStatus}</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Attachment Preview */}
      {attachedFileName && (
        <div className="px-4 py-2 bg-slate-900 border border-cyan-500/30 rounded-xl mb-2 flex items-center justify-between text-xs text-cyan-300 shrink-0">
          <span className="flex items-center gap-2 font-mono truncate">
            <Paperclip className="w-3.5 h-3.5 text-cyan-400" />
            {attachedFileName} ({attachedFileContent?.length || 0} bytes)
          </span>
          <button
            onClick={() => {
              setAttachedFileName(null);
              setAttachedFileContent(null);
            }}
            className="text-slate-400 hover:text-rose-400 ml-2"
          >
            Remove
          </button>
        </div>
      )}

      {/* Quick Suggestion Chips */}
      <div className="flex flex-wrap gap-1.5 px-1 py-1.5 shrink-0">
        {[
          '🤖 Explain how you execute tools',
          '🔍 Run MCP Network Diagnostics',
          '💻 Write a Kotlin Compose snippet',
          '🧮 Calculate 1024 * 512',
          '📱 How to build APK in AIDE Pro',
        ].map((suggestion, idx) => (
          <button
            key={idx}
            onClick={() => {
              setInputText(suggestion);
            }}
            className="text-[11px] px-3 py-1 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-cyan-300 border border-slate-800 hover:border-cyan-500/40 transition-all cursor-pointer"
          >
            {suggestion}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <div className="mt-2 relative bg-[#090d16] border border-slate-800 rounded-2xl p-2.5 focus-within:border-cyan-500/50 shadow-lg shrink-0">
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder={
            settings.openRouterApiKey
              ? "Instruct Vladimir AI (e.g. 'Read /storage/emulated/0/Download/tasks_todo.txt', 'Call MCP tool')..."
              : "Paste OpenRouter API key in Settings or ask questions..."
          }
          rows={2}
          className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-500 resize-none outline-none px-2 py-1"
        />

        <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
          {/* Action buttons */}
          <div className="flex items-center space-x-1">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2 rounded-xl text-slate-400 hover:text-cyan-400 hover:bg-slate-800/60 transition-all"
              title="Attach document or text file"
            >
              <Paperclip className="w-4 h-4" />
            </button>
          </div>

          {/* Send / Stop Buttons */}
          <div>
            {isGenerating ? (
              <button
                onClick={handleStop}
                className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/40 hover:bg-rose-500/30 text-xs font-bold transition-all"
              >
                <StopCircle className="w-4 h-4 animate-pulse" />
                <span>Stop Generation</span>
              </button>
            ) : (
              <button
                onClick={handleSend}
                disabled={!inputText.trim() && !attachedFileContent}
                className="flex items-center space-x-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-black font-bold text-xs hover:scale-[1.02] shadow-[0_0_15px_rgba(0,240,255,0.3)] disabled:opacity-40 disabled:pointer-events-none transition-all"
              >
                <span>Send</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
