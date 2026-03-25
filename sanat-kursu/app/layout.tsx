"use client";
import '@/app/globals.css';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Calendar, Users, GraduationCap, BookOpen, Wallet, UserCheck } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const menuItems = [
    { name: 'Panel', path: '/admin', icon: <Home size={18} /> }, 
    { name: 'Program', path: '/admin/program', icon: <Calendar size={18} /> },
    { name: 'Öğrenciler', path: '/admin/students', icon: <Users size={18} /> },
    { name: 'Hocalar', path: '/admin/teachers', icon: <GraduationCap size={18} /> },
    { name: 'Kurslar', path: '/admin/courses', icon: <BookOpen size={18} /> },
    { name: 'Ödemeler', path: '/admin/payments', icon: <Wallet size={18} /> },
    { name: 'Yoklama', path: '/admin/attendance', icon: <UserCheck size={18} /> },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-200 p-4 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex gap-2 md:gap-4 overflow-x-auto pb-2 no-scrollbar">
            {menuItems.map((item) => (
              <Link 
                key={item.path} 
                href={item.path}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs transition-all whitespace-nowrap ${
                  pathname === item.path 
                  ? 'bg-purple-600 text-white shadow-lg' 
                  : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                {item.icon} {item.name}
              </Link>
            ))}
          </div>
          <div className="hidden lg:block font-black text-purple-600 italic uppercase text-sm">Sanat Mekanı</div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto p-4 md:p-8">{children}</main>
    </div>
  );
}