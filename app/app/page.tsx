'use client';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense, useState } from 'react';

const roleConfig: Record<string, { label: string; desc: string; icon: string }> = {
  siswa:  { label: 'Siswa',          desc: 'Login atau daftar akun baru',   icon: '👤' },
  guru:   { label: 'Guru / Walas',   desc: 'Kelola absen & laporan kelas',  icon: '🏫' },
  bk:     { label: 'BK / Kesiswaan', desc: 'Proses laporan & dispensasi',   icon: '🏢' },
  admin:  { label: 'Admin',          desc: 'Kelola akun guru & BK',         icon: '⚙️' },
};

function AppContent() {
  const params = useSearchParams();
  const role = params.get('role') || '';
  const config = roleConfig[role];
  const [showAbout, setShowAbout] = useState(false);

  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: 'sans-serif' }}>

      {/* Navbar */}
      <nav style={{ background: '#fff', borderBottom: '1px solid #e5e5e5', padding: '14px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '36px', height: '36px', background: '#fd1d00', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>📋</div>
          <span style={{ fontSize: '16px', fontWeight: '600', color: '#111' }}>Website Absensi</span>
        </div>
        <span style={{ fontSize: '15px', fontWeight: '600', color: '#111', marginRight: '80px' }}>
          {config ? config.label : 'Absensi'}
        </span>
        <button onClick={() => setShowAbout(true)} style={{ background: '#f5f5f5', color: '#111', border: '1px solid #e5e5e5', borderRadius: '10px', padding: '8px 20px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>About Us</button>
      </nav>

      {/* Hero */}
      <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 24px', minHeight: '700px' }}>
        <video autoPlay loop muted playsInline style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 }}>
          <source src="/uploads/backtoschool.mp4" type="video/mp4" />
        </video>
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1 }} />

        {!config ? (
          <div style={{ position: 'relative', zIndex: 2, color: '#fff', fontSize: '14px' }}>Role tidak ditemukan.</div>
        ) : (
          <div style={{ position: 'relative', zIndex: 2, background: '#fff', borderRadius: '20px', padding: '40px 32px', width: '100%', maxWidth: '360px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '64px', height: '64px', background: '#fff0ef', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '30px' }}>
              {config.icon}
            </div>
            <p style={{ fontWeight: '700', fontSize: '18px', color: '#111' }}>{config.label}</p>
            <p style={{ fontSize: '13px', color: '#999', textAlign: 'center' }}>{config.desc}</p>
            <Link href={`/login?role=${role}`} style={{ display: 'block', width: '100%', textAlign: 'center', background: '#fd1d00', color: '#fff', padding: '10px 0', borderRadius: '10px', fontSize: '14px', fontWeight: '600', textDecoration: 'none' }}>
              Masuk
            </Link>
          </div>
        )}
      </div>

      <footer style={{ background: '#fff', color: '#111', padding: '48px 32px 24px', fontFamily: 'sans-serif', borderTop: '1px solid #e5e5e5' }}>
  <div style={{ maxWidth: '900px', margin: '0 auto' }}>
    
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '32px', marginBottom: '40px' }}>
      
      <div>
        <p style={{ fontWeight: '700', fontSize: '13px', color: '#111', marginBottom: '12px', letterSpacing: '0.05em' }}>ROLE SISWA</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {['Isi Absen', 'Ongoing Absen', 'Riwayat Absen', 'Laporan Masalah'].map(item => (
            <span key={item} style={{ fontSize: '13px', color: '#555' }}>{item}</span>
          ))}
        </div>
      </div>

      <div>
        <p style={{ fontWeight: '700', fontSize: '13px', color: '#111', marginBottom: '12px', letterSpacing: '0.05em' }}>ROLE GURU</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {['Data Absen Kelas', 'Laporan Absen', 'Laporan Masalah', 'Dispensasi'].map(item => (
            <span key={item} style={{ fontSize: '13px', color: '#555' }}>{item}</span>
          ))}
        </div>
      </div>

      <div>
        <p style={{ fontWeight: '700', fontSize: '13px', color: '#111', marginBottom: '12px', letterSpacing: '0.05em' }}>ROLE BK</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {['Ongoing Absen', 'Laporan Masalah', 'History Laporan', 'Reset Absen'].map(item => (
            <span key={item} style={{ fontSize: '13px', color: '#555' }}>{item}</span>
          ))}
        </div>
      </div>

      <div>
        <p style={{ fontWeight: '700', fontSize: '13px', color: '#111', marginBottom: '12px', letterSpacing: '0.05em' }}>ROLE ADMIN</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {['Kelola Akun Guru', 'Kelola Akun BK', 'Kelola Akun Siswa', 'Manajemen Data'].map(item => (
            <span key={item} style={{ fontSize: '13px', color: '#555' }}>{item}</span>
          ))}
        </div>
      </div>

    </div>

    <div style={{ borderTop: '1px solid #e5e5e5', paddingTop: '20px', textAlign: 'center' }}>
      <p style={{ fontSize: '13px', color: 'rgba(0,0,0,0.4)' }}>
        2026 · NamaSekolah@gmail.com · Website Resmi Sekolah
      </p>
    </div>

  </div>
</footer>

      {/* About Us Popup */}
      {showAbout && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '24px' }} onClick={() => setShowAbout(false)}>
          <div style={{ background: '#fff', borderRadius: '20px', padding: '40px', width: '100%', maxWidth: '680px', maxHeight: '85vh', overflowY: 'auto', position: 'relative' }} onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowAbout(false)} style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', color: '#999', fontWeight: '600' }}>✕</button>
            <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#111', marginBottom: '20px' }}>About Us</h2>
            <p style={{ fontSize: '14px', color: '#555', lineHeight: '1.8', marginBottom: '12px' }}>Kami adalah platform absensi digital yang membantu sekolah mengelola kehadiran dengan lebih mudah, cepat, dan efisien. Sistem kami dirancang minimalis, praktis, dan dapat diakses kapan saja.</p>
            <p style={{ fontSize: '14px', color: '#555', lineHeight: '1.8', marginBottom: '12px' }}>Visi kami adalah menjadi solusi absensi digital terpercaya yang memudahkan manajemen kehadiran secara modern dan efisien. Misi kami adalah menghadirkan sistem absensi yang mudah digunakan, membantu pengelolaan data kehadiran lebih cepat dan akurat, serta mendukung transformasi digital untuk perusahaan dan institusi.</p>
            <p style={{ fontSize: '14px', color: '#555', lineHeight: '1.8', marginBottom: '28px' }}>Brand ini hadir dari kebutuhan akan sistem absensi yang lebih praktis dibanding metode manual, karena kami percaya teknologi dapat meningkatkan efisiensi, kedisiplinan, dan produktivitas.</p>
            <hr style={{ border: 'none', borderTop: '1px solid #e5e5e5', marginBottom: '24px' }} />
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111', marginBottom: '12px' }}>Latar Belakang</h3>
            <p style={{ fontSize: '14px', color: '#555', lineHeight: '1.8' }}>Brand ini hadir dari kebutuhan akan sistem absensi yang lebih praktis, cepat, dan efisien dibanding metode manual. Banyak perusahaan dan institusi masih menggunakan pencatatan kehadiran secara konvensional yang memakan waktu dan rentan kesalahan. Karena itu, kami menghadirkan solusi absensi digital yang modern, mudah digunakan, dan membantu meningkatkan efisiensi serta produktivitas.</p>
          </div>
        </div>
      )}
    </main>
  );
}

export default function AppPage() {
  return (
    <Suspense>
      <AppContent />
    </Suspense>
  );
}