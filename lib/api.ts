export type Message = { role: "user" | "assistant"; content: string };

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";

function fallbackAgent(messages: Message[]): string {
  const last = messages.filter(m => m.role === "user").slice(-1)[0]?.content || "";
  if (/超图|SuperMap/i.test(last)) {
    return "超图是领先的地理信息系统（GIS）平台提供商，支持多种空间数据分析与可视化。";
  }
  if (/地理信息|GIS/i.test(last)) {
    return "地理信息系统（GIS）用于采集、存储、分析和展示地理空间数据。";
  }
  if (/你好|hi|hello/i.test(last)) {
    return "您好！很高兴为您服务。";
  }
  return "很抱歉，我暂时无法理解您的问题，但我会不断学习进步！";
}

export async function callAgent(messages: Message[]): Promise<string> {
  if (!OPENAI_API_KEY) {
    return fallbackAgent(messages);
  }
  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages,
        temperature: 0.5,
        max_tokens: 512,
      }),
    });
    if (!res.ok) throw new Error("OpenAI API error");
    const data = await res.json();
    return data.choices?.[0]?.message?.content?.trim() || "抱歉，未获取到有效回复。";
  } catch (e) {
    return "抱歉，服务暂时不可用。";
  }
} 