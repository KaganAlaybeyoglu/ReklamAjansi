export interface AiAdvertRequest {
  campaignName: string;
  clientName?: string;
  campaignDescription?: string;
  format: string;
  language?: 'tr' | 'en' | 'both';
}

export interface AiAdvertIdea {
  title: string;
  description: string;
}

export interface AiAdvertRequest {
  campaignName: string;
  clientName?: string;
  campaignDescription?: string;
  format: string;
  language?: 'tr' | 'en' | 'both';
}

export interface AiAdvertIdea {
  title: string;
  description: string;
}

export async function generateAdvertIdea(req: AiAdvertRequest): Promise<AiAdvertIdea> {
  const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
  const model = import.meta.env.VITE_OPENROUTER_MODEL || "openai/gpt-4o-mini";

  if (!apiKey) {
    throw new Error("OpenRouter API key is not configured.");
  }

  const prompt = `
Sen bir reklam ajansında kıdemli kreatif direktörsün.
Aşağıdaki bilgilerle bir reklam fikri üret:

MÜŞTERİ: ${req.clientName || "Bilinmiyor"}
KAMPANYA: ${req.campaignName}
AÇIKLAMA: ${req.campaignDescription || "Yok"}
FORMAT: ${req.format}

Lütfen aşağıdaki gibi GERÇEK geçerli JSON formatında dön:

{
  "title": "Başlık",
  "description": "Açıklama"
}

Sakın başka açıklama ekleme. Sadece JSON ver.
`.trim();

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": window.location.origin,
      "X-Title": "Agency Manager"
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: "system",
          content: "Sadece geçerli JSON döndür. JSON dışında hiçbir metin ekleme."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7
    })
  });

  const data = await response.json();
  const content: string = data?.choices?.[0]?.message?.content || "";

  
  try {
    return JSON.parse(content);
  } catch (_) {
  }

  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[0]);
    } catch (err) {
      console.error("JSON parse fallback failed:", err, content);
    }
  }

  console.error("AI raw output:", content);
  throw new Error("AI geçerli JSON üretmedi.");
}
