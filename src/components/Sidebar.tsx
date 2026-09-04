import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  MessageSquare,
  Trash2,
  Download,
  Search,
  Pin,
  PinOff,
  Sparkles,
  Bot,
  Layers,
  ChevronLeft,
  ChevronRight,
  FileJson,
  FileText,
} from 'lucide-react';
import { ChatSession } from '../types';

interface SidebarProps {
  sessions: ChatSession[];
  currentSessionId: string;
  onSelectSession: (id: string) => void;
  onNewSession: () => void;
  onDeleteSession: (id: string) => void;
  onTogglePin: (id: string) => void;
  isOpen: boolean;
  onToggleOpen: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  sessions,
  currentSessionId,
  onSelectSession,
  onNewSession,
  onDeleteSession,
  onTogglePin,
  isOpen,
  onToggleOpen,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSessions = sessions.filter((s) =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pinnedSessions = filteredSessions.filter((s) => s.isPinned);
  const regularSessions = filteredSessions.filter((s) => !s.isPinned);

  const exportChatAsMarkdown = (session: ChatSession) => {
    const md = `# ${session.title}\n\n*Yaratilgan sana: ${new Date(
      session.createdAt
    ).toLocaleString()}*\n*Model: ${session.model}*\n\n---\n\n` +
      session.messages
        .map(
          (m) =>
            `### ${m.role === 'user' ? '👤 Foydalanuvchi' : '🤖 Nova AI'}\n\n${
              m.content
            }\n`
        )
        .join('\n---\n\n');

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${session.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportChatAsJSON = (session: ChatSession) => {
    const blob = new Blob([JSON.stringify(session, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${session.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onToggleOpen}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-40 w-72 md:w-80 bg-slate-950/90 backdrop-blur-2xl border-r border-slate-800/80 flex flex-col transition-all duration-300 transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0 lg:w-0 lg:opacity-0 lg:pointer-events-none'
        }`}
      >
        {/* Logo & Header */}
        <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-purple-600 to-pink-500 p-0.5 shadow-lg shadow-cyan-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
            <div>
              <h1 className="font-extrabold text-base tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-purple-300 to-pink-400">
                NOVA STUDIO
              </h1>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">
                Next-Gen AI System
              </p>
            </div>
          </div>

          <button
            onClick={onToggleOpen}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 lg:hidden"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>

        {/* New Chat Button */}
        <div className="p-3">
          <button
            onClick={onNewSession}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 text-white font-medium text-sm shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/35 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Yangi Suhbat Boshlash</span>
          </button>
        </div>

        {/* Search Chats */}
        <div className="px-3 pb-2">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Suhbatlarni qidirish..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
            />
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-4">
          {/* Pinned Chats */}
          {pinnedSessions.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 px-2 mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-purple-400">
                <Pin className="w-3 h-3" />
                <span>Biriktirilgan Suhbatlar</span>
              </div>
              <div className="space-y-1">
                {pinnedSessions.map((session) => (
                  <SessionItem
                    key={session.id}
                    session={session}
                    isActive={session.id === currentSessionId}
                    onSelect={() => onSelectSession(session.id)}
                    onDelete={() => onDeleteSession(session.id)}
                    onTogglePin={() => onTogglePin(session.id)}
                    onExportMd={() => exportChatAsMarkdown(session)}
                    onExportJson={() => exportChatAsJSON(session)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Regular Chats */}
          <div>
            <div className="flex items-center gap-1.5 px-2 mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              <MessageSquare className="w-3 h-3" />
              <span>Barcha Suhbatlar</span>
            </div>
            <div className="space-y-1">
              {regularSessions.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-500">
                  {searchQuery ? 'Topilmadi' : 'Suhbatlar mavjud emas'}
                </div>
              ) : (
                regularSessions.map((session) => (
                  <SessionItem
                    key={session.id}
                    session={session}
                    isActive={session.id === currentSessionId}
                    onSelect={() => onSelectSession(session.id)}
                    onDelete={() => onDeleteSession(session.id)}
                    onTogglePin={() => onTogglePin(session.id)}
                    onExportMd={() => exportChatAsMarkdown(session)}
                    onExportJson={() => exportChatAsJSON(session)}
                  />
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer Metrics Card */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/40">
          <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/60 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-slate-300 font-medium">AI Engine Tayyor</span>
            </div>
            <span className="font-mono text-[10px] text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40">
              v2.5 Pro
            </span>
          </div>
        </div>
      </aside>
    </>
  );
};

interface SessionItemProps {
  session: ChatSession;
  isActive: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onTogglePin: () => void;
  onExportMd: () => void;
  onExportJson: () => void;
}

const SessionItem: React.FC<SessionItemProps> = ({
  session,
  isActive,
  onSelect,
  onDelete,
  onTogglePin,
  onExportMd,
  onExportJson,
}) => {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div
      onClick={onSelect}
      className={`group relative flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-all ${
        isActive
          ? 'bg-cyan-950/50 border border-cyan-500/40 text-cyan-200 shadow-md shadow-cyan-950/30'
          : 'hover:bg-slate-900/80 text-slate-300 border border-transparent'
      }`}
    >
      <div className="flex items-center gap-2.5 min-w-0 pr-2">
        <MessageSquare
          className={`w-4 h-4 flex-shrink-0 ${
            isActive ? 'text-cyan-400' : 'text-slate-500 group-hover:text-slate-400'
          }`}
        />
        <div className="truncate">
          <p className="text-xs font-medium truncate">{session.title || 'Yangi Suhbat'}</p>
          <p className="text-[10px] text-slate-500 font-mono">
            {new Date(session.updatedAt).toLocaleDateString([], {
              month: 'short',
              day: 'numeric',
            })}
          </p>
        </div>
      </div>

      {/* Action buttons */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <button
          onClick={onTogglePin}
          className="p-1 rounded-lg text-slate-400 hover:text-purple-300 hover:bg-slate-800"
          title={session.isPinned ? "Biriktirishni bekor qilish" : "Biriktirish"}
        >
          {session.isPinned ? <PinOff className="w-3.5 h-3.5" /> : <Pin className="w-3.5 h-3.5" />}
        </button>

        <button
          onClick={onExportMd}
          className="p-1 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-slate-800"
          title="Markdown export"
        >
          <FileText className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={onDelete}
          className="p-1 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800"
          title="O'chirish"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
