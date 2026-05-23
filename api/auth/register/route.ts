import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  const { nama, email, password, kelas, role } = await req.json();
  const hashed = await bcrypt.hash(password, 10);

  try {
    await db.execute(
      'INSERT INTO users (nama, email, password, role, kelas) VALUES (?, ?, ?, ?, ?)',
      [nama, email, hashed, role, kelas]
    );
    return NextResponse.json({ message: 'Registrasi berhasil' });
  } catch (e: any) {
    return NextResponse.json({ message: 'Email sudah dipakai' }, { status: 400 });
  }
}