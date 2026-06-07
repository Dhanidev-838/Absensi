import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

function getUser(req: NextRequest) {
  const auth = req.headers.get('authorization');
  const token = auth?.replace('Bearer ', '');
  if (!token) return null;
  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as any;
  } catch { return null; }
}



export async function GET(req: NextRequest) {
  const user = getUser(req);
  if (!user || user.role !== 'admin') return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const role = req.nextUrl.searchParams.get('role') || 'siswa';

  if (role === 'grafik-masalah') {
  const now = new Date();
  const bulan = now.getMonth() + 1;
  const tahun = now.getFullYear();

  const [rows]: any = await db.execute(`
    SELECT COUNT(*) as total
    FROM laporan_masalah
    WHERE MONTH(created_at) = ? AND YEAR(created_at) = ?
  `, [bulan, tahun]);

  const [perBulan]: any = await db.execute(`
    SELECT 
      MONTH(created_at) as bulan,
      YEAR(created_at) as tahun,
      COUNT(*) as total
    FROM laporan_masalah
    GROUP BY YEAR(created_at), MONTH(created_at)
    ORDER BY tahun DESC, bulan DESC
    LIMIT 6
  `);

  return NextResponse.json({ total: rows[0].total, perBulan });
}

if (role === 'grafik') {
  const today = new Date().toISOString().split('T')[0];
  const [rows]: any = await db.execute(`
    SELECT 
      SUM(status = 'hadir')  as hadir,
      SUM(status = 'izin')   as izin,
      SUM(status = 'sakit')  as sakit,
      SUM(status = 'dispen') as dispen,
      SUM(status = 'alpha')  as alpha
    FROM absen
    WHERE tanggal = ?
  `, [today]);
  return NextResponse.json({ grafik: rows[0] });
}

  const [users]: any = await db.execute(
    'SELECT id, nama, email, password, role, kelas, created_at FROM users WHERE role = ? ORDER BY created_at DESC',
    [role]
  );
  return NextResponse.json({ users });
}



export async function POST(req: NextRequest) {
  const user = getUser(req);
  if (!user || user.role !== 'admin') return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const { nama, email, password, role, kelas } = await req.json();
  const hashed = await bcrypt.hash(password, 10);

  try {
    await db.execute(
      'INSERT INTO users (nama, email, password, role, kelas) VALUES (?, ?, ?, ?, ?)',
      [nama, email, hashed, role, kelas || null]
    );
    return NextResponse.json({ message: 'Akun berhasil dibuat' });
  } catch {
    return NextResponse.json({ message: 'Email sudah dipakai' }, { status: 400 });
  }
}

export async function PUT(req: NextRequest) {
  const user = getUser(req);
  if (!user || user.role !== 'admin') return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const { id, password, nama } = await req.json();

  // Update username
  if (nama) {
    await db.execute('UPDATE users SET nama = ? WHERE id = ?', [nama, id]);
    return NextResponse.json({ message: 'Username berhasil diubah' });
  }

  // Reset password
  if (password) {
    const hashed = await bcrypt.hash(password, 10);
    await db.execute('UPDATE users SET password = ? WHERE id = ?', [hashed, id]);
    return NextResponse.json({ message: 'Password berhasil direset' });
  }

  return NextResponse.json({ message: 'Tidak ada yang diubah' }, { status: 400 });
}



export async function DELETE(req: NextRequest) {
  const user = getUser(req);
  if (!user || user.role !== 'admin') return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const id = req.nextUrl.searchParams.get('id');

  try {
    await db.execute('DELETE FROM absen WHERE user_id = ?', [id]);  // ← tambah ini
    await db.execute('DELETE FROM users WHERE id = ?', [id]);
    return NextResponse.json({ message: 'Akun berhasil dihapus' });
  } catch (e: any) {
    console.error('DELETE user error:', e.sqlMessage || e.message);
    return NextResponse.json({ message: e.sqlMessage || 'Gagal hapus akun' }, { status: 500 });
  }
}

