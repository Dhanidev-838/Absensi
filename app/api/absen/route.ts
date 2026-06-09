import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import jwt from 'jsonwebtoken';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

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
  const tipe = req.nextUrl.searchParams.get('tipe');

  // BK: rekap semua siswa
  if (tipe === 'bk') {
    if (user.role !== 'bk') return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const [rekap]: any = await db.execute(`
      SELECT 
        u.id as user_id, u.nama, u.kelas,
        SUM(a.status = 'hadir')  as hadir,
        SUM(a.status = 'izin')   as izin,
        SUM(a.status = 'sakit')  as sakit,
        SUM(a.status = 'dispen') as dispen,
        SUM(a.status = 'alpha')  as alpha,
        MIN(a.tanggal) as mulai_dari,
        MAX(a.tanggal) as terakhir
      FROM users u
      LEFT JOIN absen a ON a.user_id = u.id
      WHERE u.role = 'siswa'
      GROUP BY u.id, u.nama, u.kelas
      ORDER BY u.kelas, u.nama
    `);

    return NextResponse.json({ rekap });
  }

  // Walas: rekap siswa sekelas + foto hari ini
  if (tipe === 'walas') {
    if (user.role !== 'guru') return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const [siswa]: any = await db.execute(`
      SELECT 
        u.id as user_id, u.nama, u.kelas,
        a_today.foto,
        a_today.status as status_hari_ini,
        a_today.created_at as waktu_absen_hari_ini,
        SUM(a.status = 'hadir')  as hadir,
        SUM(a.status = 'izin')   as izin,
        SUM(a.status = 'sakit')  as sakit,
        SUM(a.status = 'dispen') as dispen,
        SUM(a.status = 'alpha')  as alpha
      FROM users u
      LEFT JOIN absen a ON a.user_id = u.id
      LEFT JOIN absen a_today ON a_today.user_id = u.id AND a_today.tanggal = ?
      WHERE u.role = 'siswa' AND u.kelas = ?
      GROUP BY u.id, u.nama, u.kelas, a_today.foto, a_today.status, a_today.created_at
      ORDER BY u.nama
    `, [today, user.kelas]);

    return NextResponse.json(
      { siswa, nama: user.nama, kelas: user.kelas }, 
      { 
        status: 200,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        }
      }
    );
  }

  // Siswa: semua teman sekelas + rekap diri sendiri
  const [siswa]: any = await db.execute(`
    SELECT 
      u.id as user_id, u.nama, u.kelas,
      a_today.foto,
      a_today.status as status_hari_ini,
      a_today.created_at as waktu_absen_hari_ini,
      SUM(a.status = 'hadir')  as hadir,
      SUM(a.status = 'izin')   as izin,
      SUM(a.status = 'sakit')  as sakit,
      SUM(a.status = 'dispen') as dispen,
      SUM(a.status = 'alpha')  as alpha
    FROM users u
    LEFT JOIN absen a ON a.user_id = u.id
    LEFT JOIN absen a_today ON a_today.user_id = u.id AND a_today.tanggal = ?
    WHERE u.role = 'siswa' AND u.kelas = ?
    GROUP BY u.id, u.nama, u.kelas, a_today.foto, a_today.status, a_today.created_at
    ORDER BY u.nama
  `, [today, user.kelas]);

  const [hari_ini]: any = await db.execute(
    `SELECT * FROM absen WHERE user_id = ? AND tanggal = ?`,
    [user.id, today]
  );

  const [rekapArr]: any = await db.execute(`
    SELECT 
      SUM(status = 'hadir')  as hadir,
      SUM(status = 'izin')   as izin,
      SUM(status = 'sakit')  as sakit,
      SUM(status = 'dispen') as dispen,
      SUM(status = 'alpha')  as alpha,
      MIN(tanggal) as mulai_dari
    FROM absen WHERE user_id = ?
  `, [user.id]);

  // Auto alpha setelah jam 08:00
  // Auto alpha setelah jam 08:00 WIB
const nowLocalStr = new Date().toLocaleString("en-US", { timeZone: "Asia/Jakarta" });
const now = new Date(nowLocalStr);

