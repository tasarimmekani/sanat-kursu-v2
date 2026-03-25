"use client";
export const dynamic = "force-dynamic"; // Vercel'in hafızayı temizlemesi için şart!

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleLogin = (e: any) => {
    e.preventDefault();
    if (password === 'sanat123') {
      alert("Giriş Başarılı!");
      // Giriş yapınca seni yoklama sayfasına atsın
      router.push('/attendance'); 
    } else {
      alert('Hatalı Şifre!');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl w-full max-w-md border-4 border-rose-500 text-black text-center">
        <h1 className="text-3xl font-black mb-2 uppercase italic text-slate-800">YÖNETİM GİRİŞİ</h1>
        <p className="text-slate-500 mb-8 font-bold text-lg">Lütfen şifreyi giriniz</p>
        
        <form onSubmit={handleLogin} className="space-y-6">
          <input
            type="password"
            placeholder="Şifre..."
            className="w-full p-5 rounded-2xl bg-slate-50 border-2 border-slate-200 font-black text-black text-center focus:outline-none focus:ring-4 focus:ring-rose-200 transition-all text-2xl"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="submit"
            className="w-full bg-rose-600 text-white p-5 rounded-2xl font-black hover:bg-rose-700 shadow-xl transition-all text-2xl active:scale-95"
          >
            GİRİŞ YAP 🚀
          </button>
        </form>
      </div>
    </div>
  );
}