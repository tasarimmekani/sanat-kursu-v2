"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock } from 'lucide-react';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleLogin = (e: any) => {
    e.preventDefault();
    if (password === 'sanat123') {
      alert("Giriş Başarılı! Şimdi sisteme erişebilirsiniz.");
      router.push('/'); 
    } else {
      alert('Hatalı Şifre!');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl w-full max-w-md border border-slate-100 text-black">
        <div className="flex justify-center mb-6">
          <div className="bg-rose-100 p-4 rounded-full text-rose-600">
            <Lock size={40} />
          </div>
        </div>
        <h1 className="text-2xl font-black text-center text-slate-800 mb-2 uppercase italic">Yönetim Paneli</h1>
        <p className="text-center text-slate-500 mb-8 font-medium">Lütfen giriş şifresini yazın</p>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="password"
            placeholder="Şifre"
            className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 font-bold text-black focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="submit"
            className="w-full bg-rose-600 text-white p-4 rounded-2xl font-black hover:bg-rose-700 shadow-lg shadow-rose-100 transition-all"
          >
            GİRİŞ YAP
          </button>
        </form>
      </div>
    </div>
  );
}