import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import ChatBotSimple from "./components/ChatBotSimple.jsx";
import "./components/ChatBotWidget.css";

const container = document.getElementById("root");
const root = createRoot(container);

root.render(
  <StrictMode>
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)", padding: "24px" }}>
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "64px" }}>
          <h1 style={{ fontSize: "36px", fontWeight: "bold", marginBottom: "16px", background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            ChatBot Interaktif
          </h1>
          <p style={{ color: "#6b7280", fontSize: "18px" }}>
            Klik tombol di pojok kanan bawah untuk membuka chatbot
          </p>
        </div>
        <ChatBotSimple />
      </div>
    </div>
  </StrictMode>
);
