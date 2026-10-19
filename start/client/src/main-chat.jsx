import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import store from "./app/store.js";
import ChatBotWidget from "./components/ChatBotWidget.jsx";

const container = document.getElementById("root");
const root = createRoot(container);

root.render(
  <StrictMode>
    <Provider store={store}>
      <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)", padding: "24px" }}>
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "64px" }}>
            <h1 style={{ fontSize: "36px", fontWeight: "bold", marginBottom: "16px", background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              ChatBot Sepak Bola Indonesia
            </h1>
            <p style={{ color: "#6b7280", fontSize: "18px" }}>
              Klik tombol di pojok kanan bawah untuk membuka chatbot
            </p>
          </div>
          <ChatBotWidget />
        </div>
      </div>
    </Provider>
  </StrictMode>
);
