'use client';
import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

function LoginForm() {
  const searchParams = useSearchParams();
  const role = searchParams.get('role') || 'siswa';
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const roleLabel: Record<string, string> = {
    siswa: 'Siswa',
    guru: 'Guru / Walas',
    bk: 'BK / Kesiswaan',
    admin: 'Admin',
  };

  async function handleLogin() {
  setLoading(true);
  setError('');
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, role }),
  });
  const data = await res.json();
  setLoading(false);
  if (!res.ok) return setError(data.message || 'Login gagal');
  localStorage.setItem('token', data.token);
  router.push(`/dashboard/${role}`);
}

  return (
    <main style={{ minHeight: '100vh', display: 'flex', fontFamily: 'sans-serif' }}>
      <div style={{
        flex: 1,
        backgroundImage: 'url("/uploads/cn1.jpg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}></div>

      <div style={{
        width: '420px', background: '#fff',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '48px 36px', borderLeft: '1px solid #e5e5e5'
      }}>
        <div style={{ width: '100%', maxWidth: '340px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

          <p style={{ fontSize: '13px', color: '#000000', fontWeight: '600' }}>
            Login sebagai {roleLabel[role]}
          </p>

          <div>
            <div style={{
              width: '44px', height: '44px', background: '#fd1d00',
              borderRadius: '12px', display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: '20px', marginBottom: '12px'
            }}>📋</div>
            <h2 style={{ fontSize: '22px', fontWeight: '600', color: '#ff0000' }}>
              Login {roleLabel[role]}
            </h2>
            <p style={{ fontSize: '13px', color: '#999', marginTop: '4px' }}>
              Masuk ke Sistem Absensi
            </p>
          </div>

          {error && (
            <div style={{
              background: '#fff0ef', border: '1px solid #fd1d00',
              borderRadius: '10px', padding: '10px 12px',
              fontSize: '13px', color: '#fd1d00'
            }}>{error}</div>
          )}

          <input
            type="email" placeholder="Email" value={email}
            onChange={e => setEmail(e.target.value)}
            style={{
              border: '1px solid #e5e5e5', borderRadius: '10px',
              padding: '10px 14px', fontSize: '14px', outline: 'none',
              width: '100%', boxSizing: 'border-box'
            }}
          />

          <input
            type="password" placeholder="Password" value={password}
            onChange={e => setPassword(e.target.value)}
            style={{
              border: '1px solid #e5e5e5', borderRadius: '10px',
              padding: '10px 14px', fontSize: '14px', outline: 'none',
              width: '100%', boxSizing: 'border-box'
            }}
          />

          <button onClick={handleLogin} disabled={loading} style={{
            background: '#fd1d00', color: '#fff', border: 'none',
            borderRadius: '10px', padding: '11px 0', fontSize: '14px',
            fontWeight: '600', cursor: 'pointer', width: '100%'
          }}>
            {loading ? 'Loading...' : 'Masuk'}
          </button>

          <Link href="/" style={{
            textAlign: 'center', fontSize: '13px', color: '#999',
            textDecoration: 'none', display: 'block'
          }}>← Kembali</Link>
        </div>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}