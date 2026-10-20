import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { API_BASE_URL } from "../../api/auth.js";
import { clearToken, getToken, isTokenValid } from "../../auth/session.js";

const initialState = {
  data: "",
  loading: false,
  error: "",
};

export const geminiSlice = createSlice({
  name: "gemini",
  initialState,
  reducers: {
    fetchPending: (state) => {
      state.loading = true;
      state.error = initialState.error;
    },
    fetchSuccess: (state, action) => {
      state.data = action.payload;
      state.loading = false;
      state.error = initialState.error;
    },
    fetchFailed: (state, action) => {
      state.error = action.payload;
      state.data = initialState.data;
      state.loading = false;
    },
  },
});

export const { fetchPending, fetchSuccess, fetchFailed } = geminiSlice.actions;

export const fetchAI = (input) => async (dispatch) => {
  const token = getToken();
  if (!isTokenValid(token)) {
    const message = "Silakan login untuk menggunakan chatbot.";
    dispatch(fetchFailed(message));
    return { ok: false, message, status: 401 };
  }
  const trimmedInput = input?.trim();

  if (!trimmedInput) {
    const message = "Pesan tidak boleh kosong.";
    dispatch(fetchFailed(message));
    return { ok: false, message };
  }

  try {
    dispatch(fetchPending());

    const result = await axios.get(`${API_BASE_URL}/genAI`, {
      params: { input: trimmedInput },
      headers: { Authorization: `Bearer ${token}` },
      timeout: 60000,
    });

    const reply =
      typeof result.data === "string" ? result.data.trim() : "";

    if (!reply) {
      throw new Error("AI tidak memberikan jawaban.");
    }

    if (getToken() !== token) return { ok: false, message: "Sesi telah berubah." };
    dispatch(fetchSuccess(reply));

    return { ok: true, message: reply };
  } catch (error) {
    const status = error.response?.status;
    let message = error.response?.data?.message || error.message;
    if (getToken() !== token) return { ok: false, message: "Sesi telah berubah." };
    if (status === 401) clearToken();

    if (status === 503) {
      message =
        error.response?.data?.message ||
        "Layanan AI sementara tidak tersedia. Silakan coba lagi nanti.";
    } else if (status === 400) {
      message = "Pesan tidak boleh kosong.";
    } else if (error.code === "ECONNABORTED") {
      message = "Layanan AI terlalu lama merespons. Silakan coba lagi.";
    } else if (!error.response) {
      message = "Tidak dapat terhubung ke layanan AI. Periksa koneksi Anda.";
    }

    dispatch(fetchFailed(message));
    return { ok: false, message, status };
  }
};

export const geminiReducer = geminiSlice.reducer;
