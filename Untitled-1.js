// ===== src/utils/ExportService.js =====
// NOT: Bu dosya yanında xlsx kütüphanesinin kurulu olması gereklidir.
// Kurulum: npm install xlsx
import * as XLSX from "xlsx";

// Tarihli dosya ismi oluşturucu
function withDate(prefix) {
  const now = new Date();
  const stamp =
    [now.getFullYear().toString().slice(2), (now.getMonth()+1).toString().padStart(2,"0"), now.getDate().toString().padStart(2,"0")].join("_");
  return `${prefix}_${stamp}.xlsx`;
}

export function exportStudents(students, BRANCHES) {
  const data = students.map(s => ({
    "Ad Soyad": s.name,
    "Veli Tel": s.parentPhone,
    "Branş": (s.branches || []).map(br =>
      (BRANCHES.find(x => x.key === br) || {}).label || br
    ).join(", "),
    "Kayıt Tarihi": s.registerDate
  }));
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Öğrenciler");
  XLSX.writeFile(wb, withDate("Kurs_Ogrenci_Listesi"));
}

export function exportPayments(payments, students, BRANCHES, month = null) {
  // İsteğe bağlı olarak sadece belirli ayı filtrele (default: bu ay)
  if (!month) {
    const now = new Date();
    month = `${now.getFullYear()}-${(now.getMonth()+1).toString().padStart(2, "0")}`;
  }
  const table = payments
    .filter(p => p.month === month)
    .map(p => {
      const student = students.find(s => s.id === p.studentId);
      return {
        "Öğrenci": student ? student.name : "",
        "Branş": student ? (student.branches || []).map(br => (BRANCHES.find(x => x.key === br) || {}).label || br).join(", ") : "",
        "Toplam Ücret": `${Number(p.amount).toLocaleString("tr-TR")}₺`,
        "Ödeme Durumu": p.status === "paid" ? "Ödendi" : "Bekliyor",
        "Kalan Borç": p.status === "paid" ? "₺0" : `${Number(p.amount).toLocaleString("tr-TR")}₺`,
      };
    });
  const ws = XLSX.utils.json_to_sheet(table);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Ödeme Raporu");
  XLSX.writeFile(wb, withDate("Aylik_Odeme_Raporu"));
}

export function exportCourses(courses, students, BRANCHES) {
  const WEEKDAYS = ["Pzt", "Salı", "Çar", "Per", "Cum", "Cmt", "Paz"];
  const data = courses.map(cr => {
    const student = students.find(s => s.id.toString() === cr.studentId?.toString());
    const br = BRANCHES.find(x => x.key === cr.branch);
    return {
      "Gün": WEEKDAYS[Number(cr.day)] || cr.day,
      "Saat": cr.time,
      "Ders Adı": br ? br.label : cr.branch,
      "Öğrenci": student ? student.name : (cr.studentName || ""),
      "Eğitmen": cr.teacher || "",
      "Oda": cr.room || "",
    };
  });
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Haftalık Program");
  XLSX.writeFile(wb, withDate("Kurs_Haftalik_Program"));
}

// ===== src/components/ui/ExportButton.jsx =====
import React from "react";
import { FileSpreadsheet, Download } from "lucide-react";

