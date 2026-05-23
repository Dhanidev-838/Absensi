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

  if (role === 'grafik') {
    const [rows]: any = await db.execute(`
      SELECT 
        tanggal,
        SUM(status = 'hadir') as hadir,
        SUM(status = 'izin') as izin,
        SUM(status = 'sakit') as sakit,
        SUM(status = 'alpha') as alpha
      FROM absen
      GROUP BY tanggal
      ORDER BY tanggal DESC
      LIMIT 14
    `);
    return NextResponse.json({ grafik: rows.reverse() });
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

  const { id, password } = await req.json();
  const hashed = await bcrypt.hash(password, 10);

  await db.execute('UPDATE users SET password = ? WHERE id = ?', [hashed, id]);
  return NextResponse.json({ message: 'Password berhasil direset' });
}