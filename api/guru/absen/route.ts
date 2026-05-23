import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import jwt from 'jsonwebtoken';

function getUser(req: NextRequest) {
  const auth = req.headers.get('authorization');
  const token = auth?.replace('Bearer ', '');
  if (!token) return null;
  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as any;
  } catch { return null; }
}

// GET - ambil absen siswa hari ini + jejak + status laporan ke BK
export async function GET(req: NextRequest) {
  const user = getUser(req);
  if (!user || user.role !== 'guru') return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const today = new Date().toISOString().split('T')[0];

  // Auto-delete absen yang sudah lewat 24 jam
  await db.execute(
    `DELETE FROM absen WHERE tanggal < ?`,
    [today]
  );

  // Auto-delete laporan_bk (diterima/ditolak) yang sudah lewat 24 jam
  await db.execute(
    `DELETE FROM laporan_bk WHERE created_at < ? AND status IN ('diterima', 'ditolak')`,
    [today + ' 00:00:00']
  );

  // Langsung gunakan kelas dari JWT token
  const kelasGuru = user.kelas;

  const [sekarang]: any = await db.execute(
    `SELECT a.*, u.nama, u.kelas FROM absen a
     JOIN users u ON a.user_id = u.id
     WHERE a.tanggal = ? AND u.kelas = ? AND u.role = 'siswa'
     ORDER BY a.created_at DESC`,
    [today, kelasGuru]
  );

  const [jejak]: any = await db.execute(
    `SELECT a.*, u.nama, u.kelas FROM absen a
     JOIN users u ON a.user_id = u.id
     WHERE a.tanggal < ? AND u.kelas = ? AND u.role = 'siswa'
     ORDER BY a.tanggal DESC, u.nama ASC
     LIMIT 100`,
    [today, kelasGuru]
  );

  // Get status laporan absen dari BK (utk guru ini, hari ini)
  const [laporanStatus]: any = await db.execute(
    `SELECT lb.*, a.tanggal FROM laporan_bk lb
     JOIN absen a ON lb.ref_id = a.id
     WHERE lb.tipe = 'absen' AND lb.diterima_oleh = ? AND a.tanggal = ?
     ORDER BY lb.created_at DESC LIMIT 1`,
    [user.id, today]
  );

  return NextResponse.json({ 
    sekarang, 
    jejak, 
    nama: user.nama, 
    kelas: user.kelas,
    laporanStatus: laporanStatus[0] || null
  });
}

// POST - kirim absen hari ini ke BK
export async function POST(req: NextRequest) {
  const user = getUser(req);
  if (!user || user.role !== 'guru') return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const today = new Date().toISOString().split('T')[0];

  const [absen]: any = await db.execute(
    'SELECT id FROM absen WHERE tanggal = ?',
    [today]
  );

  if (absen.length === 0) return NextResponse.json({ message: 'Belum ada absen hari ini' }, { status: 400 });

  await db.execute(
    'INSERT INTO laporan_bk (tipe, ref_id, diterima_oleh) VALUES (?, ?, ?)',
    ['absen', absen[0].id, user.id]
  );

  return NextResponse.json({ message: 'Laporan absen berhasil dikirim ke BK' });
}