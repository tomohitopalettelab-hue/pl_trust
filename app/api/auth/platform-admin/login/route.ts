import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { password } = await request.json();
    const adminPassword = process.env.PLATFORM_ADMIN_PASSWORD || process.env.NEXT_PUBLIC_ADMIN_PASSWORD;

    if (!adminPassword) {
      return NextResponse.json({ error: '管理者パスワードが未設定です' }, { status: 500 });
    }

    if (password === adminPassword) {
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: 'IDまたはパスワードが正しくありません' }, { status: 401 });
  } catch (error) {
    console.error('platform-admin login error:', error);
    return NextResponse.json({ error: 'ログインに失敗しました' }, { status: 500 });
  }
}
