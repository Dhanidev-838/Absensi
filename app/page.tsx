'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Home() {
  const [showAbout, setShowAbout] = useState(false);
  const [navHidden, setNavHidden] = useState(false);
  const [navScrolled, setNavScrolled] = useState(false);

  useEffect(() => {
    let lastScrollY = window.scrollY;
    const handleScroll = () => {
      const currentScroll = window.scrollY;
      setNavScrolled(currentScroll > 10);
      setNavHidden(currentScroll > lastScrollY && currentScroll > 100);
      lastScrollY = currentScroll;
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: 'sans-serif' }}>

      {/* Navbar */}
      <nav style={{
        background: '#fff',
        borderBottom: navScrolled ? 'none' : '1px solid #e5e5e5',
        boxShadow: navScrolled ? '0 2px 12px rgba(0,0,0,0.08)' : 'none',
        padding: '14px 32px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        transform: navHidden ? 'translateY(-100%)' : 'translateY(0)',
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
        flex: 1, position: 'relative',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '48px 24px', marginTop: '64px',
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
            {[
              { role: 'siswa', icon: '👤', label: 'Siswa', desc: 'Login atau daftar akun baru' },
              { role: 'guru', icon: '🏫', label: 'Guru / Walas', desc: 'Kelola absen & laporan kelas' },
              { role: 'bk', icon: '🏢', label: 'BK / Kesiswaan', desc: 'Proses laporan & cetak excel' },
              { role: 'admin', icon: '⚙️', label: 'Admin', desc: 'Kelola akun guru & BK' },
            ].map(({ role, icon, label, desc }) => (
              <div key={role} style={{
                background: '#fff', borderRadius: '20px',
                padding: '24px 16px', display: 'flex', flexDirection: 'column',
                alignItems: 'center', gap: '12px'
              }}>
                <div style={{
                  width: '56px', height: '56px', background: role === 'siswa' ? '#fff0ef' : '#f5f5f5',
                  borderRadius: '50%', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: '26px'
                }}>{icon}</div>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontWeight: '600', color: '#111', fontSize: '15px' }}>{label}</p>
                  <p style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>{desc}</p>
                </div>
                <Link href={`/login?role=${role}`} style={{
                  display: 'block', width: '100%', textAlign: 'center',
                  background: '#fd1d00', color: '#fff', padding: '8px 0',
                  borderRadius: '10px', fontSize: '13px', fontWeight: '600',
                  textDecoration: 'none'
                }}>Masuk</Link>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tentang Sekolah */}
      <section style={{ background: '#fff', padding: '64px 32px', borderTop: '1px solid #e5e5e5' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr auto', gap: '48px', alignItems: 'start' }}>
          <div>
            <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#111', marginBottom: '20px' }}>Tentang Sekolah</h2>
            <p style={{ fontSize: '14px', color: '#555', lineHeight: '1.8', marginBottom: '32px' }}>
              Yayasan AT-TAQWA Kemiri Jaya dibangun pada tahun 2004 di Jl. Raya Tanah Baru No.99 Kemiri Jaya, Beji, Depok 16421. Yayasan ini diprakarsai serta di miliki oleh Bpk. H. Drs. Nasan, M.M, kemudian di tahun sama sekolah SMK Citra Negara dibuka. Sekolah SMK Citra Negara berdiri pada tahun 2004, pada awal berdirinya SMK Citra Negara yang berada di bawah yayasan AT-TAQWA hanya memiliki 1 program keahlian yaitu Tata Niaga (TN). Kemudian pada tahun 2007 SMK Citra Negara kembali membuka program keahlian baru yaitu Teknik Komputer Jaringan (TKJ), lalu jurusan Multimedia (MM) pada tahun 2011, jurusan Administrasi Perkantoran (AP) pada tahun 2015, dan yang terakhir adalah jurusan Rekayasa Perangkat Lunak (RPL) yang didirikan pada tahun yang sama dengan jurusan AP yaitu pada tahun 2015. Sehingga total Program keahlian yang dimiliki SMK Citra Negara pada saat ini berjumlah 5 jurusan.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
              {[
                { label: 'Nama Sekolah', value: 'SMK CITRA NEGARA' },
                { label: 'Lokasi', value: 'Jl. Tanah Baru Jl. Kemiri Jaya No.99, Beji, Kecamatan Beji, Kota Depok, Jawa Barat 16421' },
                { label: 'Naungan', value: 'Yayasan AT-TAQWA Kemiri Jaya' },
                { label: 'Fokus', value: 'Mencetak lulusan vokasi yang kompeten, berkarakter kuat, dan siap bersaing di dunia kerja' },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p style={{ fontSize: '13px', fontWeight: '700', color: '#111', marginBottom: '6px' }}>{label}</p>
                  <p style={{ fontSize: '13px', color: '#555', lineHeight: '1.6' }}>{value}</p>
                </div>
              ))}
            </div>
          </div>
          <img src="/uploads/Citra-Negara.png" alt="Logo Sekolah" style={{ width: '160px', height: '160px', objectFit: 'contain' }} />
        </div>
      </section>

      <section style={{ background: '#fff', padding: '64px 32px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '64px' }}>

          {/* Apa itu Absensi Digital */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
              <p style={{ fontSize: '12px', fontWeight: '700', color: '#fd1d00', letterSpacing: '0.1em', marginBottom: '8px' }}>TENTANG SISTEM</p>
              <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#111', marginBottom: '16px', lineHeight: 1.3 }}>Apa itu Absensi Digital?</h2>
              <p style={{ fontSize: '14px', color: '#555', lineHeight: '1.8' }}>
                Absensi Digital adalah sistem pencatatan kehadiran berbasis web yang menggantikan absensi manual dengan teknologi modern. Sistem ini memungkinkan siswa melakukan absensi secara mandiri melalui perangkat masing-masing dengan verifikasi foto selfie, sehingga proses pencatatan kehadiran menjadi lebih efisien, akurat, dan transparan.
Dengan absensi digital, data kehadiran tercatat secara otomatis dan real-time, dapat diakses kapan saja oleh guru, BK, maupun admin sekolah. Sistem ini juga dilengkapi fitur laporan, rekap kehadiran, dan notifikasi otomatis untuk siswa yang tidak hadir, sehingga memudahkan pihak sekolah dalam memantau dan mengelola kehadiran siswa secara menyeluruh.
              </p>
            </div>
            <div style={{
              background: '#f9f9f9', borderRadius: '16px', padding: '24px',
              display: 'flex', flexDirection: 'column', gap: '12px'
            }}>
              {[
                { icon: '📸', text: 'Absen via foto selfie' },
                { icon: '📊', text: 'Rekap kehadiran real-time' },
                { icon: '🔔', text: 'Auto-alpha jika tidak hadir' },
                { icon: '📥', text: 'Ekspor laporan ke Excel' },
              ].map(({ icon, text }) => (
                <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '20px' }}>{icon}</span>
                  <p style={{ fontSize: '14px', color: '#333' }}>{text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Jurusan yang dipantau */}
          <div>
            <p style={{ fontSize: '12px', fontWeight: '700', color: '#fd1d00', letterSpacing: '0.1em', marginBottom: '8px' }}>CAKUPAN</p>
            <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#111', marginBottom: '24px' }}>Berbagai Jurusan yang kami pantau</h2>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {['TJKT', 'PPLG', 'PEMASARAN', 'DKV', 'MPLB'].map(j => (
                <div key={j} style={{
                  border: '2px solid #e5e5e5', borderRadius: '12px',
                  padding: '16px 32px', fontSize: '14px', fontWeight: '700', color: '#111'
                }}>{j}</div>
              ))}
            </div>
          </div>

          {/* Jurusan akan datang */}
          <div>
            <p style={{ fontSize: '12px', fontWeight: '700', color: '#fd1d00', letterSpacing: '0.1em', marginBottom: '8px' }}>SEGERA HADIR</p>
            <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#111', marginBottom: '24px' }}>Jurusan yang akan datang</h2>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {['PERHOTELAN'].map(j => (
                <div key={j} style={{
                  border: '2px dashed #e5e5e5', borderRadius: '12px',
                  padding: '16px 32px', fontSize: '14px', fontWeight: '700', color: '#999'
                }}>{j}</div>
              ))}
            </div>
          </div>

          {/* Alur Penggunaan */}
          <div>
            <p style={{ fontSize: '12px', fontWeight: '700', color: '#fd1d00', letterSpacing: '0.1em', marginBottom: '8px' }}>CARA KERJA</p>
            <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#111', marginBottom: '32px' }}>Alur Penggunaan</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
              {[
                { step: '01', icon: '🔐', label: 'Login', desc: 'Masuk sesuai peran — Siswa, Guru, BK, atau Admin' },
                { step: '02', icon: '📸', label: 'Isi Status', desc: 'Siswa mengisi absen harian dengan foto selfie' },
                { step: '03', icon: '📊', label: 'Pantau Rekap', desc: 'Guru & BK memantau kehadiran siswa secara real-time' },
                { step: '04', icon: '📋', label: 'Tindak Lanjut', desc: 'BK memproses laporan dan mengekspor data ke Excel' },
              ].map(({ step, icon, label, desc }) => (
                <div key={step} style={{
                  background: '#f9f9f9', borderRadius: '16px', padding: '24px 16px',
                  display: 'flex', flexDirection: 'column', gap: '10px'
                }}>
                  <p style={{ fontSize: '11px', fontWeight: '700', color: '#fd1d00' }}>{step}</p>
                  <span style={{ fontSize: '28px' }}>{icon}</span>
                  <p style={{ fontSize: '14px', fontWeight: '700', color: '#111' }}>{label}</p>
                  <p style={{ fontSize: '12px', color: '#777', lineHeight: '1.6' }}>{desc}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: '#fff', color: '#111', padding: '48px 32px 24px', borderTop: '1px solid #e5e5e5' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '32px', marginBottom: '40px' }}>
            {[
              { title: 'ROLE SISWA', items: ['Isi Absen', 'Ongoing Absen', 'Riwayat Absen', 'Laporan Masalah'] },
              { title: 'ROLE GURU', items: ['Data Absen Kelas', 'Laporan Absen', 'Laporan Masalah', 'Dispensasi'] },
              { title: 'ROLE BK', items: ['Ongoing Absen', 'Laporan Masalah', 'History Laporan', 'Reset Absen'] },
              { title: 'ROLE ADMIN', items: ['Kelola Akun Guru', 'Kelola Akun BK', 'Kelola Akun Siswa', 'Manajemen Data'] },
            ].map(({ title, items }) => (
              <div key={title}>
                <p style={{ fontWeight: '700', fontSize: '13px', color: '#111', marginBottom: '12px', letterSpacing: '0.05em' }}>{title}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {items.map(item => (
                    <span key={item} style={{ fontSize: '13px', color: '#555' }}>{item}</span>
                  ))}
                </div>
              </div>
            ))}
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