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
    const [laporan]: any = await db.execute(`
      SELECT
        lb.id, lb.created_at, lb.ref_id,
        u.nama as nama_walas,
        u.kelas as kelas_walas
      FROM laporan_bk lb
      JOIN users u ON lb.diterima_oleh = u.id
      WHERE lb.tipe = 'absen' AND lb.status = 'diterima'
      ORDER BY lb.created_at DESC
    `);

    return NextResponse.json({ laporan });
  } catch (err: any) {
    console.error('History GET error:', err.message);
    return NextResponse.json({ message: err.message, laporan: [] }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = getUser(req);
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const { tanggal } = await req.json();

  try {
    const [absen]: any = await db.execute(`
      SELECT a.*, u.nama, u.kelas FROM absen a
      JOIN users u ON a.user_id = u.id
      WHERE a.tanggal = ?
      ORDER BY u.nama ASC
    `, [tanggal]);

    return NextResponse.json({ absen });
  } catch (err: any) {
    return NextResponse.json({ message: err.message, absen: [] }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const user = getUser(req);
  if (!user || user.role !== 'bk')
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ message: 'ID tidak ada' }, { status: 400 });

  try {
    await db.execute('DELETE FROM laporan_bk WHERE id = ? AND tipe = ?', [id, 'absen']);
    return NextResponse.json({ message: 'Dihapus' });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}