import React, { useState } from 'react';
import {
  Brain,
  Plus,
  Trash2,
  Edit2,
  Search,
  CheckCircle2,
  Clock,
  Play,
  RotateCcw,
  StopCircle,
  Tag,
} from 'lucide-react';
import { MemoryItem, AgentTask } from '../types';
import { StorageService } from '../services/storage';

export const MemoryScreen: React.FC = () => {
  const [memories, setMemories] = useState<MemoryItem[]>(StorageService.getMemories());
  const [tasks, setTasks] = useState<AgentTask[]>(StorageService.getTasks());
  const [activeTab, setActiveTab] = useState<'memories' | 'tasks'>('memories');
  const [searchQuery, setSearchQuery] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState<MemoryItem['category']>('preference');
  const [isAdding, setIsAdding] = useState(false);

  const handleAddMemory = () => {
    if (!newContent.trim()) return;
    const item: MemoryItem = {
      id: `mem-${Date.now()}`,
      category: newCategory,
      content: newContent.trim(),
      timestamp: Date.now(),
    };
    const updated = [item, ...memories];
    setMemories(updated);
    StorageService.saveMemories(updated);
    setNewContent('');
    setIsAdding(false);
  };

  const handleDeleteMemory = (id: string) => {
    const updated = memories.filter(m => m.id !== id);
    setMemories(updated);
    StorageService.saveMemories(updated);
  };

  const handleClearAllMemories = () => {
    if (window.confirm('Are you sure you want to clear all stored agent memories?')) {
      setMemories([]);
      StorageService.saveMemories([]);
    }
  };

  const filteredMemories = memories.filter(
    m =>
      m.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      {/* Tab Switcher */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveTab('memories')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'memories'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Brain className="w-4 h-4" />
            <span>Persistent Memory ({memories.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('tasks')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'tasks'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Task Planner ({tasks.length})</span>
          </button>
        </div>

        {activeTab === 'memories' && (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsAdding(!isAdding)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-cyan-400 text-black font-bold text-xs hover:bg-cyan-300 transition-all shadow-md"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Memory</span>
            </button>
            {memories.length > 0 && (
              <button
                onClick={handleClearAllMemories}
                className="text-xs text-rose-400 hover:text-rose-300 px-2.5 py-1.5 rounded-xl hover:bg-rose-500/10 transition-all"
              >
                Clear All
              </button>
            )}
          </div>
        )}
      </div>

      {/* MEMORIES VIEW */}
      {activeTab === 'memories' && (
        <div className="space-y-4">
          {/* Add form */}
          {isAdding && (
            <div className="p-5 rounded-2xl bg-[#0b0f19] border border-cyan-500/40 space-y-3 shadow-lg">
              <h3 className="text-xs font-bold text-cyan-300 uppercase tracking-wider">
                Store New Memory Item
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="sm:col-span-1">
                  <label className="text-[11px] text-slate-400 block mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none"
                  >
                    <option value="preference">Preference</option>
                    <option value="fact">Fact</option>
                    <option value="instruction">Instruction</option>
                    <option value="general">General</option>
                  </select>
                </div>
                <div className="sm:col-span-3">
                  <label className="text-[11px] text-slate-400 block mb-1">Memory Content</label>
                  <input
                    type="text"
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    placeholder="e.g. Always confirm before deleting /storage/emulated/0 files"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-cyan-400"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button
                  onClick={() => setIsAdding(false)}
                  className="px-3 py-1.5 text-xs text-slate-400"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddMemory}
                  className="px-4 py-1.5 bg-cyan-400 text-black font-bold text-xs rounded-xl shadow"
                >
                  Save Fact
                </button>
              </div>
            </div>
          )}

          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search memories by keyword..."
              className="w-full bg-[#0b0f19] border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-100 outline-none focus:border-cyan-400"
            />
          </div>

          {/* Memories List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredMemories.map((mem) => (
              <div
                key={mem.id}
                className="p-4 rounded-2xl bg-[#090d16] border border-slate-800 hover:border-slate-700 transition-all flex items-start justify-between gap-3"
              >
                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                    {mem.category}
                  </span>
                  <p className="text-xs text-slate-200 leading-relaxed font-sans">
                    {mem.content}
                  </p>
                  <span className="text-[10px] text-slate-500 block">
                    {new Date(mem.timestamp).toLocaleString()}
                  </span>
                </div>

                <button
                  onClick={() => handleDeleteMemory(mem.id)}
                  className="text-slate-500 hover:text-rose-400 p-1"
                  title="Delete memory"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TASKS VIEW */}
      {activeTab === 'tasks' && (
        <div className="space-y-4">
          {tasks.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-[#090d16] border border-slate-800 space-y-2">
              <Clock className="w-8 h-8 text-slate-500 mx-auto" />
              <h3 className="text-sm font-semibold text-slate-300">No Multi-step Plans Recorded</h3>
              <p className="text-xs text-slate-500">
                Instruct Vladimir AI to "create a plan for..." and execution steps will appear here in real time.
              </p>
            </div>
          ) : (
            tasks.map((task) => (
              <div
                key={task.id}
                className="p-5 rounded-2xl bg-[#090d16] border border-purple-500/30 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-white text-base">{task.title}</h3>
                    <p className="text-xs text-slate-400">{task.userInstruction}</p>
                  </div>
                  <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/30 uppercase">
                    {task.status}
                  </span>
                </div>

                {/* Steps */}
                <div className="space-y-2">
                  {task.steps.map((st, i) => (
                    <div
                      key={st.id}
                      className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center space-x-2.5">
                        <span className="w-5 h-5 rounded-full bg-slate-800 text-cyan-400 font-mono flex items-center justify-center text-[10px] font-bold">
                          {i + 1}
                        </span>
                        <span className="text-slate-200">{st.description}</span>
                      </div>
                      <span className="text-[11px] font-mono text-slate-400">{st.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
