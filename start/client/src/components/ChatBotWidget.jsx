import { useState, useRef, useEffect, useCallback } from "react";
import "./ChatBotWidget.css";
import { useDispatch, useSelector } from "react-redux";
import { fetchAI } from "../features/todo/todoSlice";

export default function ChatBotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const { todos, loading, error } = useSelector((state) => state.todo);
  const [messages, setMessages] = useState([
    {
      id: Date.now(),
      text: "Halo! Saya assistant virtual. Ada yang bisa saya bantu?",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef(null);
  const dispatch = useDispatch();

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(fetchAI(inputValue));
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const getBotReply = (msg) => {
    const lower = msg.toLowerCase().trim();
    if (lower.includes("halo") || lower.includes("hi") || lower.includes("hey"))
      return "Hai! Selamat datang! Apa yang bisa saya bantu hari ini?";
    if (lower.includes("nama") || lower.includes("siapa"))
      return "Saya assistant virtual yang siap membantu Anda!";
    if (lower.includes("bantu") || lower.includes("tolong"))
      return "Tentu! Silakan jelaskan apa yang ingin Anda tanya.";
    if (lower.includes("terima kasih"))
      return "Sama-sama! Senang bisa membantu Anda. 😊";
    if (lower.includes("jam"))
      return `Sekarang jam ${new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}.`;
    if (lower.includes("tanggal"))
      return `Hari ini tanggal ${new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}.`;
    const fallbacks = [
      "Menarik! Bisa dijelaskan lebih detail?",
      "Baik, saya catat. Ada lagi yang bisa saya bantu?",
      "Saya mengerti. Mohon maaf jika saya tidak bisa menjawab secara spesifik.",
      "Terima kasih atas pertanyaannya! Ada hal lain?",
      "Baiklah, silakan lanjutkan...",
    ];
    return fallbacks[Math.floor(Math.random() * fallbacks.length)];
  };

  const formatTime = (d) =>
    d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });

  return (
    <>
      <button
        type="button"
        className="bot-toggle"
        onClick={() => setIsOpen((v) => !v)}
        aria-label={isOpen ? "Tutup" : "Buka"}
      >
        {isOpen ? (
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        ) : (
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        )}
      </button>
      {isOpen && (
        <div className="bot-popup" role="dialog" aria-label="Chatbot">
          <div className="bot-header">
            <div>
              <span className="bot-title">Assistant</span>
              <span className="bot-status">
                <span className="bot-dot" />
                Online
              </span>
            </div>
            <div className="bot-actions">
              <button
                type="button"
                className="bot-action-btn"
                onClick={() =>
                  setMessages([
                    {
                      id: Date.now(),
                      text: "Halo! Saya assistant virtual. Ada yang bisa saya bantu?",
                      sender: "bot",
                      timestamp: new Date(),
                    },
                  ])
                }
                title="Reset"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                  <path d="M3 3v5h5" />
                </svg>
              </button>
              <button
                type="button"
                className="bot-close"
                onClick={() => setIsOpen(false)}
                aria-label="Tutup"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
            </div>
          </div>
          <div className="bot-body">
            <div className="bot-messages">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={
                    "bot-message " + (m.sender === "user" ? "user" : "bot")
                  }
                >
                  <div className="bot-bubble">
                    <p className="bot-text">{m.text}</p>
                    <span className="bot-time">{formatTime(m.timestamp)}</span>
                  </div>
                </div>
              ))}
              {isProcessing && (
                <div className="bot-message bot typing-indicator">
                  <div className="bot-bubble">
                    <div className="typing-dots">
                      <span />
                      <span />
                      <span />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>
          <div className="bot-footer">
            <form onSubmit={(e) => handleSubmit(e)}>
              <input
                type="text"
                className="bot-input text-black"
                placeholder="Ketik pesan..."
                onChange={(e) => setInputValue(e.target.value)}
                // onKeyDown={handleKeyDown}
                disabled={isProcessing}
                maxLength={500}
              />
              <button
                type="button"
                className="bot-send"
                // onClick={handleSend}
                disabled={!inputValue.trim() || isProcessing}
                aria-label="Kirim"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 2 11 13" />
                  <path d="M22 2 15 22 8 10 11 2Z" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
