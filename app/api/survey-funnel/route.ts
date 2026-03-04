import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

type FunnelAction = 'start' | 'review_click';

async function ensureTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS survey_funnel_events (
      session_id TEXT PRIMARY KEY,
      customer_id TEXT NOT NULL,
      started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      review_clicked_at TIMESTAMPTZ
    );
  `;
}

export async function POST(request: Request) {
  try {
    await ensureTable();

    const body = await request.json();
    const customerId = String(body?.customerId || '').trim();
    const sessionId = String(body?.sessionId || '').trim();
    const action = body?.action as FunnelAction;

    if (!customerId || !sessionId || (action !== 'start' && action !== 'review_click')) {
      return NextResponse.json({ error: 'invalid payload' }, { status: 400 });
    }

    if (action === 'start') {
      await sql`
        INSERT INTO survey_funnel_events (session_id, customer_id, started_at)
        VALUES (${sessionId}, ${customerId}, NOW())
        ON CONFLICT (session_id)
        DO NOTHING;
      `;
      return NextResponse.json({ ok: true });
    }

    await sql`
      UPDATE survey_funnel_events
      SET review_clicked_at = COALESCE(review_clicked_at, NOW())
      WHERE session_id = ${sessionId} AND customer_id = ${customerId};
    `;

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('survey funnel post error:', error);
    return NextResponse.json({ error: 'failed' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    await ensureTable();

    const { searchParams } = new URL(request.url);
    const customerId = String(searchParams.get('customerId') || '').trim();
    const month = String(searchParams.get('month') || '').trim();

    if (!customerId) {
      return NextResponse.json({ error: 'customerId is required' }, { status: 400 });
    }

    if (month && !/^\d{4}-\d{2}$/.test(month)) {
      return NextResponse.json({ error: 'invalid month' }, { status: 400 });
    }

    const monthRowsResult = await sql<{ month_key: string }>`
      SELECT to_char(date_trunc('month', started_at), 'YYYY-MM') AS month_key
      FROM survey_funnel_events
      WHERE customer_id = ${customerId}
      GROUP BY 1
      ORDER BY 1 DESC;
    `;

    const availableMonths = monthRowsResult.rows
      .map((row) => row.month_key)
      .filter((value) => typeof value === 'string' && value.length === 7);

    const [startedRowsResult, clickedRowsResult] = await (async () => {
      if (!month) {
        return Promise.all([
          sql<{ count: string }>`
            SELECT COUNT(*)::text AS count
            FROM survey_funnel_events
            WHERE customer_id = ${customerId};
          `,
          sql<{ count: string }>`
            SELECT COUNT(*)::text AS count
            FROM survey_funnel_events
            WHERE customer_id = ${customerId} AND review_clicked_at IS NOT NULL;
          `,
        ]);
      }

      const [year, monthNumber] = month.split('-').map(Number);
      const fromDate = new Date(Date.UTC(year, monthNumber - 1, 1, 0, 0, 0));
      const toDate = new Date(Date.UTC(year, monthNumber, 1, 0, 0, 0));

      return Promise.all([
        sql<{ count: string }>`
          SELECT COUNT(*)::text AS count
          FROM survey_funnel_events
          WHERE customer_id = ${customerId}
            AND started_at >= ${fromDate.toISOString()}::timestamptz
            AND started_at < ${toDate.toISOString()}::timestamptz;
        `,
        sql<{ count: string }>`
          SELECT COUNT(*)::text AS count
          FROM survey_funnel_events
          WHERE customer_id = ${customerId}
            AND started_at >= ${fromDate.toISOString()}::timestamptz
            AND started_at < ${toDate.toISOString()}::timestamptz
            AND review_clicked_at IS NOT NULL;
        `,
      ]);
    })();

    const startedRows = startedRowsResult.rows;
    const clickedRows = clickedRowsResult.rows;

    const startedCount = Number(startedRows[0]?.count || '0');
    const reviewClickCount = Number(clickedRows[0]?.count || '0');
    const reviewPostRate = startedCount > 0 ? Math.round((reviewClickCount / startedCount) * 100) : 0;

    return NextResponse.json({
      customerId,
      month: month || 'all',
      availableMonths,
      startedCount,
      reviewClickCount,
      reviewPostRate,
    });
  } catch (error) {
    console.error('survey funnel get error:', error);
    return NextResponse.json({ error: 'failed' }, { status: 500 });
  }
}
