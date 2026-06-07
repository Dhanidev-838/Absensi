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
  if (!user || user.role !== 'bk') return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const tipe = req.nextUrl.searchParams.get('tipe');
  const refId = req.nextUrl.searchParams.get('ref_id');
  const today = new Date().toISOString().split('T')[0];

  // Auto-delete laporan_bk (diterima/ditolak) yang sudah lewat 24 jam
  await db.execute(
    `DELETE FROM laporan_bk WHERE created_at < ? AND status IN ('diterima', 'ditolak')`,
    [today + ' 00:00:00']
  );

  try {
    if (tipe === 'absen') {
      const [laporan]: any = await db.execute(`
  SELECT lb.*, u.nama as nama_walas, u.kelas as kelas_walas
  FROM laporan_bk lb
  JOIN users u ON lb.diterima_oleh = u.id
  WHERE lb.tipe = 'absen'
  ORDER BY lb.created_at DESC
`);
      return NextResponse.json({ laporan, nama: user.nama, kelas: user.kelas });
    }

    if (tipe === 'masalah') {
      const [laporan]: any = await db.execute(`
        SELECT lm.*, u.nama as nama_walas, u.kelas as kelas_walas
        FROM laporan_masalah lm
        JOIN users u ON lm.user_id = u.id
        ORDER BY lm.created_at DESC
      `);
      return NextResponse.json({ laporan });
    }

    if (tipe === 'history') {
      const [absen]: any = await db.execute(`
        SELECT lb.*, u.nama as nama_walas, u.kelas as kelas_walas, lb.status
        FROM laporan_bk lb
        JOIN users u ON lb.diterima_oleh = u.id
        ORDER BY lb.created_at DESC
      `);
      const [masalah]: any = await db.execute(`
        SELECT lm.*, u.nama as nama_walas, u.kelas as kelas_walas, lm.status, 'masalah' as tipe 
        FROM laporan_masalah lm
        JOIN users u ON lm.user_id = u.id
        WHERE lm.status != 'pending'
        ORDER BY lm.created_at DESC
      `);
      return NextResponse.json({ laporan: [...absen, ...masalah] });
    }

    if (tipe === 'cetak' && refId) {
      const today = new Date().toISOString().split('T')[0];
      const [absen]: any = await db.execute(`
        SELECT a.*, u.nama, u.kelas FROM absen a
        JOIN users u ON a.user_id = u.id
        WHERE a.tanggal = ?
        ORDER BY u.nama ASC
      `, [today]);
      return NextResponse.json({ absen });
    }

    return NextResponse.json({ message: 'Tipe tidak valid' }, { status: 400 });

  } catch (e: any) {
    return NextResponse.json({ message: e.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const user = getUser(req);
  if (!user || user.role !== 'bk') return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const { id, status, tipe } = await req.json();

  try {
    if (tipe === 'absen') {
      await db.execute('UPDATE laporan_bk SET status = ? WHERE id = ?', [status, id]);
    }
    if (tipe === 'masalah') {
      await db.execute('UPDATE laporan_masalah SET status = ? WHERE id = ?', [status, id]);
    }
    return NextResponse.json({ message: 'Berhasil diupdate' });
  } catch (e: any) {
    return NextResponse.json({ message: e.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const user = getUser(req);
  if (!user || user.role !== 'bk') return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const id = req.nextUrl.searchParams.get('id');
  await db.execute('DELETE FROM laporan_bk WHERE id = ?', [id]);
  return NextResponse.json({ message: 'Laporan dihapus' });
}