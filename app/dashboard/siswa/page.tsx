'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

type TabKey = 'absen' | 'sekarang';
type AttendanceCategory = 'hadir' | 'izin' | 'sakit';

type Recap = {
  mulai_dari?: string;
  hadir?: number;
  izin?: number;
  sakit?: number;
  alpha?: number;
};

type SiswaItem = {
  user_id: string | number;
  nama: string;
  foto?: string;
  status_hari_ini?: string;
  alasan_hari_ini?: string;
  hadir?: number;
  izin?: number;
  sakit?: number;
  alpha?: number;
};

export default function DashboardSiswa() {
  const router = useRouter();
  const [tab, setTab] = useState<TabKey>('absen');
  const [kategori, setKategori] = useState<AttendanceCategory>('hadir');
  const [showKategori, setShowKategori] = useState(false);
  const [foto, setFoto] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [bisaAbsen, setBisaAbsen] = useState(false);
  const [userName, setUserName] = useState('');
  const [userKelas, setUserKelas] = useState('');
  const [kameraAktif, setKameraAktif] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const tokenRef = useRef('');
  const [rekap, setRekap] = useState<Recap | null>(null);
  const [siswaList, setSiswaList] = useState<SiswaItem[]>([]);
  const [alasan, setAlasan] = useState('');
  const [showAlasanPopup, setShowAlasanPopup] = useState(false);
  const [alasanPopupItem, setAlasanPopupItem] = useState<SiswaItem | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const touchStartX = useRef(0);

  useEffect(() => {
    const t = localStorage.getItem('token') || '';
    tokenRef.current = t;
    cekWaktu();
    fetchHistory(t);
  }, []);

  function cekWaktu() {
    const now = new Date();
    const totalMenit = now.getHours() * 60 + now.getMinutes();
    const bisaAbsen = totalMenit >= 6 * 60 && totalMenit <= 8 * 60;
    setBisaAbsen(bisaAbsen);
    // setBisaAbsen(true); // sementara testing
  }

  async function fetchHistory(t: string) {
    const res = await fetch('/api/absen', {
      headers: { Authorization: `Bearer ${t}` },
    });
    const data = await res.json();
    if (res.ok) {
      setSiswaList(data.siswa || []);
      setRekap(data.rekap || null);
      setUserName(data.nama);
      setUserKelas(data.kelas);
    }
  }

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }

  function handleTouchEnd(e: React.TouchEvent) {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (diff > 50) setSidebarOpen(false);
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
    formData.append('alasan', alasan);
    const res = await fetch('/api/absen', {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenRef.current}` },
      body: formData,
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) return setMsg(data.message || 'Gagal absen');
    setMsg('Absen berhasil!');
    setFoto(null);
    fetchHistory(tokenRef.current);
    setTab('sekarang');
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
            <p className={styles.pageTitle}>Dashboard Siswa {userKelas && `- ${userKelas}`}</p>
            <p className={styles.pageSubtitle}>{userName || 'Siswa'}</p>
          </div>
        </div>
        <button onClick={handleLogout} className={styles.secondaryButton}>Logout</button>
      </header>

      <div className={styles.content}>
        {tab === 'absen' && (
          <section className={styles.card}>
            <div className={styles.sectionHeader}>
              <h2>Isi Absen Hari Ini</h2>
              <p>Batas absen dari jam 06:00 sampai 08:00</p>
            </div>

            {!bisaAbsen ? (
              <div className={styles.alert}>Anda telah dinyatakan ALPHA karena Waktu absen sudah habis (06:00 - 08:00)</div>
            ) : (
              <div className={styles.formStack}>
                <div className={styles.previewFrame}>
                  {kameraAktif ? (
                    <video ref={videoRef} autoPlay playsInline className={styles.previewMedia} />
                  ) : foto ? (
                    <img src={foto} alt="Selfie absen" className={styles.previewMedia} />
                  ) : (
                    <p className={styles.previewEmpty}>Preview kamera</p>
                  )}
                </div>

                <div className={styles.buttonRow}>
                  {!foto && !kameraAktif && (
                    <button onClick={bukakamera} className={styles.primaryButton}>Buka Kamera</button>
                  )}

                  {kameraAktif && (
                    <>
                      <button onClick={ambilFoto} className={styles.primaryButton}>Ambil Foto</button>
                      <button onClick={tutupKamera} className={styles.ghostButton}>Tutup</button>
                    </>
                  )}

                  {foto && !kameraAktif && (
                    <button onClick={() => { setFoto(null); bukakamera(); }} className={styles.ghostButton}>
                      Ambil Ulang
                    </button>
                  )}
                </div>

                {foto && !kameraAktif && (
                  <>
                    <div className={styles.dropdownWrap}>
                      <button onClick={() => setShowKategori(!showKategori)} className={styles.primaryButton}>
                        Kategori: {kategori.charAt(0).toUpperCase() + kategori.slice(1)}
                      </button>
                      {showKategori && (
                        <div className={styles.dropdownMenu}>
                          {['izin', 'sakit'].map(k => (
                            <button
                              key={k}
                              onClick={() => { setKategori(k as AttendanceCategory); setShowKategori(false); }}
                              className={kategori === k ? styles.dropdownItemActive : styles.dropdownItem}
                            >
                              {k.charAt(0).toUpperCase() + k.slice(1)}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {(kategori === 'izin' || kategori === 'sakit') && (
                      <textarea
                        placeholder={`Tulis alasan ${kategori}...`}
                        value={alasan}
                        onChange={e => setAlasan(e.target.value)}
                        rows={3}
                        className={styles.textarea}
                      />
                    )}

                    <button onClick={handleAbsen} disabled={loading} className={styles.primaryButton}>
                      {loading ? 'Mengirim...' : 'Kirim Absen'}
                    </button>
                  </>
                )}

                {msg && (
                  <p className={msg.includes('berhasil') ? styles.successText : styles.errorText}>{msg}</p>
                )}
              </div>
            )}
          </section>
        )}

        {tab === 'sekarang' && (
          <section className={styles.historyLayout}>
            {rekap && (
              <div className={styles.card}>
                <p className={styles.cardTitle}>
                  Rekap Kehadiran Kamu {rekap.mulai_dari && `(sejak ${new Date(rekap.mulai_dari).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })})`}
                </p>
                <div className={styles.recapGrid}>
                  {[
                    { label: 'Hadir', val: rekap.hadir, danger: false },
                    { label: 'Izin', val: rekap.izin, danger: false },
                    { label: 'Sakit', val: rekap.sakit, danger: false },
                    { label: 'Alpha', val: rekap.alpha, danger: true },
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
                    {['Nama', 'Foto Hari Ini', 'Status Hari Ini', 'Alasan', 'Hadir', 'Izin', 'Sakit', 'Alpha'].map(h => (
                      <th key={h}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {siswaList.length === 0 ? (
                    <tr>
                      <td colSpan={8} className={styles.emptyCell}>Belum ada data</td>
                    </tr>
                  ) : siswaList.map((item, i) => (
                    <tr key={item.user_id} className={i % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
                      <td className={styles.nameCell}>{item.nama}</td>
                      <td>
                        {item.foto ? (
                          <img src={item.foto} alt={`Foto ${item.nama}`} className={styles.avatar} />
                        ) : (
                          <span className={styles.mutedText}>-</span>
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
      </div>

      <footer className={styles.footer}>
        2026 - NamaSekolah@gmail.com - Website Resmi Sekolah
      </footer>

      {sidebarOpen && (
        <div className={styles.backdrop} onClick={() => setSidebarOpen(false)} />
      )}

      <div
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ''}`}
      >
        <div className={styles.sidebarHeader}>
          <p>Direktori Halaman Siswa</p>
          <button aria-label="Tutup menu" onClick={() => setSidebarOpen(false)} className={styles.closeButton}>x</button>
        </div>
        <div className={styles.navList}>
          {[
            { key: 'absen', label: 'Isi Absen' },
            { key: 'sekarang', label: 'Ongoing Absen' },
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
    </main>
  );
}
