export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface ChatCompletionChoice {
  message?: {
    content?: string;
  };
}

interface ChatCompletionResponse {
  choices?: ChatCompletionChoice[];
  error?: {
    message?: string;
  };
}

const AI_BASE_URL = "https://ark.cn-beijing.volces.com/api/v3";
const AI_MODEL = "deepseek-v3-2-251201";
const AI_SYSTEM_PROMPT =
  "你是一个中文智能前端助理，帮助用户完成 React、TypeScript、交互设计和页面集成相关任务。回答要简洁、专业、可执行。";

export async function requestAssistantReply(
  userInput: string,
  history: ChatMessage[] = []
) {
  const apiKey = import.meta.env.VITE_AI_API_KEY?.trim();
  const baseUrl = import.meta.env.VITE_AI_BASE_URL?.trim() || AI_BASE_URL;
  const model = import.meta.env.VITE_AI_MODEL?.trim() || AI_MODEL;
  const systemPrompt =
    import.meta.env.VITE_AI_SYSTEM_PROMPT?.trim() || AI_SYSTEM_PROMPT;

  if (!apiKey) {
    throw new Error("缺少 VITE_AI_API_KEY，请在 .env.local 或部署平台环境变量中配置。");
  }

  const response = await fetch(`${baseUrl.replace(/\/+$/, "")}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        ...history,
        { role: "user", content: userInput },
      ],
      temperature: 0.7,
    }),
  });

  const data = (await response.json()) as ChatCompletionResponse;

  if (!response.ok) {
    throw new Error(data.error?.message || `AI 请求失败: ${response.status}`);
  }

  const reply = data.choices?.[0]?.message?.content?.trim();

  if (!reply) {
    throw new Error("模型返回为空，请稍后重试。");
  }

  return reply;
}
