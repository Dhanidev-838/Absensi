'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

type TabKey = 'absen' | 'laporan';

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
  alasan_hari_ini: string | null;
};

type LaporanItem = {
  id: number;
  judul: string;
  komentar: string;
  status: string;
  created_at: string;
};

type KomentarItem = {
  id: number;
  nama: string;
  isi: string;
  created_at: string;
};

type RekapTotal = {
  mulai_dari?: string;
  hadir?: number;
  izin?: number;
  sakit?: number;
  alpha?: number;
};

export default function DashboardGuru() {
  const router = useRouter();
  const [tab, setTab] = useState<TabKey>('absen');
  const [absenHariIni, setAbsenHariIni] = useState<SiswaItem[]>([]);
  const [laporan, setLaporan] = useState<LaporanItem[]>([]);
  const [formLaporan, setFormLaporan] = useState({ judul: '', komentar: '' });
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [userName, setUserName] = useState('');
  const [userKelas, setUserKelas] = useState('');
  const [selectedLaporan, setSelectedLaporan] = useState<LaporanItem | null>(null);
  const [komentarPopup, setKomentarPopup] = useState<KomentarItem[]>([]);
  const [inputBalas, setInputBalas] = useState('');
  const [editKomentarId, setEditKomentarId] = useState<number | null>(null);
  const [editKomentarIsi, setEditKomentarIsi] = useState('');
  const [rekapTotal, setRekapTotal] = useState<RekapTotal | null>(null);
  const [showAlasanPopup, setShowAlasanPopup] = useState(false);
  const [alasanPopupItem, setAlasanPopupItem] = useState<SiswaItem | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const touchStartX = useRef(0);

  function getToken() {
    return localStorage.getItem('token');
  }

  const fetchAbsen = useCallback(async () => {
    const res = await fetch('/api/guru/absen', {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    const data = await res.json();
    if (!res.ok) return router.push('/login?role=guru');
    setUserName(data.nama);
    setUserKelas(data.kelas || '');
    setAbsenHariIni(data.siswa || []);
    setRekapTotal(data.rekap_total || null);
  }, [router]);

  const fetchLaporan = useCallback(async () => {
    const res = await fetch('/api/laporan/masalah', {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    const data = await res.json();
    if (res.ok) setLaporan(data.laporan);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      fetchAbsen();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [fetchAbsen]);

  useEffect(() => {
    if (tab !== 'laporan') return;
    const timer = window.setTimeout(() => {
      fetchLaporan();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [fetchLaporan, tab]);

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }

  function handleTouchEnd(e: React.TouchEvent) {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (diff > 50) setSidebarOpen(false);
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

  async function handleKirimBalasan() {
    if (!inputBalas || !selectedLaporan) return;
    await fetch('/api/komentar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
      body: JSON.stringify({ laporan_id: selectedLaporan.id, isi: inputBalas }),
    });
    setInputBalas('');
    fetchKomentarPopup(selectedLaporan.id);
  }

  async function handleLogout() {
    localStorage.removeItem('token');
    router.push('/');
  }

  const statusColor: Record<string, string> = {
    hadir: '#000000',
    izin: '#000000',
    sakit: '#000000',
    alpha: '#fd1d00',
  };

  const today = new Date();

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
            <p className={styles.pageTitle}>Dashboard Walas{userKelas && ` - ${userKelas}`}</p>
            <p className={styles.pageSubtitle}>{userName || 'Guru'}</p>
          </div>
        </div>
        <button onClick={handleLogout} className={styles.secondaryButton}>Logout</button>
      </header>

      <div className={styles.content}>
        {tab === 'absen' && (
          <section className={styles.stack}>
            <div className={styles.pageHeader}>
              <div>
                <h2>Ongoing Absen Siswa</h2>
                <p>{userKelas ? `Kelas ${userKelas}` : 'Pantau kehadiran siswa hari ini'}</p>
              </div>
              <div className={styles.dateBlock}>
                <span>{today.toLocaleDateString('id-ID', { month: 'long' })}</span>
                <strong>{today.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</strong>
              </div>
            </div>

            {rekapTotal && (
              <div className={styles.card}>
                <p className={styles.cardTitle}>
                  Rekap Total Kelas {rekapTotal.mulai_dari && `(sejak ${new Date(rekapTotal.mulai_dari).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })})`}
                </p>
                <div className={styles.recapGrid}>
                  {[
                    { label: 'Hadir', val: rekapTotal.hadir, danger: false },
                    { label: 'Izin', val: rekapTotal.izin, danger: false },
                    { label: 'Sakit', val: rekapTotal.sakit, danger: false },
                    { label: 'Alpha', val: rekapTotal.alpha, danger: true },
                  ].map(({ label, val, danger }) => (
                    <div key={label} className={danger ? styles.recapItemDanger : styles.recapItem}>
                      <p>{val || 0}</p>
                      <span>{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className={styles.tableCard}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    {['Nama Siswa', 'Foto Hari Ini', 'Status Hari Ini', 'Alasan', 'Hadir', 'Izin', 'Sakit', 'Alpha'].map(h => (
                      <th key={h}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {absenHariIni.length === 0 ? (
                    <tr>
                      <td colSpan={8} className={styles.emptyCell}>Belum ada data siswa</td>
                    </tr>
                  ) : absenHariIni.map((item, i) => (
                    <tr key={item.user_id} className={i % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
                      <td className={styles.nameCell}>{item.nama}</td>
                      <td>
                        {item.foto ? (
                          <img src={item.foto} alt={`Foto ${item.nama}`} className={styles.avatar} />
                        ) : (
                          <span className={styles.mutedText}>tidak ada foto</span>
                        )}
                      </td>
                      <td>
                        <span
                          className={styles.statusBadge}
                          style={{
                            background: `${statusColor[item.status_hari_ini || ''] || '#888888'}20`,
                            color: statusColor[item.status_hari_ini || ''] || '#888888',
                          }}
                        >
                          {item.status_hari_ini?.toUpperCase() || 'BELUM'}
                        </span>
                      </td>
                      <td>
                        {(item.status_hari_ini === 'izin' || item.status_hari_ini === 'sakit') && item.alasan_hari_ini ? (
                          <button
                            onClick={() => { setAlasanPopupItem(item); setShowAlasanPopup(true); }}
                            className={styles.smallButton}
                          >
                            Lihat
                          </button>
                        ) : (
                          <span className={styles.mutedText}>-</span>
                        )}
                      </td>
                      <td className={styles.countCell}>{item.hadir || 0}</td>
                      <td className={styles.countCell}>{item.izin || 0}</td>
                      <td className={styles.countCell}>{item.sakit || 0}</td>
                      <td className={styles.countCellDanger}>{item.alpha || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {tab === 'laporan' && (
          <section className={styles.stack}>
            <div className={styles.pageHeader}>
              <div>
                <h2>Laporan Masalah Siswa</h2>
                <p>Kirim dan pantau laporan yang diteruskan ke BK</p>
              </div>
            </div>

            {msg && (
              <div className={msg.includes('berhasil') ? styles.successAlert : styles.alert}>{msg}</div>
            )}

            <div className={styles.card}>
              <p className={styles.cardTitle}>Buat Laporan Masalah Dengan BK</p>
              <div className={styles.formStack}>
                <input
                  type="text"
                  placeholder="Judul laporan"
                  value={formLaporan.judul}
                  onChange={e => setFormLaporan({ ...formLaporan, judul: e.target.value })}
                  className={styles.input}
                />
                <textarea
                  placeholder="Tulis komentar / laporan masalah siswa..."
                  value={formLaporan.komentar}
                  onChange={e => setFormLaporan({ ...formLaporan, komentar: e.target.value })}
                  rows={4}
                  className={styles.textarea}
                />
                <button onClick={handleBuatLaporan} disabled={loading} className={styles.primaryButton}>
                  {loading ? 'Mengirim...' : 'Kirim ke BK'}
                </button>
              </div>
            </div>

            {laporan.length === 0 ? (
              <div className={styles.emptyCard}>Belum ada laporan</div>
            ) : laporan.map(l => (
              <article key={l.id} className={styles.reportCard}>
                <div className={styles.reportTop}>
                  <div className={styles.reportText}>
                    <p className={styles.reportAuthor}>{userName}</p>
                    <h3>{l.judul}</h3>
                    <p>{l.komentar}</p>
                  </div>
                  <div className={styles.reportMeta}>
                    <span className={l.status === 'ditolak' ? styles.statusPillDanger : styles.statusPill}>
                      {l.status}
                    </span>
                    <p>{new Date(l.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  </div>
                </div>
                <button
                  onClick={() => { setSelectedLaporan(l); fetchKomentarPopup(l.id); }}
                  className={styles.ghostButton}
                >
                  Lihat balasan dari BK
                </button>
              </article>
            ))}
          </section>
        )}
      </div>

      <footer className={styles.footer}>
        2026 - NamaSekolah@gmail.com - Website Resmi Sekolah
      </footer>

      {selectedLaporan && (
        <div className={styles.modalBackdrop} onClick={() => setSelectedLaporan(null)}>
          <div className={styles.largeModal} onClick={e => e.stopPropagation()}>
            <div className={styles.reportTop}>
              <div className={styles.reportText}>
                <p className={styles.reportAuthor}>{userName}</p>
                <h3>{selectedLaporan.judul}</h3>
                <p>{selectedLaporan.komentar}</p>
              </div>
              <div className={styles.reportMeta}>
                <span className={styles.statusPill}>{selectedLaporan.status}</span>
                <p>{new Date(selectedLaporan.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              </div>
            </div>

            <div className={styles.commentList}>
              {komentarPopup.map(k => (
                <div key={k.id} className={styles.commentItem}>
                  <div className={styles.commentHeader}>
                    <p>{k.nama}</p>
                    <div className={styles.commentActions}>
                      {k.nama === userName && (
                        <>
                          <button onClick={() => { setEditKomentarId(k.id); setEditKomentarIsi(k.isi); }} className={styles.smallDangerButton}>Edit</button>
                          <button onClick={() => handleHapusKomentar(k.id)} className={styles.smallButton}>Hapus</button>
                        </>
                      )}
                      <span>{new Date(k.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                  {editKomentarId === k.id ? (
                    <div className={styles.inlineForm}>
                      <input
                        value={editKomentarIsi}
                        onChange={e => setEditKomentarIsi(e.target.value)}
                        className={styles.input}
                      />
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
              <button onClick={handleKirimBalasan} className={styles.primaryButton}>Kirim</button>
            </div>

            <button onClick={() => setSelectedLaporan(null)} className={styles.ghostButton}>Tutup</button>
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
          <p>Direktori Halaman Walas</p>
          <button aria-label="Tutup menu" onClick={() => setSidebarOpen(false)} className={styles.closeButton}>x</button>
        </div>
        <div className={styles.navList}>
          {[
            { key: 'absen', label: 'Ongoing Absen' },
            { key: 'laporan', label: 'Laporan Masalah' },
          ].map(t => (
            <button
              key={t.key}
              onClick={() => { setTab(t.key as TabKey); setSidebarOpen(false); }}
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
