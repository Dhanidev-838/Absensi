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

export async function GET(req: NextRequest) {
  const user = getUser(req);
  if (!user || user.role !== 'guru') return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  // Memaksa format YYYY-MM-DD menggunakan zona waktu Jakarta (WIB)
const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' });

  const [siswa]: any = await db.execute(`
    SELECT 
      u.id as user_id,
      u.nama,
      u.kelas,
      a_today.foto,
      a_today.status   as status_hari_ini,
      a_today.created_at as waktu_absen_hari_ini,
      SUM(a.status = 'hadir')  as hadir,
      SUM(a.status = 'izin')   as izin,
      SUM(a.status = 'sakit')  as sakit,
      SUM(a.status = 'alpha')  as alpha
    FROM users u
    LEFT JOIN absen a       ON a.user_id = u.id
    LEFT JOIN absen a_today ON a_today.user_id = u.id AND a_today.tanggal = ?
    WHERE u.role = 'siswa' AND u.kelas = ?
    GROUP BY u.id, u.nama, u.kelas, a_today.foto, a_today.status, a_today.created_at
    ORDER BY u.nama
  `, [today, user.kelas]);

  const [rekapTotal]: any = await db.execute(`
    SELECT 
      SUM(a.status = 'hadir')  as hadir,
      SUM(a.status = 'izin')   as izin,
      SUM(a.status = 'sakit')  as sakit,
      SUM(a.status = 'alpha')  as alpha,
      MIN(a.tanggal) as mulai_dari
    FROM absen a
    JOIN users u ON a.user_id = u.id
    WHERE u.role = 'siswa' AND u.kelas = ?
  `, [user.kelas]);

  return NextResponse.json({ siswa, nama: user.nama, kelas: user.kelas, rekap_total: rekapTotal[0] });
}