const sudahLewatJam8 = now.getHours() > 8 || (now.getHours() === 8 && now.getMinutes() >= 0);
  if (sudahLewatJam8 && hari_ini.length === 0) {
    const jam8 = new Date();
    jam8.setHours(8, 0, 0, 0);
    const jam8Str = jam8.toISOString().slice(0, 19).replace('T', ' ');
    await db.execute(
      `INSERT INTO absen (user_id, tanggal, status, foto, created_at) VALUES (?, ?, 'alpha', NULL, ?)`,
      [user.id, today, jam8Str]
    );
    const [updated]: any = await db.execute(
      `SELECT * FROM absen WHERE user_id = ? AND tanggal = ?`,
      [user.id, today]
    );
    // refresh siswa list juga
    const [siswaUpdated]: any = await db.execute(`
      SELECT 
        u.id as user_id, u.nama, u.kelas,
        a_today.foto,
        a_today.status as status_hari_ini,
        a_today.created_at as waktu_absen_hari_ini,
        SUM(a.status = 'hadir')  as hadir,
        SUM(a.status = 'izin')   as izin,
        SUM(a.status = 'sakit')  as sakit,
        SUM(a.status = 'dispen') as dispen,
        SUM(a.status = 'alpha')  as alpha
      FROM users u
      LEFT JOIN absen a ON a.user_id = u.id
      LEFT JOIN absen a_today ON a_today.user_id = u.id AND a_today.tanggal = ?
      WHERE u.role = 'siswa' AND u.kelas = ?
      GROUP BY u.id, u.nama, u.kelas, a_today.foto, a_today.status, a_today.created_at
      ORDER BY u.nama
    `, [today, user.kelas]);

    const [rekapUpdated]: any = await db.execute(`
      SELECT 
        SUM(status = 'hadir')  as hadir,
        SUM(status = 'izin')   as izin,
        SUM(status = 'sakit')  as sakit,
        SUM(status = 'dispen') as dispen,
        SUM(status = 'alpha')  as alpha,
        MIN(tanggal) as mulai_dari
      FROM absen WHERE user_id = ?
    `, [user.id]);

    return NextResponse.json(
      {
        siswa: siswaUpdated, hari_ini: updated,
        rekap: rekapUpdated[0], nama: user.nama, kelas: user.kelas
      },
      { 
        status: 200,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        }
      }
    );
  }

  return NextResponse.json(
    { siswa, hari_ini, rekap: rekapArr[0], nama: user.nama, kelas: user.kelas },
    { 
      status: 200,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    }
  );
}

export async function POST(req: NextRequest) {
  const user = getUser(req);
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' });

  const [cek]: any = await db.execute(
    'SELECT id FROM absen WHERE user_id = ? AND tanggal = ?',
    [user.id, today]
  );
  if (cek.length > 0) return NextResponse.json({ message: 'Sudah absen hari ini' }, { status: 400 });

  const formData = await req.formData();
  const foto = formData.get('foto') as File;
  const status = formData.get('status') as string || 'hadir';

  let namaFoto = null;
  if (foto) {
    const bytes = await foto.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString('base64');
const dataUri = `data:image/jpeg;base64,${base64}`;
const uploaded = await cloudinary.uploader.upload(dataUri, {
  folder: 'absensi',
  public_id: `${user.id}_${Date.now()}`,
});
namaFoto = uploaded.secure_url;
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

  const today = new Date().toISOString().split('T')[0];
  const formData = await req.formData();
  const foto = formData.get('foto') as File;
  const status = formData.get('status') as string;
  const id = formData.get('id');

  const [cek]: any = await db.execute(
    'SELECT id FROM absen WHERE id = ? AND user_id = ? AND tanggal = ?',
    [id, user.id, today]
  );
  if (cek.length === 0) return NextResponse.json({ message: 'Tidak bisa edit absen kemarin' }, { status: 403 });

  if (foto) {
    const bytes = await foto.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString('base64');
const dataUri = `data:image/jpeg;base64,${base64}`;
const uploaded = await cloudinary.uploader.upload(dataUri, {
  folder: 'absensi',
  public_id: `${user.id}_${Date.now()}`,
});
await db.execute(
  'UPDATE absen SET foto = ?, status = ? WHERE id = ? AND user_id = ?',
  [uploaded.secure_url, status, id, user.id]
);
  } else {
    await db.execute(
      'UPDATE absen SET status = ? WHERE id = ? AND user_id = ?',
      [status, id, user.id]
    );
  }

  return NextResponse.json({ message: 'Absen berhasil diupdate' });
}

export async function DELETE(req: NextRequest) {
  const user = getUser(req);
  if (!user || user.role !== 'bk') return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const jurusan = req.nextUrl.searchParams.get('jurusan');
  const kelas = req.nextUrl.searchParams.get('kelas');

  try {
    if (kelas) {
      await db.execute(`
        DELETE a FROM absen a
        JOIN users u ON a.user_id = u.id
        WHERE u.role = 'siswa' AND u.kelas = ?
      `, [kelas]);
    } else if (jurusan) {
      await db.execute(`
        DELETE a FROM absen a
        JOIN users u ON a.user_id = u.id
        WHERE u.role = 'siswa' AND u.kelas LIKE ?
      `, [`%${jurusan}%`]);
    } else {
      await db.execute(`
        DELETE a FROM absen a
        JOIN users u ON a.user_id = u.id
        WHERE u.role = 'siswa'
      `, []);
    }
    return NextResponse.json({ message: 'Berhasil direset' });
  } catch (e: any) {
    return NextResponse.json({ message: e.message }, { status: 500 });
  }
}