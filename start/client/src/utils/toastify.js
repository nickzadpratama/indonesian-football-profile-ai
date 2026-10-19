import Toastify from "toastify-js";
import "toastify-js/src/toastify.css";

const showToast = (message, background) => {
  return Toastify({
    text: message,
    duration: 3000,
    newWindow: true,
    close: true,
    gravity: "top",
    position: "right",
    stopOnFocus: true,
    style: {
      background,
      color: "#e2e8f0",
      border: "1px solid rgba(255, 255, 255, 0.15)",
      borderRadius: "12px",
      boxShadow: "0 12px 40px rgba(0, 0, 0, 0.55)",
    },
    onClick: function () {},
  }).showToast();
};

export const toastifyError = (message) =>
  showToast(message, "linear-gradient(135deg, #0f172a, #7f1d1d)");

export const toastifySuccess = (message) =>
  showToast(message, "linear-gradient(135deg, #064e3b, #0f172a)");
