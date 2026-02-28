import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  const { ratings } = await req.json();

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini", // コスパの良いモデル
    messages: [
      { role: "system", content: "あなたは親切なお客さまです。渡されたアンケート結果に基づき、Googleマップに投稿するような前向きで自然な口コミを40文字以内で作成してください。" },
      { role: "user", content: `アンケート評価: ${JSON.stringify(ratings)}` }
    ],
  });

  return NextResponse.json({ text: completion.choices[0].message.content });
}