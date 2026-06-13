'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const roles = [
  { role: 'siswa', label: 'Siswa', desc: 'Absen harian, riwayat kehadiran, dan laporan masalah.' },
  { role: 'guru', label: 'Guru / Walas', desc: 'Pantau kelas, cek rekap, dan tindak lanjuti siswa.' },
  { role: 'bk', label: 'BK / Kesiswaan', desc: 'Kelola laporan, reset data, dan ekspor rekap.' },
  { role: 'admin', label: 'Admin', desc: 'Atur akun siswa, guru, BK, dan data sistem.' },
];

const schoolFacts = [
  { label: 'Nama Sekolah', value: 'SMK Citra Negara' },
  { label: 'Naungan', value: 'Yayasan AT-TAQWA Kemiri Jaya' },
  { label: 'Lokasi', value: 'Kemiri Jaya, Beji, Depok' },
];

const features = [
  { title: 'Foto Selfie', desc: 'Siswa melakukan absensi dengan bukti foto langsung dari perangkat.' },
  { title: 'Rekap Real-time', desc: 'Guru dan BK dapat memantau data kehadiran tanpa menunggu laporan manual.' },
  { title: 'Auto Alpha', desc: 'Sistem membantu menandai siswa yang belum hadir pada batas waktu absen.' },
  { title: 'Ekspor Data', desc: 'Data absensi dapat dicetak untuk arsip dan kebutuhan tindak lanjut.' },
];

const majors = ['TJKT', 'PPLG', 'PEMASARAN', 'DKV', 'MPLB'];

const flow = [
  { step: '01', label: 'Login', desc: 'Masuk sesuai peran sebagai Siswa, Guru, BK, atau Admin.' },
  { step: '02', label: 'Isi Status', desc: 'Siswa mengisi absen harian pada waktu yang sudah ditentukan.' },
  { step: '03', label: 'Pantau Rekap', desc: 'Guru dan BK melihat kehadiran siswa secara cepat dan rapi.' },
  { step: '04', label: 'Tindak Lanjut', desc: 'BK memproses laporan dan mengekspor data ketika dibutuhkan.' },
];

const contact = [
  {
    label: 'Alamat Sekolah',
    value: 'Jl. Raya Tanah Baru No.99, Kemiri Jaya, Beji, Depok 16421',
  },
  { label: 'No Telpon', value: '+62-838-7740-9984' },
  { label: 'Gmail', value: 'dhanitriadisaputra@second.com' },
];

const mapsUrl =
  'https://www.google.com/maps/search/?api=1&query=SMK%20Citra%20Negara%20Jl.%20Raya%20Tanah%20Baru%20No.99%20Kemiri%20Jaya%20Beji%20Depok';

const aboutUsContent = [
  'Kami adalah platform absensi digital yang membantu sekolah mengelola kehadiran dengan lebih mudah, cepat, dan efisien. Sistem kami dirancang minimalis, praktis, dan dapat diakses kapan saja.',
  'Visi kami adalah menjadi solusi absensi digital terpercaya yang memudahkan manajemen kehadiran secara modern dan efisien. Misi kami adalah menghadirkan sistem absensi yang mudah digunakan, membantu pengelolaan data kehadiran lebih cepat dan akurat, serta mendukung transformasi digital untuk perusahaan dan institusi.',
  'Brand ini hadir dari kebutuhan akan sistem absensi yang lebih praktis dibanding metode manual, karena kami percaya teknologi dapat meningkatkan efisiensi, kedisiplinan, dan produktivitas.',
  'Brand ini hadir dari kebutuhan akan sistem absensi yang lebih praktis, cepat, dan efisien dibanding metode manual. Banyak perusahaan dan institusi masih menggunakan pencatatan kehadiran secara konvensional yang memakan waktu dan rentan kesalahan. Karena itu, kami menghadirkan solusi absensi digital yang modern, mudah digunakan, dan membantu meningkatkan efisiensi serta produktivitas.',
];

