'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';

type User = {
  id: number;
  nama: string;
  email: string;
  password: string;
  role: string;
  kelas: string | null;
  created_at: string;
};

type Grafik = {
  hadir: number;
  izin: number;
  sakit: number;
  dispen: number;
  alpha: number;
};

function UserCard({ u }: { u: any }) {
  const [resetId, setResetId] = useState<number | null>(null);
  const [resetPass, setResetPass] = useState('');
  const [editNamaId, setEditNamaId] = useState<number | null>(null);
  const [editNamaValue, setEditNamaValue] = useState('');
  const [msg, setMsg] = useState('');

  async function handleHapus() {
    if (!confirm('Hapus akun ini?')) return;
    const res = await fetch(`/api/admin?id=${u.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    const data = await res.json();
    setMsg(data.message);
    window.location.reload();
  }

  async function handleUbahUsername() {
    if (!editNamaValue) return;
    const res = await fetch('/api/admin', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
      body: JSON.stringify({ id: u.id, nama: editNamaValue }),
    });
    const data = await res.json();
    setMsg(data.message);
    setEditNamaId(null);
    window.location.reload();
  }

  async function handleReset() {
    if (!resetPass) return setMsg('Password baru kosong');
    const res = await fetch('/api/admin', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
      body: JSON.stringify({ id: u.id, password: resetPass }),
    });
    const data = await res.json();
    if (!res.ok) return setMsg(data.message || 'Gagal reset');
    setMsg('Password berhasil direset!');
    setResetId(null);
    setResetPass('');
  }

  return (
    <div style={{
      background: '#fff', borderRadius: '12px', border: '1px solid #e5e5e5', padding: '14px',
      display: 'flex', flexDirection: 'column', gap: '6px'
    }}>
      {msg && <p style={{ fontSize: '12px', color: msg.includes('berhasil') ? '#16a34a' : '#fd1d00' }}>{msg}</p>}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <p style={{ fontWeight: '600', fontSize: '14px', color: '#111' }}>{u.nama}</p>
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          <span style={{ background: '#f5f5f5', color: '#555', padding: '3px 8px', borderRadius: '20px', fontSize: '11px' }}>{u.role}</span>
          <button onClick={handleHapus} style={{ background: '#fd1d00', color: '#fff', border: 'none', borderRadius: '8px', padding: '4px 10px', fontSize: '12px', cursor: 'pointer' }}>Hapus</button>
        </div>
      </div>
      <p style={{ fontSize: '13px', color: '#666' }}>📧 {u.email}</p>
      {u.kelas && <p style={{ fontSize: '13px', color: '#666' }}>🏫 {u.kelas}</p>}
      <p style={{ fontSize: '12px', color: '#bbb' }}>🔒 {u.password.substring(0, 20)}...</p>
      <p style={{ fontSize: '12px', color: '#bbb' }}>📅 {new Date(u.created_at).toLocaleDateString('id-ID')}</p>

      {resetId === u.id ? (
        <div style={{ display: 'flex', gap: '8px' }}>
          <input type="password" placeholder="Password baru" value={resetPass} onChange={e => setResetPass(e.target.value)}
            style={{ flex: 1, border: '1px solid #e5e5e5', borderRadius: '10px', padding: '8px 12px', fontSize: '13px', outline: 'none' }} />
          <button onClick={handleReset} style={{ background: '#fd1d00', color: '#fff', border: 'none', borderRadius: '10px', padding: '8px 14px', fontSize: '13px', cursor: 'pointer' }}>Simpan</button>
          <button onClick={() => setResetId(null)} style={{ background: '#f5f5f5', color: '#555', border: 'none', borderRadius: '10px', padding: '8px 14px', fontSize: '13px', cursor: 'pointer' }}>Batal</button>
        </div>
      ) : editNamaId === u.id ? (
        <div style={{ display: 'flex', gap: '6px' }}>
          <input value={editNamaValue} onChange={e => setEditNamaValue(e.target.value)} placeholder="Username baru..."
            style={{ flex: 1, border: '1px solid #e5e5e5', borderRadius: '8px', padding: '7px 10px', fontSize: '13px', outline: 'none' }} />
          <button onClick={handleUbahUsername} style={{ background: '#111', color: '#fff', border: 'none', borderRadius: '8px', padding: '7px 12px', fontSize: '12px', cursor: 'pointer' }}>Simpan</button>
          <button onClick={() => setEditNamaId(null)} style={{ background: '#f5f5f5', color: '#555', border: '1px solid #e5e5e5', borderRadius: '8px', padding: '7px 12px', fontSize: '12px', cursor: 'pointer' }}>Batal</button>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => { setEditNamaId(u.id); setEditNamaValue(u.nama); }} style={{ flex: 1, background: '#111', color: '#fff', border: 'none', borderRadius: '10px', padding: '8px', fontSize: '13px', cursor: 'pointer' }}>Ubah Username</button>
          <button onClick={() => { setResetId(u.id); setMsg(''); }} style={{ flex: 1, background: '#111', color: '#fff', border: 'none', borderRadius: '10px', padding: '8px', fontSize: '13px', cursor: 'pointer' }}>Reset Password</button>
        </div>
      )}
    </div>
  );
}

export default function DashboardAdmin() {
  const router = useRouter();
  const [tab, setTab] = useState<'buat' | 'siswa' | 'guru' | 'bk'>('buat');
  const [form, setForm] = useState({ nama: '', email: '', password: '', role: 'guru', kelas: '' });
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [resetId, setResetId] = useState<number | null>(null);
  const [resetPass, setResetPass] = useState('');
  const [grafik, setGrafik] = useState<Grafik | null>(null);
  const [editNamaId, setEditNamaId] = useState<number | null>(null);
  const [editNamaValue, setEditNamaValue] = useState('');
  const [totalUser, setTotalUser] = useState({ siswa: 0, guru: 0, bk: 0 });
  const [grafikMasalah, setGrafikMasalah] = useState<any>(null);


  useEffect(() => {
    if (tab === 'buat') { fetchGrafik(); fetchTotalUser(); return; }
    fetchUsers();
  }, [tab]);

  async function fetchUsers() {
    const token = localStorage.getItem('token');
    const res = await fetch(`/api/admin?role=${tab}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) return console.log('fetch gagal:', data);
    setUsers(data.users);
  }

  async function fetchGrafik() {
  const token = localStorage.getItem('token');
  const [r1, r2] = await Promise.all([
    fetch('/api/admin?role=grafik', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
    fetch('/api/admin?role=grafik-masalah', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
  ]);
  if (r1) setGrafik(r1.grafik);
  if (r2) setGrafikMasalah(r2);
}

  async function fetchTotalUser() {
  const token = localStorage.getItem('token');
  const [s, g, b] = await Promise.all([
    fetch('/api/admin?role=siswa', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
    fetch('/api/admin?role=guru', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
    fetch('/api/admin?role=bk', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
  ]);
  setTotalUser({ siswa: s.users?.length || 0, guru: g.users?.length || 0, bk: b.users?.length || 0 });
}

  async function handleBuat() {
    setLoading(true);
    setMsg('');
    const token = localStorage.getItem('token');
    const res = await fetch('/api/admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) return setMsg(data.message || 'Gagal buat akun');
    setMsg('Akun berhasil dibuat!');
    setForm({ nama: '', email: '', password: '', role: 'guru', kelas: '' });
  }

  async function handleHapusAkun(id: number) {
    if (!confirm('Hapus akun ini?')) return;
    const res = await fetch(`/api/admin?id=${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    const data = await res.json();
    setMsg(data.message);
    fetchUsers();
  }

  async function handleUbahUsername(id: number) {
    if (!editNamaValue) return;
    const res = await fetch('/api/admin', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
      body: JSON.stringify({ id, nama: editNamaValue }),
    });
    const data = await res.json();
    setMsg(data.message);
    setEditNamaId(null);
    setEditNamaValue('');
    fetchUsers();
  }

  async function handleReset(id: number) {
    if (!resetPass) return setMsg('Password baru kosong');
    const token = localStorage.getItem('token');
    const res = await fetch('/api/admin', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ id, password: resetPass }),
    });
    const data = await res.json();
    if (!res.ok) return setMsg(data.message || 'Gagal reset');
    setMsg('Password berhasil direset!');
    setResetId(null);
    setResetPass('');
    fetchUsers();
  }

  async function handleLogout() {
    localStorage.removeItem('token');
    router.push('/');
  }

  const grafikData = grafik ? [
    { name: 'Hadir',  jumlah: Number(grafik.hadir),  fill: '#16a34a' },
    { name: 'Izin',   jumlah: Number(grafik.izin),   fill: '#d97706' },
    { name: 'Sakit',  jumlah: Number(grafik.sakit),  fill: '#2563eb' },
    { name: 'Dispen', jumlah: Number(grafik.dispen), fill: '#7e22ce' },
    { name: 'Alpha',  jumlah: Number(grafik.alpha),  fill: '#dc2626' },
  ] : [];

  const tabList = [
    { key: 'buat', label: '➕ Buat Akun' },
    { key: 'siswa', label: '👤 Akun Siswa' },
    { key: 'guru', label: '🏫 Akun Guru' },
    { key: 'bk', label: '🏢 Akun BK' },
  ];

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
          }}>⚙️</div>
          <div>
            <p style={{ fontSize: '15px', fontWeight: '600', color: '#111' }}>Dashboard Admin</p>
            <p style={{ fontSize: '12px', color: '#999' }}>Kelola akun pengguna</p>
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
        {tabList.map(t => (
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

        {tab === 'buat' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Form Buat Akun */}
            <div style={{
              background: '#fff', borderRadius: '20px', border: '1px solid #e5e5e5',
              padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px'
            }}>
              <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#111' }}>Buat Akun Baru</h2>
              {msg && (
                <div style={{
                  background: msg.includes('berhasil') ? '#f0fdf4' : '#fff0ef',
                  border: `1px solid ${msg.includes('berhasil') ? '#16a34a' : '#fd1d00'}`,
                  borderRadius: '10px', padding: '10px 12px', fontSize: '13px',
                  color: msg.includes('berhasil') ? '#16a34a' : '#fd1d00'
                }}>{msg}</div>
              )}
              <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} style={{
                border: '1px solid #e5e5e5', borderRadius: '10px',
                padding: '10px 14px', fontSize: '14px', outline: 'none', background: '#fff'
              }}>
                <option value="siswa">Siswa</option>
                <option value="guru">Guru / Walas</option>
                <option value="bk">BK / Kesiswaan</option>
              </select>
              {['nama', 'email', 'password'].map(f => (
                <input key={f} type={f === 'password' ? 'password' : 'text'}
                  placeholder={f.charAt(0).toUpperCase() + f.slice(1)}
                  value={form[f as keyof typeof form]}
                  onChange={e => setForm({ ...form, [f]: e.target.value })}
                  style={{
                    border: '1px solid #e5e5e5', borderRadius: '10px',
                    padding: '10px 14px', fontSize: '14px', outline: 'none',
                    width: '100%', boxSizing: 'border-box'
                  }}
                />
              ))}
              {(form.role === 'guru' || form.role === 'siswa') && (
                <select value={form.kelas} onChange={e => setForm({ ...form, kelas: e.target.value })}
                  style={{ border: '1px solid #e5e5e5', borderRadius: '10px', padding: '10px 14px', fontSize: '14px', outline: 'none', background: '#fff', width: '100%', boxSizing: 'border-box' as const }}>
                  <option value="">-- Pilih Kelas --</option>
                  {['10 DKV PLUS','10 DKV 1','10 DKV 2','10 TJKT PLUS','10 TJKT 1','10 TJKT 2','10 TJKT 3','10 TJKT 4','10 TJKT 5','10 PPLG 1','10 PPLG 2','10 PEMASARAN 1','10 PEMASARAN 2','10 MPLB PLUS','10 MPLB 1','10 MPLB 2','10 MPLB 3','10 MPLB 4','10 MPLB 5','11 DKV PLUS','11 DKV 1','11 DKV 2','11 TJKT PLUS','11 TJKT 1','11 TJKT 2','11 TJKT 3','11 TJKT 4','11 TJKT 5','11 TJKT 6','11 TJKT 7','11 PPLG 1','11 PPLG 2','11 PEMASARAN 1','11 PEMASARAN 2','11 PEMASARAN 3','11 MPLB PLUS','11 MPLB 1','11 MPLB 2','11 MPLB 3','11 MPLB 4','11 MPLB 5'].map(k => (
                    <option key={k} value={k}>{k}</option>
                  ))}
                </select>
              )}
              <button onClick={handleBuat} disabled={loading} style={{
                background: '#fd1d00', color: '#fff', border: 'none',
                borderRadius: '10px', padding: '11px 0', fontSize: '14px',
                fontWeight: '600', cursor: 'pointer'
              }}>
                {loading ? 'Membuat...' : 'Buat Akun'}
              </button>
            </div>

            {/* Grafik */}
            <div style={{
              background: '#fff', borderRadius: '20px', border: '1px solid #e5e5e5', padding: '24px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#111' }}>Grafik Kehadiran</h2>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '12px', color: '#999' }}>
                    {new Date().toLocaleDateString('id-ID', { month: 'long' })}
                  </p>
                  <p style={{ fontSize: '13px', fontWeight: '600', color: '#111' }}>
                    {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
              </div>

              {!grafik ? (
                <p style={{ textAlign: 'center', color: '#999', fontSize: '14px', padding: '40px 0' }}>
                  Belum ada data kehadiran
                </p>
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={grafikData} barCategoryGap="35%" margin={{ top: 20, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 12, fontWeight: 600 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(value) => [`${value} siswa`]} />
                    <Bar dataKey="jumlah" radius={[6, 6, 0, 0]}>
                      {grafikData.map((entry, index) => (
                        <Cell key={index} fill={entry.fill} />
                      ))}
                      <LabelList dataKey="jumlah" position="top" style={{ fontSize: '12px', fontWeight: '600', fill: '#555' }} formatter={(v: any) => `${v}x`} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}

              {/* Grafik Laporan Masalah */}
{grafikMasalah && (
  <div style={{ background: '#fff', borderRadius: '20px', border: '1px solid #e5e5e5', padding: '24px' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
      <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#111' }}>Laporan Masalah</h2>
      <div style={{ textAlign: 'right' }}>
        <p style={{ fontSize: '12px', color: '#999' }}>
          {new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
        </p>
        <p style={{ fontSize: '22px', fontWeight: '700', color: '#fd1d00' }}>
          {grafikMasalah.total} Laporan
        </p>
        <p style={{ fontSize: '11px', color: '#999' }}>bulan ini</p>
      </div>
    </div>

    {/* Bar chart 6 bulan terakhir */}
    <ResponsiveContainer width="100%" height={200}>
      <BarChart
        data={grafikMasalah.perBulan?.map((b: any) => ({
          name: new Date(b.tahun, b.bulan - 1).toLocaleDateString('id-ID', { month: 'short', year: '2-digit' }),
          total: Number(b.total),
        })).reverse()}
        barCategoryGap="35%"
        margin={{ top: 16, right: 10, left: -10, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="name" tick={{ fontSize: 11, fontWeight: 600 }} />
        <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
        <Tooltip formatter={(value) => [`${value} laporan`]} />
        <Bar dataKey="total" radius={[6, 6, 0, 0]} fill="#fd1d00">
          <LabelList dataKey="total" position="top" style={{ fontSize: '12px', fontWeight: '600', fill: '#555' }} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  </div>
)}

              {/* Total User */}
<div style={{ background: '#fff', borderRadius: '20px', border: '1px solid #e5e5e5', padding: '24px', marginTop: '20px' }}>
  <p style={{ fontSize: '14px', fontWeight: '600', color: '#111', marginBottom: '12px' }}>Total User Yang Sudah registrasi</p>
  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
    {[
      { label: 'Siswa', count: totalUser.siswa, color: '#16a34a', icon: '🎓' },
      { label: 'Guru',  count: totalUser.guru,  color: '#2563eb', icon: '🏫' },
      { label: 'BK',    count: totalUser.bk,    color: '#7e22ce', icon: '🏢' },
    ].map(({ label, count, color, icon }) => (
      <div key={label} style={{
        background: color, borderRadius: '14px', padding: '16px 20px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
      }}>
        <div>
          <p style={{ fontSize: '16px', fontWeight: '700', color: '#fff' }}>{label}</p>
          <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.8)', marginTop: '2px' }}>Total :</p>
          <p style={{ fontSize: '22px', fontWeight: '700', color: '#fff', marginTop: '2px' }}>
            {String(count).padStart(3, '0')} Akun
          </p>
        </div>
        <span style={{ fontSize: '36px', opacity: 0.9 }}>{icon}</span>
      </div>
    ))}
  </div>
</div>
            </div>
          </div>
        )}

        {/* Daftar Akun */}
        {(tab === 'siswa' || tab === 'guru' || tab === 'bk') && (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
    <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#111' }}>
      Daftar Akun {tab === 'siswa' ? 'Siswa' : tab === 'guru' ? 'Guru / Walas' : 'BK'}
    </h2>
    {msg && (
      <div style={{
        background: msg.includes('berhasil') ? '#f0fdf4' : '#fff0ef',
        border: `1px solid ${msg.includes('berhasil') ? '#16a34a' : '#fd1d00'}`,
        borderRadius: '10px', padding: '10px 12px', fontSize: '13px',
        color: msg.includes('berhasil') ? '#16a34a' : '#fd1d00'
      }}>{msg}</div>
    )}

    {tab === 'bk' ? (
      // BK: tampil flat tanpa grouping
      users.length === 0 ? (
        <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e5e5e5', padding: '24px', textAlign: 'center', color: '#999', fontSize: '14px' }}>
          Belum ada akun BK
        </div>
      ) : users.map(u => <UserCard key={u.id} u={u} />)
    ) : (() => {
      const jurusanConfig = [
        { key: 'PPLG',      label: 'PPLG',      color: '#d97706' },
        { key: 'TJKT',      label: 'TJKT',      color: '#2563eb' },
        { key: 'DKV',       label: 'DKV',       color: '#fd1d00' },
        { key: 'MPLB',      label: 'MPLB',      color: '#ea580c' },
        { key: 'PEMASARAN', label: 'Pemasaran', color: '#16a34a' },
      ];

      // group by jurusan → kelas
      const byJurusan: Record<string, Record<string, User[]>> = {};
      users.forEach(u => {
        const jurusan = jurusanConfig.find(j => u.kelas?.toUpperCase().includes(j.key))?.key || 'LAINNYA';
        const kelas = u.kelas || 'Tanpa Kelas';
        if (!byJurusan[jurusan]) byJurusan[jurusan] = {};
        if (!byJurusan[jurusan][kelas]) byJurusan[jurusan][kelas] = [];
        byJurusan[jurusan][kelas].push(u);
      });

      return jurusanConfig.map(({ key, label, color }) => {
        const kelasByJurusan = byJurusan[key];
        if (!kelasByJurusan) return null;
        const kelasList = Object.keys(kelasByJurusan).sort();
        return (
          <div key={key} style={{ border: `2px solid ${color}`, borderRadius: '16px', overflow: 'hidden' }}>
            {/* Header Jurusan */}
            <div style={{
              background: color + '18', padding: '10px 16px',
              borderBottom: `1px solid ${color}30`,
              display: 'flex', alignItems: 'center', gap: '8px'
            }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: color }} />
              <p style={{ fontWeight: '700', fontSize: '14px', color }}>Jurusan {label}</p>
              <span style={{ marginLeft: 'auto', fontSize: '11px', color, fontWeight: '500' }}>
                {Object.values(kelasByJurusan).flat().length} akun
              </span>
            </div>

            {/* Per Kelas */}
            {kelasList.map(kelas => (
              <div key={kelas} style={{ borderBottom: `1px solid ${color}20` }}>
                {/* Sub-header Kelas */}
                <div style={{
                  background: color + '0d', padding: '8px 16px',
                  borderBottom: `1px solid ${color}20`,
                  display: 'flex', alignItems: 'center', gap: '8px'
                }}>
                  <p style={{ fontSize: '13px', fontWeight: '600', color }}>{kelas}</p>
                  <span style={{ fontSize: '11px', color: '#999' }}>
                    {kelasByJurusan[kelas].length} akun
                  </span>
                </div>
                {/* Cards */}
                <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {kelasByJurusan[kelas].map(u => <UserCard key={u.id} u={u} />)}
                </div>
              </div>
            ))}
          </div>
        );
      });
    })()}
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