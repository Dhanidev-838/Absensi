import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(req: NextRequest) {
  const { email, password, role } = await req.json();

  const [rows]: any = await db.execute(
    'SELECT * FROM users WHERE email = ? AND role = ?',
    [email, role]
  );

  if (!rows.length) return NextResponse.json(
    { message: 'Akun tidak ditemukan' }, { status: 401 }
  );

  const user = rows[0];
  const match = await bcrypt.compare(password, user.password);
  if (!match) return NextResponse.json(
    { message: 'Password salah' }, { status: 401 }
  );

  const token = jwt.sign(
    { id: user.id, role: user.role, nama: user.nama, kelas: user.kelas },
    process.env.JWT_SECRET!,
    { expiresIn: '1d' }
  );

  return NextResponse.json({ message: 'Login berhasil', token, role: user.role });
}