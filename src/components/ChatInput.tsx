import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Square,
  Mic,
  MicOff,
  Paperclip,
  Image as ImageIcon,
  X,
  Sparkles,
  Zap,
  Code,
  Languages,
} from 'lucide-react';
import { Attachment } from '../types';
import { AudioVisualizer } from './AudioVisualizer';

interface ChatInputProps {
  onSendMessage: (text: string, attachments: Attachment[]) => void;
  isLoading: boolean;
  onStop: () => void;
  onSelectPromptTemplate?: () => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  isLoading,
  onStop,
  onSelectPromptTemplate,
}) => {
  const [text, setText] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const recognitionRef = useRef<any>(null);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'uz-UZ';

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setText((prev) => (prev ? `${prev} ${transcript}` : transcript));
      };

      recognition.onerror = (e: any) => {
        console.warn('Speech recognition error:', e);
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  // Auto resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        200
      )}px`;
    }
  }, [text]);

  const handleSend = () => {
    if ((!text.trim() && attachments.length === 0) || isLoading) return;
    onSendMessage(text.trim(), attachments);
    setText('');
    setAttachments([]);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      alert('Brauzeringiz ovozli yozishni (Speech Recognition) qo\'llab-quvvatlamaydi. Chrome yoki Edge brauzeridan foydalaning.');
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (err) {
        console.error('Failed to start speech recognition:', err);
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const isImage = file.type.startsWith('image/');
      const reader = new FileReader();

      reader.onload = (event) => {
        const newAttachment: Attachment = {
          id: Math.random().toString(36).substring(7),
          name: file.name,
          type: isImage ? 'image' : 'file',
          url: event.target?.result as string,
          size: file.size,
        };
        setAttachments((prev) => [...prev, newAttachment]);
      };

      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const quickPills = [
    { label: '🧠 Chuqur tahlil qil', prompt: 'Ushbu mavzuni eng mayda detallarigacha mantiqiy tahlil qilib ber: ' },
    { label: '💻 Kod yoz & tushuntir', prompt: 'Quyidagi vazifa uchun toza, optimallashgan kod yoz: ' },
    { label: '🌐 O\'zbekchaga tarjima', prompt: 'Quyidagi matnni tabiiy va chiroyli o\'zbek tiliga tarjima qil: ' },
    { label: '⚡ Qisqa xulosa', prompt: 'Quyidagi ma\'lumotni 3 ta asosiy punktda qisqacha xulosala: ' },
  ];

  return (
    <div className="relative w-full max-w-4xl mx-auto px-2 md:px-4 pb-4">
      {/* Quick Prompts Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-1 scrollbar-none text-xs">
        {quickPills.map((pill, i) => (
          <button
            key={i}
            onClick={() => setText((prev) => (prev ? `${prev}\n${pill.prompt}` : pill.prompt))}
            className="flex-shrink-0 px-3 py-1.5 rounded-full bg-slate-900/60 hover:bg-cyan-950/40 border border-slate-700/60 hover:border-cyan-500/40 text-slate-300 hover:text-cyan-300 transition-all active:scale-95 shadow-sm"
          >
            {pill.label}
          </button>
        ))}
      </div>

      {/* Audio Visualizer if recording */}
      <AnimatePresence>
        {isRecording && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="mb-2"
          >
            <AudioVisualizer isRecording={isRecording} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Glass Input Container */}
      <div className="relative rounded-2xl bg-slate-900/80 backdrop-blur-xl border border-slate-700/60 shadow-2xl focus-within:border-cyan-500/50 focus-within:ring-2 focus-within:ring-cyan-500/20 transition-all">
        {/* Attachment chips */}
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 p-3 pb-0">
            {attachments.map((att) => (
              <div
                key={att.id}
                className="flex items-center gap-2 px-2.5 py-1 bg-slate-800 border border-cyan-500/30 rounded-xl text-xs text-cyan-200"
              >
                {att.type === 'image' ? (
                  <ImageIcon className="w-3.5 h-3.5 text-cyan-400" />
                ) : (
                  <Paperclip className="w-3.5 h-3.5 text-purple-400" />
                )}
                <span className="max-w-[130px] truncate">{att.name}</span>
                <button
                  onClick={() => removeAttachment(att.id)}
                  className="hover:text-red-400 p-0.5 rounded-full"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Text Area */}
        <div className="flex items-end p-2.5 md:p-3 gap-2">
          {/* File Upload Hidden Input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            multiple
            accept="image/*,.txt,.pdf,.json,.md,.js,.ts,.py,.html,.css"
            className="hidden"
          />

          {/* Attachment button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2.5 rounded-xl text-slate-400 hover:text-cyan-300 hover:bg-slate-800/80 transition-all active:scale-95 flex-shrink-0"
            title="Fayl yoki rasm biriktirish"
          >
            <Paperclip className="w-5 h-5" />
          </button>

          {/* Mic Button */}
          <button
            type="button"
            onClick={toggleRecording}
            className={`p-2.5 rounded-xl transition-all active:scale-95 flex-shrink-0 ${
              isRecording
                ? 'bg-red-500/20 text-red-400 border border-red-500/50 animate-pulse'
                : 'text-slate-400 hover:text-pink-400 hover:bg-slate-800/80'
            }`}
            title={isRecording ? 'Yozishni to\'xtatish' : 'Ovoz orqali kiritish'}
          >
            {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Nova AI ga savol bering yoki vazifa topshiring... (Enter yuborish, Shift+Enter yangi qator)"
            rows={1}
            className="flex-1 max-h-[200px] bg-transparent text-slate-100 placeholder-slate-500 text-sm md:text-base resize-none focus:outline-none py-1.5 px-2 font-normal leading-relaxed"
          />

          {/* Send / Stop Button */}
          {isLoading ? (
            <button
              onClick={onStop}
              className="p-2.5 rounded-xl bg-gradient-to-r from-red-600 to-pink-600 text-white hover:opacity-90 shadow-lg shadow-red-500/20 transition-all active:scale-95 flex-shrink-0"
              title="To'xtatish"
            >
              <Square className="w-5 h-5 fill-current" />
            </button>
          ) : (
            <button
              onClick={handleSend}
              disabled={!text.trim() && attachments.length === 0}
              className={`p-2.5 rounded-xl transition-all active:scale-95 flex-shrink-0 ${
                text.trim() || attachments.length > 0
                  ? 'bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 text-white shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-105'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
              title="Yuborish (Enter)"
            >
              <Send className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
