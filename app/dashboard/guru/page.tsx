'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

type SiswaItem = {
  user_id: number;
  nama: string;
  kelas: string;
  foto: string | null;
  status_hari_ini: string | null;
  waktu_absen_hari_ini: string | null;
  hadir: number;
  izin: number;
  sakit: number;
  alpha: number;
  alasan_hari_ini: string | null;  // tambah ini
};

type LaporanItem = {
  id: number;
  judul: string;
  komentar: string;
  status: string;
  created_at: string;
};

export default function DashboardGuru() {
  const router = useRouter();
  const [tab, setTab] = useState<'absen' | 'laporan'>('absen');
  const [absenHariIni, setAbsenHariIni] = useState<SiswaItem[]>([]);
  const [laporan, setLaporan] = useState<LaporanItem[]>([]);
  const [formLaporan, setFormLaporan] = useState({ judul: '', komentar: '' });
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [userName, setUserName] = useState('');
  const [userKelas, setUserKelas] = useState('');
  const [token, setToken] = useState('');
  const [selectedLaporan, setSelectedLaporan] = useState<LaporanItem | null>(null);
  const [komentarPopup, setKomentarPopup] = useState<any[]>([]);
  const [inputBalas, setInputBalas] = useState('');
  const [editKomentarId, setEditKomentarId] = useState<number | null>(null);
  const [editKomentarIsi, setEditKomentarIsi] = useState('');
  const [rekapTotal, setRekapTotal] = useState<any>(null);
  const [showAlasanPopup, setShowAlasanPopup] = useState(false);
  const [alasanPopupItem, setAlasanPopupItem] = useState<any>(null);

  useEffect(() => {
    const t = localStorage.getItem('token') || '';
    setToken(t);
    fetchAbsen();
  }, []);

  useEffect(() => {
    if (tab === 'laporan') fetchLaporan();
  }, [tab]);

  function getToken() {
    return localStorage.getItem('token');
  }

  async function fetchAbsen() {
  const res = await fetch('/api/guru/absen', {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  const data = await res.json();
  if (!res.ok) return router.push('/login?role=guru');
  setUserName(data.nama);
  setUserKelas(data.kelas || '');
  setAbsenHariIni(data.siswa || []);
  setRekapTotal(data.rekap_total || null);
}

  async function fetchLaporan() {
    const res = await fetch('/api/laporan/masalah', {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    const data = await res.json();
    if (res.ok) setLaporan(data.laporan);
  }

  async function fetchKomentarPopup(laporanId: number) {
    const res = await fetch(`/api/komentar?laporan_id=${laporanId}`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    const data = await res.json();
    if (res.ok) setKomentarPopup(data.komentar);
  }

  async function handleEditKomentar(komentarId: number) {
    const res = await fetch(`/api/komentar/${komentarId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
      body: JSON.stringify({ isi: editKomentarIsi }),
    });
    if (res.ok) {
      setEditKomentarId(null);
      fetchKomentarPopup(selectedLaporan?.id || 0);
    }
  }

  async function handleHapusKomentar(komentarId: number) {
    const res = await fetch(`/api/komentar/${komentarId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    if (res.ok) fetchKomentarPopup(selectedLaporan?.id || 0);
  }

  async function handleBuatLaporan() {
    if (!formLaporan.judul || !formLaporan.komentar) return setMsg('Judul dan komentar wajib diisi');
    setLoading(true);
    const res = await fetch('/api/laporan/masalah', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
      body: JSON.stringify(formLaporan),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) return setMsg(data.message || 'Gagal buat laporan');
    setMsg('Laporan berhasil dikirim ke BK!');
    setFormLaporan({ judul: '', komentar: '' });
    fetchLaporan();
  }

  async function handleLogout() {
    localStorage.removeItem('token');
    router.push('/');
  }

  const statusColor: Record<string, string> = {
    hadir: '#000000', izin: '#000000', sakit: '#000000',
    alpha: '#dc2626',
  };

  return (
    <main style={{ minHeight: '100vh', background: '#f5f5f5', fontFamily: 'sans-serif', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{
        background: '#fff', borderBottom: '1px solid #e5e5e5',
        padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px', height: '36px', background: '#fd1d00',
            borderRadius: '10px', display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: '18px'
          }}>🏫</div>
          <div>
            <p style={{ fontSize: '15px', fontWeight: '600', color: '#111' }}>Dashboard Walas{userKelas && ` - ${userKelas}`}</p>
            <p style={{ fontSize: '12px', color: '#999' }}>{userName}</p>
          </div>
        </div>
        <button onClick={handleLogout} style={{
          background: '#fff', border: '1px solid #e5e5e5', borderRadius: '10px',
          padding: '8px 16px', fontSize: '13px', cursor: 'pointer', color: '#111'
        }}>Logout</button>
      </div>

      {/* Tab */}
      <div style={{
        display: 'flex', gap: '8px', padding: '16px 24px',
        borderBottom: '1px solid #e5e5e5', background: '#fff', overflowX: 'auto'
      }}>
        {[
          { key: 'absen', label: '📋 Ongoing Absen' },
          { key: 'laporan', label: '💬 Laporan Masalah' },
        ].map(t => (
          <button key={t.key} onClick={() => { setTab(t.key as any); setMsg(''); }} style={{
            padding: '8px 16px', borderRadius: '10px', fontSize: '13px',
            fontWeight: tab === t.key ? '600' : '400',
            background: tab === t.key ? '#fd1d00' : '#f5f5f5',
            color: tab === t.key ? '#fff' : '#555',
            border: 'none', cursor: 'pointer', whiteSpace: 'nowrap'
          }}>{t.label}</button>
        ))}
      </div>

      <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto', width: '100%', flex: 1 }}>

        {tab === 'absen' && (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#111' }}>Ongoing Absen Siswa</h2>
      <div style={{ textAlign: 'right' }}>
        <p style={{ fontSize: '13px', color: '#999' }}>
          {new Date().toLocaleDateString('id-ID', { month: 'long' })}
        </p>
        <p style={{ fontSize: '13px', fontWeight: '600', color: '#111' }}>
          {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>
    </div>

    {/* Card rekap — DI LUAR div tabel */}
    {rekapTotal && (
      <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e5e5e5', padding: '16px' }}>
        <p style={{ fontWeight: '600', fontSize: '14px', color: '#000000', marginBottom: '12px', padding: '8px', borderRadius: '8px' }}>
          Rekap Total Kelas {rekapTotal.mulai_dari && `(sejak ${new Date(rekapTotal.mulai_dari).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })})`}
        </p>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {[
            { label: 'Hadir',  val: rekapTotal.hadir,  color: '#000000' },
            { label: 'Izin',   val: rekapTotal.izin,   color: '#000000' },
            { label: 'Sakit',  val: rekapTotal.sakit,  color: '#000000' },
            { label: 'Alpha',  val: rekapTotal.alpha,  color: '#dc2626' },
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

    {/* Tabel — div sendiri */}
    <div style={{ background: '#fff', border: '1px solid #e5e5e5', overflow: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
        <thead>
          <tr style={{ background: '#fd1d00' }}>
            {['Nama Siswa', 'Foto Hari Ini', 'Status Hari Ini', 'Alasan', 'Hadir', 'Izin', 'Sakit', 'Alpha'].map(h => (
              <th key={h} style={{
                padding: '12px 10px', fontSize: '12px', fontWeight: '600',
                color: '#fff', textAlign: 'center', borderRight: '1px solid rgba(255,255,255,0.2)'
              }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {absenHariIni.length === 0 ? (
            <tr>
              <td colSpan={8} style={{ padding: '24px', textAlign: 'center', color: '#999', fontSize: '14px' }}>
                Belum ada data siswa
              </td>
            </tr>
          ) : absenHariIni.map((item, i) => (
            <tr key={item.user_id} style={{ borderTop: '1px solid #e5e5e5', background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
              <td style={{ padding: '12px 10px', fontSize: '13px', color: '#111', textAlign: 'center', fontWeight: '500' }}>{item.nama}</td>
              <td style={{ padding: '12px 10px', textAlign: 'center' }}>
                {item.foto ? (
                  <img src={item.foto} style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover', margin: '0 auto', display: 'block' }} />
                ) : (
                  <span style={{ fontSize: '12px', color: '#999' }}>tidak ada foto</span>
                )}
              </td>
              <td style={{ padding: '12px 10px', textAlign: 'center' }}>
                <span style={{
                  background: (statusColor[item.status_hari_ini || ''] || '#888') + '20',
                  color: statusColor[item.status_hari_ini || ''] || '#888',
                  padding: '4px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: '600'
                }}>{item.status_hari_ini?.toUpperCase() || 'BELUM'}</span>
              </td>
              <td style={{ padding: '12px 10px', textAlign: 'center' }}>
  {(item.status_hari_ini === 'izin' || item.status_hari_ini === 'sakit') && item.alasan_hari_ini ? (
    <button onClick={() => { setAlasanPopupItem(item); setShowAlasanPopup(true); }} style={{ background: '#f5f5f5', border: '1px solid #e5e5e5', borderRadius: '8px', padding: '4px 10px', fontSize: '11px', cursor: 'pointer', color: '#555' }}>Lihat</button>
  ) : <span style={{ fontSize: '12px', color: '#999' }}>-</span>}
</td>
              <td style={{ padding: '12px 8px', textAlign: 'center', color: '#000000', fontWeight: '700', fontSize: '14px' }}>{item.hadir || 0}</td>
              <td style={{ padding: '12px 8px', textAlign: 'center', color: '#000000', fontWeight: '700', fontSize: '14px' }}>{item.izin || 0}</td>
              <td style={{ padding: '12px 8px', textAlign: 'center', color: '#000000', fontWeight: '700', fontSize: '14px' }}>{item.sakit || 0}</td>
              <td style={{ padding: '12px 8px', textAlign: 'center', color: '#dc2626', fontWeight: '700', fontSize: '14px' }}>{item.alpha || 0}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
)}

        {/* Laporan Masalah */}
        {tab === 'laporan' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#111' }}>Laporan Masalah Siswa</h2>

            {msg && (
              <div style={{
                background: msg.includes('berhasil') ? '#f0fdf4' : '#fff0ef',
                border: `1px solid ${msg.includes('berhasil') ? '#000000' : '#fd1d00'}`,
                borderRadius: '10px', padding: '10px 12px', fontSize: '13px',
                color: msg.includes('berhasil') ? '#000000' : '#fd1d00'
              }}>{msg}</div>
            )}

            <div style={{
              background: '#fff', borderRadius: '16px', border: '1px solid #e5e5e5', padding: '16px',
              display: 'flex', flexDirection: 'column', gap: '12px'
            }}>
              <p style={{ fontWeight: '600', fontSize: '14px', color: '#111' }}>Buat Laporan Masalah Dengan BK</p>
              <input type="text" placeholder="Judul laporan"
                value={formLaporan.judul}
                onChange={e => setFormLaporan({ ...formLaporan, judul: e.target.value })}
                style={{ border: '1px solid #e5e5e5', borderRadius: '10px', padding: '10px 14px', fontSize: '14px', outline: 'none', width: '100%', boxSizing: 'border-box' }}
              />
              <textarea placeholder="Tulis komentar / laporan masalah siswa..."
                value={formLaporan.komentar}
                onChange={e => setFormLaporan({ ...formLaporan, komentar: e.target.value })}
                rows={4}
                style={{ border: '1px solid #e5e5e5', borderRadius: '10px', padding: '10px 14px', fontSize: '14px', outline: 'none', width: '100%', boxSizing: 'border-box', resize: 'vertical' }}
              />
              <button onClick={handleBuatLaporan} disabled={loading} style={{
                background: '#fd1d00', color: '#fff', border: 'none',
                borderRadius: '10px', padding: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer'
              }}>{loading ? 'Mengirim...' : 'Kirim ke BK'}</button>
            </div>

            {laporan.length === 0 ? (
              <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e5e5e5', padding: '24px', textAlign: 'center', color: '#999', fontSize: '14px' }}>
                Belum ada laporan
              </div>
            ) : laporan.map(l => (
              <div key={l.id} style={{
                background: '#fff', borderRadius: '16px', border: '1px solid #e5e5e5', padding: '16px',
                display: 'flex', flexDirection: 'column', gap: '8px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <p style={{ fontWeight: '600', fontSize: '14px', color: '#111' }}>{userName}</p>
                    <p style={{ fontSize: '13px', color: '#333', marginTop: '2px' }}>{l.judul}</p>
                    <p style={{ fontSize: '13px', color: '#555', marginTop: '4px' }}>{l.komentar}</p>
                  </div>
                  <div style={{ textAlign: 'right', minWidth: '130px' }}>
                    <span style={{
                      background: l.status === 'diproses' ? '#f0fdf4' : l.status === 'ditolak' ? '#fff0ef' : '#f5f5f5',
                      color: l.status === 'diproses' ? '#000000' : l.status === 'ditolak' ? '#fd1d00' : '#888',
                      padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600', display: 'block', marginBottom: '4px'
                    }}>{l.status}</span>
                    <p style={{ fontSize: '11px', color: '#bbb' }}>
                      {new Date(l.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                </div>
                <button onClick={() => { setSelectedLaporan(l); fetchKomentarPopup(l.id); }} style={{
                  background: '#f5f5f5', border: '1px solid #e5e5e5', borderRadius: '10px',
                  padding: '8px 14px', fontSize: '12px', cursor: 'pointer', color: '#555', textAlign: 'left'
                }}>💬 Klik untuk melihat balasan dari BK</button>
              </div>
            ))}
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

      {/* Popup Komentar */}
      {selectedLaporan && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 200, padding: '24px'
        }} onClick={() => setSelectedLaporan(null)}>
          <div style={{
            background: '#fff', borderRadius: '20px', padding: '24px',
            width: '100%', maxWidth: '560px', maxHeight: '85vh', overflowY: 'auto'
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div>
                <p style={{ fontWeight: '600', fontSize: '15px', color: '#111' }}>{userName}</p>
                <p style={{ fontSize: '13px', color: '#333', marginTop: '2px' }}>{selectedLaporan.judul}</p>
                <p style={{ fontSize: '13px', color: '#555', marginTop: '4px' }}>{selectedLaporan.komentar}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{
                  background: selectedLaporan.status === 'diproses' ? '#f0fdf4' : '#f5f5f5',
                  color: selectedLaporan.status === 'diproses' ? '#000000' : '#888',
                  padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600', display: 'block'
                }}>{selectedLaporan.status}</span>
                <p style={{ fontSize: '11px', color: '#bbb', marginTop: '4px' }}>
                  {new Date(selectedLaporan.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
              {komentarPopup.map(k => (
                <div key={k.id} style={{ background: '#f0f7ff', borderRadius: '8px', padding: '10px 12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <p style={{ fontSize: '12px', fontWeight: '600', color: '#2563eb' }}>{k.nama}</p>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {k.nama === userName && (
                        <>
                          <button onClick={() => { setEditKomentarId(k.id); setEditKomentarIsi(k.isi); }} style={{
                            background: '#fd1d00', color: '#fff', border: 'none',
                            borderRadius: '6px', padding: '3px 8px', fontSize: '11px', cursor: 'pointer'
                          }}>Edit</button>
                          <button onClick={() => handleHapusKomentar(k.id)} style={{
                            background: '#fff', color: '#dc2626', border: '1px solid #dc2626',
                            borderRadius: '6px', padding: '3px 8px', fontSize: '11px', cursor: 'pointer'
                          }}>Hapus</button>
                        </>
                      )}
                      <p style={{ fontSize: '11px', color: '#bbb', whiteSpace: 'nowrap' }}>
                        {new Date(k.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  {editKomentarId === k.id ? (
                    <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
                      <input value={editKomentarIsi} onChange={e => setEditKomentarIsi(e.target.value)}
                        style={{ flex: 1, border: '1px solid #e5e5e5', borderRadius: '6px', padding: '6px 10px', fontSize: '13px', outline: 'none' }} />
                      <button onClick={() => handleEditKomentar(k.id)} style={{
                        background: '#fd1d00', color: '#fff', border: 'none',
                        borderRadius: '6px', padding: '6px 10px', fontSize: '12px', cursor: 'pointer'
                      }}>Simpan</button>
                    </div>
                  ) : (
                    <p style={{ fontSize: '13px', color: '#333', marginTop: '4px' }}>{k.isi}</p>
                  )}
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <input type="text" placeholder="Balas Komentar..."
                value={inputBalas}
                onChange={e => setInputBalas(e.target.value)}
                style={{ flex: 1, border: '1px solid #e5e5e5', borderRadius: '10px', padding: '8px 12px', fontSize: '13px', outline: 'none' }}
              />
              <button onClick={async () => {
                if (!inputBalas) return;
                await fetch('/api/komentar', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
                  body: JSON.stringify({ laporan_id: selectedLaporan.id, isi: inputBalas }),
                });
                setInputBalas('');
                fetchKomentarPopup(selectedLaporan.id);
              }} style={{
                background: '#fd1d00', color: '#fff', border: 'none',
                borderRadius: '10px', padding: '8px 16px', fontSize: '13px', cursor: 'pointer'
              }}>Kirim</button>
            </div>

            <button onClick={() => setSelectedLaporan(null)} style={{
              marginTop: '12px', width: '100%', background: '#f5f5f5', border: 'none',
              borderRadius: '10px', padding: '8px', fontSize: '13px', cursor: 'pointer', color: '#555'
            }}>Tutup</button>
          </div>
        </div>
      )}

      {showAlasanPopup && alasanPopupItem && (
  <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '24px' }} onClick={() => setShowAlasanPopup(false)}>
    <div style={{ background: '#fff', borderRadius: '20px', padding: '24px', width: '100%', maxWidth: '400px' }} onClick={e => e.stopPropagation()}>
      <p style={{ fontWeight: '600', fontSize: '15px', color: '#111', marginBottom: '8px' }}>Alasan — {alasanPopupItem.nama}</p>
      <p style={{ fontSize: '13px', color: '#555' }}>Status: <strong>{alasanPopupItem.status_hari_ini?.toUpperCase()}</strong></p>
      <p style={{ fontSize: '13px', color: '#333', marginTop: '12px', lineHeight: '1.6' }}>{alasanPopupItem.alasan_hari_ini || 'Tidak ada alasan'}</p>
      <button onClick={() => setShowAlasanPopup(false)} style={{ marginTop: '16px', width: '100%', background: '#f5f5f5', border: 'none', borderRadius: '10px', padding: '10px', fontSize: '13px', cursor: 'pointer', color: '#555' }}>Tutup</button>
    </div>
  </div>
)}

    </main>
  );
}