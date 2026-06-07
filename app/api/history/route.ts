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
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  try {
    // BARU - ganti dengan ini
const [laporan]: any = await db.execute(`
  SELECT
    lb.id, lb.created_at, lb.jurusan, lb.kelas,
    lb.kelas as kelas_walas,
    penerima.nama AS nama_walas
  FROM laporan_bk lb
  JOIN users penerima ON lb.diterima_oleh = penerima.id
  WHERE lb.tipe = 'absen' AND lb.status = 'diterima'
  ORDER BY lb.created_at DESC
`);
    return NextResponse.json({ laporan });
  } catch (err: any) {
    return NextResponse.json({ message: err.message, laporan: [] }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = getUser(req);
  if (!user || user.role !== 'bk') return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const body = await req.json();

  // Simpan history cetak
  if (body.simpan) {
  try {
    await db.execute(
  `INSERT INTO laporan_bk (tipe, ref_id, diterima_oleh, status, jurusan, kelas) VALUES ('absen', NULL, ?, 'diterima', ?, ?)`,
  [user.id, body.jurusan || null, body.kelas || null]
);
    return NextResponse.json({ message: 'History tersimpan' });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}

  // Ambil data excel
  const { dari, sampai, kelas, jurusan } = body;
  try {
    let query = `
      SELECT a.tanggal, a.status, u.nama, u.kelas
      FROM absen a
      JOIN users u ON a.user_id = u.id
      WHERE u.role = 'siswa'
    `;
    const params: any[] = [];
    if (dari) { query += ` AND a.tanggal >= ?`; params.push(dari); }
    if (sampai) { query += ` AND a.tanggal <= ?`; params.push(sampai); }
    if (kelas) { query += ` AND u.kelas = ?`; params.push(kelas); }
    if (jurusan) { query += ` AND u.kelas LIKE ?`; params.push(`%${jurusan}%`); }
    query += ` ORDER BY u.nama, a.tanggal`;

    const [rows]: any = await db.execute(query, params);
    return NextResponse.json({ absen: rows });
  } catch (err: any) {
    return NextResponse.json({ message: err.message, absen: [] }, { status: 500 });
  }
}



export async function DELETE(req: NextRequest) {
  const user = getUser(req);
  if (!user || user.role !== 'bk') return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const id = req.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ message: 'ID tidak ada' }, { status: 400 });

  try {
    await db.execute('DELETE FROM laporan_bk WHERE id = ? AND tipe = ?', [id, 'absen']);
    return NextResponse.json({ message: 'Dihapus' });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}