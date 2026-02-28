import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { rows } = await sql`SELECT * FROM surveys ORDER BY created_at DESC;`;
    return NextResponse.json(rows);
  } catch (error) {
    console.error('DB取得エラー:', error);
    return NextResponse.json({ error: '取得に失敗しました' }, { status: 500 });
  }
}