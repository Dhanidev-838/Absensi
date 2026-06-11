'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';



export default function DashboardSiswa() {
  const router = useRouter();
  const [tab, setTab] = useState<'absen' | 'sekarang'>('absen');
  const [kategori, setKategori] = useState<'hadir' | 'izin' | 'sakit'>('hadir');
  const [showKategori, setShowKategori] = useState(false);
  const [foto, setFoto] = useState<string | null>(null);
  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [historySekarang, setHistorySekarang] = useState<any[]>([]);
  const [bisaAbsen, setBisaAbsen] = useState(false);
  const [userName, setUserName] = useState('');
  const [userKelas, setUserKelas] = useState('');
  const [kameraAktif, setKameraAktif] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [token, setToken] = useState('');
  const [fotoUpdate, setFotoUpdate] = useState<string | null>(null);
  const [kameraUpdateAktif, setKameraUpdateAktif] = useState(false);
  const videoUpdateRef = useRef<HTMLVideoElement>(null);
  const streamUpdateRef = useRef<MediaStream | null>(null);
  const [kategoriUpdate, setKategoriUpdate] = useState<'hadir' | 'izin' | 'sakit'>('hadir');
  const [showKategoriUpdate, setShowKategoriUpdate] = useState(false);
  const [rekap, setRekap] = useState<any>(null);
  const [siswaList, setSiswaList] = useState<any[]>([]);

  useEffect(() => {
    const t = localStorage.getItem('token') || '';
    setToken(t);
    cekWaktu();
    fetchHistory(t);
  }, []);

  
function cekWaktu() {
  // const now = new Date();
  // const totalMenit = now.getHours() * 60 + now.getMinutes();
  // const bisaAbsen = totalMenit >= 6 * 60 && totalMenit <= 8 * 60;
  // setBisaAbsen(bisaAbsen);
  setBisaAbsen(true); // sementara testing
}

  async function fetchHistory(t: string) {
  const res = await fetch('/api/absen', {
    headers: { Authorization: `Bearer ${t}` },
  });
  const data = await res.json();
  if (res.ok) {
    setHistorySekarang(data.hari_ini || []);
    setSiswaList(data.siswa || []);
    setRekap(data.rekap || null);
    setUserName(data.nama);
    setUserKelas(data.kelas);
  }
}

  async function bukakamera() {
    setKameraAktif(true);
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
    streamRef.current = stream;
    if (videoRef.current) videoRef.current.srcObject = stream;
  }

  function tutupKamera() {
    streamRef.current?.getTracks().forEach(t => t.stop());
    setKameraAktif(false);
  }

  function ambilFoto() {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d')?.drawImage(video, 0, 0);
    setFoto(canvas.toDataURL('image/jpeg'));
    tutupKamera();
  }

  async function handleAbsen() {
    if (!foto) return setMsg('Ambil foto selfie dulu');
    setLoading(true);
    setMsg('');
    const blob = await (await fetch(foto)).blob();
    const file = new File([blob], 'selfie.jpg', { type: 'image/jpeg' });
    const formData = new FormData();
    formData.append('foto', file);
    formData.append('status', kategori);
    const res = await fetch('/api/absen', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) return setMsg(data.message || 'Gagal absen');
    setMsg('Absen berhasil!');
    setFoto(null);
    fetchHistory(token);
    setTab('sekarang');
  }

  async function handleEditFoto(id: number) {
    if (!fotoFile) return setMsg('Ambil foto dulu');
    setLoading(true);
    setMsg('');
    const formData = new FormData();
    formData.append('foto', fotoFile);
    formData.append('id', String(id));
    formData.append('status', kategoriUpdate);
    const res = await fetch('/api/absen', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) return setMsg(data.message || 'Gagal update foto');
    setMsg('Foto berhasil diupdate!');
    setFotoUpdate(null);
    setFotoFile(null);
    setKategoriUpdate('hadir');
    fetchHistory(token);
  }

  async function bukaKameraUpdate() {
    setKameraUpdateAktif(true);
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
    streamUpdateRef.current = stream;
    if (videoUpdateRef.current) videoUpdateRef.current.srcObject = stream;
  }

  function tutupKameraUpdate() {
    streamUpdateRef.current?.getTracks().forEach(t => t.stop());
    setKameraUpdateAktif(false);
  }

  function ambilFotoUpdate() {
    const video = videoUpdateRef.current;
    if (!video) return;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d')?.drawImage(video, 0, 0);
    canvas.toBlob((blob) => {
      if (blob) setFotoFile(new File([blob], 'update.jpg', { type: 'image/jpeg' }));
    }, 'image/jpeg');
    setFotoUpdate(canvas.toDataURL('image/jpeg'));
    tutupKameraUpdate();
  }

  async function handleLogout() {
    localStorage.removeItem('token');
    router.push('/');
  }

  const statusColor: Record<string, string> = {
    hadir: '#16a34a', izin: '#d97706', sakit: '#2563eb',
    alpha: '#dc2626',
  };

  return (
    <main style={{ minHeight: '100vh', background: '#f5f5f5', fontFamily: 'sans-serif', display: 'flex', flexDirection: 'column' }}>
      <div style={{
        background: '#fff', borderBottom: '1px solid #e5e5e5',
        padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px', height: '36px', background: '#fd1d00',
            borderRadius: '10px', display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: '18px'
          }}>📋</div>
          <div>
            <p style={{ fontSize: '15px', fontWeight: '600', color: '#111' }}>Dashboard Siswa {userKelas && `- ${userKelas}`}</p>
            <p style={{ fontSize: '12px', color: '#999' }}>{userName}</p>
          </div>
        </div>
        <button onClick={handleLogout} style={{
          background: '#fff', border: '1px solid #e5e5e5', borderRadius: '10px',
          padding: '8px 16px', fontSize: '13px', cursor: 'pointer', color: '#111'
        }}>Logout</button>
      </div>

      <div style={{
        display: 'flex', gap: '8px', padding: '16px 24px',
        borderBottom: '1px solid #e5e5e5', background: '#fff'
      }}>
        {[
          { key: 'absen', label: '📸 Isi Absen' },
          { key: 'sekarang', label: '📋 Ongoing Absen' },
        ].map(t => (
          <button key={t.key} onClick={() => { setTab(t.key as any); setMsg(''); }} style={{
            padding: '8px 16px', borderRadius: '10px', fontSize: '13px',
            fontWeight: tab === t.key ? '600' : '400',
            background: tab === t.key ? '#fd1d00' : '#f5f5f5',
            color: tab === t.key ? '#fff' : '#555',
            border: 'none', cursor: 'pointer'
          }}>{t.label}</button>
        ))}
      </div>

      <div style={{ padding: '24px', maxWidth: '700px', margin: '0 auto', width: '100%', flex: 1 }}>

        {tab === 'absen' && (
          <div style={{ background: '#fff', borderRadius: '20px', border: '1px solid #e5e5e5', padding: '24px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#111', marginBottom: '4px' }}>Isi Absen Hari Ini</h2>
            <p style={{ fontSize: '13px', color: '#999', marginBottom: '20px' }}>Batas Absen dari jam 06:00 sampai 08:00</p>

            {!bisaAbsen ? (
              <div style={{
                background: '#fff0ef', border: '1px solid #fd1d00',
                borderRadius: '10px', padding: '12px 16px', color: '#fd1d00', fontSize: '14px'
              }}>⏰ Waktu absen sudah habis (06:00 - 08:00)</div>
            ) : (
              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', minWidth: '130px' }}>
                  <button onClick={kameraAktif ? ambilFoto : bukakamera} style={{
                    background: '#fd1d00', color: '#fff', border: 'none',
                    borderRadius: '10px', padding: '10px 16px', fontSize: '13px',
                    fontWeight: '600', cursor: 'pointer', textAlign: 'left'
                  }}>{kameraAktif ? '📸 Ambil Foto' : '📷 Isi Absen'}</button>

                  {kameraAktif && (
                    <button onClick={tutupKamera} style={{
                      background: '#f5f5f5', color: '#555', border: '1px solid #e5e5e5',
                      borderRadius: '10px', padding: '8px 16px', fontSize: '13px',
                      cursor: 'pointer', textAlign: 'left'
                    }}>✕ Tutup</button>
                  )}

                  <div style={{ position: 'relative' }}>
                    <button onClick={() => setShowKategori(!showKategori)} style={{
                      background: '#fd1d00', color: '#fff', border: 'none',
                      borderRadius: '10px', padding: '10px 16px', fontSize: '13px',
                      fontWeight: '600', cursor: 'pointer', width: '100%', textAlign: 'left'
                    }}>Kategory ▾</button>
                    {showKategori && (
                      <div style={{
                        position: 'absolute', top: '100%', left: 0, background: '#fff',
                        border: '1px solid #e5e5e5', borderRadius: '10px', overflow: 'hidden',
                        zIndex: 10, marginTop: '4px', width: '100%',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                      }}>
                        {['hadir', 'izin', 'sakit'].map(k => (
                          <button key={k} onClick={() => { setKategori(k as any); setShowKategori(false); }} style={{
                            display: 'block', width: '100%', padding: '10px 16px',
                            fontSize: '13px', border: 'none',
                            background: kategori === k ? '#f5f5f5' : '#fff',
                            cursor: 'pointer', textAlign: 'left',
                          }}>{k.charAt(0).toUpperCase() + k.slice(1)}</button>
                        ))}
                      </div>
                    )}
                  </div>

                  <span style={{
  fontSize: '12px', fontWeight: '600',
  background: kategori === 'hadir' ? '#f0fdf4' : '#faf5ff',
  color: kategori === 'hadir' ? '#16a34a' : '#7e22ce',
  padding: '4px 10px', borderRadius: '20px', textAlign: 'center'
}}>{kategori.toUpperCase()}</span>
                </div>

                <div style={{
                  flex: 1, border: '1px solid #e5e5e5', borderRadius: '12px',
                  overflow: 'hidden', minHeight: '220px', background: '#f5f5f5',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  {kameraAktif ? (
                    <video ref={videoRef} autoPlay playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : foto ? (
                    <img src={foto} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <p style={{ color: '#ccc', fontSize: '13px' }}>Preview kamera</p>
                  )}
                </div>
              </div>
            )}

            {msg && (
              <p style={{ fontSize: '13px', marginTop: '12px', color: msg.includes('berhasil') ? '#16a34a' : '#fd1d00' }}>{msg}</p>
            )}

            {foto && !kameraAktif && bisaAbsen && (
              <button onClick={handleAbsen} disabled={loading} style={{
                background: '#fd1d00', color: '#fff', border: 'none',
                borderRadius: '10px', padding: '12px', fontSize: '14px',
                fontWeight: '600', cursor: 'pointer', width: '100%', marginTop: '16px'
              }}>{loading ? 'Mengirim...' : 'Kirim Absen'}</button>
            )}
          </div>
        )}

        {tab === 'sekarang' && (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

    {rekap && (
      <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e5e5e5', padding: '16px' }}>
        <p style={{ fontWeight: '600', fontSize: '14px', color: '#111', marginBottom: '12px' }}>
          Rekap Kehadiran Kamu {rekap.mulai_dari && `(sejak ${new Date(rekap.mulai_dari).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })})`}
        </p>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {[
            { label: 'Hadir',  val: rekap.hadir,  color: '#16a34a' },
            { label: 'Izin',   val: rekap.izin,   color: '#d97706' },
            { label: 'Sakit',  val: rekap.sakit,  color: '#2563eb' },

            { label: 'Alpha',  val: rekap.alpha,  color: '#dc2626' },
          ].map(({ label, val, color }) => (
            <div key={label} style={{
              background: color + '15', border: `1px solid ${color}30`,
              borderRadius: '10px', padding: '10px 16px', textAlign: 'center', flex: 1, minWidth: '60px'
            }}>
              <p style={{ fontSize: '20px', fontWeight: '700', color }}>{val || 0}</p>
              <p style={{ fontSize: '11px', color, fontWeight: '600' }}>{label}</p>
            </div>
          ))}
        </div>
      </div>
    )}

    <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e5e5e5', overflow: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '500px' }}>
        <thead>
          <tr style={{ background: '#fd1d00' }}>
            {['Nama', 'Foto Hari Ini', 'Status Hari Ini', 'Hadir', 'Izin', 'Sakit', 'Alpha'].map(h => (
              <th key={h} style={{
                padding: '12px 10px', fontSize: '12px', fontWeight: '600',
                color: '#fff', textAlign: 'center', borderRight: '1px solid rgba(255,255,255,0.2)'
              }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
  {siswaList.length === 0 ? (
    <tr><td colSpan={8} style={{ padding: '24px', textAlign: 'center', color: '#999' }}>Belum ada data</td></tr>
  ) : siswaList.map((item, i) => (
    <tr key={item.user_id} style={{ borderTop: '1px solid #e5e5e5', background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
      <td style={{ padding: '12px 10px', fontSize: '13px', color: '#111', textAlign: 'center', fontWeight: '500' }}>{item.nama}</td>
      <td style={{ padding: '12px 10px', textAlign: 'center' }}>
        {item.foto ? (
          <img src={item.foto} style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover', margin: '0 auto', display: 'block' }} />
        ) : (
          <span style={{ fontSize: '12px', color: '#999' }}>-</span>
        )}
      </td>
      <td style={{ padding: '12px 10px', textAlign: 'center' }}>
        <span style={{
          background: (statusColor[item.status_hari_ini || ''] || '#888') + '20',
          color: statusColor[item.status_hari_ini || ''] || '#888',
          padding: '4px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: '600'
        }}>{item.status_hari_ini?.toUpperCase() || 'BELUM'}</span>
      </td>
      <td style={{ padding: '12px 8px', textAlign: 'center', color: '#16a34a', fontWeight: '700', fontSize: '14px' }}>{item.hadir || 0}</td>
      <td style={{ padding: '12px 8px', textAlign: 'center', color: '#d97706', fontWeight: '700', fontSize: '14px' }}>{item.izin || 0}</td>
      <td style={{ padding: '12px 8px', textAlign: 'center', color: '#2563eb', fontWeight: '700', fontSize: '14px' }}>{item.sakit || 0}</td>
      <td style={{ padding: '12px 8px', textAlign: 'center', color: '#dc2626', fontWeight: '700', fontSize: '14px' }}>{item.alpha || 0}</td>
    </tr>
  ))}
</tbody>
      </table>
    </div>

            {bisaAbsen && historySekarang.length > 0 && (
              <div style={{ background: '#fff', borderRadius: '20px', border: '1px solid #e5e5e5', padding: '24px' }}>
                <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#111', marginBottom: '4px' }}>Update Foto Selfie</h2>
                <p style={{ fontSize: '13px', color: '#999', marginBottom: '20px' }}>Ganti foto absen Anda hari ini</p>

                <div style={{ display: 'flex', gap: '16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', minWidth: '130px' }}>
                    <button onClick={kameraUpdateAktif ? ambilFotoUpdate : bukaKameraUpdate} style={{
                      background: '#fd1d00', color: '#fff', border: 'none',
                      borderRadius: '10px', padding: '10px 16px', fontSize: '13px',
                      fontWeight: '600', cursor: 'pointer', textAlign: 'left'
                    }}>{kameraUpdateAktif ? '📸 Ambil Foto' : '📷 Buka Kamera'}</button>

                    {kameraUpdateAktif && (
                      <button onClick={tutupKameraUpdate} style={{
                        background: '#f5f5f5', color: '#555', border: '1px solid #e5e5e5',
                        borderRadius: '10px', padding: '8px 16px', fontSize: '13px',
                        cursor: 'pointer', textAlign: 'left'
                      }}>✕ Tutup</button>
                    )}

                    <div style={{ position: 'relative' }}>
                      <button onClick={() => setShowKategoriUpdate(!showKategoriUpdate)} style={{
                        background: '#fd1d00', color: '#fff', border: 'none',
                        borderRadius: '10px', padding: '10px 16px', fontSize: '13px',
                        fontWeight: '600', cursor: 'pointer', width: '100%', textAlign: 'left'
                      }}>Kategory ▾</button>
                      {showKategoriUpdate && (
                        <div style={{
                          position: 'absolute', top: '100%', left: 0, background: '#fff',
                          border: '1px solid #e5e5e5', borderRadius: '10px', overflow: 'hidden',
                          zIndex: 10, marginTop: '4px', width: '100%',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                        }}>
                          {['hadir', 'izin', 'sakit'].map(k => (
                            <button key={k} onClick={() => { setKategoriUpdate(k as any); setShowKategoriUpdate(false); }} style={{
                              display: 'block', width: '100%', padding: '10px 16px',
                              fontSize: '13px', border: 'none',
                              background: kategoriUpdate === k ? '#f5f5f5' : '#fff',
                              cursor: 'pointer', textAlign: 'left',
                            }}>{k.charAt(0).toUpperCase() + k.slice(1)}</button>
                          ))}
                        </div>
                      )}
                    </div>

                    <span style={{
  fontSize: '12px', fontWeight: '600',
  background: kategoriUpdate === 'hadir' ? '#f0fdf4' : '#faf5ff',
  color: kategoriUpdate === 'hadir' ? '#16a34a' : '#7e22ce',
  padding: '4px 10px', borderRadius: '20px', textAlign: 'center'
}}>{kategoriUpdate.toUpperCase()}</span>
                  </div>

                  <div style={{
                    flex: 1, border: '1px solid #e5e5e5', borderRadius: '12px',
                    overflow: 'hidden', minHeight: '220px', background: '#f5f5f5',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    {kameraUpdateAktif ? (
                      <video ref={videoUpdateRef} autoPlay playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : fotoUpdate ? (
                      <img src={fotoUpdate} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <p style={{ color: '#ccc', fontSize: '13px' }}>Preview kamera</p>
                    )}
                  </div>
                </div>

                {msg && (
                  <p style={{ fontSize: '13px', marginTop: '12px', color: msg.includes('berhasil') ? '#16a34a' : '#fd1d00' }}>{msg}</p>
                )}

                {fotoUpdate && !kameraUpdateAktif && (
                  <button onClick={() => handleEditFoto(historySekarang[0].id)} disabled={loading} style={{
                    background: '#fd1d00', color: '#fff', border: 'none',
                    borderRadius: '10px', padding: '12px', fontSize: '14px',
                    fontWeight: '600', cursor: 'pointer', width: '100%', marginTop: '16px'
                  }}>{loading ? 'Mengirim...' : 'Update Foto'}</button>
                )}
              </div>
            )}
          </div>
        )}

      </div>

      <footer style={{
        background: '#fff', color: 'rgba(0,0,0,0.5)',
        padding: '16px 32px', textAlign: 'center', fontSize: '13px',
        borderTop: '1px solid #e5e5e5'
      }}>
        2026 · NamaSekolah@gmail.com · Website Resmi Sekolah
      </footer>
    </main>
  );
}