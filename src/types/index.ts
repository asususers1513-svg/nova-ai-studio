export type Role = 'user' | 'assistant' | 'system';

export interface Attachment {
  id: string;
  name: string;
  type: 'image' | 'file';
  url: string; // base64 or object URL
  size: number;
}

export interface Message {
  id: string;
  role: Role;
  content: string;
  thinking?: string;
  timestamp: number;
  model?: string;
  attachments?: Attachment[];
  isStreaming?: boolean;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
  model: string;
  systemPrompt?: string;
  isPinned?: boolean;
}

export interface ModelOption {
  id: string;
  name: string;
  provider: 'openai' | 'openrouter' | 'deepseek' | 'groq' | 'gemini' | 'custom';
  description: string;
  badge?: string;
  icon?: string;
  contextWindow?: string;
}

export interface AppSettings {
  apiKey: string;
  provider: 'openai' | 'openrouter' | 'deepseek' | 'groq' | 'gemini' | 'custom';
  customBaseUrl: string;
  model: string;
  systemPrompt: string;
  temperature: number;
  maxTokens: number;
  streamResponse: boolean;
  enableThinking: boolean;
  theme: 'dark' | 'light';
  voiceLang: string;
  voicePitch: number;
  voiceRate: number;
}

export interface PromptTemplate {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'Coding' | 'Writing' | 'Reasoning' | 'Productivity' | 'Translation' | 'Fun';
  prompt: string;
  systemPrompt?: string;
}
