import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' });

  // Ambil semua siswa yang belum absen hari ini
  const [siswa]: any = await db.execute(`
    SELECT u.id FROM users u
    LEFT JOIN absen a ON a.user_id = u.id AND a.tanggal = ?
    WHERE u.role = 'siswa' AND a.id IS NULL
  `, [today]);

  if (siswa.length === 0) return NextResponse.json({ message: 'Semua sudah absen' });

  const jam8 = `${today} 08:00:00`;
  
  for (const s of siswa) {
    await db.execute(
      `INSERT INTO absen (user_id, tanggal, status, foto, created_at) VALUES (?, ?, 'alpha', NULL, ?)`,
      [s.id, today, jam8]
    );
  }

  return NextResponse.json({ message: `${siswa.length} siswa di-alpha` });
}