import ChatBotWidget from "../components/ChatBotWidget";

export default function BotDemoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Demo ChatBot Widget
          </h1>
          <p className="text-gray-600 text-lg">
            Klik tombol di pojok kanan bawah untuk membuka chatbot
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Cara Penggunaan</h2>
          <ul className="space-y-3 text-gray-600">
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-medium flex-shrink-0">1</span>
              <span>Klik tombol pesan di pojok kanan bawah</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-medium flex-shrink-0">2</span>
              <span>Ketik pesan Anda di kolom input</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-medium flex-shrink-0">3</span>
              <span>Tekan Enter atau klik tombol kirim</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-medium flex-shrink-0">4</span>
              <span>Terima balasan dari assistant virtual</span>
            </li>
          </ul>
        </div>

        <div className="mt-8 p-6 bg-indigo-50 rounded-xl border border-indigo-100">
          <h3 className="font-semibold text-indigo-800 mb-2">Tips Interaksi</h3>
          <p className="text-indigo-700 text-sm">
            Cobalah mengetik: "Halo", "Siapa kamu?", "Tolong bantu saya", "Jam berapa sekarang?", atau "Tanggal hari ini"
          </p>
        </div>

        <ChatBotWidget />
      </div>
    </div>
  );
}
