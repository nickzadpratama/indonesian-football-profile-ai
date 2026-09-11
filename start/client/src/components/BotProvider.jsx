import { useEffect } from "react";
import ChatBotWidget from "./ChatBotWidget";
import "./ChatBotWidget.css";

/**
 * BotProvider - Komponen wrapper yang menambahkan chatbot ke aplikasi tanpa memodifikasi source code.
 * Cukup import dan wrap dengan komponen ini pada halaman yang ingin ditambahkan chatbot.
 */
export default function BotProvider({ children }) {
  return (
    <>
      {children}
      <ChatBotWidget />
    </>
  );
}

/**
 * Contoh penggunaan di halaman:
 * 
 * import BotProvider from "../components/BotProvider";
 * 
 * function HalamanSaya() {
 *   return (
 *     <BotProvider>
 *      <div>Konten halaman...</div>
 *     </BotProvider>
 *   );
 * }
 */