// children: buton metni, onClick: export handler, loading: bool
export default function ExportButton({ onClick, children, icon = "spreadsheet", className = "", ...props }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-2xl bg-green-600 hover:bg-green-700 text-white font-semibold shadow transition ${className}`}
      {...props}
    >
      {icon === "spreadsheet"
        ? <FileSpreadsheet size={18} className="text-white" />
        : <Download size={18} className="text-white" />
      }
      {children}
    </button>
  );
}

// ===== src/components/features/StudentForm.jsx =====
import React, { useState } from "react";
import { BRANCHES } from "../../hooks/useAcademyStore";
import { UserPlus, BookCopy } from "lucide-react";
import ExportButton from "../ui/ExportButton";
import { exportStudents } from "../../utils/ExportService";

export default function StudentForm({ onRegister, students = [] }) {
  const [form, setForm] = useState({
    name: "",
    parentPhone: "",
    registerDate: "",
    monthlyFee: "",
    branches: [],
  });

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };
  const handleBranches = e => {
    const value = e.target.value;
    setForm(f =>
      ({
        ...f,
        branches: f.branches.includes(value)
          ? f.branches.filter(b => b !== value)
          : [...f.branches, value]
      })
    );
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (!form.name.trim() || !form.parentPhone.trim() || form.branches.length === 0) {
      alert("Lütfen tüm alanları doldurun!");
      return;
    }
    const registerDate = form.registerDate || new Date().toISOString().slice(0,10);
    onRegister({
      ...form,
      registerDate,
      branches: form.branches,
    });
    setForm({ name: "", parentPhone: "", registerDate: "", monthlyFee: "", branches: [] });
  };

  // Otomatik ücret hesapla
  const autoFee = form.branches.reduce((sum, key) => {
    const br = BRANCHES.find(x => x.key === key);
    return sum + (br ? br.monthlyFee : 0);
  }, 0);

  return (
    <div className="bg-white rounded-2xl shadow-md border border-slate-100 p-6 w-full max-w-lg">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-xl font-bold text-pink-800 flex gap-2 items-center font-serif">
          <UserPlus className="text-pink-500" size={22} />
          Öğrenci Kayıt
        </h3>
        <ExportButton
          onClick={() => exportStudents(students, BRANCHES)}
          icon="spreadsheet"
        >
          Öğrenci Listesini İndir
        </ExportButton>
      </div>
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <div>
          <label className="block text-xs text-slate-600 mb-1">Ad Soyad</label>
          <input
            name="name"
            type="text"
            value={form.name}
            onChange={handleChange}
            className="w-full rounded-2xl border px-3 py-2 bg-pink-50 border-slate-200 font-sans outline-pink-400"
            autoComplete="off"
            required
          />
        </div>
        <div>
          <label className="block text-xs text-slate-600 mb-1">Veli Telefonu</label>
          <input
            name="parentPhone"
            type="text"
            value={form.parentPhone}
            onChange={handleChange}
            className="w-full rounded-2xl border px-3 py-2 bg-pink-50 border-slate-200 font-sans outline-pink-400"
            autoComplete="off"
            required
          />
        </div>
        <div>
          <label className="block text-xs text-slate-600 mb-1">Kayıt Tarihi</label>
          <input
            name="registerDate"
            type="date"
            value={form.registerDate}
            onChange={handleChange}
            className="rounded-2xl border px-3 py-2 border-slate-200 font-sans outline-pink-400 w-full"
          />
        </div>
        <div>
          <label className="block text-xs text-slate-600 mb-2">Branş Seçimi</label>
          <div className="grid grid-cols-2 gap-2">
            {BRANCHES.map(branch =>
              <label key={branch.key} className={`flex items-center gap-2 px-2 py-1 rounded-2xl cursor-pointer border transition
                ${form.branches.includes(branch.key) ? "border-pink-400 bg-pink-50" : "border-slate-200 bg-white"}
              `}>
                <input
                  type="checkbox"
                  name="branches"
                  value={branch.key}
                  checked={form.branches.includes(branch.key)}
                  onChange={handleBranches}
                  className="accent-pink-500"
                />
                <BookCopy size={16} className={branch.color.split(" ")[1]} />
                <span className="text-sm">{branch.label}</span>
                <span className="text-xs ms-auto text-slate-400 font-mono">₺{branch.monthlyFee}</span>
              </label>
            )}
          </div>
        </div>
        <div>
          <label className="block text-xs text-slate-600 mb-1">Aylık Toplam Ücret</label>
          <div className="rounded-2xl border border-slate-200 bg-amber-50 px-3 py-2 font-semibold text-amber-700 text-lg">{autoFee.toLocaleString("tr-TR")}₺</div>
        </div>
        <button
          type="submit"
          className="rounded-2xl bg-pink-500 hover:bg-pink-600 text-white font-semibold shadow px-4 py-2 text-sm font-sans mt-2"
        >
          Kaydet
        </button>
      </form>
    </div>
  );
}

// ===== src/components/features/CourseCalendar.jsx =====
import React, { useState } from "react";
import { BRANCHES } from "../../hooks/useAcademyStore";
import { CalendarClock, User, PlusCircle, X } from "lucide-react";
import ExportButton from "../ui/ExportButton";
import { exportCourses } from "../../utils/ExportService";

const WEEKDAYS = ["Pzt", "Salı", "Çar", "Per", "Cum", "Cmt", "Paz"];
const TIME_SLOTS = [
  "09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00"
];

function branchColorClass(branchKey) {
  const br = BRANCHES.find(b => b.key === branchKey);
  return br ? br.color + " rounded-2xl font-semibold px-3 py-1 block shadow-sm" : "bg-slate-100 text-slate-700";
}

export default function CourseCalendar({ courses, onAddCourse, students }) {
  const [modal, setModal] = useState({ open: false, day: null, slot: null });
  const [form, setForm] = useState({
    studentId: "",
    branch: "",
  });

  function closeModal() {
    setModal({ open: false, day: null, slot: null });
    setForm({ studentId: "", branch: "" });
  }
  const doAdd = (e) => {
    e.preventDefault();
    if (!form.studentId || !form.branch) return;
    const student = students.find(s => s.id.toString() === form.studentId);
    onAddCourse({
      studentId: form.studentId,
      studentName: student ? student.name : "",
      branch: form.branch,
      day: modal.day,
      time: modal.slot,
      className: "",
      teacher: "",
      room: "",
    });
    closeModal();
  };

  function cellCourses(day, slot) {
    return courses.filter(c => c.day === day && c.time === slot);
  }

  return (
    <div className="bg-white rounded-2xl shadow-md border border-slate-100 w-full max-w-3xl mx-auto">
      <div className="flex items-center justify-between px-6 pt-6 pb-4">
        <h3 className="text-xl font-bold text-pink-800 flex gap-2 items-center font-serif">
          <CalendarClock className="text-pink-500" size={22} />
          Ders Takvimi
        </h3>
        <ExportButton
          onClick={() => exportCourses(courses, students, BRANCHES)}
          icon="spreadsheet"
        >
          Haftalık Programı İndir
        </ExportButton>
      </div>
      <div className="w-full overflow-x-auto pb-4 px-2">
        <table className="table-auto w-full border-collapse select-none font-sans">
          <thead>
            <tr>
              <th className="p-2 bg-pink-50 border-b">Saat</th>
              {WEEKDAYS.map(day => (
                <th key={day} className="p-2 bg-pink-50 border-b">{day}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {TIME_SLOTS.map(slot => (
              <tr key={slot}>
                <td className="text-sm bg-pink-50 py-2 px-3 text-pink-700 border-b font-medium">{slot}</td>
                {WEEKDAYS.map((_, dIdx) => (
                  <td
                    key={dIdx}
                    className={`align-top min-w-[120px] px-1 py-1 border-b border-slate-100 cursor-pointer hover:bg-pink-50 transition relative`}
                    onClick={() => setModal({ open: true, day: dIdx, slot })}
                  >
                    {cellCourses(dIdx, slot).length === 0 && (
                      <span className="absolute top-1.5 right-1.5 text-pink-200 opacity-60 hover:opacity-100">
                        <PlusCircle size={16} />
                      </span>
                    )}
                    <div className="flex flex-col gap-1">
                      {cellCourses(dIdx, slot).map(c => (
                        <div key={c.id} className={branchColorClass(c.branch)}>
                          <User size={13} className="inline me-1 align-middle" />
                          <span>{c.studentName}</span>
                          <span className="text-xs ml-2 opacity-60">{slot}</span>
                        </div>
                      ))}
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {modal.open && (
        <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center" onClick={closeModal}>
          <div
            className="bg-white min-w-[260px] max-w-xs w-full rounded-2xl p-6 shadow-lg flex flex-col gap-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div className="font-semibold text-pink-700 text-lg font-serif">Ders Ekle ({WEEKDAYS[modal.day]} {modal.slot})</div>
              <button onClick={closeModal}>
                <X size={18} className="text-slate-400 hover:text-pink-500 transition" />
              </button>
            </div>
            <form className="flex flex-col gap-3" onSubmit={doAdd}>
              <div>
                <label className="block text-xs mb-1 text-slate-600">Öğrenci</label>
                <select
                  value={form.studentId}
                  onChange={e => setForm(f => ({ ...f, studentId: e.target.value }))}
                  className="w-full border rounded-2xl px-3 py-2 font-sans border-slate-200"
                  required
                >
                  <option value="">Seçiniz</option>
                  {students.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs mb-1 text-slate-600">Branş</label>
                <select
                  value={form.branch}
                  onChange={e => setForm(f => ({ ...f, branch: e.target.value }))}
                  className="w-full border rounded-2xl px-3 py-2 font-sans border-slate-200"
                  required
                >
                  <option value="">Seçiniz</option>
                  {BRANCHES.map(b => (
                    <option key={b.key} value={b.key}>{b.label}</option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                className="bg-pink-500 hover:bg-pink-600 text-white rounded-2xl px-3 py-2 font-sans font-semibold shadow mt-2"
              >
                Ekle
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ===== src/components/features/FinancePanel.jsx =====
import React, { useMemo, useState } from "react";
import { BRANCHES } from "../../hooks/useAcademyStore";
import { CheckCircle2, XCircle, Filter, ReceiptText } from "lucide-react";
import ExportButton from "../ui/ExportButton";
import { exportPayments } from "../../utils/ExportService";

function currency(amount) {
  return (Number(amount)||0).toLocaleString("tr-TR") + "₺";
}

export default function FinancePanel({ payments, students, setPaymentStatus, financialSummary }) {
  const [onlyWithDebt, setOnlyWithDebt] = useState(false);
  const currentMonth = new Date().toISOString().slice(0,7);

  const table = useMemo(() => {
    return payments
      .filter(p => p.month === currentMonth)
      .map(p => {
        const student = students.find(s => s.id === p.studentId);
        return {
          ...p,
          name: student ? student.name : "-",
          branches: student ? student.branches : [],
          parentPhone: student ? student.parentPhone : "",
        };
      })
      .filter(row => {
        if (!onlyWithDebt) return true;
        return row.status !== "paid";
      });
  }, [payments, students, onlyWithDebt, currentMonth]);

  // Finansal özet kartları
  const summary = financialSummary();

  return (
    <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-md border border-slate-100 px-6 py-6 max-w-3xl mx-auto mb-10">
      <div className="flex gap-4 mb-6 flex-col md:flex-row justify-between">
        <div className="flex-1 p-3 rounded-2xl min-w-[160px] bg-gradient-to-r from-amber-100 to-white shadow">
          <div className="text-xs text-slate-500 mb-1 font-semibold flex gap-1 items-center"><ReceiptText size={15} className="text-amber-500" />Toplam Beklenen</div>
          <div className="text-lg font-bold text-amber-700">{currency(summary.totalExpected)}</div>
        </div>
        <div className="flex-1 p-3 rounded-2xl min-w-[160px] bg-gradient-to-r from-emerald-100 to-white shadow">
          <div className="text-xs text-slate-500 mb-1 font-semibold flex gap-1 items-center"><CheckCircle2 size={15} className="text-emerald-500" />Tahsil Edilen</div>
          <div className="text-lg font-bold text-emerald-700">{currency(summary.totalPaid)}</div>
        </div>
        <div className="flex-1 p-3 rounded-2xl min-w-[160px] bg-gradient-to-r from-pink-100 to-white shadow">
          <div className="text-xs text-slate-500 mb-1 font-semibold flex gap-1 items-center"><XCircle size={15} className="text-pink-500" />Kalan Alacak</div>
          <div className="text-lg font-bold text-pink-700">{currency(summary.totalWaiting)}</div>
        </div>
        <div className="flex flex-col gap-2">
          <button
            className={"flex items-center gap-2 px-3 py-2 rounded-2xl border border-slate-200 shadow bg-white/80 hover:bg-pink-100 transition font-sans text-sm font-medium min-w-[110px]"}
            onClick={() => setOnlyWithDebt((v) => !v)}
          >
            <Filter size={18} />
            {onlyWithDebt ? "Hepsini Göster" : "Borçlular"}
          </button>
          <ExportButton
            className="w-full"
            onClick={() => exportPayments(payments, students, BRANCHES, currentMonth)}
            icon="spreadsheet"
          >
            Aylık Ödeme Raporu İndir
          </ExportButton>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="table-auto min-w-full font-sans text-sm">
          <thead>
            <tr className="bg-pink-50">
              <th className="p-2 text-left">Öğrenci</th>
              <th className="p-2 text-left">Branş(lar)</th>
              <th className="p-2 text-center">Telefon</th>
              <th className="p-2 text-center">Aylık Borç</th>
              <th className="p-2 text-center">Ödeme Durumu</th>
              <th className="p-2"></th>
            </tr>
          </thead>
          <tbody>
            {table.length === 0 && (
              <tr><td className="text-center text-slate-400 pt-8" colSpan={6}>Kayıt yok</td></tr>
            )}
            {table.map(row =>
              <tr key={row.studentId}
                className={row.status === "paid"
                  ? "bg-emerald-50"
                  : "bg-rose-50"
                }
              >
                <td className="p-2 font-bold text-slate-800">{row.name}</td>
                <td className="p-2">
                  <div className="flex flex-wrap gap-1">
                    {row.branches.map(brKey => {
                      const br = BRANCHES.find(b => b.key === brKey);
                      return (
                        <span
                          key={brKey}
                          className={`px-2 py-1 rounded-xl text-xs font-medium mr-1 ${br ? br.color : ''} bg-opacity-80`}
                        >
                          {br ? br.label : brKey}
                        </span>
                      );
                    })}
                  </div>
                </td>
                <td className="p-2 text-center">{row.parentPhone}</td>
                <td className="p-2 text-center font-mono">{currency(row.amount)}</td>
                <td className="p-2 text-center">
                  <button
                    onClick={() => setPaymentStatus(row.studentId, row.month, row.status === "paid" ? "waiting" : "paid")}
                    className={`px-3 py-1 rounded-2xl flex gap-1 items-center shadow-sm font-bold transition 
                      ${row.status === "paid"
                        ? "bg-emerald-600 text-white hover:bg-emerald-700"
                        : "bg-rose-100 text-pink-700 hover:bg-rose-200"}
                    `}
                  >
                    {row.status === "paid"
                      ? (<><CheckCircle2 size={16} /> Ödendi</>)
                      : (<><XCircle size={16} /> Bekliyor</>)
                    }
                  </button>
                </td>
                <td className="p-2"></td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ===== src/pages/page.js =====
import React from "react";
import { useAcademyStore } from "../hooks/useAcademyStore";
import StudentForm from "../components/features/StudentForm";
import CourseCalendar from "../components/features/CourseCalendar";
import FinancePanel from "../components/features/FinancePanel";

// Dashboard Stat Card helper
function StatCard({ icon, label, value, colorClass }) {
  return (
    <div className={`flex flex-col items-center justify-center p-4 rounded-2xl shadow bg-white/70 min-w-[120px] ${colorClass}`}>
      <div className="mb-1">{icon}</div>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs opacity-70">{label}</div>
    </div>
  );
}

import { Users, CalendarCheck, Coins } from "lucide-react";

export default function Page() {
  const {
    students,
    addStudent,
    courses,
    addCourse,
    payments,
    setPaymentStatus,
    financialSummary,
    createOrUpdatePaymentsForAll,
  } = useAcademyStore();

  const todayCourses = (() => {
    const d = new Date();
    const todayIdx = d.getDay() === 0 ? 6 : d.getDay() - 1;
    return courses.filter(c => Number(c.day) === todayIdx).length;
  })();

  const summary = financialSummary();

  React.useEffect(() => {
    createOrUpdatePaymentsForAll();
  }, [students, createOrUpdatePaymentsForAll]);

  return (
    <div className="bg-pink-50 min-h-screen w-full py-8 px-2 font-serif">
      {/* Dashboard Stat Cards */}
      <div className="flex gap-4 mb-8 items-stretch max-w-7xl mx-auto">
        <StatCard
          icon={<Users size={22} className="text-pink-500" />}
          label="Toplam Öğrenci"
          value={students.length}
          colorClass="text-pink-700"
        />
        <StatCard
          icon={<CalendarCheck size={22} className="text-blue-500" />}
          label="Bugünkü Ders"
          value={todayCourses}
          colorClass="text-blue-700"
        />
        <StatCard
          icon={<Coins size={22} className="text-amber-500" />}
          label="Beklenen Tahsilat"
          value={summary.totalWaiting.toLocaleString("tr-TR") + "₺"}
          colorClass="text-amber-700"
        />
      </div>
      {/* Main UI */}
      <div className="flex flex-col md:flex-row gap-8 w-full justify-between max-w-7xl mx-auto mb-10">
        <StudentForm onRegister={addStudent} students={students} />
        <CourseCalendar
          courses={courses}
          onAddCourse={addCourse}
          students={students}
        />
      </div>
      {/* Finance Panel */}
      <FinancePanel
        payments={payments}
        students={students}
        setPaymentStatus={setPaymentStatus}
        financialSummary={financialSummary}
      />
    </div>
  );
}

// ===== src/styles/globals.css =====
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Genel font ve pastel arkaplan */
html, body {
  background-color: #fdf2f8;
  font-family: 'Outfit', 'Inter', ui-sans-serif, system-ui, sans-serif;
}

/* Form inputlar için */
input, select, textarea, button {
  font-family: 'Outfit', 'Inter', ui-sans-serif, system-ui, sans-serif;
}

/* Kartlar, modal ve formlar için köşe & gölge */
.rounded-2xl { border-radius: 1rem !important; }
.shadow-md { box-shadow: 0 4px 24px 0 rgb(210 148 167/0.08), 0 1.5px 3px 0 rgb(210 148 167/0.03) !important; }
.shadow { box-shadow: 0 2px 8px 0 rgb(255 179 203/0.13) !important; }

/* Ders Renk Paleti Branch: 
  .bg-pink-100.text-pink-700 { Bale }
  .bg-blue-100.text-blue-700 { Piyano }
  .bg-emerald-100.text-emerald-700 { Gitar }
  .bg-orange-100.text-orange-700 { Davul }
  .bg-amber-100.text-amber-700 { Resim }
*/

/* Cam efekt (glassmorphism) finans panel ve kartlarda: */
.bg-white\/80 { background-color: rgba(255,255,255,0.8)!important; }
.backdrop-blur-md { backdrop-filter: blur(12px)!important; }

/* Export button override (spreadsheet green) */
.bg-green-600 { background-color: #16a34a !important; }
.bg-green-700 { background-color: #15803d !important; }
.text-white { color: #fff !important; }

@media (max-width: 768px) {
  .rounded-2xl { border-radius: 0.9rem !important; }
}

/* Minor fix for lucide icon vertical align: */
svg.lucide { vertical-align: middle; }

/* Responsive table fix */
@media (max-width: 800px) {
  table { font-size: 90%; }
  td, th { padding-left: 4px; padding-right: 4px; }
}

// ===== tailwind.config.js =====
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    fontFamily: {
      sans: ["Inter", "Outfit", "ui-sans-serif", "system-ui", "sans-serif"],
      serif: ["Outfit", "ui-serif", "serif"],
    },
    extend: {
      colors: {
        amber: require("tailwindcss/colors").amber,
      }
    },
  },
  plugins: [],
};
