import React, { useState, useEffect } from 'react';
import {
  Settings,
  KeyRound,
  Cpu,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Trash2,
  RefreshCw,
  Search,
  Shield,
  Volume2,
  Lock,
} from 'lucide-react';
import { AppSettings, OpenRouterModel } from '../types';
import { OpenRouterService } from '../services/openrouter';
import { StorageService } from '../services/storage';

interface SettingsScreenProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  settings,
  onUpdateSettings,
}) => {
  const [apiKeyInput, setApiKeyInput] = useState(settings.openRouterApiKey);
  const [showKey, setShowKey] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    valid: boolean;
    message: string;
  } | null>(null);

  // Dynamic models catalog
  const [models, setModels] = useState<OpenRouterModel[]>(OpenRouterService.getFallbackModels());
  const [modelSearch, setModelSearch] = useState('');
  const [isLoadingModels, setIsLoadingModels] = useState(false);

  useEffect(() => {
    loadModels();
  }, [settings.openRouterApiKey]);

  const loadModels = async () => {
    setIsLoadingModels(true);
    try {
      const liveModels = await OpenRouterService.fetchModels(settings.openRouterApiKey);
      if (liveModels.length > 0) {
        setModels(liveModels);
      }
    } catch (e) {
      console.warn('Could not fetch models:', e);
    } finally {
      setIsLoadingModels(false);
    }
  };

  const handleValidateAndSaveKey = async () => {
    setIsValidating(true);
    setValidationResult(null);

    const res = await OpenRouterService.validateApiKey(apiKeyInput);
    setIsValidating(false);
    setValidationResult(res);

    if (res.valid) {
      onUpdateSettings({ openRouterApiKey: apiKeyInput.trim() });
    }
  };

  const handleClearKey = () => {
    setApiKeyInput('');
    onUpdateSettings({ openRouterApiKey: '' });
    setValidationResult(null);
  };

  const filteredModels = models.filter(
    (m) =>
      m.name.toLowerCase().includes(modelSearch.toLowerCase()) ||
      m.id.toLowerCase().includes(modelSearch.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-8">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Settings className="w-6 h-6 text-cyan-400" />
          Settings & Agent Configuration
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Configure your OpenRouter API credentials, select frontier reasoning models, and manage Android 17 runtime security.
        </p>
      </div>

      {/* 1. OpenRouter API Key Panel */}
      <div className="p-6 rounded-2xl bg-[#0b0f19] border border-cyan-500/30 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <KeyRound className="w-5 h-5 text-cyan-400" />
            <h3 className="font-bold text-sm text-white">OpenRouter API Key</h3>
          </div>
          {settings.openRouterApiKey && (
            <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/30">
              Active: {StorageService.maskApiKey(settings.openRouterApiKey)}
            </span>
          )}
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          OpenRouter routes requests across Claude 3.7, GPT-4o, Gemini 2.5 Flash, and DeepSeek. Enter your key to activate agent chat and tool calls.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type={showKey ? 'text' : 'password'}
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              placeholder="sk-or-v1-..."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 pr-10 text-xs font-mono text-slate-100 outline-none focus:border-cyan-400"
            />
            <button
              onClick={() => setShowKey(!showKey)}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
            >
              {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleValidateAndSaveKey}
              disabled={isValidating || !apiKeyInput.trim()}
              className="flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl bg-cyan-400 text-black font-bold text-xs hover:bg-cyan-300 disabled:opacity-40 transition-all shadow-md shrink-0"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isValidating ? 'Validating...' : 'Test & Save'}</span>
            </button>

            {settings.openRouterApiKey && (
              <button
                onClick={handleClearKey}
                className="p-2.5 rounded-xl bg-slate-900 text-slate-400 hover:text-rose-400 border border-slate-800 transition-all"
                title="Remove saved API key"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Validation Result Box */}
        {validationResult && (
          <div
            className={`p-3 rounded-xl border text-xs flex items-center space-x-2.5 ${
              validationResult.valid
                ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                : 'bg-rose-950/30 border-rose-500/40 text-rose-300'
            }`}
          >
            {validationResult.valid ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            )}
            <span>{validationResult.message}</span>
          </div>
        )}

        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2">
          <Lock className="w-4 h-4 shrink-0 mt-0.5 text-cyan-400" />
          <span>
            <strong>Security Notice:</strong> In Vladimir AI’s Android project, API keys are encrypted using Android Keystore AES-256 (<code>SecurityManager.kt</code>). Keys are never committed to code or logged.
          </span>
        </div>
      </div>

      {/* 2. Model Selection & Dynamic Catalog */}
      <div className="p-6 rounded-2xl bg-[#0b0f19] border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <Cpu className="w-5 h-5 text-cyan-400" />
            <h3 className="font-bold text-sm text-white">Select AI Model</h3>
          </div>

          <button
            onClick={loadModels}
            disabled={isLoadingModels}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs text-slate-300 border border-slate-700 transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingModels ? 'animate-spin' : ''}`} />
            <span>Refresh OpenRouter Models</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={modelSearch}
            onChange={(e) => setModelSearch(e.target.value)}
            placeholder="Search models (e.g. gemini, claude, gpt-4o, llama)..."
            className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 outline-none focus:border-cyan-400"
          />
        </div>

        {/* Models Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-80 overflow-y-auto scrollbar-thin">
          {filteredModels.map((m) => {
            const isSelected = settings.selectedModel === m.id;
            return (
              <div
                key={m.id}
                onClick={() => onUpdateSettings({ selectedModel: m.id })}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-cyan-500/10 border-cyan-500/50 shadow-[0_0_15px_rgba(0,240,255,0.15)]'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs text-slate-100">{m.name}</h4>
                  {isSelected && (
                    <span className="text-[10px] font-mono font-bold text-cyan-400 px-1.5 py-0.5 rounded bg-cyan-500/20">
                      ACTIVE
                    </span>
                  )}
                </div>
                <div className="font-mono text-[11px] text-cyan-400 mt-0.5 truncate">
                  {m.id}
                </div>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                  {m.description}
                </p>
                <div className="mt-2 pt-1 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                  <span>Context: {(m.context_length / 1024).toFixed(0)}k</span>
                  <span>{m.supports_tools ? '⚡ Tools Supported' : 'No tools'}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Voice & General Settings */}
      <div className="p-6 rounded-2xl bg-[#0b0f19] border border-slate-800 space-y-4">
        <div className="flex items-center space-x-2">
          <Volume2 className="w-5 h-5 text-cyan-400" />
          <h3 className="font-bold text-sm text-white">Voice & Agent Behavior</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="text-slate-400 block mb-1">Voice Recognition Language</label>
            <select
              value={settings.voiceLanguage}
              onChange={(e) => onUpdateSettings({ voiceLanguage: e.target.value as any })}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 outline-none"
            >
              <option value="en-US">English (United States)</option>
              <option value="ar-SA">Arabic (العربية)</option>
              <option value="ar-MA">Moroccan Darija (الدارجة المغربية)</option>
            </select>
          </div>

          <div>
            <label className="text-slate-400 block mb-1">Target Android Platform</label>
            <select
              value={settings.androidApiTarget}
              onChange={(e) => onUpdateSettings({ androidApiTarget: parseInt(e.target.value, 10) })}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 outline-none"
            >
              <option value={37}>Android 17 (API 37 - Mandatory Local Network Security)</option>
              <option value={36}>Android 16 (API 36)</option>
              <option value={35}>Android 15 (API 35)</option>
            </select>
          </div>
        </div>

        <div className="pt-2 flex items-center justify-between">
          <span className="text-xs text-slate-300">
            Require confirmation before executing file delete/mutate actions
          </span>
          <button
            onClick={() =>
              onUpdateSettings({
                requireApprovalForSensitiveTools: !settings.requireApprovalForSensitiveTools,
              })
            }
            className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
              settings.requireApprovalForSensitiveTools ? 'bg-cyan-400 justify-end' : 'bg-slate-800 justify-start'
            }`}
          >
            <div className="w-4 h-4 rounded-full bg-black shadow" />
          </button>
        </div>
      </div>
    </div>
  );
};
