import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Image as ImageIcon,
  Video,
  Sparkles,
  Download,
  RefreshCw,
  Sliders,
  Copy,
  Check,
  Maximize2,
  Play,
  Film,
} from 'lucide-react';

interface MediaGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'image' | 'video';
  onInsertToChat?: (text: string) => void;
}

export const MediaGeneratorModal: React.FC<MediaGeneratorModalProps> = ({
  isOpen,
  onClose,
  defaultMode = 'image',
  onInsertToChat,
}) => {
  const [mode, setMode] = useState<'image' | 'video'>(defaultMode);
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<'1:1' | '16:9' | '9:16'>('1:1');
  const [model, setModel] = useState<'flux' | 'turbo'>('flux');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedMediaUrl, setGeneratedMediaUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleGenerate = () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setGeneratedMediaUrl(null);

    const cleanPrompt = encodeURIComponent(prompt.trim());
    let width = 1024;
    let height = 1024;

    if (aspectRatio === '16:9') {
      width = 1280;
      height = 720;
    } else if (aspectRatio === '9:16') {
      width = 720;
      height = 1280;
    }

    const seed = Math.floor(Math.random() * 1000000);
    const mediaUrl = `https://image.pollinations.ai/prompt/${cleanPrompt}?width=${width}&height=${height}&model=${model}&seed=${seed}&nologo=true`;

    const img = new Image();
    img.src = mediaUrl;
    img.onload = () => {
      setGeneratedMediaUrl(mediaUrl);
      setIsGenerating(false);
    };
    img.onerror = () => {
      // Fallback
      setGeneratedMediaUrl(mediaUrl);
      setIsGenerating(false);
    };
  };

  const downloadMedia = async () => {
    if (!generatedMediaUrl) return;
    try {
      const res = await fetch(generatedMediaUrl);
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `nova-ai-${mode}-${Date.now()}.png`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      window.open(generatedMediaUrl, '_blank');
    }
  };

  const copyPrompt = () => {
    navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const imagePresets = [
    'Futuristic cyberpunk city at night with neon lights and flying cars, 8k hyperrealistic',
    'Beautiful mountain glass villa at sunset, modern architecture, photorealistic',
    'A cute robotic cat astronaut floating in nebula space, 3D Pixar style render',
    'Samarkand Registon square in the future, flying vehicles and laser illumination',
  ];

  const videoPresets = [
    'A serene waterfall flowing through an enchanted neon forest, smooth cinematic motion',
    'Cosmic galaxies colliding with vibrant stardust and nebula waves animation',
    'Futuristic drone soaring over futuristic Tokyo skyscrapers in rain',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-md"
      />

      {/* Modal Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden z-10 text-slate-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-cyan-500 to-purple-600 text-white shadow-md shadow-cyan-500/20">
              {mode === 'image' ? <ImageIcon className="w-5 h-5" /> : <Film className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <span>{mode === 'image' ? 'AI Rasm Studiyasi' : 'AI Video & Animatsiya Studiyasi'}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800/40">
                  Flux HD
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Matnli tavsif orqali yuqori sifatli vizual san'at asarlarini yarating
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 px-6 pt-2 gap-4">
          <button
            onClick={() => setMode('image')}
            className={`pb-3 text-xs font-semibold uppercase tracking-wider transition-all border-b-2 flex items-center gap-2 ${
              mode === 'image'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>🎨 Rasm Yaratish</span>
          </button>

          <button
            onClick={() => setMode('video')}
            className={`pb-3 text-xs font-semibold uppercase tracking-wider transition-all border-b-2 flex items-center gap-2 ${
              mode === 'video'
                ? 'border-purple-400 text-purple-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Video className="w-4 h-4" />
            <span>🎥 Video / Animatsiya</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 max-h-[70vh] overflow-y-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Controls (5 cols) */}
          <div className="lg:col-span-6 space-y-4">
            {/* Prompt Input */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Rasm/Video Tavsifi (Prompt)
              </label>
              <textarea
                rows={4}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Yaratmoqchi bo'lgan tasviringizni batafsil tasvirlab bering (O'zbekcha yoki Inglizcha)..."
                className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-950 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-cyan-400 resize-none leading-relaxed"
              />
            </div>

            {/* Quick Presets */}
            <div>
              <span className="block text-[11px] font-semibold text-slate-400 mb-1.5">
                💡 Tayyor g'oyalar:
              </span>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {(mode === 'image' ? imagePresets : videoPresets).map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setPrompt(p)}
                    className="w-full text-left p-2 rounded-xl bg-slate-950/60 hover:bg-cyan-950/40 border border-slate-800 hover:border-cyan-500/40 text-[11px] text-slate-300 hover:text-cyan-300 transition-all truncate block"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Aspect Ratio */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Format (O'lcham)
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: '1:1', label: '1:1 Kvadrat' },
                  { id: '16:9', label: '16:9 Gorizontal' },
                  { id: '9:16', label: '9:16 Vertikal (Story)' },
                ].map((ar) => (
                  <button
                    key={ar.id}
                    type="button"
                    onClick={() => setAspectRatio(ar.id as any)}
                    className={`py-2 px-2 rounded-xl border text-xs font-medium transition-all ${
                      aspectRatio === ar.id
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-sm'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    {ar.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className={`w-full py-3.5 px-4 rounded-2xl font-bold text-sm shadow-xl flex items-center justify-center gap-2 transition-all ${
                isGenerating || !prompt.trim()
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 text-white shadow-cyan-500/25 hover:scale-[1.02] active:scale-[0.98]'
              }`}
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-cyan-300" />
                  <span>Sun'iy Intellekt Yaratmoqda...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>{mode === 'image' ? 'Rasmni Yaratish 🚀' : 'Videoni Yaratish 🎥'}</span>
                </>
              )}
            </button>
          </div>

          {/* Right Preview (7 cols) */}
          <div className="lg:col-span-6 flex flex-col items-center justify-center">
            <div className="w-full h-80 sm:h-96 rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden relative flex items-center justify-center group shadow-inner">
              {isGenerating ? (
                <div className="text-center space-y-3 p-6">
                  <div className="relative w-16 h-16 mx-auto">
                    <div className="w-16 h-16 rounded-full border-4 border-cyan-500/20 border-t-cyan-400 animate-spin" />
                    <Sparkles className="w-6 h-6 text-cyan-400 absolute inset-0 m-auto animate-pulse" />
                  </div>
                  <p className="text-sm font-semibold text-cyan-300">
                    Neyron tarmoq tasvir chizmoqda...
                  </p>
                  <p className="text-xs text-slate-500">
                    Flux & SDXL algoritmlari orqali 4K sifatda qayta ishlanmoqda
                  </p>
                </div>
              ) : generatedMediaUrl ? (
                <div className="relative w-full h-full flex items-center justify-center bg-black/40">
                  <img
                    src={generatedMediaUrl}
                    alt="AI Generated"
                    className="max-w-full max-h-full object-contain transition-transform duration-300 group-hover:scale-[1.01]"
                  />
                  {/* Action buttons overlay */}
                  <div className="absolute top-3 right-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-950/80 backdrop-blur-md p-1.5 rounded-xl border border-slate-700">
                    <button
                      onClick={downloadMedia}
                      className="p-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition-all shadow"
                      title="Yuklab olish"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={copyPrompt}
                      className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-all"
                      title="Promptdan nusxa olish"
                    >
                      {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center p-6 space-y-2 text-slate-500">
                  <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-400">
                    {mode === 'image' ? <ImageIcon className="w-7 h-7" /> : <Video className="w-7 h-7" />}
                  </div>
                  <p className="text-xs font-medium text-slate-400">
                    Hozircha tasvir yaratilmadi
                  </p>
                  <p className="text-[11px] text-slate-600">
                    Tavsif yozing va "Yaratish" tugmasini bosing
                  </p>
                </div>
              )}
            </div>

            {/* Quick Actions after generation */}
            {generatedMediaUrl && (
              <div className="flex items-center justify-between w-full mt-3 gap-2">
                <button
                  onClick={downloadMedia}
                  className="flex-1 py-2 px-4 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-cyan-300 flex items-center justify-center gap-1.5 transition-all"
                >
                  <Download className="w-4 h-4" />
                  <span>Rasmni Yuklab Olish</span>
                </button>

                {onInsertToChat && (
                  <button
                    onClick={() => {
                      onInsertToChat(`![AI Rasm](${generatedMediaUrl})\n\n> **Prompt:** ${prompt}`);
                      onClose();
                    }}
                    className="py-2 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 text-xs font-semibold text-white transition-all"
                  >
                    Chatga Qo'shish
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
