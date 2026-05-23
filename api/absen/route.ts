import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import jwt from 'jsonwebtoken';
import { writeFile } from 'fs/promises';
import path from 'path';

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

  const today = new Date().toISOString().split('T')[0];

  // Auto-delete absen yang sudah lewat 24 jam
  await db.execute(`DELETE FROM absen WHERE tanggal < ?`, [today]);

  // ✅ AUTO-ALPHA: Setelah jam 08:00, siswa yang belum absen → otomatis alpha
  const now = new Date();
  const jam = now.getHours();
  const menit = now.getMinutes();
  const sudahLewatJam8 = jam > 8 || (jam === 8 && menit >= 0);

  if (sudahLewatJam8) {
    // Cek apakah user ini sudah punya absen hari ini
    const [cekAbsen]: any = await db.execute(
      `SELECT id FROM absen WHERE user_id = ? AND tanggal = ?`,
      [user.id, today]
    );

    if (cekAbsen.length === 0) {
      // Belum absen → insert alpha otomatis
      const jam8 = new Date();
jam8.setHours(8, 0, 0, 0);
const jam8Str = jam8.toISOString().slice(0, 19).replace('T', ' ');

await db.execute(
  `INSERT INTO absen (user_id, tanggal, status, foto, created_at) VALUES (?, ?, 'alpha', NULL, ?)`,
  [user.id, today, jam8Str]
);
    }
  }

  const [sekarang]: any = await db.execute(
    `SELECT a.*, u.nama FROM absen a 
     JOIN users u ON a.user_id = u.id 
     WHERE a.user_id = ? AND a.tanggal = ? 
     ORDER BY a.created_at DESC`,
    [user.id, today]
  );

  const [jejak]: any = await db.execute(
    `SELECT a.*, u.nama FROM absen a 
     JOIN users u ON a.user_id = u.id 
     WHERE a.user_id = ? AND a.tanggal < ? 
     ORDER BY a.tanggal DESC`,
    [user.id, today]
  );

  return NextResponse.json({ sekarang, jejak, nama: user.nama, kelas: user.kelas });
}



export async function POST(req: NextRequest) {
  const user = getUser(req);
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const today = new Date().toISOString().split('T')[0];

  const [cek]: any = await db.execute(
    'SELECT id FROM absen WHERE user_id = ? AND tanggal = ?',
    [user.id, today]
  );
  if (cek.length > 0) {
    return NextResponse.json({ message: 'Sudah absen hari ini' }, { status: 400 });
  }

  const formData = await req.formData();
  const foto = formData.get('foto') as File;
  const status = formData.get('status') as string || 'hadir';

  let namaFoto = null;
  if (foto) {
    const bytes = await foto.arrayBuffer();
    const buffer = Buffer.from(bytes);
    namaFoto = `${user.id}_${Date.now()}.jpg`;
    const filePath = path.join(process.cwd(), 'public', 'uploads', namaFoto);
    await writeFile(filePath, buffer);
  }

  await db.execute(
    'INSERT INTO absen (user_id, tanggal, status, foto) VALUES (?, ?, ?, ?)',
    [user.id, today, status, namaFoto]
  );

  return NextResponse.json({ message: 'Absen berhasil' });
}

export async function PUT(req: NextRequest) {
  const user = getUser(req);
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const formData = await req.formData();
  const foto = formData.get('foto') as File;
  const status = formData.get('status') as string || 'hadir';
  const id = formData.get('id');

  if (!foto) return NextResponse.json({ message: 'Foto kosong' }, { status: 400 });

  const bytes = await foto.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const namaFoto = `${user.id}_${Date.now()}.jpg`;
  const filePath = path.join(process.cwd(), 'public', 'uploads', namaFoto);
  await writeFile(filePath, buffer);

  await db.execute(
    'UPDATE absen SET foto = ?, status = ? WHERE id = ? AND user_id = ?',
    [namaFoto, status, id, user.id]
  );

  return NextResponse.json({ message: 'Foto berhasil diupdate' });
}