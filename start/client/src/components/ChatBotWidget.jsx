import { useState, useRef, useEffect, useCallback } from "react";
import "./ChatBotWidget.css";
import { useDispatch, useSelector } from "react-redux";
import { fetchAI } from "../features/gemini/geminiSlice";

const WELCOME_MESSAGE = {
  id: "welcome",
  text: "Halo! Saya assistant virtual sepak bola Indonesia. Ada yang bisa saya bantu?",
  sender: "bot",
  timestamp: new Date(),
};

export default function ChatBotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const { loading, error } = useSelector((state) => state.gemini);
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [inputValue, setInputValue] = useState("");
  const isProcessing = loading;
  const messagesEndRef = useRef(null);
  const nextMessageId = useRef(1);
  const dispatch = useDispatch();

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || isProcessing) return;
    const userText = inputValue.trim();
    setMessages((prev) => [
      ...prev,
      {
        id: `user-${nextMessageId.current++}`,
        text: userText,
        sender: "user",
        timestamp: new Date(),
      },
    ]);
    setInputValue("");

    const result = await dispatch(fetchAI(userText));

    setMessages((prev) => [
      ...prev,
      {
        id: `bot-${nextMessageId.current++}`,
        text: result.message,
        sender: "bot",
        timestamp: new Date(),
        isError: !result.ok,
      },
    ]);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const formatTime = (d) =>
    d.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });

  const resetMessages = () => {
    nextMessageId.current = 1;
    setMessages([{ ...WELCOME_MESSAGE, timestamp: new Date() }]);
    setInputValue("");
  };

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
              <span className={`bot-status${error ? " error" : ""}`}>
                <span className="bot-dot" />
                {error ? "Tidak tersedia" : isProcessing ? "Menjawab..." : "Online"}
              </span>
            </div>
            <div className="bot-actions">
              <button
                type="button"
                className="bot-action-btn"
                onClick={resetMessages}
                title="Reset"
                aria-label="Reset percakapan"
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
            <div className="bot-messages" aria-live="polite">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={
                    "bot-message " + (m.sender === "user" ? "user" : "bot")
                  }
                >
                  <div className={`bot-bubble${m.isError ? " bot-error" : ""}`}>
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
            <form className="bot-form" onSubmit={handleSubmit}>
              <input
                type="text"
                className="bot-input text-black"
                placeholder="Ketik pesan..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                disabled={isProcessing}
                maxLength={500}
              />
              <button
                type="submit"
                className="bot-send"
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
