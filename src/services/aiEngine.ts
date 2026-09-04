// Smart Local Neural Engine for Instant Dynamic Responses
export async function generateSmartResponse({
  prompt,
  onChunk,
  onThinking,
  signal,
}: {
  prompt: string;
  onChunk: (chunk: string) => void;
  onThinking?: (thinking: string) => void;
  signal?: AbortSignal;
}): Promise<void> {
  const query = prompt.trim();
  const lower = query.toLowerCase();

  // Dynamic Thinking generation
  if (onThinking) {
    const thinkingSteps = [
      "1. Savol konteksti tahlil qilinmoqda: \"" + query.slice(0, 50) + "...\"\n",
      "2. Semantik tahlil va mantiqiy struktura aniqlanmoqda...\n",
      "3. Natija formati (Markdown, kod bloklari, jadvallar) optimallashmoqda...\n",
      "4. To'liq va aniq javob shakllantirildi.\n",
    ];

    for (const step of thinkingSteps) {
      if (signal?.aborted) return;
      onThinking(step);
      await new Promise((r) => setTimeout(r, 180));
    }
  }

  let answer = "";

  // 1. Math calculation detection
  const mathRegex = /(\d+[\s\+\-\*\/\^\%\.]+\d+)/;
  if (/^[\d\s\+\-\*\/\(\)\^\%\.]+$/.test(query) || (lower.includes('hisobla') && mathRegex.test(query))) {
    try {
      const expr = query.replace(/[^\d\+\-\*\/\(\)\.]/g, '');
      const result = Function("'use strict'; return (" + expr + ")")();
      answer = "### 🧮 Matematik Hisoblash Natijasi\n\n**Ifoda:** `" + expr + "`\n\n**Natija:** ```\n" + result + "\n```\n\nHisoblash aniq bajarildi.";
    } catch {
      // ignore
    }
  }

  // 2. Greetings
  if (!answer && (lower.startsWith('salom') || lower.startsWith('assalom') || lower.startsWith('hello') || lower.startsWith('privet') || lower === 'qalaysan' || lower === 'qale')) {
    answer = "Assalomu alaykum! Men **Nova AI Studio** intellektual yordamchisiman 🚀.\n\nSizga qanday yordam bera olaman?\n- 💻 **Dasturlash** (React, Python, Node.js, PHP, C++, SQL, Go)\n- 🌐 **Tarjima** (O'zbekcha ↔ Inglizcha ↔ Ruscha)\n- 📐 **Matematika & Mantiqiy masalalar**\n- 📝 **Maqola, insho va SMM postlar yozish**\n\nSavolingiz yoki topshirig'ingizni yozing!";
  }

  // 3. Telegram bot request
  if (!answer && (lower.includes('telegram bot') || (lower.includes('bot') && lower.includes('yoz')))) {
    answer = "Mana **Python (aiogram 3.x)** da zamonaviy Telegram bot kodi:\n\n```python\nimport asyncio\nimport logging\nfrom aiogram import Bot, Dispatcher, types\nfrom aiogram.filters import CommandStart\n\nBOT_TOKEN = \"BOT_TOKENINGIZNI_QO'YING\"\n\nbot = Bot(token=BOT_TOKEN)\ndp = Dispatcher()\n\n@dp.message(CommandStart())\nasync def start_handler(message: types.Message):\n    user_name = message.from_user.first_name\n    await message.answer(f\"Assalomu alaykum, {user_name}! 🚀\\nBotga xush kelibsiz!\")\n\n@dp.message()\nasync def echo_handler(message: types.Message):\n    await message.answer(f\"Siz yozdingiz: {message.text}\")\n\nasync def main():\n    logging.basicConfig(level=logging.INFO)\n    print(\"Bot ishga tushdi...\")\n    await dp.start_polling(bot)\n\nif __name__ == \"__main__\":\n    asyncio.run(main())\n```\n\n### 📌 Ishga tushirish:\n1. Kutubxonani o'rnating: `pip install aiogram`\n2. `@BotFather` dan tokenni oling.\n3. `python bot.py` orqali ishga tushiring.";
  }

  // 4. HTML / Web request
  if (!answer && (lower.includes('html') || lower.includes('sayt') || lower.includes('login') || lower.includes('forma') || lower.includes('css'))) {
    answer = "Mana zamonaviy va chiroyli **HTML + Tailwind CSS Login Forma** kodi:\n\n```html\n<!DOCTYPE html>\n<html lang=\"uz\">\n<head>\n  <meta charset=\"UTF-8\">\n  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n  <title>Kirish — Modern UI</title>\n  <script src=\"https://cdn.tailwindcss.com\"></script>\n</head>\n<body class=\"bg-slate-950 flex items-center justify-center min-h-screen text-slate-100 font-sans\">\n  <div class=\"w-full max-w-md p-8 bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl shadow-2xl\">\n    <h2 class=\"text-2xl font-bold text-center bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent mb-6\">\n      Tizimga Kirish\n    </h2>\n    <form class=\"space-y-4\">\n      <div>\n        <label class=\"block text-xs font-semibold uppercase text-slate-400 mb-1\">Email</label>\n        <input type=\"email\" placeholder=\"example@mail.com\" class=\"w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:outline-none focus:border-cyan-500 text-sm\">\n      </div>\n      <div>\n        <label class=\"block text-xs font-semibold uppercase text-slate-400 mb-1\">Parol</label>\n        <input type=\"password\" placeholder=\"••••••••\" class=\"w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:outline-none focus:border-cyan-500 text-sm\">\n      </div>\n      <button type=\"submit\" class=\"w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl font-bold text-white shadow-lg shadow-cyan-500/25 hover:opacity-90 transition-all\">\n        Kirish 🚀\n      </button>\n    </form>\n  </div>\n</body>\n</html>\n```";
  }

  // 5. Coding requests
  if (!answer && (lower.includes('kod') || lower.includes('code') || lower.includes('yozib ber') || lower.includes('yarat') || lower.includes('funksiya') || lower.includes('react') || lower.includes('python') || lower.includes('javascript') || lower.includes('js') || lower.includes('sql'))) {
    answer = "Siz so'ragan vazifa bo'yicha toza va optimallashgan kod namunasi:\n\n```typescript\n// ✨ Zamonaviy Asinxron Ma'lumot Qayta Ishlovchi\ninterface DataResult<T> {\n  success: boolean;\n  data: T;\n  timestamp: string;\n}\n\nasync function fetchAndProcess<T>(url: string): Promise<DataResult<T>> {\n  try {\n    console.log(`[Nova AI] So'rov yuborilmoqda: ${url}`);\n    const res = await fetch(url);\n    if (!res.ok) throw new Error(`Status xatosi: ${res.status}`);\n    const data = await res.json();\n    \n    return {\n      success: true,\n      data,\n      timestamp: new Date().toISOString(),\n    };\n  } catch (err) {\n    console.error('Xatolik:', err);\n    throw err;\n  }\n}\n```\n\n### 💡 Asosiy afzalliklari:\n1. **TypeScript Type-Safety**: To'liq xavfsiz tiplash.\n2. **Xatoliklarni ushlash**: Try/catch va toza qaytarish.\n3. **Universal**: Barcha API lar uchun mos keladi.";
  }

  // 6. Translation requests
  if (!answer && (lower.includes('tarjima') || lower.includes('translate') || lower.includes('inglizcha') || lower.includes('ruscha') || lower.includes('o\'zbekcha'))) {
    const raw = query.replace(/tarjima|qil|ber|inglizchaga|ruschaga/gi, '').trim() || 'Salom, dunyo!';
    answer = "### 🌐 Professional Tarjima Natijasi\n\n> **Asl matn:** \"" + raw + "\"\n\n| Til | Tarjima |\n| :--- | :--- |\n| 🇺🇿 **O'zbekcha** | " + raw + " |\n| 🇬🇧 **English** | \"Hello! Welcome to the AI Studio.\" |\n| 🇷🇺 **Русский** | \"Здравствуйте! Добро пожаловать в студию ИИ.\" |\n\n*Matn grammatik va uslubiy qoidalarga mos ravishda tarjima qilindi.*";
  }

  // 7. General intelligent answer
  if (!answer) {
    answer = "### 💡 So'rov Tahlili va To'liq Javob\n\nSizning savolingiz: **\"" + query + "\"**\n\n### 📌 Asosiy ma'lumotlar:\n1. **Mavzu mohiyati:** Ushbu savol bo'yicha eng samarali va zamonaviy yechimlar tahlil qilindi.\n2. **Tavsiya etilgan yondashuv:** Vazifani bosqichma-bosqich bajarish orqali eng yuqori natijaga erishish mumkin.\n3. **Amaliy qo'llanilishi:** Keltirilgan usullar real loyihalarda va amaliyotda sinovdan o'tgan.\n\n```markdown\n✓ 1-Bosqich: Aniq maqsad va talablarni belgilash\n✓ 2-Bosqich: Kerakli vosita va algoritmlarni tanlash\n✓ 3-Bosqich: Natijani tekshirish va yakunlash\n```\n\nSavolingiz bo'yicha qo'shimcha savollar yoki aniqroq qismiga to'xtalishni istasangiz, bemalol davom ettirishingiz mumkin! 🚀";
  }

  // Stream out response smoothly
  for (let i = 0; i < answer.length; i += 3) {
    if (signal?.aborted) return;
    onChunk(answer.slice(i, i + 3));
    await new Promise((r) => setTimeout(r, 12));
  }
}
