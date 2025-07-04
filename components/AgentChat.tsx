import React, { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaExpand, FaCompress, FaRobot, FaUser } from "react-icons/fa";

// Message类型定义
export type Message = { role: "user" | "assistant"; content: string };

type AgentChatProps = {
  fullScreen: boolean;
  onToggleFull: () => void;
};

const INIT_MESSAGE: Message = {
  role: "assistant",
  content: "您好，我是数字孪生助手，请问需要了解哪部分城市信息？",
};

const AVATAR = {
  assistant: (
    <div className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-700/80 shadow">
      <FaRobot className="text-white text-xl" />
    </div>
  ),
  user: (
    <div className="w-8 h-8 flex items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-blue-700 shadow">
      <FaUser className="text-white text-xl" />
    </div>
  ),
};

const bubbleBase =
  "px-4 py-2 rounded-2xl max-w-[80%] whitespace-pre-line text-sm shadow transition-all";
const bubbleUser =
  "bg-gradient-to-br from-blue-600 to-blue-400 text-white ml-auto";
const bubbleAssistant =
  "bg-white/10 text-white border border-blue-900/30 backdrop-blur";

const chatBoxBase =
  "backdrop-blur-md bg-white/10 border border-blue-900/30 shadow-2xl rounded-3xl flex flex-col w-full h-full";
const inputBase =
  "flex-1 px-4 py-2 rounded-full border border-gray-700 bg-black/60 shadow focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-white placeholder-gray-400";
const sendBtnBase =
  "ml-2 px-4 py-2 rounded-full flex items-center justify-center bg-blue-600 text-white shadow hover:bg-blue-700 transition disabled:opacity-50";

const scrollArea =
  "flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-blue-900 scrollbar-track-transparent";

const FLOOD_KEYWORD = "防汛简报";
const FLOOD_DOC_URL = "/docs/flood_report.pdf";

const AgentChat: React.FC<AgentChatProps> = ({ fullScreen, onToggleFull }) => {
  const [messages, setMessages] = useState<Message[]>([INIT_MESSAGE]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [typing, setTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMsg: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    setTyping(true);

    // 特殊关键词逻辑
    if (input.includes(FLOOD_KEYWORD)) {
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "",
          },
        ]);
        setTyping(false);
        setLoading(false);
      }, 600);
      return;
    }

    try {
      const res = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMsg] }),
      });
      if (!res.ok) throw new Error('API error');
      const data = await res.json();
      const reply = data.reply;
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: reply },
        ]);
        setTyping(false);
      }, Math.max(600, Math.min(reply.length * 30, 3000)));
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "抱歉，服务暂时不可用。" },
      ]);
      setTyping(false);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSend();
  };

  // 聊天气泡渲染
  const renderBubble = (msg: Message, idx: number) => {
    // 特殊：防汛简报按钮
    if (
      msg.role === "assistant" &&
      messages[idx - 1]?.role === "user" &&
      messages[idx - 1]?.content?.includes(FLOOD_KEYWORD)
    ) {
      return (
        <div className="flex items-end gap-2 justify-start">
          {AVATAR.assistant}
          <div className={`${bubbleBase} ${bubbleAssistant} flex items-center`}>
            <a
              href={FLOOD_DOC_URL}
              download
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
            >
              下载防汛简报
            </a>
          </div>
        </div>
      );
    }

    return (
      <div
        className={`flex items-end gap-2 ${
          msg.role === "user" ? "justify-end" : "justify-start"
        }`}
      >
        {msg.role === "assistant" && AVATAR.assistant}
        <div
          className={`${bubbleBase} ${
            msg.role === "user" ? bubbleUser : bubbleAssistant
          }`}
        >
          {msg.content}
        </div>
        {msg.role === "user" && AVATAR.user}
      </div>
    );
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ scale: 0.98, opacity: 0.7 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.98, opacity: 0.7 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={`$${
          fullScreen
            ? "fixed inset-0 z-40 flex items-center justify-center bg-black/90"
            : "relative z-20 h-full"
        }`}
        style={{ minWidth: 320, minHeight: 400, height: "100%" }}
      >
        <div
          className={`${chatBoxBase} flex flex-col h-full w-full max-w-3xl transition-all duration-500`}
        >
          {/* 顶部栏 */}
          <div className="flex items-center justify-between px-6 py-3 border-b border-blue-900/30">
            <div className="font-bold text-lg text-white tracking-wide flex items-center gap-2">
              <FaRobot className="text-blue-400" />
              数字孪生助手
            </div>
            <button
              className="p-2 rounded-full hover:bg-blue-900/30 transition"
              onClick={onToggleFull}
              aria-label={fullScreen ? "缩小" : "放大"}
            >
              {fullScreen ? (
                <FaCompress className="text-white text-lg" />
              ) : (
                <FaExpand className="text-white text-lg" />
              )}
            </button>
          </div>
          {/* 聊天内容 */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-blue-900 scrollbar-track-transparent">
            {messages.map((msg, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
              >
                {renderBubble(msg, idx)}
              </motion.div>
            ))}
            {/* 打字动画 */}
            {typing && (
              <div className="flex items-end gap-2 justify-start">
                {AVATAR.assistant}
                <div
                  className={`${bubbleBase} ${bubbleAssistant} flex items-center`}
                >
                  <span className="animate-pulse">正在输入…</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          {/* 输入区 */}
          <div className="p-4 border-t border-blue-900/30 flex items-center bg-black/60 rounded-b-3xl">
            <input
              className={inputBase}
              type="text"
              placeholder="请输入您的问题…"
              value={input}
              disabled={loading}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
            />
            <motion.button
              className={sendBtnBase}
              onClick={handleSend}
              disabled={loading || !input.trim()}
              whileTap={{ scale: 0.92 }}
              animate={loading ? { opacity: 0.6 } : { opacity: 1 }}
              transition={{ duration: 0.2 }}
              aria-label="发送"
            >
              {loading ? (
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8z"
                  />
                </svg>
              ) : (
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 12h14M12 5l7 7-7 7"
                  />
                </svg>
              )}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AgentChat; 