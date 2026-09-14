import Toastify from "toastify-js";
import "toastify-js/src/toastify.css";

export const toastifyError = (message) => {
  return Toastify({
    text: message,
    duration: 3000,
    newWindow: true,
    close: true,
    gravity: "bottom", // `top` or `bottom`
    position: "right", // `left`, `center` or `right`
    stopOnFocus: true,
    style: {
      background: "#34D399",
      color: "black",
    },
    onClick: function () {}, // Callback after click
  }).showToast();
};
