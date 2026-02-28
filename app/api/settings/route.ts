import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { rows } = await sql`SELECT data FROM app_settings WHERE id = 1;`;
    return NextResponse.json(rows[0]?.data || null);
  } catch (error) {
    return NextResponse.json({ error: '取得失敗' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    await sql`
      INSERT INTO app_settings (id, data, updated_at)
      VALUES (1, ${JSON.stringify(body)}, CURRENT_TIMESTAMP)
      ON CONFLICT (id) DO UPDATE SET data = ${JSON.stringify(body)}, updated_at = CURRENT_TIMESTAMP;
    `;
    return NextResponse.json({ message: '保存成功' });
  } catch (error) {
    return NextResponse.json({ error: '保存失敗' }, { status: 500 });
  }
}