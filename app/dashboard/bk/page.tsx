'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

type TabKey = 'absen' | 'masalah' | 'history';

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

type HistoryItem = {
  id: number;
  jurusan?: string;
  kelas?: string;
  kelas_walas?: string;
  created_at: string;
};

type AbsenHistoryRow = {
  nama: string;
  kelas: string;
  tanggal: string;
  status: string;
};

const jurusanConfig = [
  { key: 'PPLG', label: 'Jurusan PPLG' },
  { key: 'TJKT', label: 'Jurusan TJKT' },
  { key: 'DKV', label: 'Jurusan DKV' },
  { key: 'MPLB', label: 'Jurusan MPLB' },
  { key: 'PEMASARAN', label: 'Jurusan Pemasaran' },
];

function buildCsv(rows: AbsenHistoryRow[]) {
  const tanggalList = Array.from(new Set(rows.map(r => r.tanggal))).sort();
  const groupedData: Record<string, Record<string, string>> = {};
  const kelasByNama: Record<string, string> = {};

  rows.forEach(r => {
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

  return [header.join(','), ...csvRows].join('\n');
}

function downloadCsv(filename: string, csvContent: string) {
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function JejakHistory({ token, isBK = false }: { token: string; isBK?: boolean }) {
  const [laporan, setLaporan] = useState<HistoryItem[]>([]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      fetch('/api/history', {
        headers: { Authorization: `Bearer ${token}` },
      }).then(r => r.json()).then(d => {
        if (d.laporan) setLaporan(d.laporan);
      });
    }, 0);
    return () => window.clearTimeout(timer);
  }, [token]);

  async function downloadExcel(kelas: string) {
    const res = await fetch('/api/history', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ kelas }),
    });
    const data = await res.json();
    const rows: AbsenHistoryRow[] = data.absen || [];
    if (rows.length === 0) return alert('Belum ada data');

    downloadCsv(
      `rekap_absen_${kelas}_${new Date().toLocaleDateString('id-ID').replace(/\//g, '_')}.csv`,
      buildCsv(rows),
    );
  }

  async function handleHapus(id: number) {
    if (!confirm('Hapus history laporan ini?')) return;
    await fetch(`/api/history?id=${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    setLaporan(prev => prev.filter(l => l.id !== id));
  }

  const grouped: Record<string, HistoryItem[]> = {};
  laporan.forEach(l => {
    const key = jurusanConfig.find(j => j.key === l.jurusan?.toUpperCase())?.key || 'LAINNYA';
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(l);
  });

  return (
    <section className={styles.stack}>
      <div className={styles.pageHeader}>
        <div>
          <h2>Jejak History Laporan Absen</h2>
          <p>Riwayat cetak dan laporan absensi per jurusan</p>
        </div>
      </div>

      {jurusanConfig.map(({ key, label }) => {
        const items = grouped[key] || [];
        return (
          <div key={key} className={styles.sectionCard}>
            <div className={styles.sectionBar}>
              <div>
                <p>{label}</p>
                <span>{items.length} laporan</span>
              </div>
            </div>
            {items.length === 0 ? (
              <div className={styles.emptyBlock}>Belum ada history laporan {label}</div>
            ) : items.map((l, i) => (
              <div key={l.id} className={i % 2 === 0 ? styles.historyRow : styles.historyRowAlt}>
                <div className={styles.dateBadge}>
                  <strong>{new Date(l.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</strong>
                  <span>{new Date(l.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <p className={styles.rowTitle}>{l.kelas || l.jurusan}</p>
                <div className={styles.rowActions}>
                  <button onClick={() => downloadExcel(l.kelas_walas || l.kelas || '')} className={styles.ghostButton}>Unduh Excel</button>
                  {isBK && (
                    <button onClick={() => handleHapus(l.id)} className={styles.dangerGhostButton}>Hapus</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        );
      })}
    </section>
  );
}

export default function DashboardBK() {
  const router = useRouter();
  const [tab, setTab] = useState<TabKey>('absen');
  const [siswaRekap, setSiswaRekap] = useState<SiswaRekap[]>([]);
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
  const [popupJurusan, setPopupJurusan] = useState<{ jurusan: string; label: string } | null>(null);
  const [popupKelas, setPopupKelas] = useState<{ kelas: string } | null>(null);
  const [showAlasanPopup, setShowAlasanPopup] = useState(false);
  const [alasanPopupItem, setAlasanPopupItem] = useState<SiswaRekap | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const touchStartX = useRef(0);

  function getToken() {
    return localStorage.getItem('token');
  }

  const fetchUser = useCallback(async (t: string) => {
    const res = await fetch('/api/absen?tipe=bk', {
      headers: { Authorization: `Bearer ${t}` },
    });
    const data = await res.json();
    if (!res.ok) return router.push('/login?role=bk');
    setUserName(data.nama || '');
    setSiswaRekap(data.rekap || []);
  }, [router]);

  const fetchRekap = useCallback(async () => {
    const res = await fetch('/api/absen?tipe=bk', {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    const data = await res.json();
    if (res.ok) setSiswaRekap(data.rekap || []);
  }, []);

  const fetchLaporanMasalah = useCallback(async () => {
    const res = await fetch('/api/laporan/bk?tipe=masalah', {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    const data = await res.json();
    if (res.ok) setLaporanMasalah(data.laporan);
  }, []);

  useEffect(() => {
    const t = localStorage.getItem('token') || '';
    const timer = window.setTimeout(() => {
      setToken(t);
      fetchUser(t);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [fetchUser]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (tab === 'absen') fetchRekap();
      if (tab === 'masalah') fetchLaporanMasalah();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [fetchLaporanMasalah, fetchRekap, tab]);

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }

  function handleTouchEnd(e: React.TouchEvent) {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (diff > 50) setSidebarOpen(false);
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
    if (res.ok) {
      setMsg(`Absen ${jurusan} berhasil direset!`);
      fetchRekap();
    } else setMsg(data.message || 'Gagal reset');
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
    if (res.ok) {
      setMsg(status === 'diproses' ? 'Laporan diproses!' : 'Laporan ditolak');
      fetchLaporanMasalah();
    }
  }

  async function handleResetAbsen() {
    if (!confirm('Reset semua data absen ongoing? Ini tidak bisa dibatalkan!')) return;
    const res = await fetch('/api/absen', {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    const data = await res.json();
    if (res.ok) {
      setMsg('Semua data absen berhasil direset!');
      fetchRekap();
    } else setMsg(data.message || 'Gagal reset');
  }

  async function handleResetKelas(kelas: string) {
    if (!confirm(`Reset absen kelas ${kelas}? Tidak bisa dibatalkan!`)) return;
    const res = await fetch(`/api/absen?kelas=${encodeURIComponent(kelas)}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    const data = await res.json();
    if (res.ok) {
      setMsg(`Absen ${kelas} berhasil direset!`);
      fetchRekap();
    } else setMsg(data.message || 'Gagal reset');
  }

  async function cetakExcelJurusan(jurusan: string) {
    const res = await fetch('/api/history', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
      body: JSON.stringify({ jurusan }),
    });
    const data = await res.json();
    const rows: AbsenHistoryRow[] = data.absen || [];
    if (rows.length === 0) return setMsg('Belum ada data untuk dicetak');

    downloadCsv(`rekap_absen_${jurusan}_${new Date().toLocaleDateString('id-ID')}.csv`, buildCsv(rows));
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
    const rows: AbsenHistoryRow[] = data.absen || [];
    if (rows.length === 0) return setMsg('Belum ada data untuk dicetak');

    downloadCsv(`rekap_absen_${kelas}_${new Date().toLocaleDateString('id-ID')}.csv`, buildCsv(rows));
    await fetch('/api/history', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
      body: JSON.stringify({ simpan: true, jurusan, kelas }),
    });
  }

  async function handleKirimBalasanPopup() {
    if (!inputBalas || !selectedMasalah) return;
    await fetch('/api/komentar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
      body: JSON.stringify({ laporan_id: selectedMasalah.id, isi: inputBalas }),
    });
    setInputBalas('');
    fetchKomentar(selectedMasalah.id);
  }

  async function handleLogout() {
    localStorage.removeItem('token');
    router.push('/');
  }

  const statusColor: Record<string, string> = {
    pending: '#000000',
    diterima: '#000000',
    ditolak: '#fd1d00',
    diproses: '#727272',
  };

  const grouped: Record<string, SiswaRekap[]> = {};
  siswaRekap.forEach(s => {
    const key = jurusanConfig.find(j => s.kelas?.toUpperCase().includes(j.key))?.key || 'LAINNYA';
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(s);
  });

  return (
    <main className={styles.shell}>
      <header className={styles.topbar}>
        <div className={styles.identity}>
          <button
            aria-label="Buka menu"
            onClick={() => setSidebarOpen(true)}
            className={styles.menuButton}
          >
            <span />
            <span />
            <span />
          </button>
          <div className={styles.titleBlock}>
            <p className={styles.pageTitle}>Dashboard BK</p>
            <p className={styles.pageSubtitle}>{userName || 'BK'}</p>
          </div>
        </div>
        <button onClick={handleLogout} className={styles.secondaryButton}>Logout</button>
      </header>

      <div className={styles.content}>
        {msg && (
          <div className={msg.includes('berhasil') || msg.includes('diproses') ? styles.successAlert : styles.alert}>
            {msg}
          </div>
        )}

        {tab === 'absen' && (
          <section className={styles.stack}>
            <div className={styles.pageHeader}>
              <div>
                <h2>Ongoing Absen Semua Jurusan</h2>
                <p>Rekap kelas, cetak CSV, dan reset data absen</p>
              </div>
              <button onClick={handleResetAbsen} className={styles.dangerButton}>Reset Semua Absen</button>
            </div>

            {jurusanConfig.map(({ key, label }) => {
              const items = grouped[key] || [];
              const mulaiDari = items.find(s => s.mulai_dari)?.mulai_dari;
              return (
                <div key={key} className={styles.sectionCard}>
                  <div className={styles.sectionBar}>
                    <div>
                      <p>{label}</p>
                      {mulaiDari && (
                        <span>sejak {new Date(mulaiDari).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                      )}
                    </div>
                    <div className={styles.sectionActions}>
                      <button onClick={() => handleResetJurusan(key)} className={styles.dangerSmallButton}>Reset</button>
                      <button onClick={() => cetakExcelJurusan(key)} className={styles.ghostSmallButton}>Cetak Jurusan</button>
                      <button onClick={() => setPopupJurusan({ jurusan: key, label })} className={styles.smallButton}>Lihat Detail</button>
                    </div>
                  </div>

                  {items.length === 0 ? (
                    <div className={styles.emptyBlock}>Belum ada data siswa {label}</div>
                  ) : Array.from(new Set(items.map(s => s.kelas))).sort().map((kelas, ki) => {
                    const siswaKelas = items.filter(s => s.kelas === kelas);
                    return (
                      <div key={kelas} className={ki % 2 === 0 ? styles.classRow : styles.classRowAlt}>
                        <p className={styles.className}>{kelas}</p>
                        <div className={styles.miniStats}>
                          {[
                            { label: 'Hadir', val: siswaKelas.reduce((a, s) => a + Number(s.hadir || 0), 0), danger: false },
                            { label: 'Izin', val: siswaKelas.reduce((a, s) => a + Number(s.izin || 0), 0), danger: false },
                            { label: 'Sakit', val: siswaKelas.reduce((a, s) => a + Number(s.sakit || 0), 0), danger: false },
                            { label: 'Alpha', val: siswaKelas.reduce((a, s) => a + Number(s.alpha || 0), 0), danger: true },
                          ].map(stat => (
                            <div key={stat.label} className={stat.danger ? styles.miniStatDanger : styles.miniStat}>
                              <strong>{stat.val}</strong>
                              <span>{stat.label}</span>
                            </div>
                          ))}
                        </div>
                        <div className={styles.rowActions}>
                          <button onClick={() => setPopupKelas({ kelas })} className={styles.smallButton}>Detail</button>
                          <button onClick={() => cetakExcelKelas(kelas, key)} className={styles.ghostSmallButton}>Cetak</button>
                          <button onClick={() => handleResetKelas(kelas)} className={styles.dangerSmallButton}>Reset</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </section>
        )}

        {tab === 'masalah' && (
          <section className={styles.stack}>
            <div className={styles.pageHeader}>
              <div>
                <h2>Laporan Masalah Siswa</h2>
                <p>Tinjau laporan walas dan beri balasan untuk tindak lanjut</p>
              </div>
            </div>

            {laporanMasalah.length === 0 ? (
              <div className={styles.emptyCard}>Belum ada laporan masalah</div>
            ) : laporanMasalah.map(l => (
              <article key={l.id} className={styles.reportCard}>
                <div className={styles.reportActions}>
                  <button onClick={() => handleHapusLaporan(l.id)} className={styles.dangerSmallButton}>Hapus Masalah</button>
                </div>
                <div className={styles.reportTop}>
                  <div className={styles.reportText}>
                    <h3>{l.judul}</h3>
                    <p>dari {l.nama_walas} - {l.kelas_walas}</p>
                  </div>
                  <span
                    className={styles.statusBadge}
                    style={{
                      background: `${statusColor[l.status] || '#888888'}20`,
                      color: statusColor[l.status] || '#888888',
                    }}
                  >
                    {l.status.toUpperCase()}
                  </span>
                </div>
                <p className={styles.reportBody}>{l.komentar}</p>

                <div className={styles.commentList}>
                  {(komentarMap[l.id] || []).map(k => (
                    <div key={k.id} className={styles.commentItem}>
                      <div className={styles.commentHeader}>
                        <p>{k.nama}</p>
                        <div className={styles.commentActions}>
                          {k.nama === userName && (
                            <>
                              <button onClick={() => { setEditKomentarId(k.id); setEditKomentarIsi(k.isi); }} className={styles.smallButton}>Edit</button>
                              <button onClick={() => handleHapusKomentar(k.id, l.id)} className={styles.dangerGhostSmallButton}>Hapus</button>
                            </>
                          )}
                        </div>
                      </div>
                      {editKomentarId === k.id ? (
                        <div className={styles.inlineForm}>
                          <input value={editKomentarIsi} onChange={e => setEditKomentarIsi(e.target.value)} className={styles.input} />
                          <button onClick={() => handleEditKomentar(k.id)} className={styles.primaryButton}>Simpan</button>
                        </div>
                      ) : (
                        <p className={styles.commentBody}>{k.isi}</p>
                      )}
                      <span className={styles.commentTime}>{new Date(k.created_at).toLocaleTimeString('id-ID')}</span>
                    </div>
                  ))}

                  <button onClick={() => { setSelectedMasalah(l); fetchKomentar(l.id); }} className={styles.ghostButton}>
                    Lihat balasan lebih detail
                  </button>

                  <div className={styles.replyForm}>
                    <input
                      type="text"
                      placeholder="Balas komentar..."
                      value={inputKomentar[l.id] || ''}
                      onFocus={() => fetchKomentar(l.id)}
                      onChange={e => setInputKomentar(prev => ({ ...prev, [l.id]: e.target.value }))}
                      className={styles.input}
                    />
                    <button onClick={() => handleKirimKomentar(l.id)} className={styles.primaryButton}>Kirim</button>
                  </div>
                </div>

                {l.status === 'pending' && (
                  <div className={styles.actionRow}>
                    <button onClick={() => handleProsesMasalah(l.id, 'diproses')} className={styles.secondaryButton}>Proses</button>
                    <button onClick={() => handleProsesMasalah(l.id, 'ditolak')} className={styles.dangerGhostButton}>Tolak</button>
                  </div>
                )}
              </article>
            ))}
          </section>
        )}

        {tab === 'history' && token && <JejakHistory token={token} isBK={true} />}
      </div>

      <footer className={styles.footer}>
        2026 - NamaSekolah@gmail.com - Website Resmi Sekolah
      </footer>

      {popupJurusan && (
        <div className={styles.modalBackdrop} onClick={() => setPopupJurusan(null)}>
          <div className={styles.largeModal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <p>{popupJurusan.label}</p>
              <button onClick={() => setPopupJurusan(null)} className={styles.ghostSmallButton}>Tutup</button>
            </div>
            <div className={styles.tableCard}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    {['Kelas', 'Hadir', 'Izin', 'Sakit', 'Alpha', 'Aksi'].map(h => (
                      <th key={h}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const kelasList = Array.from(new Set((grouped[popupJurusan.jurusan] || []).map(s => s.kelas))).sort();
                    if (kelasList.length === 0) return (
                      <tr><td colSpan={6} className={styles.emptyCell}>Belum ada data</td></tr>
                    );
                    return kelasList.map((kelas, i) => {
                      const siswaKelas = (grouped[popupJurusan.jurusan] || []).filter(s => s.kelas === kelas);
                      const totalHadir = siswaKelas.reduce((a, s) => a + Number(s.hadir || 0), 0);
                      const totalIzin = siswaKelas.reduce((a, s) => a + Number(s.izin || 0), 0);
                      const totalSakit = siswaKelas.reduce((a, s) => a + Number(s.sakit || 0), 0);
                      const totalAlpha = siswaKelas.reduce((a, s) => a + Number(s.alpha || 0), 0);
                      return (
                        <tr key={kelas} className={i % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
                          <td className={styles.nameCell}>{kelas}</td>
                          <td className={styles.countCell}>{totalHadir}</td>
                          <td className={styles.countCell}>{totalIzin}</td>
                          <td className={styles.countCell}>{totalSakit}</td>
                          <td className={styles.countCellDanger}>{totalAlpha}</td>
                          <td><button onClick={() => cetakExcelKelas(kelas, popupJurusan.jurusan)} className={styles.smallButton}>Cetak</button></td>
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

      {selectedMasalah && (
        <div className={styles.modalBackdrop} onClick={() => setSelectedMasalah(null)}>
          <div className={styles.largeModal} onClick={e => e.stopPropagation()}>
            <div className={styles.reportTop}>
              <div className={styles.reportText}>
                <h3>{selectedMasalah.nama_walas}</h3>
                <p>{selectedMasalah.judul}</p>
                <p>{selectedMasalah.komentar}</p>
              </div>
              <div className={styles.reportMeta}>
                <span
                  className={styles.statusBadge}
                  style={{
                    background: `${statusColor[selectedMasalah.status] || '#888888'}20`,
                    color: statusColor[selectedMasalah.status] || '#888888',
                  }}
                >
                  {selectedMasalah.status}
                </span>
                <p>{new Date(selectedMasalah.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              </div>
            </div>

            <div className={styles.commentList}>
              {(komentarMap[selectedMasalah.id] || []).map(k => (
                <div key={k.id} className={styles.commentItem}>
                  <div className={styles.commentHeader}>
                    <p>{k.nama}</p>
                    <div className={styles.commentActions}>
                      <span>{new Date(k.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                      {k.nama === userName && (
                        <>
                          <button onClick={() => { setEditKomentarId(k.id); setEditKomentarIsi(k.isi); }} className={styles.smallButton}>Edit</button>
                          <button onClick={() => handleHapusKomentar(k.id, selectedMasalah.id)} className={styles.dangerGhostSmallButton}>Hapus</button>
                        </>
                      )}
                    </div>
                  </div>
                  {editKomentarId === k.id ? (
                    <div className={styles.inlineForm}>
                      <input value={editKomentarIsi} onChange={e => setEditKomentarIsi(e.target.value)} className={styles.input} />
                      <button onClick={() => handleEditKomentar(k.id)} className={styles.primaryButton}>Simpan</button>
                    </div>
                  ) : (
                    <p className={styles.commentBody}>{k.isi}</p>
                  )}
                </div>
              ))}
            </div>

            <div className={styles.replyForm}>
              <input
                type="text"
                placeholder="Balas komentar..."
                value={inputBalas}
                onChange={e => setInputBalas(e.target.value)}
                className={styles.input}
              />
              <button onClick={handleKirimBalasanPopup} className={styles.primaryButton}>Kirim</button>
            </div>

            <button onClick={() => setSelectedMasalah(null)} className={styles.ghostButton}>Tutup</button>
          </div>
        </div>
      )}

      {popupKelas && (
        <div className={styles.modalBackdrop} onClick={() => setPopupKelas(null)}>
          <div className={styles.largeModal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <p>{popupKelas.kelas}</p>
              <button onClick={() => setPopupKelas(null)} className={styles.ghostSmallButton}>Tutup</button>
            </div>
            <div className={styles.tableCard}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    {['Nama Siswa', 'Status', 'Alasan', 'Hadir', 'Izin', 'Sakit', 'Alpha'].map(h => (
                      <th key={h}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {siswaRekap.filter(s => s.kelas === popupKelas.kelas).length === 0 ? (
                    <tr><td colSpan={7} className={styles.emptyCell}>Belum ada data</td></tr>
                  ) : siswaRekap.filter(s => s.kelas === popupKelas.kelas).map((s, i) => (
                    <tr key={s.user_id} className={i % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
                      <td className={styles.nameCell}>{s.nama}</td>
                      <td>
                        <span className={s.status_hari_ini === 'alpha' ? styles.statusDangerText : styles.statusText}>
                          {s.status_hari_ini?.toUpperCase() || 'BELUM'}
                        </span>
                      </td>
                      <td>
                        {(s.status_hari_ini === 'izin' || s.status_hari_ini === 'sakit') && s.alasan_hari_ini ? (
                          <button onClick={() => { setAlasanPopupItem(s); setShowAlasanPopup(true); }} className={styles.smallButton}>Lihat</button>
                        ) : <span className={styles.mutedText}>-</span>}
                      </td>
                      <td className={styles.countCell}>{s.hadir || 0}</td>
                      <td className={styles.countCell}>{s.izin || 0}</td>
                      <td className={styles.countCell}>{s.sakit || 0}</td>
                      <td className={styles.countCellDanger}>{s.alpha || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {showAlasanPopup && alasanPopupItem && (
        <div className={styles.modalBackdrop} onClick={() => setShowAlasanPopup(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <p className={styles.modalTitle}>Alasan - {alasanPopupItem.nama}</p>
            <p className={styles.modalMeta}>Status: <strong>{alasanPopupItem.status_hari_ini?.toUpperCase()}</strong></p>
            <p className={styles.modalBody}>{alasanPopupItem.alasan_hari_ini || 'Tidak ada alasan'}</p>
            <button onClick={() => setShowAlasanPopup(false)} className={styles.ghostButton}>Tutup</button>
          </div>
        </div>
      )}

      {sidebarOpen && (
        <div className={styles.backdrop} onClick={() => setSidebarOpen(false)} />
      )}

      <div
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ''}`}
      >
        <div className={styles.sidebarHeader}>
          <p>Direktori Halaman BK</p>
          <button aria-label="Tutup menu" onClick={() => setSidebarOpen(false)} className={styles.closeButton}>x</button>
        </div>
        <div className={styles.navList}>
          {[
            { key: 'absen', label: 'Ongoing Absen' },
            { key: 'masalah', label: 'Laporan Masalah' },
            { key: 'history', label: 'History Laporan' },
          ].map(t => (
            <button
              key={t.key}
              onClick={() => { setTab(t.key as TabKey); setSidebarOpen(false); setMsg(''); }}
              className={tab === t.key ? styles.navItemActive : styles.navItem}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>
    </main>
  );
}
