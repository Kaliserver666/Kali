import React, { useState } from 'react';
import {
  Wrench,
  FileText,
  Terminal,
  Globe,
  Brain,
  Smartphone,
  Shield,
  Search,
  CheckCircle2,
  AlertTriangle,
  Play,
} from 'lucide-react';
import { ToolDefinition } from '../types';
import { ToolsRegistryService } from '../services/toolsRegistry';

interface ToolsScreenProps {
  onTestTool?: (toolName: string) => void;
}

export const ToolsScreen: React.FC<ToolsScreenProps> = () => {
  const [tools, setTools] = useState<ToolDefinition[]>(ToolsRegistryService.getBuiltinTools());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [testResult, setTestResult] = useState<{ tool: string; output: string } | null>(null);

  const categories = [
    { id: 'all', label: 'All Tools', icon: Wrench },
    { id: 'file', label: 'File & SAF', icon: FileText },
    { id: 'execution', label: 'Sandbox Execution', icon: Terminal },
    { id: 'web', label: 'Web & Search', icon: Globe },
    { id: 'android', label: 'Android Intents', icon: Smartphone },
    { id: 'memory', label: 'Memory & Planning', icon: Brain },
    { id: 'utility', label: 'Utilities', icon: Wrench },
  ];

  const filteredTools = tools.filter(t => {
    const matchesSearch =
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'all' || t.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const toggleTool = (name: string) => {
    setTools(prev =>
      prev.map(t => (t.name === name ? { ...t, enabled: !t.enabled } : t))
    );
  };

  const runQuickTest = async (tool: ToolDefinition) => {
    let mockArgs: Record<string, any> = {};
    if (tool.name === 'get_time') mockArgs = {};
    else if (tool.name === 'calculate') mockArgs = { expression: 'Math.sqrt(256) * 10' };
    else if (tool.name === 'list_files') mockArgs = { directory: '/storage/emulated/0' };
    else if (tool.name === 'read_file') mockArgs = { path: '/storage/emulated/0/Documents/welcome_guide.md' };
    else if (tool.name === 'sandbox_run') mockArgs = { code: '[1, 2, 3, 4].map(x => x * 10)' };
    else if (tool.name === 'web_search') mockArgs = { query: 'Model Context Protocol 2024-11-05' };
    else if (tool.name === 'open_android_app') mockArgs = { appName: 'youtube' };
    else if (tool.name === 'memory_search') mockArgs = { query: 'preference' };

    const res = await ToolsRegistryService.executeTool(tool.name, mockArgs, {});
    setTestResult({ tool: tool.name, output: res.result });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Wrench className="w-6 h-6 text-cyan-400" />
          Autonomous Tool Registry
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Inspect and toggle Vladimir AI’s built-in Android tools, file operations, sandboxes, and web capabilities.
        </p>
      </div>

      {/* Search & Categories */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tools by name, description, category..."
            className="w-full bg-[#0b0f19] border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-100 outline-none focus:border-cyan-400"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {categories.map((c) => {
            const Icon = c.icon;
            const isSel = selectedCategory === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c.id)}
                className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isSel
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{c.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Test Output Card */}
      {testResult && (
        <div className="p-4 rounded-2xl bg-slate-900 border border-cyan-500/40 space-y-2 shadow-lg">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-cyan-300 flex items-center gap-1.5">
              <Play className="w-3.5 h-3.5 text-cyan-400" />
              Verified Execution Output: {testResult.tool}()
            </span>
            <button
              onClick={() => setTestResult(null)}
              className="text-slate-400 hover:text-white"
            >
              Dismiss
            </button>
          </div>
          <pre className="p-3 rounded-xl bg-black/60 font-mono text-xs text-emerald-400 max-h-48 overflow-y-auto whitespace-pre-wrap">
            {testResult.output}
          </pre>
        </div>
      )}

      {/* Tool Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTools.map((tool) => (
          <div
            key={tool.name}
            className={`p-5 rounded-2xl bg-[#090d16] border transition-all ${
              tool.enabled ? 'border-slate-800 hover:border-slate-700' : 'border-slate-800/40 opacity-50'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="font-mono font-bold text-sm text-cyan-300">
                    {tool.name}()
                  </h3>
                  {tool.requiresApproval && (
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                      <Shield className="w-2.5 h-2.5" />
                      Approval Required
                    </span>
                  )}
                </div>
                <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider">
                  Category: {tool.category}
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => runQuickTest(tool)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs font-semibold"
                  title="Run test execution"
                >
                  <Play className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => toggleTool(tool.name)}
                  className={`w-10 h-6 flex items-center rounded-full p-1 transition-colors ${
                    tool.enabled ? 'bg-cyan-500 justify-end' : 'bg-slate-800 justify-start'
                  }`}
                >
                  <div className="w-4 h-4 rounded-full bg-black shadow" />
                </button>
              </div>
            </div>

            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              {tool.description}
            </p>

            {/* Input Schema Preview */}
            <div className="mt-3 pt-2 border-t border-slate-800/60">
              <span className="text-[10px] font-mono text-slate-500 uppercase block mb-1">
                JSON Parameters:
              </span>
              <pre className="font-mono text-[11px] text-slate-400 bg-slate-900/60 p-2 rounded-lg overflow-x-auto">
                {JSON.stringify(tool.parameters.properties, null, 2)}
              </pre>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
