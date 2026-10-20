import ChatBotWidget from "./ChatBotWidget";
import "./ChatBotWidget.css";

export default function BotProvider({ children }) {
  return (
    <>
      {children}
      <ChatBotWidget />
    </>
  );
}
