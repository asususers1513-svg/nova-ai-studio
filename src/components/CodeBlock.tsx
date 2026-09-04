import React, { useState } from 'react';
import { Check, Copy, Terminal, Code2 } from 'lucide-react';

interface CodeBlockProps {
  language: string;
  code: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ language, code }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code', err);
    }
  };

  const lines = code.trim().split('\n');

  return (
    <div className="my-4 rounded-xl overflow-hidden border border-cyan-500/20 bg-slate-950/90 shadow-2xl font-mono text-xs md:text-sm">
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-900/90 border-b border-slate-800 text-slate-400">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 mr-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 inline-block"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block"></span>
          </div>
          <Code2 className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-xs font-medium uppercase tracking-wider text-cyan-300">
            {language || 'code'}
          </span>
        </div>

        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-sans transition-all bg-slate-800/80 hover:bg-slate-700 hover:text-cyan-300 text-slate-300 border border-slate-700/50 active:scale-95"
          title="Nusxa olish"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-medium">Nusxalandi!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Nusxa olish</span>
            </>
          )}
        </button>
      </div>

      {/* Code content with line numbers */}
      <div className="p-4 overflow-x-auto max-h-[500px] text-slate-200">
        <table className="border-collapse w-full text-left">
          <tbody>
            {lines.map((line, idx) => (
              <tr key={idx} className="hover:bg-cyan-500/5 transition-colors group">
                <td className="pr-4 py-0.5 select-none text-right text-slate-600 group-hover:text-slate-400 w-8 text-xs font-mono">
                  {idx + 1}
                </td>
                <td className="py-0.5 whitespace-pre font-mono text-cyan-100/90 pl-2">
                  {line || ' '}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
