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

  const [laporan]: any = await db.execute(
    'SELECT * FROM laporan_masalah WHERE user_id = ? ORDER BY created_at DESC',
    [user.id]
  );

  return NextResponse.json({ laporan });
}

export async function POST(req: NextRequest) {
  const user = getUser(req);
  if (!user || user.role !== 'guru') return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const { judul, komentar } = await req.json();

  await db.execute(
    'INSERT INTO laporan_masalah (user_id, judul, komentar) VALUES (?, ?, ?)',
    [user.id, judul, komentar]
  );

  return NextResponse.json({ message: 'Laporan berhasil dikirim' });
}

export async function DELETE(req: NextRequest) {
  const user = getUser(req);
  if (!user || user.role !== 'bk') return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const id = req.nextUrl.searchParams.get('id');
  await db.execute('DELETE FROM komentar_laporan WHERE laporan_id = ?', [id]);
  await db.execute('DELETE FROM laporan_masalah WHERE id = ?', [id]);
  return NextResponse.json({ message: 'Laporan dihapus' });
}