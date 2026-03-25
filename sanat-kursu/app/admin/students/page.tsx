"use client";
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Users, Plus, Trash2, Search, Download, X } from 'lucide-react';
import * as XLSX from 'xlsx';

export default function StudentsPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newStudent, setNewStudent] = useState({ name: '', parent_name: '', phone: '', note: '' });

  const fetchStudents = async () => {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .order('name');
    if (!error) setStudents(data || []);
  };

  useEffect(() => { fetchStudents(); }, []);

  const handleSave = async () => {
    if (!newStudent.name || !newStudent.phone) {
      alert("Lütfen en azından İsim ve Telefon alanlarını doldurun!");
      return;
    }

    const { error } = await supabase
      .from('students')
      .insert([newStudent]);

    if (error) {
      alert("Kayıt Hatası: " + error.message);
    } else {
      setNewStudent({ name: '', parent_name: '', phone: '', note: '' });
      setIsModalOpen(false);
      fetchStudents();
    }
  };

  const deleteStudent = async (id: string) => {
    if (confirm("Bu öğrenciyi silmek istediğinize emin misiniz?")) {
      const { error } = await supabase.from('students').delete().eq('id', id);
      if (!error) fetchStudents();
    }
  };

  // EXCEL RAPORU DÜZENLEME FONKSİYONU
  const exportToExcel = () => {
    const reportData = students.map(student => ({
      "Öğrenci Ad Soyad": student.name,
      "Veli Adı": student.parent_name || "-",
      "Telefon No": student.phone || "-",
      "Özel Notlar": student.note || "-",
      "Kayıt Tarihi": new Date(student.created_at).toLocaleDateString('tr-TR')
    }));

    const ws = XLSX.utils.json_to_sheet(reportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Öğrenci Listesi");

    // Sütun genişliklerini otomatik ayarla
    ws['!cols'] = [{ wch: 25 }, { wch: 20 }, { wch: 15 }, { wch: 30 }, { wch: 15 }];

    XLSX.writeFile(wb, "Sanat_Kursu_Ogrenci_Listesi.xlsx");
  };

  return (
    <div className="p-8 text-slate-800">
      {/* Üst Başlık ve Butonlar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black uppercase italic tracking-tighter text-slate-900">Öğrenci Kayıt Sistemi</h1>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">Toplam: {students.length} Öğrenci</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button 
            onClick={exportToExcel} 
            className="flex-1 md:flex-none bg-white border-2 border-slate-100 px-5 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-50 transition-all text-slate-600 shadow-sm"
          >
            <Download size={20}/> Excel Rapor
          </button>
          <button 
            onClick={() => setIsModalOpen(true)} 
            className="flex-[2] md:flex-none bg-purple-600 text-white px-8 py-3 rounded-2xl font-black flex items-center justify-center gap-2 shadow-lg shadow-purple-100 hover:bg-purple-700 transition-all active:scale-95"
          >
            <Plus size={22} /> Yeni Kayıt
          </button>
        </div>
      </div>

      {/* Arama Çubuğu */}
      <div className="relative mb-8 group">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-purple-500 transition-colors" size={20} />
        <input 
          type="text" 
          placeholder="Öğrenci ismi ile hızlı ara..." 
          className="w-full bg-white border-2 border-slate-100 p-5 pl-14 rounded-[2rem] font-bold outline-none focus:border-purple-500 transition-all shadow-sm text-lg" 
          onChange={e => setSearchTerm(e.target.value)} 
        />
      </div>

      {/* Öğrenci Kartları Listesi */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {students
          .filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()))
          .map(student => (
            <div key={student.id} className="bg-white p-6 rounded-[3rem] border border-slate-100 shadow-sm relative group hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <button 
                onClick={() => deleteStudent(student.id)} 
                className="absolute top-6 right-6 text-slate-200 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
              >
                <Trash2 size={22} />
              </button>
              
              <div className="bg-purple-50 w-14 h-14 rounded-2xl flex items-center justify-center text-purple-600 mb-6 shadow-inner">
                <Users size={28}/>
              </div>

              <h3 className="text-xl font-black text-slate-900 uppercase italic mb-1">{student.name}</h3>
              <p className="text-purple-500 font-black text-[10px] uppercase tracking-[0.2em] mb-4">Veli: {student.parent_name || "Bilinmiyor"}</p>
              
              <div className="space-y-3">
                <div className="bg-slate-50 p-4 rounded-2xl text-sm font-black text-slate-700 border border-slate-100 flex items-center gap-3">
                  <span className="text-lg">📞</span> {student.phone}
                </div>
                {student.note && (
                  <div className="px-4 py-2 text-xs font-bold text-slate-400 italic">
                    " {student.note} "
                  </div>
                )}
              </div>
            </div>
          ))}
      </div>

      {/* Kayıt Modalı (Popup) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-[100]">
          <div className="bg-white p-10 rounded-[3.5rem] w-full max-w-md shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-8 right-8 text-slate-300 hover:text-slate-900">
              <X size={24}/>
            </button>
            
            <h2 className="text-2xl font-black mb-8 text-purple-600 uppercase italic leading-none">Öğrenci Bilgileri</h2>
            
            <div className="space-y-5">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4 mb-2 block">Öğrenci Ad Soyad *</label>
                <input type="text" placeholder="Örn: Ali Yılmaz" className="w-full bg-slate-50 p-4 rounded-2xl border-2 border-slate-50 font-bold focus:border-purple-500 outline-none text-black" value={newStudent.name} onChange={e => setNewStudent({...newStudent, name: e.target.value})} />
              </div>
              
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4 mb-2 block">Veli Ad Soyad</label>
                <input type="text" placeholder="Örn: Mehmet Yılmaz" className="w-full bg-slate-50 p-4 rounded-2xl border-2 border-slate-50 font-bold focus:border-purple-500 outline-none text-black" value={newStudent.parent_name} onChange={e => setNewStudent({...newStudent, parent_name: e.target.value})} />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4 mb-2 block">Telefon Numarası *</label>
                <input type="text" placeholder="05XX XXX XX XX" className="w-full bg-slate-50 p-4 rounded-2xl border-2 border-slate-50 font-bold focus:border-purple-500 outline-none text-black" value={newStudent.phone} onChange={e => setNewStudent({...newStudent, phone: e.target.value})} />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4 mb-2 block">Özel Not</label>
                <textarea placeholder="Örn: Piyano eğitimi alıyor..." className="w-full bg-slate-50 p-4 rounded-2xl border-2 border-slate-50 font-bold h-24 focus:border-purple-500 outline-none resize-none text-black" value={newStudent.note} onChange={e => setNewStudent({...newStudent, note: e.target.value})}></textarea>
              </div>
            </div>

            <div className="flex gap-4 mt-10">
              <button onClick={() => setIsModalOpen(false)} className="flex-1 font-bold text-slate-400 hover:text-slate-600 transition-colors">Vazgeç</button>
              <button onClick={handleSave} className="flex-[2] bg-purple-600 text-white p-5 rounded-[2rem] font-black hover:bg-purple-700 shadow-lg shadow-purple-100 transition-all active:scale-95">KAYDET</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}