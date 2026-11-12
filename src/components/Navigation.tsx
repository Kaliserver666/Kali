import React from 'react';
import {
  LayoutDashboard,
  MessageSquare,
  Network,
  Activity,
  Wrench,
  Brain,
  FolderArchive,
  Settings,
} from 'lucide-react';

export type ActiveScreen =
  | 'home'
  | 'chat'
  | 'mcp'
  | 'diagnostics'
  | 'tools'
  | 'memory'
  | 'android'
  | 'settings';

interface NavigationProps {
  currentScreen: ActiveScreen;
  onSelectScreen: (screen: ActiveScreen) => void;
  unreadCount?: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentScreen,
  onSelectScreen,
}) => {
  const navItems = [
    { id: 'home' as ActiveScreen, label: 'Home', icon: LayoutDashboard },
    { id: 'chat' as ActiveScreen, label: 'Chat Agent', icon: MessageSquare },
    { id: 'mcp' as ActiveScreen, label: 'MCP Manager', icon: Network },
    { id: 'diagnostics' as ActiveScreen, label: 'Diagnostics', icon: Activity, highlight: true },
    { id: 'tools' as ActiveScreen, label: 'Tool Registry', icon: Wrench },
    { id: 'memory' as ActiveScreen, label: 'Memory & Tasks', icon: Brain },
    { id: 'android' as ActiveScreen, label: 'Android Studio / ZIP', icon: FolderArchive, badge: 'APK/SRC' },
    { id: 'settings' as ActiveScreen, label: 'Settings', icon: Settings },
  ];

  return (
    <nav className="bg-[#080c14] border-b border-slate-800/80 px-2 sm:px-4 flex items-center overflow-x-auto scrollbar-none py-2 gap-1 sticky top-16 z-20">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = currentScreen === item.id;

        return (
          <button
            key={item.id}
            onClick={() => onSelectScreen(item.id)}
            className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap shrink-0 ${
              isActive
                ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_15px_rgba(0,240,255,0.15)] font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
            }`}
          >
            <Icon
              className={`w-4 h-4 ${
                isActive ? 'text-cyan-400' : item.highlight ? 'text-amber-400' : 'text-slate-400'
              }`}
            />
            <span>{item.label}</span>
            {item.badge && (
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 font-mono font-bold">
                {item.badge}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
};
