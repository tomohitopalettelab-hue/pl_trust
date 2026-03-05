import { NextResponse } from 'next/server';
import { palDbPost } from '@/app/api/_lib/pal-db-client';
import { findTrustAccountByPaletteId } from '@/app/api/_lib/pal-trust-accounts';

export async function POST(request: Request) {
  try {
    const { customerId, password } = await request.json();
    const loginId = String(customerId || '').trim().toUpperCase();
    const loginPassword = String(password || '');

    if (!loginId || !loginPassword) {
      return NextResponse.json({ error: '顧客IDとパスワードは必須です' }, { status: 400 });
    }

    const verifyResponse = await palDbPost('/api/chat-auth/verify', {
      loginId,
      password: loginPassword,
    });
    const verifyData = await verifyResponse.json().catch(() => ({}));

    if (!verifyResponse.ok || verifyData?.success === false) {
      return NextResponse.json({ error: 'IDまたはパスワードが正しくありません' }, { status: 401 });
    }

    const paletteId = String(verifyData?.paletteId || loginId).trim().toUpperCase();
    const trustAccount = await findTrustAccountByPaletteId(paletteId);
    if (!trustAccount) {
      return NextResponse.json({ error: 'Pal Trust契約が有効な顧客のみログインできます' }, { status: 403 });
    }

    if (String(trustAccount.status || '').toLowerCase() !== 'active') {
      return NextResponse.json({ error: 'このアカウントは停止中です' }, { status: 403 });
    }

    return NextResponse.json({ ok: true, customerId: paletteId });
  } catch (error) {
    console.error('customer login error:', error);
    return NextResponse.json({ error: 'ログインに失敗しました' }, { status: 500 });
  }
}
