import { AppSettings, Message } from '../types';

// API keys loaded from environment variables (set in .env file locally or Netlify env vars in production)
export const DEFAULT_GROQ_KEY = import.meta.env.VITE_GROQ_API_KEY || '';
export const DEFAULT_GEMINI_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

export const AVAILABLE_MODELS = [
  { id: 'openai/gpt-oss-120b', name: 'GPT OSS 120B (Groq)', provider: 'groq', description: 'Groq chipidagi eng kuchli va aqlli 120B flagman model', badge: 'Ultra Fast ⚡', icon: 'Sparkles', contextWindow: '128k' },
  { id: 'qwen/qwen3.8-27b', name: 'Qwen 3.8 27B (Groq)', provider: 'groq', description: 'O\'zbek tili va dasturlashda o\'ta ravon intellektual model', badge: 'Smart 🧠', icon: 'Cpu', contextWindow: '64k' },
  { id: 'gemini-flash-lite-latest', name: 'Gemini Vision (Google)', provider: 'gemini', description: 'Rasm tahlili va multimodal ko\'rish qobiliyatiga ega model', badge: 'Vision 🖼️', icon: 'Zap', contextWindow: '1M' },
  { id: 'groq/compound', name: 'Groq Compound', provider: 'groq', description: 'Chaqmoqdek tez umumiy suhbat va tahlil modeli', badge: 'Chaqmoq 🚀', icon: 'Flame', contextWindow: '128k' },
];

export const DEFAULT_SETTINGS: AppSettings = {
  apiKey: DEFAULT_GROQ_KEY,
  provider: 'groq',
  customBaseUrl: 'https://api.groq.com/openai/v1',
  model: 'openai/gpt-oss-120b',
  systemPrompt: 'You are Nova AI, an ultra-intelligent, helpful, direct, and polite AI assistant. You can write code, analyze images, and answer any question in fluent Uzbek.',
  temperature: 0.7,
  maxTokens: 4000,
  streamResponse: true,
  enableThinking: false,
  theme: 'dark',
  voiceLang: 'uz-UZ',
  voicePitch: 1.0,
  voiceRate: 1.0,
};

export async function sendChatMessageStream({
  messages,
  settings,
  onChunk,
  signal,
}: {
  messages: Message[];
  settings: AppSettings;
  onChunk: (chunk: string) => void;
  onThinking?: (thinking: string) => void;
  signal?: AbortSignal;
}): Promise<void> {
  const lastMsg = messages.filter((m) => m.role === 'user').slice(-1)[0];
  const query = lastMsg?.content || '';
  const lower = query.toLowerCase();

  // 1. Check if user asks for AI image generation in chat
  const isImageGenRequest =
    lower.startsWith('/image') ||
    lower.startsWith('rasm chiz') ||
    lower.startsWith('rasm yarat') ||
    lower.includes('rasmini chiz') ||
    lower.includes('rasmini yarat') ||
    lower.includes('rasm yasab ber');

  if (isImageGenRequest) {
    const cleanPrompt = query
      .replace(/\/image|rasm chizib ber|rasm chiz|rasm yaratib ber|rasm yarat|rasmini chiz|rasmini yarat|rasm yasab ber/gi, '')
      .trim() || 'Futuristic cyber city 4k high quality';

    const seed = Math.floor(Math.random() * 1000000);
    const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(cleanPrompt)}?width=1024&height=1024&model=flux&seed=${seed}&nologo=true`;

    const answer = `### 🎨 AI Rasm Tayyor!\n\n> **Prompt:** "${cleanPrompt}"\n\n![AI Rasm](${imageUrl})\n\n💡 *Yuqoridagi rasmni to'liq hajmda ko'rish yoki yuklab olishingiz mumkin.*`;

    for (let i = 0; i < answer.length; i += 3) {
      if (signal?.aborted) return;
      onChunk(answer.slice(i, i + 3));
      await new Promise((r) => setTimeout(r, 8));
    }
    return;
  }

  // 2. Check if user attached images (Vision Mode) -> Route to Gemini Vision
  const hasImageAttachments = lastMsg?.attachments && lastMsg.attachments.some((a) => a.type === 'image');

  if (hasImageAttachments || settings.provider === 'gemini' || settings.model.includes('gemini')) {
    return sendGeminiVisionRequest({ messages, settings, onChunk, signal });
  }

  // 3. Normal Text Query -> Groq ultra-fast inference
  return sendGroqRequest({ messages, settings, onChunk, signal });
}

