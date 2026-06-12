'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

type SiswaRekap = {
  user_id: number;
  nama: string;
  kelas: string;
  hadir: number;
  izin: number;
  sakit: number;
  alpha: number;
  mulai_dari: string | null;
  terakhir: string | null;
  status_hari_ini: string | null;
  alasan_hari_ini: string | null;
};

type LaporanMasalah = {
  id: number;
  judul: string;
  komentar: string;
  status: string;
  nama_walas: string;
  kelas_walas: string;
  created_at: string;
};

type Komentar = {
  id: number;
  isi: string;
  nama: string;
  created_at: string;
};

function JejakHistory({ token, isBK = false }: { token: string; isBK?: boolean }) {
  const [laporan, setLaporan] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/history', {
      headers: { Authorization: `Bearer ${token}` },
    }).then(r => r.json()).then(d => {
      if (d.laporan) setLaporan(d.laporan);
    });
  }, []);

  async function downloadExcel(kelas: string) {
    console.log('kelas:', kelas); // tambahin ini
  const res = await fetch('/api/history', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ kelas }),
  });
  const data = await res.json();
  const rows = data.absen || [];
  if (rows.length === 0) return alert('Belum ada data');

  const tanggalSet = new Set<string>();
  rows.forEach((r: any) => tanggalSet.add(r.tanggal));
  const tanggalList = Array.from(tanggalSet).sort();

  const groupedData: Record<string, Record<string, string>> = {};
  const kelasByNama: Record<string, string> = {};
  rows.forEach((r: any) => {
    if (!groupedData[r.nama]) groupedData[r.nama] = {};
    groupedData[r.nama][r.tanggal] = r.status;
    kelasByNama[r.nama] = r.kelas;
  });

  const header = ['Nama', 'Kelas', ...tanggalList, 'Hadir', 'Izin', 'Sakit', 'Alpha'];
  const csvRows = Object.entries(groupedData).map(([nama, statusMap]) => {
    const statuses = tanggalList.map(t => statusMap[t] || '-');
    const hadir  = statuses.filter(s => s === 'hadir').length;
    const izin   = statuses.filter(s => s === 'izin').length;
    const sakit  = statuses.filter(s => s === 'sakit').length;
    const alpha  = statuses.filter(s => s === 'alpha').length;
    return [nama, kelasByNama[nama], ...statuses, hadir, izin, sakit, alpha].join(',');
  });

  const csvContent = [header.join(','), ...csvRows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `rekap_absen_${kelas}_${new Date().toLocaleDateString('id-ID').replace(/\//g, '_')}.csv`;
  a.click();
}

  async function handleHapus(id: number) {
    if (!confirm('Hapus history laporan ini?')) return;
    await fetch(`/api/history?id=${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    setLaporan(prev => prev.filter(l => l.id !== id));
  }

  const jurusanConfig = [
    { key: 'PPLG',      label: 'Jurusan PPLG',      color: '#000000' },
    { key: 'TJKT',      label: 'Jurusan TJKT',      color: '#000000' },
    { key: 'DKV',       label: 'Jurusan DKV',       color: '#000000' },
    { key: 'MPLB',      label: 'Jurusan MPLB',      color: '#000000' },
    { key: 'PEMASARAN', label: 'Jurusan Pemasaran', color: '#000000' },
  ];

  const grouped: Record<string, any[]> = {};
  // BARU
laporan.forEach(l => {
  const key = jurusanConfig.find(j => j.key === l.jurusan?.toUpperCase())?.key || 'LAINNYA';
  if (!grouped[key]) grouped[key] = [];
  grouped[key].push(l);
});

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#111' }}>Jejak History Laporan Absen</h2>
      {jurusanConfig.map(({ key, label, color }) => {
        const items = grouped[key] || [];
        return (
          <div key={key} style={{ border: `2px solid ${color}`, borderRadius: '16px', overflow: 'hidden' }}>
            <div style={{ background: color + '18', padding: '10px 16px', borderBottom: `1px solid ${color}30`, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: color }} />
              <p style={{ fontWeight: '700', fontSize: '14px', color }}>{label}</p>
              <span style={{ marginLeft: 'auto', fontSize: '11px', color, fontWeight: '500' }}>{items.length} laporan</span>
            </div>
            {items.length === 0 ? (
              <div style={{ background: '#fff', padding: '16px', textAlign: 'center', color: '#999', fontSize: '13px' }}>
                Belum ada history laporan {label}
              </div>
            ) : items.map((l, i) => {
              const tanggal = new Date(l.created_at).toISOString().split('T')[0];
              return (
                <div key={l.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', borderBottom: '1px solid #e5e5e5', background: i % 2 === 0 ? '#fff' : '#fafafa', flexWrap: 'wrap' }}>
                  <div style={{ background: '#fd1d00', borderRadius: '8px', padding: '6px 12px', minWidth: '150px', flexShrink: 0 }}>
                    <p style={{ fontSize: '12px', color: '#fff', fontWeight: '600' }}>
                      {new Date(l.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                    <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.8)' }}>
                      {new Date(l.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
  <p style={{ fontSize: '13px', fontWeight: '600', color: '#111', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{l.kelas || l.jurusan}</p>
</div>
                  <button onClick={() => downloadExcel(l.kelas_walas)} style={{ background: '#fff', border: '1px solid #e5e5e5', borderRadius: '8px', padding: '7px 12px', fontSize: '12px', cursor: 'pointer', color: '#111', flexShrink: 0 }}>📥 Unduh Excel</button>
                  {isBK && (
                    <button onClick={() => handleHapus(l.id)} style={{ background: '#fff0ef', border: '1px solid #fd1d00', borderRadius: '8px', padding: '7px 12px', fontSize: '12px', cursor: 'pointer', color: '#fd1d00', fontWeight: '600', flexShrink: 0 }}>🗑️ Hapus</button>
                  )}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

export default function DashboardBK() {
  const router = useRouter();
  const [tab, setTab] = useState<'absen' | 'masalah' | 'history'>('absen');
  const [siswaRekap, setSiswaRekap] = useState<SiswaRekap[]>([]);
  const [selectedJurusan, setSelectedJurusan] = useState<string | null>(null);
  const [laporanMasalah, setLaporanMasalah] = useState<LaporanMasalah[]>([]);
  const [komentarMap, setKomentarMap] = useState<Record<number, Komentar[]>>({});
  const [inputKomentar, setInputKomentar] = useState<Record<number, string>>({});
  const [msg, setMsg] = useState('');
  const [userName, setUserName] = useState('');
  const [token, setToken] = useState('');
  const [editKomentarId, setEditKomentarId] = useState<number | null>(null);
  const [editKomentarIsi, setEditKomentarIsi] = useState('');
  const [selectedMasalah, setSelectedMasalah] = useState<LaporanMasalah | null>(null);
  const [inputBalas, setInputBalas] = useState('');
  const [popupJurusan, setPopupJurusan] = useState<{ jurusan: string; label: string; color: string } | null>(null);
  const [popupKelas, setPopupKelas] = useState<{ kelas: string; color: string } | null>(null);
  const [showAlasanPopup, setShowAlasanPopup] = useState(false);
  const [alasanPopupItem, setAlasanPopupItem] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const touchStartX = useRef(0);

  useEffect(() => {
    const t = localStorage.getItem('token') || '';
    setToken(t);
    fetchUser(t);
  }, []);

  useEffect(() => {
    if (tab === 'absen') fetchRekap();
    if (tab === 'masalah') fetchLaporanMasalah();
  }, [tab]);

  function getToken() { return localStorage.getItem('token'); }

  function handleTouchStart(e: React.TouchEvent) {
  touchStartX.current = e.touches[0].clientX;
}
function handleTouchEnd(e: React.TouchEvent) {
  const diff = touchStartX.current - e.changedTouches[0].clientX;
  if (diff > 50) setSidebarOpen(false);
}

  async function fetchUser(t: string) {
    const res = await fetch('/api/absen?tipe=bk', {
      headers: { Authorization: `Bearer ${t}` },
    });
    const data = await res.json();
    if (!res.ok) return router.push('/login?role=bk');
    setUserName(data.nama || '');
    setSiswaRekap(data.rekap || []);
  }

  async function fetchRekap() {
    const res = await fetch('/api/absen?tipe=bk', {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    const data = await res.json();
    if (res.ok) setSiswaRekap(data.rekap || []);
  }

  async function fetchLaporanMasalah() {
    const res = await fetch('/api/laporan/bk?tipe=masalah', {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    const data = await res.json();
    if (res.ok) setLaporanMasalah(data.laporan);
  }

  async function fetchKomentar(laporanId: number) {
    const res = await fetch(`/api/komentar?laporan_id=${laporanId}`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    const data = await res.json();
    if (res.ok) setKomentarMap(prev => ({ ...prev, [laporanId]: data.komentar }));
  }

  async function handleResetJurusan(jurusan: string) {
  if (!confirm(`Reset absen jurusan ${jurusan}? Tidak bisa dibatalkan!`)) return;
  const res = await fetch(`/api/absen?jurusan=${jurusan}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  const data = await res.json();
  if (res.ok) { setMsg(`Absen ${jurusan} berhasil direset!`); fetchRekap(); }
  else setMsg(data.message || 'Gagal reset');
}

  async function handleKirimKomentar(laporanId: number) {
    const isi = inputKomentar[laporanId];
    if (!isi) return;
    await fetch('/api/komentar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
      body: JSON.stringify({ laporan_id: laporanId, isi }),
    });
    setInputKomentar(prev => ({ ...prev, [laporanId]: '' }));
    fetchKomentar(laporanId);
  }

  async function handleEditKomentar(id: number) {
    await fetch('/api/komentar', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
      body: JSON.stringify({ id, isi: editKomentarIsi }),
    });
    setEditKomentarId(null);
    setEditKomentarIsi('');
    laporanMasalah.forEach(l => fetchKomentar(l.id));
  }

  async function handleHapusKomentar(id: number, laporanId: number) {
    await fetch(`/api/komentar?id=${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    fetchKomentar(laporanId);
  }

  async function handleHapusLaporan(id: number) {
    await fetch(`/api/laporan/masalah?id=${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    fetchLaporanMasalah();
  }

  async function handleProsesMasalah(id: number, status: string) {
    const res = await fetch('/api/laporan/bk', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
      body: JSON.stringify({ id, status, tipe: 'masalah' }),
    });
    if (res.ok) { setMsg(status === 'diproses' ? 'Laporan diproses!' : 'Laporan ditolak'); fetchLaporanMasalah(); }
  }

  async function handleResetAbsen() {
    if (!confirm('Reset semua data absen ongoing? Ini tidak bisa dibatalkan!')) return;
    const res = await fetch('/api/absen', {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    const data = await res.json();
    if (res.ok) { setMsg('Semua data absen berhasil direset!'); fetchRekap(); }
    else setMsg(data.message || 'Gagal reset');
  }

  async function handleResetKelas(kelas: string) {
  if (!confirm(`Reset absen kelas ${kelas}? Tidak bisa dibatalkan!`)) return;
  const res = await fetch(`/api/absen?kelas=${encodeURIComponent(kelas)}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  const data = await res.json();
  if (res.ok) { setMsg(`Absen ${kelas} berhasil direset!`); fetchRekap(); }
  else setMsg(data.message || 'Gagal reset');
}

  async function cetakExcelJurusan(jurusan: string) {
    const res = await fetch('/api/history', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
      body: JSON.stringify({ jurusan }),
    });
    const data = await res.json();
    const rows = data.absen || [];
    if (rows.length === 0) return setMsg('Belum ada data untuk dicetak');

    // Ambil semua tanggal unik
    const tanggalSet = new Set<string>();
    rows.forEach((r: any) => tanggalSet.add(r.tanggal));
    const tanggalList = Array.from(tanggalSet).sort();

    // Group by nama
    const grouped: Record<string, Record<string, string>> = {};
    const kelasByNama: Record<string, string> = {};
    rows.forEach((r: any) => {
      if (!grouped[r.nama]) grouped[r.nama] = {};
      grouped[r.nama][r.tanggal] = r.status;
      kelasByNama[r.nama] = r.kelas;
    });

    const header = ['Nama', 'Kelas', ...tanggalList, 'Hadir', 'Izin', 'Sakit', 'Alpha'];
    const csvRows = Object.entries(grouped).map(([nama, statusMap]) => {
      const statuses = tanggalList.map(t => statusMap[t] || '-');
      const hadir = statuses.filter(s => s === 'hadir').length;
      const izin = statuses.filter(s => s === 'izin').length;
      const sakit = statuses.filter(s => s === 'sakit').length;
      const alpha = statuses.filter(s => s === 'alpha').length;
      return [nama, kelasByNama[nama], ...statuses, hadir, izin, sakit, alpha].join(',');
    });

    const csvContent = [header.join(','), ...csvRows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rekap_absen_${jurusan}_${new Date().toLocaleDateString('id-ID')}.csv`;
    a.click();
    // Tambahkan ini
    await fetch('/api/history', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
      body: JSON.stringify({ simpan: true, jurusan }),
    });
  }

async function cetakExcelKelas(kelas: string, jurusan: string) {
  const res = await fetch('/api/history', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
    body: JSON.stringify({ kelas }),
  });
  const data = await res.json();
  const rows = data.absen || [];
  if (rows.length === 0) return setMsg('Belum ada data untuk dicetak');

  const tanggalSet = new Set<string>();
  rows.forEach((r: any) => tanggalSet.add(r.tanggal));
  const tanggalList = Array.from(tanggalSet).sort();

  const groupedData: Record<string, Record<string, string>> = {};
  const kelasByNama: Record<string, string> = {};
  rows.forEach((r: any) => {
    if (!groupedData[r.nama]) groupedData[r.nama] = {};
    groupedData[r.nama][r.tanggal] = r.status;
    kelasByNama[r.nama] = r.kelas;
  });

  const header = ['Nama', 'Kelas', ...tanggalList, 'Hadir', 'Izin', 'Sakit', 'Alpha'];
  const csvRows = Object.entries(groupedData).map(([nama, statusMap]) => {
    const statuses = tanggalList.map(t => statusMap[t] || '-');
    const hadir = statuses.filter(s => s === 'hadir').length;
    const izin = statuses.filter(s => s === 'izin').length;
    const sakit = statuses.filter(s => s === 'sakit').length;
    const alpha = statuses.filter(s => s === 'alpha').length;
    return [nama, kelasByNama[nama], ...statuses, hadir, izin, sakit, alpha].join(',');
  });

  const csvContent = [header.join(','), ...csvRows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `rekap_absen_${kelas}_${new Date().toLocaleDateString('id-ID')}.csv`;
  a.click();

  await fetch('/api/history', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
    body: JSON.stringify({ simpan: true, jurusan, kelas }),
  });
}

  async function handleLogout() {
    localStorage.removeItem('token');
    router.push('/');
  }

  const jurusanConfig = [
    { key: 'PPLG',      label: 'Jurusan PPLG',      color: '#000000' },
    { key: 'TJKT',      label: 'Jurusan TJKT',      color: '#000000' },
    { key: 'DKV',       label: 'Jurusan DKV',       color: '#000000' },
    { key: 'MPLB',      label: 'Jurusan MPLB',      color: '#000000' },
    { key: 'PEMASARAN', label: 'Jurusan Pemasaran', color: '#000000' },
  ];

  const statusColor: Record<string, string> = {
    pending: '#000000', diterima: '#000000', ditolak: '#dc2626', diproses: '#999',
  };

  // Group siswa by jurusan
  const grouped: Record<string, SiswaRekap[]> = {};
  siswaRekap.forEach(s => {
    const key = jurusanConfig.find(j => s.kelas?.toUpperCase().includes(j.key))?.key || 'LAINNYA';
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(s);
  });

  return (
    <main style={{ minHeight: '100vh', background: '#f5f5f5', fontFamily: 'sans-serif', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e5e5e5', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
    <button onClick={() => setSidebarOpen(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
      <div style={{ width: '22px', height: '2px', background: '#111', borderRadius: '2px' }} />
      <div style={{ width: '22px', height: '2px', background: '#111', borderRadius: '2px' }} />
      <div style={{ width: '22px', height: '2px', background: '#111', borderRadius: '2px' }} />
    </button>
    <div>
      <p style={{ fontSize: '15px', fontWeight: '600', color: '#111' }}>Dashboard BK</p>
      <p style={{ fontSize: '12px', color: '#999' }}>{userName}</p>
    </div>
  </div>
  <button onClick={handleLogout} style={{ background: '#fff', border: '1px solid #e5e5e5', borderRadius: '10px', padding: '8px 16px', fontSize: '13px', cursor: 'pointer', color: '#111' }}>Logout</button>
</div>

      <div style={{ padding: '24px', maxWidth: '900px', margin: '0 auto', width: '100%', flex: 1 }}>

        {msg && (
          <div style={{
            background: msg.includes('berhasil') || msg.includes('diproses') ? '#f0fdf4' : '#fff0ef',
            border: `1px solid ${msg.includes('berhasil') || msg.includes('diproses') ? '#16a34a' : '#fd1d00'}`,
            borderRadius: '10px', padding: '10px 12px', fontSize: '13px', marginBottom: '16px',
            color: msg.includes('berhasil') || msg.includes('diproses') ? '#16a34a' : '#fd1d00'
          }}>{msg}</div>
        )}

        {/* Ongoing Absen */}
        {tab === 'absen' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#111' }}>Ongoing Absen Semua Jurusan</h2>
              <button onClick={handleResetAbsen} style={{
                background: '#dc2626', color: '#fff', border: 'none',
                borderRadius: '10px', padding: '8px 16px', fontSize: '13px',
                cursor: 'pointer', fontWeight: '600'
              }}>🔄 Reset Semua Absen</button>
            </div>

            {jurusanConfig.map(({ key, label, color }) => {
              const items = grouped[key] || [];
              const mulaiDari = items.find(s => s.mulai_dari)?.mulai_dari;
              return (
                <div key={key} style={{ border: `2px solid ${color}`, borderRadius: '16px', overflow: 'hidden' }}>
                  {/* Header jurusan */}
                  <div style={{ background: color + '15', padding: '10px 16px', borderBottom: `1px solid ${color}30`, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: color }} />
                    <p style={{ fontWeight: '700', fontSize: '14px', color }}>{label}</p>
                    {mulaiDari && (
                      <span style={{ fontSize: '11px', color: '#999' }}>
                        sejak {new Date(mulaiDari).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </span>
                    )}
                    <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
                      <button onClick={() => handleResetJurusan(key)} style={{
  background: '#dc2626', color: '#fff', border: 'none',
  borderRadius: '8px', padding: '5px 12px', fontSize: '12px', cursor: 'pointer', fontWeight: '600'
}}>🔄 Reset</button>
                      <button onClick={() => setPopupJurusan({ jurusan: key, label, color })} style={{
                        background: color, color: '#fff', border: 'none',
                        borderRadius: '8px', padding: '5px 12px', fontSize: '12px', cursor: 'pointer', fontWeight: '600'
                      }}>👁️ Lihat Detail</button>
                    </div>
                  </div>

                  {/* Rekap singkat */}
                  {items.length === 0 ? (
                    <div style={{ background: '#fff', padding: '16px', textAlign: 'center', color: '#999', fontSize: '13px' }}>
                      Belum ada data siswa {label}
                    </div>
                  ) : (() => {
  const kelasList = Array.from(new Set(items.map(s => s.kelas))).sort();
  return kelasList.map((kelas, ki) => {
    const siswaKelas = items.filter(s => s.kelas === kelas);
    return (
      <div key={kelas} style={{ background: ki % 2 === 0 ? '#fff' : '#fafafa', padding: '10px 16px', borderTop: '1px solid #e5e5e5', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        <p style={{ fontSize: '13px', fontWeight: '600', color: '#111', minWidth: '100px' }}>{kelas}</p>
        <div style={{ display: 'flex', gap: '6px', flex: 1, flexWrap: 'wrap' }}>
          {[
            { label: 'Hadir',  val: siswaKelas.reduce((a, s) => a + Number(s.hadir || 0), 0),  color: '#000000' },
            { label: 'Izin',   val: siswaKelas.reduce((a, s) => a + Number(s.izin || 0), 0),   color: '#000000' },
            { label: 'Sakit',  val: siswaKelas.reduce((a, s) => a + Number(s.sakit || 0), 0),  color: '#000000' },
            { label: 'Alpha',  val: siswaKelas.reduce((a, s) => a + Number(s.alpha || 0), 0),  color: '#dc2626' },
          ].map(({ label: lbl, val, color: c }) => (
            <div key={lbl} style={{ background: c + '15', border: `1px solid ${c}30`, borderRadius: '8px', padding: '4px 10px', textAlign: 'center', minWidth: '45px' }}>
              <p style={{ fontSize: '14px', fontWeight: '700', color: c }}>{val}</p>
              <p style={{ fontSize: '10px', color: c, fontWeight: '600' }}>{lbl}</p>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
    <button onClick={() => setPopupKelas({ kelas, color })} style={{ background: color, color: '#fff', border: 'none', borderRadius: '7px', padding: '5px 10px', fontSize: '11px', cursor: 'pointer', fontWeight: '600' }}>👁️ Detail</button>
    <button onClick={() => cetakExcelKelas(kelas, key)} style={{ background: '#fff', color, border: `1px solid ${color}`, borderRadius: '7px', padding: '5px 10px', fontSize: '11px', cursor: 'pointer', fontWeight: '600' }}>📥 Cetak</button>
    <button onClick={() => handleResetKelas(kelas)} style={{ background: '#dc2626', color: '#fff', border: 'none', borderRadius: '7px', padding: '5px 10px', fontSize: '11px', cursor: 'pointer', fontWeight: '600' }}>🔄 Reset</button>
  </div>
      </div>
    );
  });
})()}
                </div>
              );
            })}
          </div>
        )}

        {/* Laporan Masalah */}
        {tab === 'masalah' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#111' }}>Laporan Masalah Siswa</h2>
            {laporanMasalah.length === 0 ? (
              <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e5e5e5', padding: '24px', textAlign: 'center', color: '#999', fontSize: '14px' }}>
                Belum ada laporan masalah
              </div>
            ) : laporanMasalah.map(l => (
              <div key={l.id} style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e5e5e5', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <button onClick={() => handleHapusLaporan(l.id)} style={{ background: '#fd1d00', color: '#fff', border: 'none', borderRadius: '8px', padding: '6px 12px', fontSize: '12px', cursor: 'pointer', fontWeight: '600', alignSelf: 'flex-start' }}>Hapus Masalah</button>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ fontWeight: '600', fontSize: '14px', color: '#111' }}>{l.judul}</p>
                    <p style={{ fontSize: '12px', color: '#999' }}>dari {l.nama_walas} - {l.kelas_walas}</p>
                  </div>
                  <span style={{ background: (statusColor[l.status] || '#888') + '20', color: statusColor[l.status] || '#888', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }}>{l.status.toUpperCase()}</span>
                </div>
                <p style={{ fontSize: '13px', color: '#555', background: '#f9f9f9', padding: '10px', borderRadius: '8px' }}>{l.komentar}</p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {(komentarMap[l.id] || []).map(k => (
                    <div key={k.id} style={{ background: '#f0f7ff', borderRadius: '8px', padding: '8px 12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <p style={{ fontSize: '12px', fontWeight: '600', color: '#2563eb' }}>{k.nama}</p>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          {k.nama === userName && (
                            <>
                              <button onClick={() => { setEditKomentarId(k.id); setEditKomentarIsi(k.isi); }} style={{ background: '#fd1d00', color: '#fff', border: 'none', borderRadius: '6px', padding: '3px 8px', fontSize: '11px', cursor: 'pointer' }}>Edit</button>
                              <button onClick={() => handleHapusKomentar(k.id, l.id)} style={{ background: '#fff', color: '#dc2626', border: '1px solid #dc2626', borderRadius: '6px', padding: '3px 8px', fontSize: '11px', cursor: 'pointer' }}>Hapus</button>
                            </>
                          )}
                        </div>
                      </div>
                      {editKomentarId === k.id ? (
                        <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
                          <input value={editKomentarIsi} onChange={e => setEditKomentarIsi(e.target.value)} style={{ flex: 1, border: '1px solid #e5e5e5', borderRadius: '6px', padding: '6px 10px', fontSize: '13px', outline: 'none' }} />
                          <button onClick={() => handleEditKomentar(k.id)} style={{ background: '#fd1d00', color: '#fff', border: 'none', borderRadius: '6px', padding: '6px 10px', fontSize: '12px', cursor: 'pointer' }}>Simpan</button>
                        </div>
                      ) : (
                        <p style={{ fontSize: '13px', color: '#333', marginTop: '4px' }}>{k.isi}</p>
                      )}
                      <p style={{ fontSize: '11px', color: '#bbb', marginTop: '4px' }}>{new Date(k.created_at).toLocaleTimeString('id-ID')}</p>
                    </div>
                  ))}

                  <button onClick={() => { setSelectedMasalah(l); fetchKomentar(l.id); }} style={{ background: '#f5f5f5', border: '1px solid #e5e5e5', borderRadius: '10px', padding: '8px 14px', fontSize: '12px', cursor: 'pointer', color: '#555', textAlign: 'left', width: '100%' }}>🔍 Klik Untuk melihat balasan lebih detail</button>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input type="text" placeholder="Balas komentar..." value={inputKomentar[l.id] || ''} onFocus={() => fetchKomentar(l.id)} onChange={e => setInputKomentar(prev => ({ ...prev, [l.id]: e.target.value }))} style={{ flex: 1, border: '1px solid #e5e5e5', borderRadius: '10px', padding: '8px 12px', fontSize: '13px', outline: 'none' }} />
                    <button onClick={() => handleKirimKomentar(l.id)} style={{ background: '#fd1d00', color: '#fff', border: 'none', borderRadius: '10px', padding: '8px 16px', fontSize: '13px', cursor: 'pointer' }}>Kirim</button>
                  </div>
                </div>

                {l.status === 'pending' && (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => handleProsesMasalah(l.id, 'diproses')} style={{ flex: 1, background: '#999', color: '#fff', border: 'none', borderRadius: '10px', padding: '8px', fontSize: '13px', cursor: 'pointer', fontWeight: '600' }}>✓ Proses</button>
                    <button onClick={() => handleProsesMasalah(l.id, 'ditolak')} style={{ flex: 1, background: '#fff', color: '#dc2626', border: '1px solid #dc2626', borderRadius: '10px', padding: '8px', fontSize: '13px', cursor: 'pointer', fontWeight: '600' }}>✕ Tolak</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* History */}
        {tab === 'history' && token && <JejakHistory token={token} isBK={true} />}
      </div>

      <footer style={{ background: '#fff', color: 'rgba(0,0,0,0.5)', padding: '16px 32px', textAlign: 'center', fontSize: '13px', borderTop: '1px solid #e5e5e5' }}>
        2026 · NamaSekolah@gmail.com · Website Resmi Sekolah
      </footer>

      {/* Popup Detail Jurusan */}
      {popupJurusan && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '24px' }} onClick={() => setPopupJurusan(null)}>
          <div style={{ background: '#fff', borderRadius: '20px', padding: '24px', width: '100%', maxWidth: '700px', maxHeight: '85vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <p style={{ fontWeight: '700', fontSize: '15px', color: popupJurusan.color }}>{popupJurusan.label}</p>
              <button onClick={() => setPopupJurusan(null)} style={{ background: '#f5f5f5', border: 'none', borderRadius: '8px', padding: '6px 12px', fontSize: '13px', cursor: 'pointer' }}>✕ Tutup</button>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '500px' }}>
                <thead>
                  <tr style={{ background: popupJurusan.color }}>
                    {['Kelas', '', 'Hadir', 'Izin', 'Sakit', 'Alpha', 'Aksi'].map(h => (
  <th key={h} style={{ padding: '10px 12px', fontSize: '12px', fontWeight: '600', color: '#fff', textAlign: 'center', borderRight: '1px solid rgba(255,255,255,0.2)' }}>{h}</th>
))}
                  </tr>
                </thead>
                <tbody>
  {(() => {
    const kelasList = Array.from(new Set((grouped[popupJurusan.jurusan] || []).map(s => s.kelas))).sort();
    if (kelasList.length === 0) return (
      <tr><td colSpan={8} style={{ padding: '24px', textAlign: 'center', color: '#999' }}>Belum ada data</td></tr>
    );
    return kelasList.map((kelas, i) => {
      const siswaKelas = (grouped[popupJurusan.jurusan] || []).filter(s => s.kelas === kelas);
      const totalHadir  = siswaKelas.reduce((a, s) => a + Number(s.hadir || 0), 0);
      const totalIzin   = siswaKelas.reduce((a, s) => a + Number(s.izin || 0), 0);
      const totalSakit  = siswaKelas.reduce((a, s) => a + Number(s.sakit || 0), 0);
      const totalAlpha  = siswaKelas.reduce((a, s) => a + Number(s.alpha || 0), 0);
      return (
        <tr key={kelas} style={{ borderTop: '1px solid #e5e5e5', background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
          <td style={{ padding: '10px 12px', fontSize: '13px', color: '#111', fontWeight: '600' }} colSpan={2}>{kelas}</td>
          <td style={{ padding: '10px 8px', textAlign: 'center', color: '#000000', fontWeight: '700' }}>{totalHadir}</td>
          <td style={{ padding: '10px 8px', textAlign: 'center', color: '#000000', fontWeight: '700' }}>{totalIzin}</td>
          <td style={{ padding: '10px 8px', textAlign: 'center', color: '#000000', fontWeight: '700' }}>{totalSakit}</td>
          <td style={{ padding: '10px 8px', textAlign: 'center', color: '#dc2626', fontWeight: '700' }}>{totalAlpha}</td>
          <td style={{ padding: '6px 8px', textAlign: 'center' }}>
            <button onClick={() => cetakExcelKelas(kelas, popupJurusan!.jurusan)} style={{
              background: popupJurusan!.color, color: '#fff', border: 'none',
              borderRadius: '6px', padding: '4px 10px', fontSize: '11px', cursor: 'pointer', fontWeight: '600'
            }}>📥 Cetak</button>
          </td>
        </tr>
      );
    });
  })()}
</tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Popup Komentar Masalah */}
      {selectedMasalah && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '24px' }} onClick={() => setSelectedMasalah(null)}>
          <div style={{ background: '#fff', borderRadius: '20px', padding: '24px', width: '100%', maxWidth: '560px', maxHeight: '85vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div>
                <p style={{ fontWeight: '600', fontSize: '15px', color: '#111' }}>{selectedMasalah.nama_walas}</p>
                <p style={{ fontSize: '13px', color: '#333', marginTop: '2px' }}>{selectedMasalah.judul}</p>
                <p style={{ fontSize: '13px', color: '#555', marginTop: '4px' }}>{selectedMasalah.komentar}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ background: (statusColor[selectedMasalah.status] || '#888') + '20', color: statusColor[selectedMasalah.status] || '#888', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600', display: 'block' }}>{selectedMasalah.status}</span>
                <p style={{ fontSize: '11px', color: '#bbb', marginTop: '4px' }}>
                  {new Date(selectedMasalah.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
              {(komentarMap[selectedMasalah.id] || []).map(k => (
                <div key={k.id} style={{ background: '#f0f7ff', borderRadius: '8px', padding: '10px 12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <p style={{ fontSize: '12px', fontWeight: '600', color: '#2563eb' }}>{k.nama}</p>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      <p style={{ fontSize: '11px', color: '#bbb' }}>{new Date(k.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</p>
                      {k.nama === userName && (
                        <>
                          <button onClick={() => { setEditKomentarId(k.id); setEditKomentarIsi(k.isi); }} style={{ background: '#fd1d00', color: '#fff', border: 'none', borderRadius: '6px', padding: '3px 8px', fontSize: '11px', cursor: 'pointer' }}>Edit</button>
                          <button onClick={() => handleHapusKomentar(k.id, selectedMasalah.id)} style={{ background: '#fff', color: '#dc2626', border: '1px solid #dc2626', borderRadius: '6px', padding: '3px 8px', fontSize: '11px', cursor: 'pointer' }}>Hapus</button>
                        </>
                      )}
                    </div>
                  </div>
                  {editKomentarId === k.id ? (
                    <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
                      <input value={editKomentarIsi} onChange={e => setEditKomentarIsi(e.target.value)} style={{ flex: 1, border: '1px solid #e5e5e5', borderRadius: '6px', padding: '6px 10px', fontSize: '13px', outline: 'none' }} />
                      <button onClick={() => handleEditKomentar(k.id)} style={{ background: '#fd1d00', color: '#fff', border: 'none', borderRadius: '6px', padding: '6px 10px', fontSize: '12px', cursor: 'pointer' }}>Simpan</button>
                    </div>
                  ) : (
                    <p style={{ fontSize: '13px', color: '#333', marginTop: '4px' }}>{k.isi}</p>
                  )}
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <input type="text" placeholder="Balas Komentar..." value={inputBalas} onChange={e => setInputBalas(e.target.value)} style={{ flex: 1, border: '1px solid #e5e5e5', borderRadius: '10px', padding: '8px 12px', fontSize: '13px', outline: 'none' }} />
              <button onClick={async () => {
                if (!inputBalas) return;
                await fetch('/api/komentar', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
                  body: JSON.stringify({ laporan_id: selectedMasalah.id, isi: inputBalas }),
                });
                setInputBalas('');
                fetchKomentar(selectedMasalah.id);
              }} style={{ background: '#fd1d00', color: '#fff', border: 'none', borderRadius: '10px', padding: '8px 16px', fontSize: '13px', cursor: 'pointer' }}>Kirim</button>
            </div>

            <button onClick={() => setSelectedMasalah(null)} style={{ marginTop: '12px', width: '100%', background: '#f5f5f5', border: 'none', borderRadius: '10px', padding: '8px', fontSize: '13px', cursor: 'pointer', color: '#555' }}>Tutup</button>
          </div>
        </div>
      )}

      {/* Popup Detail Siswa per Kelas */}
{popupKelas && (
  <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '24px' }} onClick={() => setPopupKelas(null)}>
    <div style={{ background: '#fff', borderRadius: '20px', padding: '24px', width: '100%', maxWidth: '700px', maxHeight: '85vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <p style={{ fontWeight: '700', fontSize: '15px', color: popupKelas.color }}>{popupKelas.kelas}</p>
        <button onClick={() => setPopupKelas(null)} style={{ background: '#f5f5f5', border: 'none', borderRadius: '8px', padding: '6px 12px', fontSize: '13px', cursor: 'pointer' }}>✕ Tutup</button>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '500px' }}>
          <thead>
            <tr style={{ background: popupKelas.color }}>
              {['Nama Siswa', 'Status', 'Alasan', 'Hadir', 'Izin', 'Sakit', 'Alpha'].map(h => (
                <th key={h} style={{ padding: '10px 12px', fontSize: '12px', fontWeight: '600', color: '#fff', textAlign: 'center', borderRight: '1px solid rgba(255,255,255,0.2)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {siswaRekap.filter(s => s.kelas === popupKelas.kelas).length === 0 ? (
              <tr><td colSpan={6} style={{ padding: '24px', textAlign: 'center', color: '#999' }}>Belum ada data</td></tr>
            ) : siswaRekap.filter(s => s.kelas === popupKelas.kelas).map((s, i) => (
              <tr key={s.user_id} style={{ borderTop: '1px solid #e5e5e5', background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                 <td style={{ padding: '10px 12px', fontSize: '13px', color: '#111', fontWeight: '500' }}>{s.nama}</td>
                 <td style={{ padding: '10px 8px', textAlign: 'center' }}>
  <span style={{ fontSize: '11px', fontWeight: '600', color: s.status_hari_ini === 'alpha' ? '#dc2626' : '#000' }}>
    {s.status_hari_ini?.toUpperCase() || 'BELUM'}
  </span>
</td>
                <td style={{ padding: '10px 8px', textAlign: 'center' }}>
  {(s.status_hari_ini === 'izin' || s.status_hari_ini === 'sakit') && s.alasan_hari_ini ? (
    <button onClick={() => { setAlasanPopupItem(s); setShowAlasanPopup(true); }} style={{ background: '#f5f5f5', border: '1px solid #e5e5e5', borderRadius: '8px', padding: '4px 10px', fontSize: '11px', cursor: 'pointer', color: '#555' }}>Lihat</button>
  ) : <span style={{ fontSize: '12px', color: '#999' }}>-</span>}
</td>
                <td style={{ padding: '10px 8px', textAlign: 'center', color: '#000000', fontWeight: '700' }}>{s.hadir || 0}</td>
                <td style={{ padding: '10px 8px', textAlign: 'center', color: '#000000', fontWeight: '700' }}>{s.izin || 0}</td>
                <td style={{ padding: '10px 8px', textAlign: 'center', color: '#000000', fontWeight: '700' }}>{s.sakit || 0}</td>
                <td style={{ padding: '10px 8px', textAlign: 'center', color: '#dc2626', fontWeight: '700' }}>{s.alpha || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
)}
{showAlasanPopup && alasanPopupItem && (
  <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '24px' }} onClick={() => setShowAlasanPopup(false)}>
    <div style={{ background: '#fff', borderRadius: '20px', padding: '24px', width: '100%', maxWidth: '400px' }} onClick={e => e.stopPropagation()}>
      <p style={{ fontWeight: '600', fontSize: '15px', color: '#111', marginBottom: '8px' }}>Alasan — {alasanPopupItem.nama}</p>
      <p style={{ fontSize: '13px', color: '#555' }}>Status: <strong>{alasanPopupItem.status_hari_ini?.toUpperCase()}</strong></p>
      <p style={{ fontSize: '13px', color: '#333', marginTop: '12px', lineHeight: '1.6' }}>{alasanPopupItem.alasan_hari_ini}</p>
      <button onClick={() => setShowAlasanPopup(false)} style={{ marginTop: '16px', width: '100%', background: '#f5f5f5', border: 'none', borderRadius: '10px', padding: '10px', fontSize: '13px', cursor: 'pointer', color: '#555' }}>Tutup</button>
    </div>
  </div>
)}

{sidebarOpen && (
  <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 300 }} onClick={() => setSidebarOpen(false)} />
)}

<div
  onTouchStart={handleTouchStart}
  onTouchEnd={handleTouchEnd}
  style={{
    position: 'fixed', top: 0, left: 0, bottom: 0,
    width: '240px', background: '#fff', zIndex: 400,
    transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
    transition: 'transform 0.25s ease',
    display: 'flex', flexDirection: 'column',
    boxShadow: sidebarOpen ? '4px 0 20px rgba(0,0,0,0.15)' : 'none',
  }}
>
  <div style={{ padding: '20px 16px', borderBottom: '1px solid #e5e5e5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
    <p style={{ fontWeight: '700', fontSize: '14px', color: '#111' }}>Directory halaman BK</p>
    <button onClick={() => setSidebarOpen(false)} style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#999' }}>✕</button>
  </div>
  <div style={{ flex: 1, padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
    {[
      { key: 'absen',   label: '📋 Ongoing Absen' },
      { key: 'masalah', label: '💬 Laporan Masalah' },
      { key: 'history', label: '🗂️ History Laporan' },
    ].map(t => (
      <button key={t.key} onClick={() => { setTab(t.key as any); setSidebarOpen(false); setMsg(''); }} style={{
        width: '100%', textAlign: 'left', padding: '10px 14px',
        borderRadius: '10px', border: 'none', fontSize: '13px',
        fontWeight: tab === t.key ? '600' : '400',
        background: tab === t.key ? '#fff0ef' : 'transparent',
        color: tab === t.key ? '#fd1d00' : '#555',
        cursor: 'pointer'
      }}>{t.label}</button>
    ))}
  </div>
</div>

    </main>
  );
}