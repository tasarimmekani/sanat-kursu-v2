"use client";
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Plus, Trash2, Wallet, Calendar } from 'lucide-react';

export default function PaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPayment, setNewPayment] = useState({ 
    student_id: '', 
    amount: '', 
    period_month: 'Eylül', 
    lesson_count: 4 
  });

  const months = ["Eylül", "Ekim", "Kasım", "Aralık", "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos"];

  const fetchData = async () => {
    const { data: payData } = await supabase.from('payments').select('*').order('payment_date', { ascending: false });
    const { data: stuData } = await supabase.from('students').select('id, name');
    setPayments(payData || []);
    setStudents(stuData || []);
  };

  useEffect(() => { fetchData(); }, []);

  const handleSave = async () => {
    if (!newPayment.student_id || !newPayment.amount) {
      alert("Lütfen öğrenci ve tutar giriniz!");
      return;
    }
    const selectedStu = students.find(s => s.id === newPayment.student_id);
    
    const { error } = await supabase.from('payments').insert([{
      student_id: newPayment.student_id,
      student_name: selectedStu?.name,
      amount: parseFloat(newPayment.amount),
      period_month: newPayment.period_month,
      lesson_count: newPayment.lesson_count,
      payment_date: new Date().toISOString().split('T')[0]
    }]);

    if (error) {
      alert("Hata: " + error.message);
    } else {
      setIsModalOpen(false);
      fetchData();
    }
  };

  return (
    <div className="p-8 text-slate-800">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-3xl font-black uppercase italic tracking-tighter">Ödeme Takibi</h1>
        <button onClick={() => setIsModalOpen(true)} className="bg-emerald-500 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg hover:bg-emerald-600 transition-all">
          <Plus size={20} /> Yeni Ödeme
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {payments.map(pay => (
          <div key={pay.id} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm relative group">
            <button onClick={async () => { if(confirm("Silinsin mi?")) { await supabase.from('payments').delete().eq('id', pay.id); fetchData(); } }} className="absolute top-4 right-4 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={18}/></button>
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-emerald-50 w-12 h-12 rounded-xl flex items-center justify-center text-emerald-600 font-black">
                {pay.period_month?.substring(0,3) || "---"}
              </div>
              <div>
                <h3 className="font-black uppercase italic leading-none">{pay.student_name}</h3>
                <p className="text-slate-400 text-[10px] font-bold mt-1 uppercase">{pay.period_month || "Belirsiz"} Dönemi</p>
              </div>
            </div>
            <div className="flex justify-between items-end border-t border-slate-50 pt-4">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase">Ders Paketi</p>
                <p className="text-lg font-black text-slate-700">{pay.lesson_count || 0} Ders</p>
              </div>
              <div className="text-2xl font-black text-emerald-600 italic leading-none">{pay.amount} TL</div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
          <div className="bg-white p-8 rounded-[2.5rem] w-full max-w-md shadow-2xl text-black">
            <h2 className="text-xl font-black mb-6 text-emerald-600 uppercase italic font-bold">Ödeme Girişi</h2>
            <div className="space-y-4">
              <select className="w-full bg-slate-50 p-4 rounded-xl border border-slate-200 font-bold outline-none" onChange={e => setNewPayment({...newPayment, student_id: e.target.value})}>
                <option value="">Öğrenci Seçin</option>
                {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              <div className="grid grid-cols-2 gap-3">
                <select className="bg-slate-50 p-4 rounded-xl border border-slate-200 font-bold outline-none" value={newPayment.period_month} onChange={e => setNewPayment({...newPayment, period_month: e.target.value})}>
                  {months.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
                <input type="number" placeholder="Ders Sayısı" className="bg-slate-50 p-4 rounded-xl border border-slate-200 font-bold outline-none" value={newPayment.lesson_count} onChange={e => setNewPayment({...newPayment, lesson_count: parseInt(e.target.value)})} />
              </div>
              <input type="number" placeholder="Tutar (TL)" className="w-full bg-slate-50 p-4 rounded-xl border border-slate-200 font-bold outline-none" onChange={e => setNewPayment({...newPayment, amount: e.target.value})} />
            </div>
            <div className="flex gap-3 mt-8">
              <button onClick={() => setIsModalOpen(false)} className="flex-1 font-bold text-slate-400">Vazgeç</button>
              <button onClick={handleSave} className="flex-[2] bg-emerald-600 text-white p-4 rounded-2xl font-black">Ödemeyi Kaydet</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}