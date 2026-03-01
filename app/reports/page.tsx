"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function ReportsPage() {
  // --- 状態管理 ---
  const [allReviews, setAllReviews] = useState<any[]>([]);
  const [appSettings, setAppSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'date' | 'rating'>('date');
  const [filterCategory, setFilterCategory] = useState<string>('すべて');

  // --- DBからデータ取得 ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [surveysRes, settingsRes] = await Promise.all([
          fetch('/api/surveys-get'),
          fetch('/api/settings')
        ]);
        const surveysData = await surveysRes.json();
        const settingsData = await settingsRes.json();
        if (Array.isArray(surveysData)) setAllReviews(surveysData);
        if (settingsData) setAppSettings(settingsData);
      } catch (error) {
        console.error("データ取得失敗:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // --- 統計計算 ---
  const totalCount = allReviews.length;
  const avgRating = totalCount > 0 ? (allReviews.reduce((acc, curr) => acc + curr.rating, 0) / totalCount).toFixed(1) : "0.0";
  const recommendationRate = totalCount > 0 ? Math.round((allReviews.filter(r => r.rating >= 4).length / totalCount) * 100) : 0;
  const categories = ['すべて', '接客', 'スピード', '清潔感', 'コスパ'];

  const filteredReviews = allReviews
    .filter(r => filterCategory === 'すべて' || r.category === filterCategory)
    .sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  const monthlyData = [{ month: '12月', count: 45 }, { month: '1月', count: 52 }, { month: '2月', count: totalCount }];

  if (loading) return <div className="min-h-screen flex items-center justify-center font-black italic text-2xl">LOADING...</div>;

  return (
    <div className="min-h-screen font-sans selection:bg-[var(--theme-primary)] text-[var(--theme-text)] pb-20">
      <div className="max-w-7xl mx-auto p-6 md:p-12">
        
        {/* ヘッダー */}
        <header className="flex justify-between items-center mb-12">
          <div className="animate-in fade-in slide-in-from-left-4 duration-700">
            <Link href="/admin" className="flex items-center gap-2 group">
              <span className="text-2xl group-hover:-translate-x-1 transition-transform">←</span>
              <h1 className="text-2xl md:text-3xl font-black tracking-tighter italic leading-none uppercase">Analytics</h1>
            </Link>
            <p className="text-[10px] md:text-xs font-black uppercase tracking-widest mt-2 italic text-[var(--theme-primary)]">集計レポート</p>
          </div>
        </header>

        {/* 統計サマリー */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-[var(--theme-card-bg)] border-[3px] border-[var(--theme-border)] p-8 rounded-[3rem] shadow-[8px_8px_0px_var(--theme-border)]">
            <p className="text-[10px] font-black text-[var(--theme-text)] opacity-60 uppercase italic mb-2">総回答数</p>
            <div className="flex items-baseline gap-2 text-7xl font-black italic tracking-tighter">{totalCount}</div>
          </div>
          <div className="border-[3px] border-[var(--theme-border)] p-8 rounded-[3rem] shadow-[8px_8px_0px_var(--theme-border)] bg-[var(--theme-primary)] text-[var(--theme-on-primary)]">
            <p className="text-[10px] font-black opacity-60 uppercase italic mb-2">平均満足度</p>
            <div className="flex items-baseline gap-2 text-7xl font-black italic tracking-tighter">{avgRating}<span className="text-2xl">/5.0</span></div>
          </div>
          <div className="bg-[var(--theme-card-bg)] text-[var(--theme-text)] border-[3px] border-[var(--theme-border)] p-8 rounded-[3rem] shadow-[8px_8px_0px_var(--theme-primary)]">
            <p className="text-[10px] font-black text-[var(--theme-text)] opacity-60 uppercase italic mb-2">推奨度</p>
            <div className="flex items-baseline gap-2 text-7xl font-black italic tracking-tighter">{recommendationRate}<span className="text-2xl text-[var(--theme-primary)]">%</span></div>
          </div>
        </div>

        {/* グラフセクション */}
        <section className="mb-16 bg-[var(--theme-card-bg)] border-[3px] border-[var(--theme-border)] p-8 md:p-12 rounded-[4rem] shadow-[12px_12px_0px_var(--theme-border)]">
          <h3 className="text-sm font-black uppercase tracking-widest italic mb-10 border-b-4 border-[var(--theme-primary)] inline-block">月別回答数の推移</h3>
          <div className="h-48 md:h-64 flex items-end justify-between gap-2 md:gap-8">
            {monthlyData.map((data, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-4 group">
                <div 
                  className={`w-full rounded-t-xl border-t-2 border-x-2 border-[var(--theme-border)] transition-all duration-700`}
                  style={{ 
                    height: `${Math.min((data.count / 100) * 100, 100)}%`,
                    backgroundColor: i === monthlyData.length - 1 ? 'var(--theme-primary)' : 'var(--theme-text)',
                    opacity: i === monthlyData.length - 1 ? 1 : 0.05
                  }}
                ></div>
                <span className="text-[10px] font-black text-[var(--theme-text)] opacity-60 italic uppercase">{data.month}</span>
              </div>
            ))}
          </div>
        </section>

        {/* 一覧セクション */}
        <section>
          <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end mb-10 gap-8">
            <div className="w-full xl:w-auto">
              <h3 className="text-xl font-black italic uppercase tracking-tighter border-b-4 border-[var(--theme-primary)] inline-block mb-6">回答一覧フィード</h3>
              <div className="flex flex-wrap gap-2">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setFilterCategory(cat)}
                    className={`px-5 py-2 rounded-2xl border-2 border-[var(--theme-border)] text-[10px] font-black transition-all shadow-[3px_3px_0px_var(--theme-border)] active:shadow-none active:translate-y-0.5`}
                    style={{ backgroundColor: filterCategory === cat ? 'var(--theme-primary)' : 'var(--theme-card-bg)', color: filterCategory === cat ? 'var(--theme-on-primary)' : 'var(--theme-text)' }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredReviews.map((review) => (
              <div key={review.id} className="bg-[var(--theme-card-bg)] border-[3px] border-[var(--theme-border)] p-8 rounded-[3rem] shadow-[8px_8px_0px_var(--theme-border)] flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <span className="text-[10px] font-black text-[var(--theme-text)] opacity-60 italic block mb-1">{new Date(review.created_at).toLocaleDateString('ja-JP')}</span>
                      <span className="px-3 py-1 rounded-full text-[9px] font-black border border-[var(--theme-border)] bg-[var(--theme-primary)] text-[var(--theme-on-primary)]">
                        {review.category || "一般回答"}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="flex gap-0.5 mb-1">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className="text-lg" style={{ color: i < review.rating ? 'var(--theme-primary)' : '#f3f4f6' }}>★</span>
                        ))}
                      </div>
                      <span className="text-2xl font-black italic">{review.rating}.0</span>
                    </div>
                  </div>
                  <p className="text-sm font-black text-[var(--theme-text)] opacity-80 leading-relaxed italic border-l-4 border-[var(--theme-text)]/10 pl-4">「{review.comment || "（コメントなし）"}」</p>
                </div>
                {/* 詳細回答表示 */}
                {review.all_answers && (
                  <div className="mt-4 pt-4 border-t border-dashed border-gray-200">
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(review.all_answers).map(([key, value]: [string, any]) => (
                        <div key={key} className="bg-[var(--theme-text)]/5 px-3 py-1.5 rounded-xl border border-[var(--theme-border)]/10">
                          <span className="text-[7px] font-black text-[var(--theme-text)] opacity-60 uppercase">Q.{key}</span>
                          <span className="text-[10px] font-black block">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}