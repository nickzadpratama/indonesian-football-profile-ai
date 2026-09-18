/**
 * ============================================================================
 * main-google.jsx — entry demo GoogleOAuthProvider  (FILE BARU)
 * ============================================================================
 * FILE BARU — tidak mengubah satu baris pun source code aplikasi
 * (main.jsx, App.jsx, LoginPage.jsx, server, dll. dibiarkan utuh 100%).
 *
 * Susunan provider SAMA PERSIS dengan pola src/main.jsx:
 *
 *   <GoogleOAuthProvider clientId="...">
 *     <Provider store={store}>
 *       <App />
 *     </Provider>
 *   </GoogleOAuthProvider>
 *
 * Cara mencoba (tanpa mengubah file apa pun):
 *   1. cd start/client && npm run dev
 *   2. Buka http://localhost:5173/google-login.html
 *      (Vite dev server otomatis melayani file .html tambahan di root)
 *
 * Isi halaman ada di src/pages/GoogleJoinDemoPage.jsx (tombol GoogleLogin,
 * kirim credential ke server, lalu tampilkan JoinClubsPage berisi postJoin
 * dan tampilan data berjalan).
 * ============================================================================
 */

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "toastify-js/src/toastify.css";
import "./index.css";
import { Provider } from "react-redux";
import { GoogleOAuthProvider } from "@react-oauth/google";
import store from "./app/store";
import GoogleJoinDemoPage from "./pages/GoogleJoinDemoPage.jsx";

// Client ID yang sama dengan yang dipakai di src/main.jsx
const GOOGLE_CLIENT_ID =
  "778334040842-f1npb34334aearksr30upc1prhv6scbd.apps.googleusercontent.com";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <Provider store={store}>
        <GoogleJoinDemoPage />
      </Provider>
    </GoogleOAuthProvider>
  </StrictMode>,
);
