import { useEffect, useRef, useState } from "react"
import { useSelector } from "react-redux"

const CHATBOT_WELCOME = "Hi! Saya asisten tim bola. Tanya tentang klub, pemain, atau statistik."



  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open])

  const toggle = () => setOpen((prev) => !prev)

  const send = () => {
    const text = draft.trim()
    if (!text) return
    setDraft("")
    setMessages((prev) => [...prev, { role: "user", text }])
    setTyping(true)
    setTimeout(() => {
      const answer = answerFor(text)
      addBotMessage(answer)
      setTyping(false)
    }, 500 + Math.random() * 500)
  }

  const answerFor = (text) => {
    const lower = text.toLowerCase()
    if (lower.includes("klub") || lower.includes("provinsi") || lower.includes("indonesia")) {
      return "Tim Indonesia tersedia di halaman Teams (filter Indonesia). Kamu bisa klik klub untuk melihat skuad."
    }
    if (lower.includes("pemain") || lower.includes("squad") || lower.includes("skuad") || lower.includes("tim")) {
      return "Buka halaman klub yang kamu inginkan, lalu klik nama pemain untuk melihat profil & statistik per musim."
    }
    if (lower.includes("statistik") || lower.includes("angka") || lower.includes("data") || lower.includes("hitungan")) {
      return "Di halaman profil pemain, kamu bisa ganti musim pakai penggeser di bawah banner. Statistik tercantum per musim yang kamu pilih."
    }
    if (lower.includes("musim") || lower.includes("season") || lower.includes("tahun")) {
      return "Hanya musim yang tersedia di layar yang bisa dipilih. Fitur ini belum mendukung musim 2025, silakan pilih musim lain yang tersedia."
    }
    if (lower.includes("admin") || lower.includes("bantuan") || lower.includes("help") || lower.includes("tolong")) {
      return "Tentu, ketik pertanyaanmu. Jika masih butuh bantuan, kamu bisa kunjungi tautan support."
    }
    return "Maaf, aku belum paham. Coba yang lain atau ketik 'admin' dan 'bantuan'."
  }

const quickOptions = [
  { label: "⚽ Klub Indonesia", payload: "Daftar klub Indonesia di halaman Teams (Indonesia)." },
  { label: "📊 Cara baca statistik", payload: "Statistik pemain mencakup Innings, Menit, Tendangan, Tawuran, Kartu, Ganti, Tendangan Tidak Valid, dan Skor untuk musim yang dipilih." },
  { label: "⚽ Kapan musim tersedia?", payload: "Fitur ini belum mendukung musim 2025. Silakan pilih 2024 atau musim lain yang tersedia." },
]