export default function Home() {
  const [navHidden, setNavHidden] = useState(false);
  const [navScrolled, setNavScrolled] = useState(false);
  const [showAbout, setShowAbout] = useState(false);

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScroll = window.scrollY;
      setNavScrolled(currentScroll > 12);
      setNavHidden(currentScroll > lastScrollY && currentScroll > 140);
      lastScrollY = currentScroll;
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const cards = Array.from(document.querySelectorAll<HTMLElement>('.box'));

    const cleanups = cards.map(card => {
      const handleMove = (e: MouseEvent) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = (y - centerY) / 17;
        const rotateY = (x - centerX) / 17;

        card.style.transform = `rotateX(${-rotateX}deg) rotateY(${rotateY}deg) scale(1.03)`;
      };

      const handleLeave = () => {
        card.style.transform = 'rotateX(0) rotateY(0) scale(1)';
      };

      card.addEventListener('mousemove', handleMove);
      card.addEventListener('mouseleave', handleLeave);

      return () => {
        card.removeEventListener('mousemove', handleMove);
        card.removeEventListener('mouseleave', handleLeave);
      };
    });

    return () => cleanups.forEach(cleanup => cleanup());
  }, []);

  useEffect(() => {
    if (!showAbout) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowAbout(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showAbout]);

  return (
    <main className="siteShell">
      <style jsx global>{`
        html {
          scroll-behavior: smooth;
        }

        .siteShell {
          --gray-50: #f7f7f8;
          --gray-100: #eeeeef;
          --gray-200: #dedee2;
          --gray-500: #71717a;
          --black: #111113;
          --white: #ffffff;
          --red: #d91f16;
          --red-soft: #fff1f0;
          min-height: 100vh;
          background: var(--white);
          color: var(--black);
          font-family: sans-serif;
          overflow-x: hidden;
        }

        .nav {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 18px;
          padding: 14px 32px;
          background: rgba(255, 255, 255, 0.94);
          border-bottom: 1px solid var(--gray-200);
          backdrop-filter: blur(14px);
          transition: transform 0.28s ease, box-shadow 0.28s ease;
        }

        .nav.scrolled {
          box-shadow: 0 12px 32px rgba(17, 17, 19, 0.08);
          border-bottom-color: transparent;
        }

        .nav.hidden {
          transform: translateY(-100%);
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 10px;
          color: var(--black);
          text-decoration: none;
          min-width: 0;
        }

        .brandMark {
          width: 38px;
          height: 38px;
          border-radius: 8px;
          background: var(--red);
          color: var(--white);
          display: grid;
          place-items: center;
          font-weight: 900;
          flex: 0 0 auto;
        }

        .brandText {
          font-size: 15px;
          font-weight: 800;
          white-space: nowrap;
        }

        .navLinks {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 8px;
          flex-wrap: wrap;
        }

        .navLinks a,
        .navLinks button {
          color: var(--black);
          text-decoration: none;
          font-size: 13px;
          font-weight: 800;
          padding: 9px 12px;
          border-radius: 8px;
        }

        .navLinks a:hover,
        .navLinks button:hover,
        .navLinks .loginLink {
          background: var(--black);
          color: var(--white);
        }

        .navLinks .aboutButton {
          background: var(--red);
          color: var(--white);
          border: 0;
          cursor: pointer;
          font-family: inherit;
        }

        .navLinks .aboutButton:hover {
          background: var(--black);
          color: var(--white);
        }

        .hero {
          min-height: 100vh;
          position: relative;
          display: flex;
          align-items: center;
          padding: 98px 24px 42px;
          isolation: isolate;
        }

        .hero video,
        .heroOverlay {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
        }

        .hero video {
          object-fit: cover;
          z-index: -3;
        }

        .heroOverlay {
          z-index: -2;
          background: linear-gradient(90deg, rgba(0, 0, 0, 0.78), rgba(0, 0, 0, 0.54), rgba(0, 0, 0, 0.22));
        }

        .heroInner,
        .sectionInner {
          width: min(1080px, 100%);
          margin: 0 auto;
        }

        .heroGrid {
          display: grid;
          grid-template-columns: minmax(0, 1.02fr) minmax(320px, 0.78fr);
          gap: 34px;
          align-items: center;
        }

        .eyebrow {
          font-size: 12px;
          font-weight: 900;
          color: var(--red);
          letter-spacing: 0.14em;
          text-transform: uppercase;
          margin-bottom: 10px;
        }

        .heroTitle {
          color: var(--white);
          font-size: clamp(36px, 6vw, 68px);
          line-height: 0.98;
          font-weight: 900;
          max-width: 760px;
        }

        .heroCopy {
          color: rgba(255, 255, 255, 0.82);
          font-size: 15px;
          line-height: 1.8;
          max-width: 610px;
          margin-top: 18px;
        }

        .heroActions {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          margin-top: 28px;
        }

        .primaryCta,
        .secondaryCta {
          border-radius: 8px;
          padding: 12px 18px;
          font-size: 14px;
          font-weight: 900;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .primaryCta {
          background: var(--red);
          color: var(--white);
        }

        .secondaryCta {
          background: rgba(255, 255, 255, 0.12);
          color: var(--white);
          border: 1px solid rgba(255, 255, 255, 0.28);
        }

        .rolePanel {
          background: rgba(255, 255, 255, 0.96);
          border: 1px solid rgba(255, 255, 255, 0.48);
          border-radius: 8px;
          padding: 18px;
          box-shadow: 0 24px 64px rgba(0, 0, 0, 0.2);
        }

        .panelHeader {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          align-items: flex-start;
          margin-bottom: 14px;
        }

        .panelHeader h2 {
          font-size: 17px;
          line-height: 1.3;
        }

        .panelHeader p {
          color: var(--gray-500);
          font-size: 12px;
          margin-top: 4px;
        }

        .roleGrid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 10px;
        }

        .roleCard,
        .infoCard,
        .majorCard,
        .flowCard,
        .contactCard,
        .mapCard {
          transform-style: preserve-3d;
          transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
          will-change: transform;
        }

        .roleCard {
          background: var(--white);
          border: 1px solid var(--gray-200);
          border-radius: 8px;
          padding: 15px;
          display: flex;
          flex-direction: column;
          min-height: 170px;
        }

        .roleCard:hover,
        .infoCard:hover,
        .majorCard:hover,
        .flowCard:hover,
        .contactCard:hover,
        .mapCard:hover {
          box-shadow: 0 20px 45px rgba(17, 17, 19, 0.12);
          border-color: rgba(217, 31, 22, 0.38);
        }

        .roleInitial {
          width: 42px;
          height: 42px;
          border-radius: 8px;
          background: var(--red-soft);
          color: var(--red);
          display: grid;
          place-items: center;
          font-size: 18px;
          font-weight: 900;
          margin-bottom: 14px;
        }

        .roleCard h3 {
          font-size: 15px;
          margin-bottom: 6px;
        }

        .roleCard p {
          color: var(--gray-500);
          font-size: 12px;
          line-height: 1.55;
          flex: 1;
        }

        .roleCard a {
          margin-top: 14px;
          display: block;
          text-align: center;
          border-radius: 8px;
          background: var(--black);
          color: var(--white);
          padding: 9px 10px;
          font-size: 13px;
          font-weight: 900;
          text-decoration: none;
        }

        .section {
          padding: 82px 24px;
          scroll-margin-top: 86px;
        }

        .sectionAlt {
          background: var(--gray-50);
        }

        .sectionHead {
          margin-bottom: 28px;
        }

        .sectionHead h2 {
          font-size: clamp(28px, 4vw, 44px);
          line-height: 1.08;
          font-weight: 900;
          max-width: 760px;
        }

        .sectionHead p {
          color: var(--gray-500);
          font-size: 14px;
          line-height: 1.8;
          max-width: 780px;
          margin-top: 12px;
        }

        .aboutGrid {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 260px;
          gap: 28px;
          align-items: start;
        }

        .aboutText {
          color: var(--gray-500);
          font-size: 14px;
          line-height: 1.9;
        }

        .factGrid,
        .featureGrid,
        .flowGrid,
        .contactGrid {
          display: grid;
          gap: 14px;
        }

        .factGrid {
          grid-template-columns: repeat(3, minmax(0, 1fr));
          margin-top: 24px;
        }

        .featureGrid,
        .flowGrid {
          grid-template-columns: repeat(4, minmax(0, 1fr));
        }

        .contactGrid {
          grid-template-columns: repeat(3, minmax(0, 1fr));
        }

        .infoCard,
        .flowCard,
        .contactCard,
        .mapCard {
          background: var(--white);
          border: 1px solid var(--gray-200);
          border-radius: 8px;
          padding: 18px;
        }

        .infoCard strong,
        .flowCard strong,
        .contactCard strong {
          display: block;
          font-size: 13px;
          margin-bottom: 8px;
        }

        .infoCard p,
        .flowCard p,
        .contactCard p,
        .mapCard p {
          color: var(--gray-500);
          font-size: 13px;
          line-height: 1.65;
        }

        .logoCard {
          background: var(--white);
          border: 1px solid var(--gray-200);
          border-radius: 8px;
          padding: 28px;
          display: grid;
          place-items: center;
        }

        .logoCard img {
          width: 180px;
          height: 180px;
          object-fit: contain;
        }

        .majorGrid {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .majorCard {
          min-width: 132px;
          text-align: center;
          background: var(--white);
          border: 1px solid var(--gray-200);
          border-radius: 8px;
          padding: 18px 26px;
          font-size: 14px;
          font-weight: 900;
        }

        .comingCard {
          border-style: dashed;
          color: var(--gray-500);
        }

        .flowCard {
          min-height: 178px;
        }

        .flowStep {
          color: var(--red);
          font-size: 12px;
          font-weight: 900;
          margin-bottom: 22px;
        }

        .contactCard a,
        .mapCard a {
          color: var(--black);
          font-weight: 900;
          text-decoration: none;
          overflow-wrap: anywhere;
        }

        .contactExtra {
          display: grid;
          grid-template-columns: 0.7fr 1.3fr;
          gap: 14px;
          margin-top: 14px;
        }

        .mapCard {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .footer {
          border-top: 1px solid var(--gray-200);
          padding: 22px 24px;
          background: var(--white);
          color: var(--gray-500);
          text-align: center;
          font-size: 13px;
        }

        .aboutOverlay {
          position: fixed;
          inset: 0;
          z-index: 200;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          background: rgba(0, 0, 0, 0.62);
        }

        .aboutModal {
          position: relative;
          width: min(680px, 100%);
          max-height: 86vh;
          overflow-y: auto;
          border-radius: 8px;
          background: var(--white);
          padding: 34px;
          box-shadow: 0 28px 80px rgba(0, 0, 0, 0.28);
        }

        .aboutClose {
          position: absolute;
          top: 16px;
          right: 16px;
          border: 0;
          background: transparent;
          color: var(--gray-500);
          cursor: pointer;
          font-size: 24px;
          font-weight: 900;
          line-height: 1;
        }

        .aboutModal h2 {
          margin-bottom: 18px;
          color: var(--black);
          font-size: 24px;
          line-height: 1.2;
          font-weight: 900;
        }

        .aboutModal p {
          color: var(--gray-500);
          font-size: 14px;
          line-height: 1.85;
          margin-top: 12px;
        }

        @media (max-width: 920px) {
          .nav {
            align-items: flex-start;
            flex-direction: column;
            padding: 12px 16px;
            gap: 10px;
          }

          .navLinks {
            width: 100%;
            justify-content: flex-start;
            overflow-x: auto;
            flex-wrap: nowrap;
            padding-bottom: 2px;
          }

          .navLinks a,
          .navLinks button {
            white-space: nowrap;
            padding: 8px 10px;
          }

          .hero {
            min-height: auto;
            padding-top: 138px;
          }

          .heroGrid,
          .aboutGrid {
            grid-template-columns: 1fr;
          }

          .featureGrid,
          .flowGrid,
          .contactGrid,
          .factGrid,
          .contactExtra {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .logoCard {
            justify-items: start;
          }
        }

        @media (max-width: 640px) {
          .brandText {
            font-size: 14px;
          }

          .hero {
            padding: 136px 14px 30px;
          }

          .heroGrid,
          .roleGrid,
          .featureGrid,
          .flowGrid,
          .contactGrid,
          .factGrid,
          .contactExtra {
            grid-template-columns: 1fr;
          }

          .heroActions a,
          .roleCard a {
            width: 100%;
          }

          .rolePanel {
            padding: 14px;
          }

          .section {
            padding: 58px 14px;
            scroll-margin-top: 126px;
          }

          .aboutText,
          .sectionHead p {
            font-size: 13px;
          }

          .majorCard {
            width: 100%;
          }

          .logoCard img {
            width: 140px;
            height: 140px;
          }

          .aboutOverlay {
            padding: 14px;
          }

          .aboutModal {
            padding: 28px 20px 22px;
          }
        }
      `}</style>

      <nav className={`nav ${navScrolled ? 'scrolled' : ''} ${navHidden ? 'hidden' : ''}`}>
        <a className="brand" href="#login" aria-label="Website Absensi">
          <span className="brandMark">A</span>
          <span className="brandText">Website Absensi</span>
        </a>
        <div className="navLinks">
          <a className="loginLink" href="#login">Login</a>
          <button className="aboutButton" type="button" onClick={() => setShowAbout(true)}>About Us</button>
          <a href="#tentang">Tentang Sekolah</a>
          <a href="#absensi">Absensi Digital</a>
          <a href="#jurusan">Jurusan</a>
          <a href="#contact">Contact Us</a>
        </div>
      </nav>

      <section id="login" className="hero">
        <video autoPlay loop muted playsInline>
          <source src="/uploads/backtoschool.mp4" type="video/mp4" />
        </video>
        <div className="heroOverlay" />

        <div className="heroInner heroGrid">
          <div>
            <p className="eyebrow">Absensi Digital Sekolah</p>
            <h1 className="heroTitle">Sistem Absensi Digital</h1>
            <p className="heroCopy">
              Pilih peran untuk masuk ke sistem. Semua alur kehadiran, laporan, rekap kelas,
              dan tindak lanjut dibuat lebih cepat tanpa mengubah kebiasaan utama sekolah.
            </p>
            <div className="heroActions">
              <a href="#absensi" className="primaryCta">Lihat Sistem</a>
              <a href="#contact" className="secondaryCta">Hubungi Sekolah</a>
            </div>
          </div>

          <div className="rolePanel">
            <div className="panelHeader">
              <div>
                <h2>Pilih Role Login</h2>
                <p>Masuk sesuai akses pengguna</p>
              </div>
            </div>
            <div className="roleGrid">
              {roles.map(({ role, label, desc }) => (
                <div className="roleCard box" key={role}>
                  <div className="roleInitial">{label.charAt(0)}</div>
                  <h3>{label}</h3>
                  <p>{desc}</p>
                  <Link href={`/login?role=${role}`}>Masuk</Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="tentang" className="section">
        <div className="sectionInner aboutGrid">
          <div>
            <div className="sectionHead">
              <p className="eyebrow">Tentang Sekolah</p>
              <h2>SMK Citra Negara</h2>
            </div>
            <p className="aboutText">
              Yayasan AT-TAQWA Kemiri Jaya dibangun pada tahun 2004 di Jl. Raya Tanah Baru
              No.99 Kemiri Jaya, Beji, Depok 16421. Sekolah SMK Citra Negara berdiri pada
              tahun 2004 dan berkembang dari satu program keahlian menjadi lima jurusan yang
              mendukung kebutuhan dunia kerja dan pendidikan vokasi.
            </p>
            <div className="factGrid">
              {schoolFacts.map(item => (
                <div className="infoCard box" key={item.label}>
                  <strong>{item.label}</strong>
                  <p>{item.value}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="logoCard box">
            <Image src="/uploads/Citra-Negara.png" alt="Logo SMK Citra Negara" width={180} height={180} />
          </div>
        </div>
      </section>

      <section id="absensi" className="section sectionAlt">
        <div className="sectionInner">
          <div className="sectionHead">
            <p className="eyebrow">Absensi Digital</p>
            <h2>Absensi lebih rapi, cepat, dan mudah dipantau</h2>
            <p>
              Sistem ini membantu siswa melakukan absen harian, guru memantau kehadiran kelas,
              BK memproses laporan, dan admin menjaga data akun tetap tertata.
            </p>
          </div>
          <div className="featureGrid">
            {features.map(item => (
              <div className="infoCard box" key={item.title}>
                <strong>{item.title}</strong>
                <p>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="jurusan" className="section">
        <div className="sectionInner">
          <div className="sectionHead">
            <p className="eyebrow">Cakupan</p>
            <h2>Berbagai Jurusan yang kami pantau</h2>
          </div>
          <div className="majorGrid">
            {majors.map(major => (
              <div className="majorCard box" key={major}>{major}</div>
            ))}
          </div>

          <div style={{ marginTop: 54 }}>
            <p className="eyebrow">Segera Hadir</p>
            <h2 style={{ fontSize: 28, lineHeight: 1.15, marginBottom: 22 }}>Jurusan yang akan datang</h2>
            <div className="majorGrid">
              <div className="majorCard comingCard box">PERHOTELAN</div>
            </div>
          </div>
        </div>
      </section>

      <section id="alur" className="section sectionAlt">
        <div className="sectionInner">
          <div className="sectionHead">
            <p className="eyebrow">Cara Kerja</p>
            <h2>Alur Penggunaan</h2>
          </div>
          <div className="flowGrid">
            {flow.map(item => (
              <div className="flowCard box" key={item.step}>
                <p className="flowStep">{item.step}</p>
                <strong>{item.label}</strong>
                <p>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="section">
        <div className="sectionInner">
          <div className="sectionHead">
            <p className="eyebrow">Contact Us</p>
            <h2>Informasi sekolah dan waktu absen</h2>
          </div>
          <div className="contactGrid">
            {contact.map(item => (
              <div className="contactCard box" key={item.label}>
                <strong>{item.label}</strong>
                {item.label === 'No Telpon' ? (
                  <p><a href="tel:+6283877409984">{item.value}</a></p>
                ) : item.label === 'Gmail' ? (
                  <p><a href="mailto:dhanitriadisaputra@second.com">{item.value}</a></p>
                ) : (
                  <p>{item.value}</p>
                )}
              </div>
            ))}
          </div>

          <div className="contactExtra">
            <div className="contactCard box">
              <strong>Waktu Absen</strong>
              <p>06:00 - 08:00</p>
            </div>
            <div className="mapCard box">
              <strong>Alamat Sekolah</strong>
              <p>
                <a href={mapsUrl} target="_blank" rel="noreferrer">
                  Buka lokasi SMK Citra Negara di Google Maps
                </a>
              </p>
            </div>
          </div>
        </div>
      </section>

      <footer className="footer">
        2026 - dhanitriadisaputra@second.com - Website Resmi Sekolah
      </footer>

      {showAbout && (
        <div className="aboutOverlay" onClick={() => setShowAbout(false)} role="presentation">
          <section className="aboutModal" role="dialog" aria-modal="true" aria-labelledby="about-title" onClick={event => event.stopPropagation()}>
            <button className="aboutClose" type="button" aria-label="Tutup About Us" onClick={() => setShowAbout(false)}>X</button>
            <h2 id="about-title">About Us</h2>
            {aboutUsContent.map(paragraph => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </section>
        </div>
      )}
    </main>
  );
}
