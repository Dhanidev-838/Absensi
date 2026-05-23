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

  const laporanId = req.nextUrl.searchParams.get('laporan_id');
  const [komentar]: any = await db.execute(`
    SELECT k.*, u.nama FROM komentar_laporan k
    JOIN users u ON k.user_id = u.id
    WHERE k.laporan_id = ?
    ORDER BY k.created_at ASC
  `, [laporanId]);

  return NextResponse.json({ komentar });
}

export async function POST(req: NextRequest) {
  const user = getUser(req);
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const { laporan_id, isi } = await req.json();
  await db.execute(
    'INSERT INTO komentar_laporan (laporan_id, user_id, isi) VALUES (?, ?, ?)',
    [laporan_id, user.id, isi]
  );

  return NextResponse.json({ message: 'Komentar terkirim' });
}

export async function PUT(req: NextRequest) {
  const user = getUser(req);
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const { id, isi } = await req.json();
  await db.execute('UPDATE komentar_laporan SET isi = ? WHERE id = ? AND user_id = ?', [isi, id, user.id]);
  return NextResponse.json({ message: 'Komentar diupdate' });
}

export async function DELETE(req: NextRequest) {
  const user = getUser(req);
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const id = req.nextUrl.searchParams.get('id');
  await db.execute('DELETE FROM komentar_laporan WHERE id = ? AND user_id = ?', [id, user.id]);
  return NextResponse.json({ message: 'Komentar dihapus' });
}