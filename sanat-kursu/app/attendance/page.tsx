"use client";
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { CheckCircle, XCircle, UserCheck, Calendar as CalendarIcon, Trash2 } from 'lucide-react';

export default function AttendancePage() {
  const [attendance, setAttendance] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newRecord, setNewRecord] = useState({ student_id: '', status: 'Geldi', lesson_date: new Date().toISOString().split('T')[0] });

  const fetchData = async () => {
    const { data: attData } = await supabase.from('attendance').select('*').order('lesson_date', { ascending: false });
    const { data: stuData } = await supabase.from('students').select('id, name');
    setAttendance(attData || []);
    setStudents(stuData || []);
  };

  useEffect(() => { fetchData(); }, []);

  const handleSave = async () => {
    const selectedStu = students.find(s => s.id === newRecord.student_id);
    const { error } = await supabase.from('attendance').insert([{
      ...newRecord,
      student_name: selectedStu?.name
    }]);
    if (!error) { setIsModalOpen(false); fetchData(); }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-3xl font-black text-slate-800 uppercase italic">Yoklama Sistemi</h1>
        <button onClick={() => setIsModalOpen(true)} className="bg-rose-500 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg hover:bg-rose-600 transition-all">
          <UserCheck size={20} /> Yoklama Al
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100 text-black">
            <tr>
              <th className="p-6 font-black uppercase italic text-sm">Öğrenci</th>
              <th className="p-6 font-black uppercase italic text-sm">Tarih</th>
              <th className="p-6 font-black uppercase italic text-sm">Durum</th>
              <th className="p-6 font-black uppercase italic text-sm">İşlem</th>
            </tr>
          </thead>
          <tbody className="text-black">
            {attendance.map(record => (
              <tr key={record.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                <td className="p-6 font-bold">{record.student_name}</td>
                <td className="p-6 font-medium text-slate-500">{record.lesson_date}</td>
                <td className="p-6 text-black">
                  <span className={`px-4 py-1.5 rounded-full font-black text-[10px] uppercase ${
                    record.status === 'Geldi' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                  }`}>
                    {record.status}
                  </span>
                </td>
                <td className="p-6">
                  <button onClick={async () => { await supabase.from('attendance').delete().eq('id', record.id); fetchData(); }} className="text-slate-200 hover:text-red-500"><Trash2 size={18}/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 text-black">
          <div className="bg-white p-8 rounded-[2.5rem] w-full max-w-md">
            <h2 className="text-xl font-black mb-6 text-rose-600 uppercase italic">Yoklama Girişi</h2>
            <div className="space-y-4">
              <select className="w-full bg-slate-50 p-3 rounded-xl border border-slate-200 font-bold" onChange={e => setNewRecord({...newRecord, student_id: e.target.value})}>
                <option value="">Öğrenci Seçin</option>
                {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              <input type="date" className="w-full bg-slate-50 p-3 rounded-xl border border-slate-200 font-bold" value={newRecord.lesson_date} onChange={e => setNewRecord({...newRecord, lesson_date: e.target.value})} />
              <div className="flex gap-2">
                <button onClick={() => setNewRecord({...newRecord, status: 'Geldi'})} className={`flex-1 p-3 rounded-xl font-black transition-all ${newRecord.status === 'Geldi' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-400'}`}>GELDİ</button>
                <button onClick={() => setNewRecord({...newRecord, status: 'Gelmedi'})} className={`flex-1 p-3 rounded-xl font-black transition-all ${newRecord.status === 'Gelmedi' ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-400'}`}>GELMEDİ</button>
              </div>
            </div>
            <div className="flex gap-3 mt-8">
              <button onClick={() => setIsModalOpen(false)} className="flex-1 font-bold text-slate-400">Vazgeç</button>
              <button onClick={handleSave} className="flex-[2] bg-rose-600 text-white p-4 rounded-2xl font-black hover:bg-rose-700 shadow-lg shadow-rose-100">Kaydet</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}