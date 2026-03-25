"use client";
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { GraduationCap, Plus, Trash2, Phone } from 'lucide-react';

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTeacher, setNewTeacher] = useState({ name: '', branch: '', phone: '' });

  const fetchTeachers = async () => {
    const { data, error } = await supabase.from('teachers').select('*').order('name');
    if (!error) setTeachers(data || []);
  };

  useEffect(() => { fetchTeachers(); }, []);

  const deleteTeacher = async (id: string) => {
    if (confirm("Hoca kaydını silmek istediğinize emin misiniz?")) {
      const { error } = await supabase.from('teachers').delete().eq('id', id);
      if (!error) fetchTeachers();
    }
  };

  const handleSave = async () => {
    const { error } = await supabase.from('teachers').insert([newTeacher]);
    if (!error) { setIsModalOpen(false); fetchTeachers(); }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-3xl font-black text-slate-800 uppercase italic">Hoca Listesi</h1>
        <button onClick={() => setIsModalOpen(true)} className="bg-orange-500 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-orange-100 hover:bg-orange-600 transition-all"><Plus size={20} /> Yeni Hoca</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {teachers.map(teacher => (
          <div key={teacher.id} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm relative group overflow-hidden">
            <button onClick={() => deleteTeacher(teacher.id)} className="absolute top-4 right-4 text-slate-200 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100 z-10"><Trash2 size={20} /></button>
            <div className="bg-orange-50 w-12 h-12 rounded-xl flex items-center justify-center text-orange-600 mb-4"><GraduationCap size={24}/></div>
            <h3 className="text-lg font-black text-slate-800 uppercase italic leading-none">{teacher.name}</h3>
            <p className="text-orange-500 text-[10px] font-black uppercase mt-2 mb-4 tracking-tighter">{teacher.branch}</p>
            <div className="flex items-center gap-2 text-slate-400 bg-slate-50 p-3 rounded-xl border border-slate-100 font-bold text-sm"><Phone size={14}/> {teacher.phone}</div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white p-8 rounded-[2.5rem] w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-black mb-6 text-orange-500 uppercase italic">Yeni Hoca Kaydı</h2>
            <div className="space-y-4">
              <input type="text" placeholder="Ad Soyad" className="w-full bg-slate-50 p-3 rounded-xl border border-slate-200 font-bold" onChange={e => setNewTeacher({...newTeacher, name: e.target.value})} />
              <input type="text" placeholder="Branş" className="w-full bg-slate-50 p-3 rounded-xl border border-slate-200 font-bold" onChange={e => setNewTeacher({...newTeacher, branch: e.target.value})} />
              <input type="text" placeholder="Telefon" className="w-full bg-slate-50 p-3 rounded-xl border border-slate-200 font-bold" onChange={e => setNewTeacher({...newTeacher, phone: e.target.value})} />
            </div>
            <div className="flex gap-3 mt-8">
              <button onClick={() => setIsModalOpen(false)} className="flex-1 font-bold text-slate-400">Vazgeç</button>
              <button onClick={handleSave} className="flex-[2] bg-orange-500 text-white p-4 rounded-2xl font-black hover:bg-orange-600 transition-all">Kaydet</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}