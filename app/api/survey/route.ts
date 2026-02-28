import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { rating, category, comment } = await request.json();

    // データベースに挿入
    await sql`
      INSERT INTO surveys (rating, category, comment)
      VALUES (${rating}, ${category}, ${comment});
    `;

    return NextResponse.json({ message: '保存完了！' }, { status: 200 });
  } catch (error) {
    console.error('DB保存エラー:', error);
    return NextResponse.json({ error: '保存に失敗しました' }, { status: 500 });
  }
}