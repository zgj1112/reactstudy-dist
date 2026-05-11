import { useEffect, useMemo, useRef, useState } from "react";
import { requestAssistantReply, type ChatMessage } from "@api/aiAssistant";
import "./AIAssistant.css";

type SpeechRecognitionConstructor = new () => SpeechRecognition;

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

const quickPrompts = [
  "帮我设计一个前端智能助理模块",
  "告诉我这个项目如何继续接入 AI 功能",
  "帮我写一个带上下文记忆的聊天组件方案",
];

const initialMessage: ChatMessage = {
  role: "assistant",
  content:
    "你好，我是首页智能助理。现在这个模块已经改成 TypeScript 版本，并且可以直接在前端调用模型。",
};

function AIAssistant() {
  const [messages, setMessages] = useState<ChatMessage[]>([initialMessage]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const SpeechRecognitionAPI = useMemo(
    () =>
      typeof window === "undefined"
        ? undefined
        : window.SpeechRecognition || window.webkitSpeechRecognition,
    []
  );

  useEffect(() => {
    setSpeechSupported(Boolean(SpeechRecognitionAPI));

    if (!SpeechRecognitionAPI) {
      return;
    }

    const recognition = new SpeechRecognitionAPI();
    recognition.lang = "zh-CN";
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0]?.transcript ?? "")
        .join("");

      setInputValue(transcript.trim());
    };

    recognition.onerror = (event) => {
      setIsListening(false);
      setError(`语音识别失败：${event.error}`);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
      recognitionRef.current = null;
    };
  }, [SpeechRecognitionAPI]);

  const sendMessage = async (preset?: string) => {
    const content = (preset ?? inputValue).trim();
    if (!content || loading) {
      return;
    }

    const history = [...messages];
    const userMessage: ChatMessage = { role: "user", content };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setLoading(true);
    setError("");

    try {
      const reply = await requestAssistantReply(content, history);
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch (requestError) {
      const nextError =
        requestError instanceof Error ? requestError.message : "请求失败";
      setError(nextError);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "连接模型失败，请检查网络、接口地址或环境变量配置。",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement> = (
    event
  ) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void sendMessage();
    }
  };

  const toggleListening = () => {
    if (!recognitionRef.current || loading) {
      return;
    }

    setError("");

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    try {
      recognitionRef.current.start();
      setIsListening(true);
    } catch {
      setError("语音识别启动失败，请确认浏览器已授权麦克风权限。");
      setIsListening(false);
    }
  };

  return (
    <section className="ai-assistant">
      <div className="ai-assistant__panel">
        <div className="ai-assistant__messages">
          {messages.map((message, index) => (
            <div
              key={`${message.role}-${index}`}
              className={`ai-assistant__message ai-assistant__message--${message.role}`}
            >
              <span className="ai-assistant__role">
                {message.role === "user" ? "你" : "助手"}
              </span>
              <p>{message.content}</p>
            </div>
          ))}
          {loading && (
            <div className="ai-assistant__message ai-assistant__message--assistant">
              <span className="ai-assistant__role">助手</span>
              <p>正在思考中...</p>
            </div>
          )}
        </div>

        <div className="ai-assistant__actions">
          {quickPrompts.map((prompt) => (
            <button
              key={prompt}
              type="button"
              className="ai-assistant__chip"
              onClick={() => sendMessage(prompt)}
              disabled={loading}
            >
              {prompt}
            </button>
          ))}
        </div>

        <div className="ai-assistant__composer">
          <textarea
            rows={4}
            value={inputValue}
            onChange={(event) => setInputValue(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="输入你的问题，按 Enter 发送，Shift + Enter 换行"
          />
          <div className="ai-assistant__toolbar">
            <button
              type="button"
              className={`ai-assistant__voice ${
                isListening ? "ai-assistant__voice--active" : ""
              }`}
              onClick={toggleListening}
              disabled={!speechSupported || loading}
              title={
                speechSupported
                  ? "点击开始语音输入"
                  : "当前浏览器不支持语音识别"
              }
            >
              {isListening ? "停止录音" : "语音输入"}
            </button>
            <button
              type="button"
              className="ai-assistant__ghost"
              onClick={() => {
                setMessages([initialMessage]);
                setError("");
                setInputValue("");
              }}
              disabled={loading}
            >
              清空对话
            </button>
            <button
              type="button"
              className="ai-assistant__submit"
              onClick={() => sendMessage()}
              disabled={loading}
            >
              {loading ? "发送中..." : "发送"}
            </button>
          </div>
          <div className="ai-assistant__hint">
            {speechSupported
              ? "支持语音识别，推荐使用 Chrome 或 Edge。"
              : "当前浏览器不支持语音识别，可继续使用文本输入。"}
          </div>
          {error && <div className="ai-assistant__error">{error}</div>}
        </div>
      </div>
    </section>
  );
}

export default AIAssistant;
