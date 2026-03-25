"use client";

export default function Page() {
  return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9' }}>
      <div style={{ background: 'white', padding: '40px', borderRadius: '20px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', textAlign: 'center' }}>
        <h1 style={{ color: '#000', marginBottom: '20px' }}>YÖNETİCİ GİRİŞİ</h1>
        <input 
          type="password" 
          placeholder="Şifre" 
          style={{ width: '100%', padding: '15px', borderRadius: '10px', border: '1px solid #ddd', marginBottom: '20px', color: '#000' }} 
        />
        <button 
          onClick={() => alert('Giriş Yapılıyor...')}
          style={{ width: '100%', padding: '15px', borderRadius: '10px', border: 'none', background: '#e11d48', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}
        >
          GİRİŞ YAP
        </button>
      </div>
    </div>
  );
}