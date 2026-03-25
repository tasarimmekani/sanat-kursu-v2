"use client";
import Link from "next/link";
import { BookOpen, Users, Calendar, GraduationCap, Wallet, UserCheck } from "lucide-react";

export default function AdminDashboard() {
  const menuItems = [
    { name: "Kurs Yönetimi", href: "/admin/courses", icon: <BookOpen size={40}/>, color: "bg-blue-500" },
    { name: "Haftalık Program", href: "/admin/program", icon: <Calendar size={40}/>, color: "bg-green-500" },
    { name: "Hoca Listesi", href: "/admin/teachers", icon: <GraduationCap size={40}/>, color: "bg-orange-500" },
    { name: "Öğrenci Kayıt", href: "/admin/students", icon: <Users size={40}/>, color: "bg-purple-500" },
    { name: "Ödeme Takibi", href: "/admin/payments", icon: <Wallet size={40}/>, color: "bg-emerald-500" },
    { name: "Yoklama Sistemi", href: "/admin/attendance", icon: <UserCheck size={40}/>, color: "bg-rose-500" },
  ];

  return (
    <div className="py-12 flex flex-col items-center">
      <h1 className="text-4xl font-black text-slate-800 mb-2 italic uppercase">Sanat Kursu Panel</h1>
      <p className="text-slate-500 mb-12 font-medium tracking-tight">Merkezinizdeki tüm süreçleri buradan yönetin</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-6xl px-4">
        {menuItems.map((item) => (
          <Link key={item.href} href={item.href} className="group">
            <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100 hover:shadow-2xl hover:-translate-y-2 transition-all flex flex-col items-center text-center">
              <div className={`${item.color} text-white p-6 rounded-[1.5rem] mb-6 group-hover:rotate-6 transition-transform shadow-xl`}>
                {item.icon}
              </div>
              <span className="font-black text-slate-700 text-xl uppercase italic tracking-tighter">{item.name}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}