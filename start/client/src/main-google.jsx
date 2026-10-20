import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "toastify-js/src/toastify.css";
import "./index.css";
import { Provider } from "react-redux";
import { GoogleOAuthProvider } from "@react-oauth/google";
import store from "./app/store";
import GoogleJoinDemoPage from "./pages/GoogleJoinDemoPage.jsx";

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
