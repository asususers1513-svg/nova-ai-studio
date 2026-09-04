import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  Bot,
  Zap,
  Code2,
  Brain,
  Languages,
  Shield,
  Layers,
  MessageSquare,
  ArrowRight,
} from 'lucide-react';
import { Message, ChatSession, AppSettings, Attachment } from './types';
import {
  DEFAULT_SETTINGS,
  sendChatMessageStream,
  AVAILABLE_MODELS,
} from './services/api';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { ChatMessage } from './components/ChatMessage';
import { ChatInput } from './components/ChatInput';
import { SettingsModal } from './components/SettingsModal';
import { PromptLibraryModal } from './components/PromptLibraryModal';
import { MediaGeneratorModal } from './components/MediaGeneratorModal';
import { ParticleBackground } from './components/ParticleBackground';

const STORAGE_KEY_SESSIONS = 'nova_studio_sessions_v4';
const STORAGE_KEY_SETTINGS = 'nova_studio_settings_v4';

export const App: React.FC = () => {
  // Settings state
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_SETTINGS);
    if (saved) {
      try {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      } catch {
        return DEFAULT_SETTINGS;
      }
    }
    return DEFAULT_SETTINGS;
  });

  // Sessions state
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_SESSIONS);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {
        // ignore
      }
    }
    const initialSession: ChatSession = {
      id: 'session_' + Date.now(),
      title: 'Yangi Suhbat',
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      model: DEFAULT_SETTINGS.model,
    };
    return [initialSession];
  });

  const [currentSessionId, setCurrentSessionId] = useState<string>(
    () => sessions[0]?.id || 'session_default'
  );

  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPromptsOpen, setIsPromptsOpen] = useState(false);
  const [isMediaOpen, setIsMediaOpen] = useState(false);
  const [mediaDefaultMode, setMediaDefaultMode] = useState<'image' | 'video'>('image');
  const [speakingText, setSpeakingText] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const chatBottomRef = useRef<HTMLDivElement | null>(null);

  const currentSession =
    sessions.find((s) => s.id === currentSessionId) || sessions[0];

  // Save to LocalStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(sessions));
  }, [sessions]);

  // Apply theme to html root
  useEffect(() => {
    const root = document.documentElement;
    if (settings.theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
  }, [settings.theme]);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentSession?.messages, isLoading]);

  // Text-To-Speech
  const handleSpeak = (text: string) => {
    if (!window.speechSynthesis) return;

    if (speakingText) {
      window.speechSynthesis.cancel();
      setSpeakingText(null);
      return;
    }

    // Clean markdown code blocks from speech
    const cleanText = text.replace(/```[\s\S]*?```/g, 'Kod bloki').slice(0, 1000);
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = settings.voiceLang || 'uz-UZ';
    utterance.pitch = settings.voicePitch || 1.0;
    utterance.rate = settings.voiceRate || 1.0;

    utterance.onend = () => setSpeakingText(null);
    utterance.onerror = () => setSpeakingText(null);

    setSpeakingText(text);
    window.speechSynthesis.speak(utterance);
  };

  // Create new session
  const handleNewSession = () => {
    const newSession: ChatSession = {
      id: 'session_' + Date.now(),
      title: 'Yangi Suhbat',
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      model: settings.model,
    };
    setSessions((prev) => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
  };

  // Delete session
  const handleDeleteSession = (id: string) => {
    const remaining = sessions.filter((s) => s.id !== id);
    if (remaining.length === 0) {
      const fresh: ChatSession = {
        id: 'session_' + Date.now(),
        title: 'Yangi Suhbat',
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        model: settings.model,
      };
      setSessions([fresh]);
      setCurrentSessionId(fresh.id);
    } else {
      setSessions(remaining);
      if (currentSessionId === id) {
        setCurrentSessionId(remaining[0].id);
      }
    }
  };

  // Toggle pin
  const handleTogglePin = (id: string) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isPinned: !s.isPinned } : s))
    );
  };

  // Clear current chat
  const handleClearChat = () => {
    if (window.confirm('Haqiqatan ham ushbu suhbatni tozalashni xohlaysizmi?')) {
      setSessions((prev) =>
        prev.map((s) =>
          s.id === currentSessionId
            ? { ...s, messages: [], updatedAt: Date.now() }
            : s
        )
      );
    }
  };

  // Stop Generation
  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsLoading(false);
  };

  // Send Message handler
  const handleSendMessage = async (
    text: string,
    attachments: Attachment[] = []
  ) => {
    if (!text && attachments.length === 0) return;

    const userMessage: Message = {
      id: 'msg_' + Date.now(),
      role: 'user',
      content: text,
      timestamp: Date.now(),
      attachments,
    };

    const assistantMessageId = 'msg_ai_' + (Date.now() + 1);
    const initialAssistantMessage: Message = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      thinking: '',
      timestamp: Date.now(),
      model: settings.model,
      isStreaming: true,
    };

    const updatedMessages = [...currentSession.messages, userMessage];

    // Generate title from first message
    const newTitle =
      currentSession.messages.length === 0
        ? text.slice(0, 32) || 'Yangi Suhbat'
        : currentSession.title;

    setSessions((prev) =>
      prev.map((s) =>
        s.id === currentSessionId
          ? {
              ...s,
              title: newTitle,
              messages: [...updatedMessages, initialAssistantMessage],
              updatedAt: Date.now(),
            }
          : s
      )
    );

    setIsLoading(true);
    abortControllerRef.current = new AbortController();

    try {
      let accumulatedContent = '';
      let accumulatedThinking = '';

      await sendChatMessageStream({
        messages: updatedMessages,
        settings,
        signal: abortControllerRef.current.signal,
        onThinking: (chunk: string) => {
          accumulatedThinking += chunk;
          setSessions((prev) =>
            prev.map((s) =>
              s.id === currentSessionId
                ? {
                    ...s,
                    messages: s.messages.map((m) =>
                      m.id === assistantMessageId
                        ? { ...m, thinking: accumulatedThinking }
                        : m
                    ),
                  }
                : s
            )
          );
        },
        onChunk: (chunk: string) => {
          accumulatedContent += chunk;
          setSessions((prev) =>
            prev.map((s) =>
              s.id === currentSessionId
                ? {
                    ...s,
                    messages: s.messages.map((m) =>
                      m.id === assistantMessageId
                        ? { ...m, content: accumulatedContent }
                        : m
                    ),
                  }
                : s
            )
          );
        },
      });

      // Mark streaming done
      setSessions((prev) =>
        prev.map((s) =>
          s.id === currentSessionId
            ? {
                ...s,
                messages: s.messages.map((m) =>
                  m.id === assistantMessageId
                    ? { ...m, isStreaming: false }
                    : m
                ),
              }
            : s
        )
      );

      // Trigger confetti on successful output
      if (currentSession.messages.length === 0) {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.85 },
          colors: ['#00d2ff', '#9d4edd', '#ff007f'],
        });
      }
    } catch (err: any) {
      console.error('Error generating AI response:', err);
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const featureCards = [
    {
      title: '💻 Koder & Dasturchi',
      desc: 'TypeScript, React, Python va arxitektura',
      prompt: 'React va Tailwind yordamida zamonaviy Glassmorphism kartochkasi komponentini yozib ber.',
      icon: Code2,
      color: 'from-cyan-500/20 to-blue-500/10 border-cyan-500/30 text-cyan-300',
    },
    {
      title: '🧠 Deep Reasoning (R1)',
      desc: 'Murakkab masalalarni mantiqiy yechish',
      prompt: 'Quyidagi masalani bosqichma-bosqich qadamlar bilan mantiqiy tahlil qilib ber: ',
      icon: Brain,
      color: 'from-purple-500/20 to-pink-500/10 border-purple-500/30 text-purple-300',
    },
    {
      title: '🌐 Universal Tarjimon',
      desc: 'O\'zbek, Ingliz, Rus va turk tillari',
      prompt: 'Quyidagi texnik matnni o\'zbek tiliga tabiiy va ravon qilib tarjima qil: ',
      icon: Languages,
      color: 'from-amber-500/20 to-orange-500/10 border-amber-500/30 text-amber-300',
    },
    {
      title: '⚡ Tezkor G\'oyalar & Post',
      desc: 'Kreativ kontent va marketing rejasi',
      prompt: 'Yangi startap loyihasi uchun 5 ta kreativ marketing g\'oyasini taklif qil.',
      icon: Sparkles,
      color: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-emerald-300',
    },
  ];

  return (
    <div className="relative flex h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 font-sans">
      {/* Background dynamic particle canvas */}
      <ParticleBackground theme={settings.theme} />

      {/* Radial Gradient Glows */}
      <div className="pointer-events-none fixed -top-40 -left-40 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl" />
      <div className="pointer-events-none fixed -bottom-40 -right-40 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl" />

      {/* Sidebar */}
      <Sidebar
        sessions={sessions}
        currentSessionId={currentSessionId}
        onSelectSession={(id) => {
          setCurrentSessionId(id);
          if (window.innerWidth < 1024) setIsSidebarOpen(false);
        }}
        onNewSession={handleNewSession}
        onDeleteSession={handleDeleteSession}
        onTogglePin={handleTogglePin}
        isOpen={isSidebarOpen}
        onToggleOpen={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      {/* Main Chat Workspace */}
      <div
        className={`relative flex-1 flex flex-col h-full overflow-hidden transition-all duration-300 ${
          isSidebarOpen ? 'lg:pl-80' : 'lg:pl-0'
        }`}
      >
        {/* Header */}
        <Header
          settings={settings}
          onUpdateSettings={(newVals) =>
            setSettings((prev) => ({ ...prev, ...newVals }))
          }
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenPrompts={() => setIsPromptsOpen(true)}
          onOpenMedia={(mode = 'image') => {
            setMediaDefaultMode(mode);
            setIsMediaOpen(true);
          }}
          onClearChat={handleClearChat}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          isSidebarOpen={isSidebarOpen}
        />

        {/* Message Viewport */}
        <main className="flex-1 overflow-y-auto px-2 md:px-6 py-4 space-y-4">
          {currentSession?.messages.length === 0 ? (
            /* Welcome / Hero Dashboard */
            <div className="max-w-4xl mx-auto min-h-[70vh] flex flex-col items-center justify-center text-center px-4 py-8">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="relative mb-6"
              >
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-3xl bg-gradient-to-tr from-cyan-500 via-purple-600 to-pink-500 p-1 shadow-2xl shadow-cyan-500/25 animate-float">
                  <div className="w-full h-full bg-slate-950 rounded-[22px] flex items-center justify-center">
                    <Bot className="w-10 h-10 md:w-12 md:h-12 text-cyan-400" />
                  </div>
                </div>
                <div className="absolute -bottom-2 -right-2 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-cyan-500 to-purple-600 text-slate-950 font-black text-[10px] uppercase tracking-wider">
                  Pro AI
                </div>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.5 }}
                className="text-2xl md:text-4xl font-extrabold tracking-tight mb-3"
              >
                Qanday yordam bera olaman,{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400">
                  Nova AI Studio
                </span>
                ?
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="text-sm md:text-base text-slate-400 max-w-xl mb-8 leading-relaxed"
              >
                Murakkab dasturlash, mantiqiy fikrlash (Reasoning), ovozli yordamchi va ko'p tilli tarjima tizimi xizmatingizda.
              </motion.p>

              {/* Starter Feature Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full max-w-3xl text-left">
                {featureCards.map((card, idx) => {
                  const Icon = card.icon;
                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 + idx * 0.1, duration: 0.4 }}
                      onClick={() => handleSendMessage(card.prompt)}
                      className={`p-4 rounded-2xl bg-gradient-to-br ${card.color} backdrop-blur-xl border cursor-pointer hover:scale-[1.02] active:scale-[0.99] transition-all shadow-lg shadow-black/20 group flex flex-col justify-between`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-sm text-slate-100 group-hover:text-cyan-300 transition-colors">
                            {card.title}
                          </span>
                          <Icon className="w-5 h-5 opacity-80" />
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          {card.desc}
                        </p>
                      </div>
                      <div className="mt-3 flex items-center gap-1 text-[11px] font-medium text-cyan-400 group-hover:text-cyan-300">
                        <span>Sinab ko'rish</span>
                        <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Chat Messages List */
            <div className="max-w-4xl mx-auto space-y-4">
              {currentSession.messages.map((msg) => (
                <ChatMessage
                  key={msg.id}
                  message={msg}
                  onSpeak={handleSpeak}
                  isSpeaking={speakingText === msg.content}
                />
              ))}
              <div ref={chatBottomRef} />
            </div>
          )}
        </main>

        {/* Input Bar */}
        <ChatInput
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          onStop={handleStop}
          onSelectPromptTemplate={() => setIsPromptsOpen(true)}
        />
      </div>

      {/* Modals */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSave={(newSettings) => setSettings(newSettings)}
      />

      <PromptLibraryModal
        isOpen={isPromptsOpen}
        onClose={() => setIsPromptsOpen(false)}
        onSelectPrompt={(p) => handleSendMessage(p)}
      />

      <MediaGeneratorModal
        isOpen={isMediaOpen}
        onClose={() => setIsMediaOpen(false)}
        defaultMode={mediaDefaultMode}
      />
    </div>
  );
};

export default App;
