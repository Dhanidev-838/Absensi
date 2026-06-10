'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function Home() {
  const [showAbout, setShowAbout] = useState(false);

  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: 'sans-serif' }}>

      {/* Navbar */}
      <nav style={{
        background: '#fff', borderBottom: '1px solid #e5e5e5',
        padding: '14px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        position: 'sticky', top: 0, zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px', height: '36px', background: '#fd1d00',
            borderRadius: '10px', display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: '18px'
          }}>📋</div>
          <span style={{ fontSize: '16px', fontWeight: '600', color: '#111' }}>Website Absensi</span>
        </div>

        <button onClick={() => setShowAbout(true)} style={{
          background: '#f5f5f5', color: '#111', border: '1px solid #e5e5e5',
          borderRadius: '10px', padding: '8px 20px', fontSize: '13px',
          fontWeight: '600', cursor: 'pointer'
        }}>About Us</button>
      </nav>

      {/* Hero + Cards */}
      <div style={{
  flex: 1,
  position: 'relative',
  display: 'flex', flexDirection: 'column',
  alignItems: 'center', justifyContent: 'center',
  padding: '48px 24px',
}}>
  <video autoPlay loop muted playsInline style={{
    position: 'absolute', inset: 0,
    width: '100%', height: '100%',
    objectFit: 'cover', zIndex: 0
  }}>
    <source src="/uploads/backtoschool.mp4" type="video/mp4" />
  </video>
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1 }}></div>

        <div style={{ position: 'relative', zIndex: 2, width: '100%', maxWidth: '520px' }}>
          <h1 style={{
            fontSize: '28px', fontWeight: '700', color: '#fff',
            textAlign: 'center', marginBottom: '8px'
          }}>Sistem Absensi Digital</h1>
          <p style={{
            fontSize: '14px', color: 'rgba(255,255,255,0.75)',
            textAlign: 'center', marginBottom: '32px'
          }}>Pilih peran untuk masuk ke sistem</p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
            {/* Siswa */}
            <div style={{
              background: '#fff', borderRadius: '20px',
              padding: '24px 16px', display: 'flex', flexDirection: 'column',
              alignItems: 'center', gap: '12px'
            }}>
              <div style={{
                width: '56px', height: '56px', background: '#fff0ef',
                borderRadius: '50%', display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: '26px'
              }}>👤</div>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontWeight: '600', color: '#111', fontSize: '15px' }}>Siswa</p>
                <p style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>Login atau daftar akun baru</p>
              </div>
              <Link href="/login?role=siswa" style={{
                display: 'block', width: '100%', textAlign: 'center',
                background: '#fd1d00', color: '#fff', padding: '8px 0',
                borderRadius: '10px', fontSize: '13px', fontWeight: '600',
                textDecoration: 'none'
              }}>Masuk</Link>
            </div>

            {/* Guru */}
            <div style={{
              background: '#fff', borderRadius: '20px',
              padding: '24px 16px', display: 'flex', flexDirection: 'column',
              alignItems: 'center', gap: '12px'
            }}>
              <div style={{
                width: '56px', height: '56px', background: '#f5f5f5',
                borderRadius: '50%', display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: '26px'
              }}>🏫</div>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontWeight: '600', color: '#111', fontSize: '15px' }}>Guru / Walas</p>
                <p style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>Kelola absen & laporan kelas</p>
              </div>
              <Link href="/login?role=guru" style={{
                display: 'block', width: '100%', textAlign: 'center',
                background: '#fd1d00', color: '#fff', padding: '8px 0',
                borderRadius: '10px', fontSize: '13px', fontWeight: '600',
                textDecoration: 'none'
              }}>Masuk</Link>
            </div>

            {/* BK */}
            <div style={{
              background: '#fff', borderRadius: '20px',
              padding: '24px 16px', display: 'flex', flexDirection: 'column',
              alignItems: 'center', gap: '12px'
            }}>
              <div style={{
                width: '56px', height: '56px', background: '#f5f5f5',
                borderRadius: '50%', display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: '26px'
              }}>🏢</div>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontWeight: '600', color: '#111', fontSize: '15px' }}>BK / Kesiswaan</p>
                <p style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>Proses laporan & dispensasi</p>
              </div>
              <Link href="/login?role=bk" style={{
                display: 'block', width: '100%', textAlign: 'center',
                background: '#fd1d00', color: '#fff', padding: '8px 0',
                borderRadius: '10px', fontSize: '13px', fontWeight: '600',
                textDecoration: 'none'
              }}>Masuk</Link>
            </div>

            {/* Admin */}
            <div style={{
              background: '#fff', borderRadius: '20px',
              padding: '24px 16px', display: 'flex', flexDirection: 'column',
              alignItems: 'center', gap: '12px'
            }}>
              <div style={{
                width: '56px', height: '56px', background: '#f5f5f5',
                borderRadius: '50%', display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: '26px'
              }}>⚙️</div>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontWeight: '600', color: '#111', fontSize: '15px' }}>Admin</p>
                <p style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>Kelola akun guru & BK</p>
              </div>
              <Link href="/login?role=admin" style={{
                display: 'block', width: '100%', textAlign: 'center',
                background: '#fd1d00', color: '#fff', padding: '8px 0',
                borderRadius: '10px', fontSize: '13px', fontWeight: '600',
                textDecoration: 'none'
              }}>Masuk</Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
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
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 200, padding: '24px'
        }} onClick={() => setShowAbout(false)}>
          <div style={{
            background: '#fff', borderRadius: '20px', padding: '40px',
            width: '100%', maxWidth: '680px', maxHeight: '85vh',
            overflowY: 'auto', position: 'relative'
          }} onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowAbout(false)} style={{
              position: 'absolute', top: '20px', right: '20px',
              background: 'none', border: 'none', fontSize: '22px',
              cursor: 'pointer', color: '#999', fontWeight: '600'
            }}>✕</button>

            <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#111', marginBottom: '20px' }}>About Us</h2>

            <p style={{ fontSize: '14px', color: '#555', lineHeight: '1.8', marginBottom: '12px' }}>
              Kami adalah platform absensi digital yang membantu sekolah mengelola kehadiran dengan lebih mudah, cepat, dan efisien. Sistem kami dirancang minimalis, praktis, dan dapat diakses kapan saja.
            </p>
            <p style={{ fontSize: '14px', color: '#555', lineHeight: '1.8', marginBottom: '12px' }}>
              Visi kami adalah menjadi solusi absensi digital terpercaya yang memudahkan manajemen kehadiran secara modern dan efisien. Misi kami adalah menghadirkan sistem absensi yang mudah digunakan, membantu pengelolaan data kehadiran lebih cepat dan akurat, serta mendukung transformasi digital untuk perusahaan dan institusi.
            </p>
            <p style={{ fontSize: '14px', color: '#555', lineHeight: '1.8', marginBottom: '28px' }}>
              Brand ini hadir dari kebutuhan akan sistem absensi yang lebih praktis dibanding metode manual, karena kami percaya teknologi dapat meningkatkan efisiensi, kedisiplinan, dan produktivitas.
            </p>

            <hr style={{ border: 'none', borderTop: '1px solid #e5e5e5', marginBottom: '24px' }} />

            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111', marginBottom: '12px' }}>Latar Belakang</h3>
            <p style={{ fontSize: '14px', color: '#555', lineHeight: '1.8' }}>
              Brand ini hadir dari kebutuhan akan sistem absensi yang lebih praktis, cepat, dan efisien dibanding metode manual. Banyak perusahaan dan institusi masih menggunakan pencatatan kehadiran secara konvensional yang memakan waktu dan rentan kesalahan. Karena itu, kami menghadirkan solusi absensi digital yang modern, mudah digunakan, dan membantu meningkatkan efisiensi serta produktivitas.
            </p>
          </div>
        </div>
      )}
    </main>
  );
}