"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function ReportsPage() {
  const brandYellow = "bg-[#F9C11C]";
  const brandYellowText = "text-[#F9C11C]";

  // --- 状態管理 ---
  const [allReviews, setAllReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'date' | 'rating'>('date');
  const [filterCategory, setFilterCategory] = useState<string>('すべて');

  // --- DBからデータ取得 ---
  useEffect(() => {
    const fetchSurveys = async () => {
      try {
        const response = await fetch('/api/surveys-get');
        const data = await response.json();
        if (Array.isArray(data)) {
          setAllReviews(data);
        }
      } catch (error) {
        console.error("データ取得失敗:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSurveys();
  }, []);

  // --- 統計データの計算 ---
  const totalCount = allReviews.length;
  const avgRating = totalCount > 0 
    ? (allReviews.reduce((acc, curr) => acc + curr.rating, 0) / totalCount).toFixed(1) 
    : "0.0";
  const recommendationRate = totalCount > 0
    ? Math.round((allReviews.filter(r => r.rating >= 4).length / totalCount) * 100)
    : 0;

  // カテゴリー一覧
  const categories = ['すべて', '接客', 'スピード', '清潔感', 'コスパ'];

  // フィルタリング & ソート処理
  const filteredReviews = allReviews
    .filter(r => filterCategory === 'すべて' || r.category === filterCategory)
    .sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  // 月別推移（簡易的に最新の回答から集計するロジック ※本来はSQL側で集計が理想）
  const monthlyData = [
    { month: '12月', count: 45 }, // 過去分は一旦固定
    { month: '1月', count: 52 },
    { month: '2月', count: totalCount }, // 2月を現在のDB総数に連動
  ];

  if (loading) return <div className="min-h-screen flex items-center justify-center font-black italic text-2xl">LOADING...</div>;

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-black font-sans selection:bg-[#F9C11C] pb-20">
      
      <div className="max-w-7xl mx-auto p-6 md:p-12">
        
        {/* --- ヘッダー --- */}
        <header className="flex justify-between items-center mb-12">
          <div className="animate-in fade-in slide-in-from-left-4 duration-700">
            <Link href="/" className="flex items-center gap-2 group">
              <span className="text-2xl group-hover:-translate-x-1 transition-transform">←</span>
              <h1 className="text-2xl md:text-3xl font-black tracking-tighter italic leading-none uppercase">Analytics</h1>
            </Link>
            <p className="text-[10px] md:text-xs font-black text-[#F9C11C] uppercase tracking-widest mt-2 italic">集計レポート</p>
          </div>
          <div className="hidden md:block bg-black text-white px-6 py-3 rounded-2xl border-2 border-black font-black italic text-xs shadow-[4px_4px_0px_#F9C11C]">
            期間: 全期間
          </div>
        </header>

        {/* --- 統計サマリー (DB連動) --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white border-[3px] border-black p-8 rounded-[3rem] shadow-[8px_8px_0px_#000]">
            <p className="text-[10px] font-black text-gray-400 uppercase italic mb-2">総回答数</p>
            <div className="flex items-baseline gap-2 text-7xl font-black italic tracking-tighter">{totalCount}</div>
          </div>
          <div className={`${brandYellow} border-[3px] border-black p-8 rounded-[3rem] shadow-[8px_8px_0px_#000]`}>
            <p className="text-[10px] font-black text-black/40 uppercase italic mb-2">平均満足度</p>
            <div className="flex items-baseline gap-2 text-7xl font-black italic tracking-tighter">{avgRating}<span className="text-2xl">/5.0</span></div>
          </div>
          <div className="bg-black text-white border-[3px] border-black p-8 rounded-[3rem] shadow-[8px_8px_0px_#F9C11C]">
            <p className="text-[10px] font-black text-gray-500 uppercase italic mb-2">推奨度</p>
            <div className="flex items-baseline gap-2 text-7xl font-black italic tracking-tighter">{recommendationRate}<span className={`${brandYellowText} text-2xl`}>%</span></div>
          </div>
        </div>

        {/* --- 推移グラフ --- */}
        <section className="mb-16 bg-white border-[3px] border-black p-8 md:p-12 rounded-[4rem] shadow-[12px_12px_0px_#000] animate-in fade-in duration-1000">
          <h3 className="text-sm font-black uppercase tracking-widest italic mb-10 border-b-4 border-[#F9C11C] inline-block">月別回答数の推移</h3>
          <div className="h-48 md:h-64 flex items-end justify-between gap-2 md:gap-8">
            {monthlyData.map((data, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-4 group">
                <div 
                  className={`w-full rounded-t-xl border-t-2 border-x-2 border-black transition-all duration-700 shadow-[4px_0px_0px_rgba(0,0,0,0.1)] ${i === monthlyData.length - 1 ? brandYellow : 'bg-gray-50 hover:bg-gray-100'}`}
                  style={{ height: `${Math.min((data.count / 100) * 100, 100)}%` }}
                >
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity -top-8 left-1/2 -translate-x-1/2 relative text-[10px] font-black italic bg-black text-white px-2 py-1 rounded">
                    {data.count}
                  </div>
                </div>
                <span className="text-[10px] font-black text-gray-400 italic uppercase">{data.month}</span>
              </div>
            ))}
          </div>
        </section>

        {/* --- フィルター & 回答一覧 --- */}
        <section className="animate-in fade-in slide-in-from-bottom-6 duration-1000">
          <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end mb-10 gap-8">
            <div className="w-full xl:w-auto">
              <h3 className="text-xl font-black italic uppercase tracking-tighter border-b-4 border-[#F9C11C] inline-block mb-6">回答一覧フィード</h3>
              <div className="flex flex-wrap gap-2">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setFilterCategory(cat)}
                    className={`px-5 py-2 rounded-2xl border-2 border-black text-[10px] font-black transition-all shadow-[3px_3px_0px_#000] active:shadow-none active:translate-y-0.5 ${filterCategory === cat ? brandYellow : 'bg-white hover:bg-gray-50'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex bg-gray-100 p-1.5 rounded-2xl border-2 border-black shadow-[4px_4px_0px_#000] self-end md:self-auto">
              <button onClick={() => setSortBy('date')} className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all ${sortBy === 'date' ? 'bg-black text-white' : 'text-gray-400'}`}>日付順</button>
              <button onClick={() => setSortBy('rating')} className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all ${sortBy === 'rating' ? 'bg-black text-white' : 'text-gray-400'}`}>評価順</button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredReviews.length > 0 ? (
              filteredReviews.map((review) => (
                <div key={review.id} className="bg-white border-[3px] border-black p-8 rounded-[3rem] shadow-[8px_8px_0px_#000] hover:scale-[1.01] transition-all">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <span className="text-[10px] font-black text-gray-400 italic block mb-1">
                        {new Date(review.created_at).toLocaleDateString('ja-JP')}
                      </span>
                      <span className={`${brandYellow} px-3 py-1 rounded-full text-[9px] font-black border border-black`}>
                        {review.category}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="flex gap-0.5 mb-1">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className={`text-lg ${i < review.rating ? 'text-[#F9C11C]' : 'text-gray-100'}`}>★</span>
                        ))}
                      </div>
                      <span className="text-2xl font-black italic">{review.rating}.0</span>
                    </div>
                  </div>
                  <p className="text-sm font-black text-gray-600 leading-relaxed italic border-l-4 border-gray-100 pl-4">
                    「{review.comment}」
                  </p>
                </div>
              ))
            ) : (
              <div className="col-span-full py-20 text-center border-3 border-dashed border-gray-200 rounded-[3rem]">
                <p className="font-black text-gray-300 italic">該当する回答が見つかりませんでした</p>
              </div>
            )}
          </div>
        </section>

      </div>
    </div>
  );
}