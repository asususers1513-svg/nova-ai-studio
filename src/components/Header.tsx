import React, { useState } from 'react';
import {
  Menu,
  Sparkles,
  Settings,
  BookOpen,
  Trash2,
  Sun,
  Moon,
  ChevronDown,
  Cpu,
  Zap,
  Flame,
  Brain,
  Atom,
} from 'lucide-react';
import { AppSettings, ModelOption } from '../types';
import { AVAILABLE_MODELS } from '../services/api';

interface HeaderProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  onOpenSettings: () => void;
  onOpenPrompts: () => void;
  onOpenMedia?: (mode?: 'image' | 'video') => void;
  onClearChat: () => void;
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  onUpdateSettings,
  onOpenSettings,
  onOpenPrompts,
  onOpenMedia,
  onClearChat,
  onToggleSidebar,
}) => {
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);

  const currentModel =
    AVAILABLE_MODELS.find((m) => m.id === settings.model) || AVAILABLE_MODELS[0];

  const getModelIcon = (icon?: string) => {
    switch (icon) {
      case 'Zap':
        return <Zap className="w-4 h-4 text-amber-400" />;
      case 'Cpu':
        return <Cpu className="w-4 h-4 text-cyan-400" />;
      case 'Brain':
        return <Brain className="w-4 h-4 text-pink-400" />;
      case 'Flame':
        return <Flame className="w-4 h-4 text-orange-400" />;
      case 'Atom':
        return <Atom className="w-4 h-4 text-purple-400" />;
      case 'Sparkles':
      default:
        return <Sparkles className="w-4 h-4 text-cyan-400" />;
    }
  };

  return (
    <header className="sticky top-0 z-20 w-full h-16 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80 px-3 md:px-6 flex items-center justify-between">
      {/* Left items */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 transition-all active:scale-95"
          title="Menyuni ochish/yopish"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Model Selector Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800/90 border border-slate-700/80 transition-all shadow-sm active:scale-98"
          >
            {getModelIcon(currentModel.icon)}
            <span className="font-semibold text-xs md:text-sm text-slate-200">
              {currentModel.name}
            </span>
            <span className="hidden sm:inline-block text-[10px] px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/50 font-mono">
              {currentModel.badge}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {/* Dropdown Menu */}
          {isModelDropdownOpen && (
            <>
              <div
                onClick={() => setIsModelDropdownOpen(false)}
                className="fixed inset-0 z-40"
              />
              <div className="absolute top-full mt-2 left-0 w-72 md:w-80 rounded-2xl bg-slate-900/95 backdrop-blur-2xl border border-slate-700/80 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                  Modelni Tanlang
                </div>
                <div className="space-y-1 mt-1 max-h-72 overflow-y-auto">
                  {AVAILABLE_MODELS.map((model) => (
                    <button
                      key={model.id}
                      onClick={() => {
                        onUpdateSettings({ model: model.id });
                        setIsModelDropdownOpen(false);
                      }}
                      className={`w-full flex items-start gap-2.5 p-2 rounded-xl text-left transition-all ${
                        model.id === settings.model
                          ? 'bg-cyan-950/60 border border-cyan-500/40 text-cyan-200'
                          : 'hover:bg-slate-800/80 text-slate-300'
                      }`}
                    >
                      <div className="mt-0.5">{getModelIcon(model.icon)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-xs md:text-sm text-slate-100">
                            {model.name}
                          </span>
                          <span className="text-[10px] font-mono text-purple-300">
                            {model.contextWindow}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 truncate">
                          {model.description}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Right Action Icons */}
      <div className="flex items-center gap-1.5 md:gap-2">
        {/* Media Studio (Image & Video) */}
        {onOpenMedia && (
          <button
            onClick={() => onOpenMedia('image')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-900/60 to-pink-900/60 hover:from-purple-900 hover:to-pink-900 border border-purple-500/40 text-xs text-purple-200 hover:text-white transition-all active:scale-95 shadow-sm"
            title="AI Rasm va Video Yaratish"
          >
            <Sparkles className="w-3.5 h-3.5 text-pink-400 animate-pulse" />
            <span className="hidden sm:inline font-medium">Rasm & Video</span>
          </button>
        )}

        {/* Prompt Library */}
        <button
          onClick={onOpenPrompts}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-xs text-slate-300 hover:text-cyan-300 transition-all active:scale-95"
          title="Shablonlar Kutubxonasi"
        >
          <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden sm:inline">Shablonlar</span>
        </button>

        {/* Clear Chat */}
        <button
          onClick={onClearChat}
          className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-all active:scale-95"
          title="Suhbatni tozalash"
        >
          <Trash2 className="w-4 h-4" />
        </button>

        {/* Theme Toggle */}
        <button
          onClick={() =>
            onUpdateSettings({
              theme: settings.theme === 'dark' ? 'light' : 'dark',
            })
          }
          className="p-2 rounded-xl text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition-all active:scale-95"
          title="Mavzuni o'zgartirish"
        >
          {settings.theme === 'dark' ? (
            <Sun className="w-4 h-4" />
          ) : (
            <Moon className="w-4 h-4" />
          )}
        </button>

        {/* Settings Modal Trigger */}
        <button
          onClick={onOpenSettings}
          className="p-2 rounded-xl text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition-all active:scale-95"
          title="Sozlamalar va API Kalit"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
