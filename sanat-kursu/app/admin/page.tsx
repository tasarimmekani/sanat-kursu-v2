"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // ŞİFRE: sanat123 (Burayı istediğin zaman değiştirebilirsin hocam)
    if (password === "sanat123") {
      localStorage.setItem("isLoggedIn", "true");
      // Şifre doğruysa ana sayfadaki ders programına gönderir
      router.push("/"); 
    } else {
      setError("Hatalı şifre! Lütfen tekrar deneyin.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 font-sans">
      <div className="bg-white p-10 rounded-2xl shadow-xl w-full max-w-md text-center border border-gray-200">
        <div className="mb-6">
          <div className="bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900">Yönetim Paneli</h1>
          <p className="text-gray-500 mt-2">Lütfen giriş şifresini yazınız</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <input
              type="password"
              placeholder="Giriş Şifresi"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <button
            type="submit"
            className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 active:scale-95 transition-all shadow-md"
          >
            Giriş Yap
          </button>
        </form>

        {error && (
          <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-200">
            <p className="text-red-600 text-sm font-semibold">{error}</p>
          </div>
        )}

        <div className="mt-8 text-sm text-gray-400">
          © 2026 Sanat Kursu v2 - Tüm Hakları Saklıdır
        </div>
      </div>
    </div>
  );
}