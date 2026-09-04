import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  X,
  BookOpen,
  Code,
  Brain,
  Languages,
  PenTool,
  TrendingUp,
  GraduationCap,
  Sparkles,
  ArrowRight,
  Search,
} from 'lucide-react';
import { PromptTemplate } from '../types';

interface PromptLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPrompt: (promptText: string) => void;
}

const TEMPLATES: PromptTemplate[] = [
  {
    id: 'code-refactor',
    title: 'Kodni Refactoring va Optimallash',
    description: 'Koddagi xatoliklarni topish, xotira va tezlikni yaxshilash',
    icon: 'Code',
    category: 'Coding',
    prompt: 'Quyidagi kodni tahlil qil, mavjud xatoliklar va kamchiliklarni ko\'rsat, hamda Clean Code qoidalariga mos ravishda to\'liq refactoring qilingan versiyasini taqdim et:\n\n```\n// kodingizni bu yerga qo\'ying\n```',
  },
  {
    id: 'fullstack-component',
    title: 'React + Tailwind Zamonaviy Komponent',
    description: 'Chiroyli animatsiyali, to\'liq tiplangan UI komponent yaratish',
    icon: 'Code',
    category: 'Coding',
    prompt: 'Menga React (TypeScript), Tailwind CSS va Framer Motion yordamida interaktiv, zamonaviy va chiroyli dizaynga ega quyidagi komponentni yozib ber: ',
  },
  {
    id: 'deep-reasoning',
    title: 'Chuqur Bosqichma-bosqich Tahlil',
    description: 'Har qanday murakkab vazifani chuqur mantiq bilan yechish',
    icon: 'Brain',
    category: 'Reasoning',
    prompt: 'Ushbu masalani eng mayda nuqtalarigacha, barcha ehtimoliy holatlarni hisobga olgan holda, bosqichma-bosqich qadamlar bilan mantiqiy yechib ber: ',
  },
  {
    id: 'uz-en-translator',
    title: 'Professional Tarjima (O\'zbek <-> Ingliz)',
    description: 'Grammatik aniq, badiiy va kontekstga mos tarjima',
    icon: 'Languages',
    category: 'Translation',
    prompt: 'Quyidagi matnni professional darajada, ma\'no va uslubni saqlagan holda o\'zbek/ingliz tiliga tarjima qilib ber:\n\n',
  },
  {
    id: 'copywriting-post',
    title: 'Telegram / Instagram Viral Post',
    description: 'Diqqatni tortuvchi sarlavha, emojilar va Call to Action',
    icon: 'PenTool',
    category: 'Writing',
    prompt: 'Quyidagi mavzuda ijtimoiy tarmoqlar (Telegram va Instagram) uchun yuqori jalb qiluvchanlikka (engagement) ega, qiziqarli, emojilar bilan bezatilgan post yozib ber: ',
  },
  {
    id: 'business-strategy',
    title: 'Biznes Reja va SWOT Tahlil',
    description: 'Loyihaning kuchli/zaif tomonlari va bozor imkoniyatlari',
    icon: 'TrendingUp',
    category: 'Productivity',
    prompt: 'Quyidagi loyiha/startap g\'oyasi uchun batafsil SWOT tahlil va 3 oylik rivojlanish strategiyasini tuzib ber: ',
  },
  {
    id: 'ai-tutor',
    title: 'Shaxsiy AI Repetitor',
    description: 'Murakkab mavzuni oddiy va hayotiy misollar bilan tushuntirish',
    icon: 'GraduationCap',
    category: 'Productivity',
    prompt: 'Men uchun quyidagi mavzuni 10 yoshli bolaga tushuntirgandek sodda, qiziqarli va hayotiy misollar orqali tushuntirib ber: ',
  },
];

export const PromptLibraryModal: React.FC<PromptLibraryModalProps> = ({
  isOpen,
  onClose,
  onSelectPrompt,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  const categories = ['All', 'Coding', 'Reasoning', 'Translation', 'Writing', 'Productivity'];

  const filtered = TEMPLATES.filter((t) => {
    const matchCat = selectedCategory === 'All' || t.category === selectedCategory;
    const matchSearch =
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Code':
        return <Code className="w-5 h-5 text-cyan-400" />;
      case 'Brain':
        return <Brain className="w-5 h-5 text-pink-400" />;
      case 'Languages':
        return <Languages className="w-5 h-5 text-purple-400" />;
      case 'PenTool':
        return <PenTool className="w-5 h-5 text-amber-400" />;
      case 'TrendingUp':
        return <TrendingUp className="w-5 h-5 text-emerald-400" />;
      case 'GraduationCap':
      default:
        return <GraduationCap className="w-5 h-5 text-blue-400" />;
    }
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

      {/* Modal Box */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="relative w-full max-w-3xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden z-10 text-slate-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">
                Tayyor Prompt Shablonlari
              </h2>
              <p className="text-xs text-slate-400">
                Bir marta bosish orqali professional so'rovlarni ishga tushiring
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

        {/* Filter bar & Search */}
        <div className="p-4 border-b border-slate-800 bg-slate-950/40 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Shablon nomini qidirish..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl font-medium transition-all ${
                  selectedCategory === cat
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                    : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Cards Grid */}
        <div className="p-6 max-h-[55vh] overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filtered.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                onSelectPrompt(item.prompt);
                onClose();
              }}
              className="group p-4 rounded-2xl bg-slate-950/80 hover:bg-slate-800/90 border border-slate-800 hover:border-cyan-500/50 cursor-pointer transition-all hover:scale-[1.02] shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 rounded-xl bg-slate-900 border border-slate-700/50 group-hover:border-cyan-500/30">
                    {getIcon(item.icon)}
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-slate-400">
                    {item.category}
                  </span>
                </div>
                <h3 className="font-semibold text-sm text-slate-100 group-hover:text-cyan-300 transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed line-clamp-2">
                  {item.description}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-xs text-cyan-400 group-hover:text-cyan-300 font-medium">
                <span>Ishlatish</span>
                <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};
