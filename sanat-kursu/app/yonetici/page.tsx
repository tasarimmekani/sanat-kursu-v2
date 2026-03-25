"use client";
// Bu iki satır sayfanın her zaman taze kalmasını sağlar
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleLogin = (e: any) => {
    e.preventDefault();
    if (password === 'sanat123') {
      alert("Giriş Başarılı!");
      router.push('/attendance'); 
    } else {
      alert('Hatalı Şifre!');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md text-black border-4 border-blue-500">
        <h1 className="text-2xl font-bold text-center mb-6">YÖNETİCİ GİRİŞİ</h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="password"
            placeholder="Şifreyi Girin"
            className="w-full p-4 rounded-xl border-2 border-gray-200 focus:border-blue-500 outline-none text-black"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit" className="w-full bg-blue-600 text-white p-4 rounded-xl font-bold hover:bg-blue-700">
            SİSTEME GİRİŞ
          </button>
        </form>
      </div>
    </div>
  );
}