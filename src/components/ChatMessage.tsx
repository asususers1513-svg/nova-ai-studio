import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot,
  User,
  Copy,
  Check,
  Volume2,
  VolumeX,
  ChevronDown,
  ChevronUp,
  Brain,
  Sparkles,
  Paperclip,
  Image as ImageIcon,
} from 'lucide-react';
import { Message } from '../types';
import { CodeBlock } from './CodeBlock';

interface ChatMessageProps {
  message: Message;
  onSpeak?: (text: string) => void;
  isSpeaking?: boolean;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  onSpeak,
  isSpeaking = false,
}) => {
  const [copied, setCopied] = useState(false);
  const [showThinking, setShowThinking] = useState(true);

  const isUser = message.role === 'user';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Nusxalashda xatolik:', err);
    }
  };

  // Basic markdown parser for blocks and inline code
  const renderFormattedContent = (content: string) => {
    // Split by code blocks ```lang ... ```
    const codeBlockRegex = /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g;
    const parts = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = codeBlockRegex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        parts.push({
          type: 'text',
          content: content.slice(lastIndex, match.index),
        });
      }
      parts.push({
        type: 'code',
        language: match[1] || 'text',
        content: match[2],
      });
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < content.length) {
      parts.push({
        type: 'text',
        content: content.slice(lastIndex),
      });
    }

    return (
      <div className="space-y-3 leading-relaxed text-sm md:text-base">
        {parts.map((part, idx) => {
          if (part.type === 'code') {
            return (
              <CodeBlock
                key={idx}
                language={part.language || 'code'}
                code={part.content || ''}
              />
            );
          }

          // Format normal text paragraphs, inline code, bold, lists
          const paragraphs = part.content.split('\n\n');
          return (
            <div key={idx} className="space-y-2.5">
              {paragraphs.map((para, pIdx) => {
                if (!para.trim()) return null;

                // Image markdown ![alt](url)
                const imgMatch = para.match(/!\[([^\]]*)\]\((https?:\/\/[^\)]+)\)/);
                if (imgMatch) {
                  const alt = imgMatch[1] || 'AI Rasm';
                  const imgUrl = imgMatch[2];
                  return (
                    <div key={pIdx} className="my-3 rounded-2xl overflow-hidden border border-cyan-500/30 bg-slate-950 p-2 shadow-2xl group/img max-w-lg">
                      <div className="relative overflow-hidden rounded-xl bg-slate-900 flex items-center justify-center">
                        <img
                          src={imgUrl}
                          alt={alt}
                          loading="lazy"
                          className="w-full h-auto max-h-[450px] object-cover rounded-xl transition-transform duration-300 group-hover/img:scale-[1.02]"
                        />
                        <div className="absolute top-2 right-2 flex items-center gap-1.5 opacity-0 group-hover/img:opacity-100 transition-opacity bg-slate-950/80 backdrop-blur-md p-1.5 rounded-xl border border-slate-700">
                          <a
                            href={imgUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition-all shadow text-xs flex items-center gap-1"
                            download
                          >
                            Yuklab olish
                          </a>
                        </div>
                      </div>
                      <div className="mt-2 px-1 flex items-center justify-between text-xs text-slate-400">
                        <span className="font-medium text-cyan-300">🎨 {alt}</span>
                        <span className="font-mono text-[10px] text-slate-500">Flux HD</span>
                      </div>
                    </div>
                  );
                }

                // Blockquote
                if (para.startsWith('>')) {
                  return (
                    <blockquote
                      key={pIdx}
                      className="border-l-4 border-cyan-400/70 pl-3 py-1 my-2 bg-cyan-950/20 text-cyan-200 rounded-r italic"
                    >
                      {para.replace(/^>\s*/, '')}
                    </blockquote>
                  );
                }

                // Table detection
                if (para.includes('|') && para.split('\n').length > 1) {
                  const rows = para.trim().split('\n').map((row) =>
                    row
                      .split('|')
                      .map((cell) => cell.trim())
                      .filter((c, i, a) => (i > 0 && i < a.length - 1) || c.length > 0)
                  );
                  if (rows.length >= 2) {
                    const headers = rows[0];
                    const dataRows = rows.slice(2); // Skip separator
                    return (
                      <div key={pIdx} className="overflow-x-auto my-3 rounded-lg border border-slate-700/60">
                        <table className="min-w-full text-xs md:text-sm text-left">
                          <thead className="bg-slate-800/80 text-cyan-300 font-semibold border-b border-slate-700">
                            <tr>
                              {headers.map((h, hi) => (
                                <th key={hi} className="px-3 py-2">
                                  {h}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800">
                            {dataRows.map((row, ri) => (
                              <tr key={ri} className="hover:bg-slate-800/40">
                                {row.map((cell, ci) => (
                                  <td key={ci} className="px-3 py-2 text-slate-300">
                                    {cell}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    );
                  }
                }

                // List items
                if (para.includes('\n- ') || para.startsWith('- ') || para.includes('\n* ') || para.startsWith('* ')) {
                  const items = para.split('\n').filter((l) => l.trim().length > 0);
                  return (
                    <ul key={pIdx} className="list-disc pl-5 space-y-1 my-2 text-slate-200">
                      {items.map((item, li) => {
                        const cleanItem = item.replace(/^[-*]\s*/, '');
                        return <li key={li}>{renderInlineFormatting(cleanItem)}</li>;
                      })}
                    </ul>
                  );
                }

                // Numbered list
                if (/^\d+\.\s/.test(para)) {
                  const items = para.split('\n').filter((l) => l.trim().length > 0);
                  return (
                    <ol key={pIdx} className="list-decimal pl-5 space-y-1 my-2 text-slate-200">
                      {items.map((item, li) => {
                        const cleanItem = item.replace(/^\d+\.\s*/, '');
                        return <li key={li}>{renderInlineFormatting(cleanItem)}</li>;
                      })}
                    </ol>
                  );
                }

                // Headings
                if (para.startsWith('### ')) {
                  return (
                    <h3 key={pIdx} className="text-base md:text-lg font-bold text-cyan-300 mt-4 mb-2 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-cyan-400" />
                      {para.replace('### ', '')}
                    </h3>
                  );
                }
                if (para.startsWith('## ')) {
                  return (
                    <h2 key={pIdx} className="text-lg md:text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 mt-5 mb-2">
                      {para.replace('## ', '')}
                    </h2>
                  );
                }

                return (
                  <p key={pIdx} className="text-slate-200 leading-relaxed break-words">
                    {renderInlineFormatting(para)}
                  </p>
                );
              })}
            </div>
          );
        })}
      </div>
    );
  };

  const renderInlineFormatting = (text: string) => {
    // Process bold **text** and inline `code`
    const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code
            key={i}
            className="px-1.5 py-0.5 mx-0.5 rounded bg-cyan-950/70 border border-cyan-500/30 text-cyan-300 text-xs md:text-sm font-mono"
          >
            {part.slice(1, -1)}
          </code>
        );
      }
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} className="font-semibold text-cyan-100">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`group relative flex gap-3 md:gap-4 py-4 px-2 md:px-4 rounded-2xl transition-colors ${
        isUser ? 'bg-cyan-950/20 border border-cyan-500/10' : 'bg-slate-900/40 border border-slate-800/60'
      }`}
    >
      {/* Avatar */}
      <div className="flex-shrink-0">
        {isUser ? (
          <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/20 ring-2 ring-cyan-400/30">
            <User className="w-5 h-5 text-white" />
          </div>
        ) : (
          <div className="relative w-9 h-9 md:w-10 md:h-10 rounded-xl bg-gradient-to-tr from-purple-600 via-pink-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-purple-500/25 ring-2 ring-purple-400/40 animate-pulse-slow">
            <Bot className="w-5 h-5 text-white" />
            <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-slate-950 rounded-full" />
          </div>
        )}
      </div>

      {/* Message Body */}
      <div className="flex-1 min-w-0 space-y-2">
        {/* Author Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm md:text-base tracking-wide text-slate-200">
              {isUser ? 'Siz' : 'Nova AI'}
            </span>
            {message.model && !isUser && (
              <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-medium bg-purple-500/10 border border-purple-500/20 text-purple-300">
                {message.model}
              </span>
            )}
            <span className="text-[11px] text-slate-500">
              {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {!isUser && onSpeak && (
              <button
                onClick={() => onSpeak(message.content)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-slate-800/80 transition-all active:scale-95"
                title={isSpeaking ? "Ovozni to'xtatish" : "Ovozli o'qish"}
              >
                {isSpeaking ? (
                  <VolumeX className="w-4 h-4 text-pink-400 animate-pulse" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </button>
            )}

            <button
              onClick={handleCopy}
              className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-slate-800/80 transition-all active:scale-95"
              title="Xabarni nusxalash"
            >
              {copied ? (
                <Check className="w-4 h-4 text-emerald-400" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Attachments preview */}
        {message.attachments && message.attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1 pb-2">
            {message.attachments.map((att) => (
              <div
                key={att.id}
                className="flex items-center gap-2 p-1.5 bg-slate-800/80 border border-slate-700/60 rounded-xl overflow-hidden shadow"
              >
                {att.type === 'image' ? (
                  <img
                    src={att.url}
                    alt={att.name}
                    className="w-14 h-14 object-cover rounded-lg border border-slate-700"
                  />
                ) : (
                  <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-cyan-950/50 text-cyan-400">
                    <Paperclip className="w-5 h-5" />
                  </div>
                )}
                <div className="text-xs max-w-[140px] truncate pr-2">
                  <p className="font-medium text-slate-200 truncate">{att.name}</p>
                  <p className="text-slate-500 text-[10px]">
                    {(att.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Thinking Accordion (DeepSeek-R1 style) */}
        {message.thinking && !isUser && (
          <div className="my-2 rounded-xl border border-purple-500/30 bg-purple-950/20 overflow-hidden shadow-inner">
            <button
              onClick={() => setShowThinking(!showThinking)}
              className="w-full flex items-center justify-between px-3 py-2 bg-purple-900/30 hover:bg-purple-900/40 text-purple-300 text-xs font-medium transition-colors"
            >
              <div className="flex items-center gap-2">
                <Brain className="w-3.5 h-3.5 text-pink-400 animate-pulse" />
                <span className="font-semibold tracking-wide">Fikrlash jarayoni (Reasoning Process)</span>
              </div>
              {showThinking ? (
                <ChevronUp className="w-3.5 h-3.5 text-purple-400" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-purple-400" />
              )}
            </button>

            <AnimatePresence>
              {showThinking && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="p-3 text-xs text-purple-200/80 font-mono whitespace-pre-wrap leading-relaxed border-t border-purple-500/20 bg-black/20 max-h-48 overflow-y-auto"
                >
                  {message.thinking}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Formatted Content */}
        <div className="text-slate-100">
          {renderFormattedContent(message.content)}
          {message.isStreaming && <span className="cursor-blink" />}
        </div>
      </div>
    </motion.div>
  );
};
