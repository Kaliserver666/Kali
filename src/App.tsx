import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { Navigation, ActiveScreen } from './components/Navigation';
import { HomeScreen } from './components/HomeScreen';
import { ChatScreen } from './components/ChatScreen';
import { McpScreen } from './components/McpScreen';
import { DiagnosticsScreen } from './components/DiagnosticsScreen';
import { ToolsScreen } from './components/ToolsScreen';
import { MemoryScreen } from './components/MemoryScreen';
import { AndroidProjectScreen } from './components/AndroidProjectScreen';
import { SettingsScreen } from './components/SettingsScreen';
import { ApprovalModal } from './components/ApprovalModal';

import { AppSettings, ChatMessage, McpServerConfig, AgentTask } from './types';
import { StorageService } from './services/storage';
import { AgentEngine } from './services/agentEngine';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ActiveScreen>('home');
  const [settings, setSettings] = useState<AppSettings>(StorageService.getSettings());
  const [mcpServers, setMcpServers] = useState<McpServerConfig[]>(StorageService.getMcpServers());
  const [messages, setMessages] = useState<ChatMessage[]>(StorageService.getMessages());
  const [tasks, setTasks] = useState<AgentTask[]>(StorageService.getTasks());
  const [diagnosticsUrl, setDiagnosticsUrl] = useState<string>('http://192.168.1.100:8000');

  // Approval modal state
  const [approvalModal, setApprovalModal] = useState<{
    isOpen: boolean;
    toolName: string;
    args: Record<string, any>;
    explanation: string;
    resolver: ((approved: boolean) => void) | null;
  }>({
    isOpen: false,
    toolName: '',
    args: {},
    explanation: '',
    resolver: null,
  });

  const updateSettings = (partial: Partial<AppSettings>) => {
    const updated = { ...settings, ...partial };
    setSettings(updated);
    StorageService.saveSettings(updated);
  };

  const updateMcpServers = (updated: McpServerConfig[]) => {
    setMcpServers(updated);
    StorageService.saveMcpServers(updated);
  };

  const requestApproval = (
    toolName: string,
    args: Record<string, any>,
    explanation: string
  ): Promise<boolean> => {
    return new Promise((resolve) => {
      setApprovalModal({
        isOpen: true,
        toolName,
        args,
        explanation,
        resolver: resolve,
      });
    });
  };

  const handleApprove = () => {
    if (approvalModal.resolver) {
      approvalModal.resolver(true);
    }
    setApprovalModal(prev => ({ ...prev, isOpen: false, resolver: null }));
  };

  const handleReject = () => {
    if (approvalModal.resolver) {
      approvalModal.resolver(false);
    }
    setApprovalModal(prev => ({ ...prev, isOpen: false, resolver: null }));
  };

  const handleSendMessage = async (text: string) => {
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: Date.now(),
      status: 'complete',
    };

    const updatedHistory = [...messages, userMsg];
    setMessages(updatedHistory);
    StorageService.saveMessages(updatedHistory);

    // Placeholder assistant message for streaming
    const assistantId = `asst-${Date.now()}`;
    const initialAssistantMsg: ChatMessage = {
      id: assistantId,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      status: 'streaming',
      modelUsed: settings.selectedModel,
    };

    setMessages([...updatedHistory, initialAssistantMsg]);

    try {
      let accumulatedText = '';
      const { finalContent, historyUpdates } = await AgentEngine.run({
        userInput: text,
        history: updatedHistory,
        settings,
        requestApproval,
        onEvent: (event) => {
          if (event.type === 'chunk') {
            accumulatedText += event.message;
            setMessages(prev =>
              prev.map(m => (m.id === assistantId ? { ...m, content: accumulatedText } : m))
            );
          }
        },
      });

      // Finalize messages with any tool messages generated
      const completedAssistant: ChatMessage = {
        id: assistantId,
        role: 'assistant',
        content: finalContent || accumulatedText || 'Task completed.',
        timestamp: Date.now(),
        status: 'complete',
        modelUsed: settings.selectedModel,
      };

      const finalMessagesList = [...updatedHistory, ...historyUpdates, completedAssistant];
      setMessages(finalMessagesList);
      StorageService.saveMessages(finalMessagesList);

      // Refresh tasks in case new ones were planned
      setTasks(StorageService.getTasks());

      return completedAssistant.content;
    } catch (e: any) {
      const errorMsg = `⚠️ Error during execution: ${e.message}`;
      setMessages(prev =>
        prev.map(m =>
          m.id === assistantId
            ? {
                ...m,
                content: errorMsg,
                status: 'error',
              }
            : m
        )
      );
      return errorMsg;
    }
  };

  const handleClearChat = () => {
    if (window.confirm('Clear all conversation messages?')) {
      const reset = [
        {
          id: `welcome-${Date.now()}`,
          role: 'assistant' as const,
          content: 'Conversation cleared. Vladimir AI is ready for your next instruction.',
          timestamp: Date.now(),
          status: 'complete' as const,
        }
      ];
      setMessages(reset);
      StorageService.saveMessages(reset);
    }
  };

  const openDiagnosticsForUrl = (url: string) => {
    setDiagnosticsUrl(url);
    setCurrentScreen('diagnostics');
  };

  return (
    <div className="min-h-screen bg-[#06080d] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Header */}
      <Header
        settings={settings}
        mcpServers={mcpServers}
        onOpenSettings={() => setCurrentScreen('settings')}
        onOpenDiagnostics={() => setCurrentScreen('diagnostics')}
      />

      {/* Cyberpunk Navigation */}
      <Navigation
        currentScreen={currentScreen}
        onSelectScreen={(screen) => setCurrentScreen(screen)}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 overflow-x-hidden">
        {currentScreen === 'home' && (
          <HomeScreen
            settings={settings}
            mcpServers={mcpServers}
            messages={messages}
            tasks={tasks}
            onNavigate={(s) => setCurrentScreen(s)}
            onQuickPrompt={(prompt) => {
              setCurrentScreen('chat');
              handleSendMessage(prompt);
            }}
          />
        )}

        {currentScreen === 'chat' && (
          <ChatScreen
            messages={messages}
            settings={settings}
            onSendMessage={handleSendMessage}
            onClearChat={handleClearChat}
            onRequestApproval={requestApproval}
            onOpenSettings={() => setCurrentScreen('settings')}
            onUpdateSettings={updateSettings}
          />
        )}

        {currentScreen === 'mcp' && (
          <McpScreen
            servers={mcpServers}
            onUpdateServers={updateMcpServers}
            onOpenDiagnosticsForUrl={openDiagnosticsForUrl}
          />
        )}

        {currentScreen === 'diagnostics' && (
          <DiagnosticsScreen
            initialUrl={diagnosticsUrl}
            settings={settings}
            onUpdateSettings={updateSettings}
          />
        )}

        {currentScreen === 'tools' && <ToolsScreen />}

        {currentScreen === 'memory' && <MemoryScreen />}

        {currentScreen === 'android' && <AndroidProjectScreen />}

        {currentScreen === 'settings' && (
          <SettingsScreen
            settings={settings}
            onUpdateSettings={updateSettings}
          />
        )}
      </main>

      {/* Security Approval Modal */}
      <ApprovalModal
        isOpen={approvalModal.isOpen}
        toolName={approvalModal.toolName}
        args={approvalModal.args}
        explanation={approvalModal.explanation}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </div>
  );
}
