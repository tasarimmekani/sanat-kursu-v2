"use client";
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Plus, Trash2, BookOpen, X } from 'lucide-react';

export default function ProgramPage() {
  const [programs, setPrograms] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProgram, setNewProgram] = useState({ student_id: '', teacher_id: '', lesson_day: 'Pazartesi', lesson_time: '' });
  const days = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"];

  const fetchData = async () => {
    const { data: progData } = await supabase.from('program').select('*').order('lesson_day');
    const { data: stuData } = await supabase.from('students').select('id, name');
    const { data: teachData } = await supabase.from('teachers').select('id, name, branch');
    setPrograms(progData || []); setStudents(stuData || []); setTeachers(teachData || []);
  };

  useEffect(() => { fetchData(); }, []);

  const deleteProgram = async (id: string) => {
    if (!id || !window.confirm("Bu ders programını silmek istediğinize emin misiniz?")) return;
    const { error } = await supabase.from('program').delete().eq('id', id);
    if (error) alert("Silme hatası: " + error.message); else setPrograms(prev => prev.filter(p => p.id !== id));
  };

  const handleSave = async () => {
    if (!newProgram.student_id || !newProgram.teacher_id || !newProgram.lesson_time) { alert("Lütfen tüm alanları doldurun!"); return; }
    const selectedStudent = students.find(s => s.id === newProgram.student_id);
    const selectedTeacher = teachers.find(t => t.id === newProgram.teacher_id);
    const { error } = await supabase.from('program').insert([{
      ...newProgram, student_name: selectedStudent?.name, teacher_name: selectedTeacher?.name, course_name: selectedTeacher?.branch || "Genel Sanat Dersi"
    }]);
    if (!error) { setIsModalOpen(false); setNewProgram({ student_id: '', teacher_id: '', lesson_day: 'Pazartesi', lesson_time: '' }); fetchData(); }
  };

  return (
    <div className="p-8 text-slate-800">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-black uppercase italic tracking-tighter">Ders Programı</h1>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">Toplam {programs.length} Ders</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 text-white px-8 py-4 rounded-[2rem] font-black flex items-center gap-2">
          <Plus size={22} /> Program Oluştur
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {programs.map(prog => (
          <div key={prog.id} className="bg-white p-6 rounded-[3rem] border border-slate-100 shadow-sm relative group overflow-hidden">
            <button onClick={(e) => { e.preventDefault(); deleteProgram(prog.id); }} className="absolute top-4 right-4 p-3 bg-red-50 text-red-400 hover:bg-red-500 hover:text-white rounded-2xl transition-all z-50">
              <Trash2 size={20} />
            </button>
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-blue-50 px-4 py-2 rounded-2xl text-blue-600 font-black text-sm italic">{prog.lesson_day}</div>
              <div className="bg-slate-900 px-4 py-2 rounded-2xl text-white font-black text-sm">{prog.lesson_time}</div>
            </div>
            <h3 className="text-xl font-black text-slate-900 uppercase italic mb-2">{prog.student_name}</h3>
            <div className="flex flex-col gap-2 mt-4">
              <div className="flex items-center gap-2 text-slate-500 font-bold text-xs uppercase italic">
                <BookOpen size={14} className="text-blue-500"/> {prog.course_name}
              </div>
              <div className="text-slate-400 font-bold text-[10px] uppercase border-t border-slate-50 pt-3">
                Eğitmen: <span className="text-slate-700">{prog.teacher_name}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-[100]">
          <div className="bg-white p-10 rounded-[3.5rem] w-full max-w-md shadow-2xl relative">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-8 right-8 text-slate-300"><X size={24}/></button>
            <h2 className="text-2xl font-black mb-8 text-blue-600 uppercase italic text-center">Yeni Program</h2>
            <div className="space-y-5">
              <select className="w-full bg-slate-50 p-4 rounded-2xl border-none font-bold text-black" onChange={e => setNewProgram({...newProgram, student_id: e.target.value})}>
                <option value="">Öğrenci Seçiniz</option>
                {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              <select className="w-full bg-slate-50 p-4 rounded-2xl border-none font-bold text-black" onChange={e => setNewProgram({...newProgram, teacher_id: e.target.value})}>
                <option value="">Hoca Seçiniz</option>
                {teachers.map(t => <option key={t.id} value={t.id}>{t.name} ({t.branch})</option>)}
              </select>
              <div className="grid grid-cols-2 gap-4">
                <select className="bg-slate-50 p-4 rounded-2xl border-none font-bold text-black" value={newProgram.lesson_day} onChange={e => setNewProgram({...newProgram, lesson_day: e.target.value})}>
                  {days.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <input type="time" className="bg-slate-50 p-4 rounded-2xl border-none font-bold text-black" onChange={e => setNewProgram({...newProgram, lesson_time: e.target.value})} />
              </div>
            </div>
            <div className="flex gap-4 mt-10">
              <button onClick={() => setIsModalOpen(false)} className="flex-1 font-bold text-slate-400 italic">VAZGEÇ</button>
              <button onClick={handleSave} className="flex-[2] bg-blue-600 text-white p-5 rounded-[2rem] font-black uppercase tracking-widest shadow-lg shadow-blue-200">KAYDET</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}