import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  X,
  Sliders,
  Brain,
  Volume2,
  Check,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { AppSettings } from '../types';
import { DEFAULT_SETTINGS, AVAILABLE_MODELS } from '../services/api';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSave: (newSettings: AppSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSave,
}) => {
  const [formData, setFormData] = useState<AppSettings>({ ...settings });
  const [activeTab, setActiveTab] = useState<'model' | 'voice'>('model');

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  const handleReset = () => {
    setFormData({ ...DEFAULT_SETTINGS });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/75 backdrop-blur-md"
      />

      {/* Modal Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="relative w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden z-10 text-slate-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">Studio Sozlamalari</h2>
              <p className="text-xs text-slate-400">
                Sun'iy intellekt xulq-atvori, model va ovoz parametrlari
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

        {/* Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/30 px-6 pt-2 gap-4">
          <button
            onClick={() => setActiveTab('model')}
            className={`pb-3 text-xs font-semibold uppercase tracking-wider transition-all border-b-2 flex items-center gap-1.5 ${
              activeTab === 'model'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Brain className="w-4 h-4" />
            <span>Model & Prompt</span>
          </button>

          <button
            onClick={() => setActiveTab('voice')}
            className={`pb-3 text-xs font-semibold uppercase tracking-wider transition-all border-b-2 flex items-center gap-1.5 ${
              activeTab === 'voice'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Volume2 className="w-4 h-4" />
            <span>Ovoz & TTS</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto space-y-5 text-sm">
          {activeTab === 'model' && (
            <div className="space-y-4">
              {/* Model Choice */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Faol Model
                </label>
                <select
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-cyan-400"
                >
                  {AVAILABLE_MODELS.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.badge})
                    </option>
                  ))}
                </select>
              </div>

              {/* System Prompt */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Tizim Ko'rsatmasi (System Prompt)
                </label>
                <textarea
                  rows={3}
                  value={formData.systemPrompt}
                  onChange={(e) =>
                    setFormData({ ...formData, systemPrompt: e.target.value })
                  }
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-cyan-400 resize-none leading-relaxed"
                />
              </div>

              {/* Temperature */}
              <div>
                <div className="flex justify-between text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                  <span>Harorat (Temperature)</span>
                  <span className="font-mono text-cyan-400">
                    {formData.temperature}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1.5"
                  step="0.1"
                  value={formData.temperature}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      temperature: parseFloat(e.target.value),
                    })
                  }
                  className="w-full accent-cyan-400 bg-slate-950 h-2 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
                  <span>0.0 (Aniq & Qat'iy)</span>
                  <span>1.5 (Ijodiy & Erkin)</span>
                </div>
              </div>

              {/* Max Tokens */}
              <div>
                <div className="flex justify-between text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                  <span>Maksimal Tokenlar (Max Tokens)</span>
                  <span className="font-mono text-cyan-400">
                    {formData.maxTokens}
                  </span>
                </div>
                <input
                  type="range"
                  min="500"
                  max="8000"
                  step="500"
                  value={formData.maxTokens}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      maxTokens: parseInt(e.target.value),
                    })
                  }
                  className="w-full accent-cyan-400 bg-slate-950 h-2 rounded-lg cursor-pointer"
                />
              </div>
            </div>
          )}

          {activeTab === 'voice' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Ovoz Tili (Speech Language)
                </label>
                <select
                  value={formData.voiceLang}
                  onChange={(e) =>
                    setFormData({ ...formData, voiceLang: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-cyan-400"
                >
                  <option value="uz-UZ">O'zbekcha (uz-UZ)</option>
                  <option value="en-US">English (en-US)</option>
                  <option value="ru-RU">Русский (ru-RU)</option>
                  <option value="tr-TR">Türkçe (tr-TR)</option>
                </select>
              </div>

              {/* Pitch */}
              <div>
                <div className="flex justify-between text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                  <span>Ovoz Balandligi (Pitch)</span>
                  <span className="font-mono text-cyan-400">
                    {formData.voicePitch}
                  </span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="1.5"
                  step="0.1"
                  value={formData.voicePitch}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      voicePitch: parseFloat(e.target.value),
                    })
                  }
                  className="w-full accent-cyan-400 bg-slate-950 h-2 rounded-lg cursor-pointer"
                />
              </div>

              {/* Rate */}
              <div>
                <div className="flex justify-between text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                  <span>Ovoz Tezligi (Speed)</span>
                  <span className="font-mono text-cyan-400">
                    {formData.voiceRate}x
                  </span>
                </div>
                <input
                  type="range"
                  min="0.7"
                  max="1.5"
                  step="0.1"
                  value={formData.voiceRate}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      voiceRate: parseFloat(e.target.value),
                    })
                  }
                  className="w-full accent-cyan-400 bg-slate-950 h-2 rounded-lg cursor-pointer"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-950/60">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Asliga qaytarish</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:bg-slate-800 transition-colors"
            >
              Bekor qilish
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium text-xs shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 active:scale-95 transition-all"
            >
              <Check className="w-4 h-4" />
              <span>Saqlash</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
