import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';
import { listTrustAccountsFromPalDb } from '@/app/api/_lib/pal-trust-accounts';

type ListRow = {
  customer_id: string;
  main_page_path: string | null;
};

type SettingsRow = {
  customer_id: string;
  settings_data: {
    settings?: Record<string, unknown>;
    surveyItems?: unknown[];
  } | null;
};

type SurveyAggRow = {
  customer_id: string;
  survey_count: number;
  avg_rating: string | number | null;
  last_response_at: string | null;
};

async function ensureTables() {
  await sql`
    CREATE TABLE IF NOT EXISTS customer_accounts (
      customer_id TEXT PRIMARY KEY,
      customer_name TEXT,
      main_page_path TEXT,
      password_hash TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;

  await sql`
    ALTER TABLE customer_accounts
    ADD COLUMN IF NOT EXISTS main_page_path TEXT;
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS customer_app_settings (
      customer_id TEXT PRIMARY KEY,
      data JSONB NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;
}

export async function GET() {
  try {
    await ensureTables();
    const trustAccounts = await listTrustAccountsFromPalDb();

    if (!trustAccounts.length) {
      return NextResponse.json([]);
    }

    const [{ rows: profileRows }, { rows: settingsRows }, { rows: surveyAggRows }] = await Promise.all([
      sql<ListRow>`
        SELECT customer_id, main_page_path
        FROM customer_accounts
      `,
      sql<SettingsRow>`
        SELECT customer_id, data AS settings_data
        FROM customer_app_settings
      `,
      sql<SurveyAggRow>`
        SELECT
          COALESCE(NULLIF(category, ''), 'default') AS customer_id,
          COUNT(*)::int AS survey_count,
          ROUND(AVG(rating)::numeric, 2) AS avg_rating,
          MAX(created_at)::text AS last_response_at
        FROM surveys
        GROUP BY 1
      `,
    ]);

    const accountMap = new Map(
      trustAccounts.map((account) => [String(account.paletteId), account]),
    );

    const profileMap = new Map(profileRows.map((row) => [String(row.customer_id), row]));
    const settingsMap = new Map(settingsRows.map((row) => [String(row.customer_id), row.settings_data || null]));
    const surveyMap = new Map(surveyAggRows.map((row) => [String(row.customer_id), row]));

    const normalized = trustAccounts.map((account) => {
      const customerId = String(account.paletteId);
      const profile = profileMap.get(customerId);
      const settingsData = settingsMap.get(customerId);
      const surveyAgg = surveyMap.get(customerId);

      const settings = settingsData?.settings || null;
      const surveyItems = Array.isArray(settingsData?.surveyItems)
        ? settingsData.surveyItems
        : [];

      return {
        customerId,
        customerName: account.name || '',
        mainPagePath: profile?.main_page_path || `/main?customerId=${encodeURIComponent(customerId)}`,
        isActive: String(account.status || '').toLowerCase() === 'active',
        hasPassword: Boolean(account.chatPasswordSet),
        createdAt: account.createdAt || null,
        updatedAt: account.updatedAt || null,
        surveyCount: Number(surveyAgg?.survey_count || 0),
        averageRating: surveyAgg?.avg_rating === null || surveyAgg?.avg_rating === undefined ? 0 : Number(surveyAgg.avg_rating),
        lastResponseAt: surveyAgg?.last_response_at || null,
        currentSettings: settings,
        surveyItems,
      };
    });

    return NextResponse.json(normalized);
  } catch (error) {
    console.error('customers list error:', error);
    return NextResponse.json({ error: '取得に失敗しました' }, { status: 500 });
  }
}