// Groq API Stream Handler
async function sendGroqRequest({
  messages,
  settings,
  onChunk,
  signal,
}: {
  messages: Message[];
  settings: AppSettings;
  onChunk: (chunk: string) => void;
  signal?: AbortSignal;
}) {
  const apiMessages = [
    ...(settings.systemPrompt ? [{ role: 'system', content: settings.systemPrompt }] : []),
    ...messages
      .filter((m) => m.content && m.content.trim())
      .map((m) => ({
        role: m.role,
        content: m.content,
      })),
  ];

  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${DEFAULT_GROQ_KEY}`,
      },
      body: JSON.stringify({
        model: settings.model.includes('qwen') ? 'qwen/qwen3.8-27b' : 'openai/gpt-oss-120b',
        messages: apiMessages,
        temperature: settings.temperature || 0.7,
        max_tokens: settings.maxTokens || 4000,
        stream: true,
      }),
      signal,
    });

    if (!res.ok) {
      // Fallback to Gemini if Groq limits hit
      return sendGeminiVisionRequest({ messages, settings, onChunk, signal });
    }

    const reader = res.body?.getReader();
    if (!reader) return;
    const decoder = new TextDecoder('utf-8');
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed === 'data: [DONE]') continue;
        if (trimmed.startsWith('data: ')) {
          try {
            const data = JSON.parse(trimmed.substring(6));
            const delta = data.choices?.[0]?.delta;
            if (delta?.content) {
              onChunk(delta.content);
            }
          } catch {}
        }
      }
    }
  } catch (err: any) {
    if (err.name === 'AbortError') return;
    return sendGeminiVisionRequest({ messages, settings, onChunk, signal });
  }
}

// Google Gemini Vision API Handler (Handles both Images & Text)
async function sendGeminiVisionRequest({
  messages,
  settings,
  onChunk,
  signal,
}: {
  messages: Message[];
  settings: AppSettings;
  onChunk: (chunk: string) => void;
  signal?: AbortSignal;
}) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent?key=${DEFAULT_GEMINI_KEY}`;

  const contents = messages
    .filter((m) => m.content || (m.attachments && m.attachments.length > 0))
    .map((m) => {
      const parts: any[] = [];
      if (m.content) {
        parts.push({ text: m.content });
      }
      if (m.attachments && m.attachments.length > 0) {
        m.attachments
          .filter((a) => a.type === 'image' && a.url.startsWith('data:'))
          .forEach((att) => {
            const match = att.url.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
            if (match) {
              parts.push({
                inline_data: {
                  mime_type: match[1],
                  data: match[2],
                },
              });
            }
          });
      }
      return {
        role: m.role === 'assistant' ? 'model' : 'user',
        parts,
      };
    });

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents,
        generationConfig: {
          temperature: settings.temperature || 0.7,
          maxOutputTokens: settings.maxTokens || 4000,
        },
      }),
      signal,
    });

    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      onChunk("Kechirasiz, javob olishda xatolik yuz berdi. Iltimos qaytadan yozing.");
      return;
    }

    for (let i = 0; i < text.length; i += 3) {
      if (signal?.aborted) return;
      onChunk(text.slice(i, i + 3));
      await new Promise((r) => setTimeout(r, 8));
    }
  } catch (err: any) {
    if (err.name === 'AbortError') return;
    onChunk(`❌ Xatolik: ${err.message || err}`);
  }
}
