"use client";

import React, { useState } from 'react';
import Link from 'next/link';

export default function OwnerDashboard() {
  const [showShareModal, setShowShareModal] = useState(false);
  
  const brandYellow = "bg-[#F9C11C]";
  const brandYellowText = "text-[#F9C11C]";

  const stats = {
    rating: 4.8,
    totalReviews: 1284,
    newReviewsThisWeek: 12,
    surveyCount: 248
  };

  const copyToClipboard = () => {
    const surveyUrl = window.location.origin + "/survey";
    navigator.clipboard.writeText(surveyUrl);
    alert("お客様用アンケートURLをコピーしました！");
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-black font-sans selection:bg-[#F9C11C]">
      
      {/* --- QR共有モーダル（中央に出るよう調整） --- */}
      {showShareModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 md:p-12">
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-2xl animate-in fade-in duration-700" 
            onClick={() => setShowShareModal(false)} 
          />
          
          <div className="relative bg-white border-[3px] border-black p-8 md:p-12 rounded-[3.5rem] w-full max-w-md shadow-[0_30px_100px_rgba(0,0,0,0.4)] 
                        animate-in zoom-in-95 fade-in duration-500 ease-out-expo">
            
            <div className="text-center mb-10">
              <h3 className="text-3xl font-black italic uppercase tracking-tighter leading-none">Share Survey</h3>
              <p className="text-[10px] font-black text-gray-400 mt-2 uppercase italic tracking-[0.2em] text-center">アンケートを共有する</p>
            </div>
            
            <div className="aspect-square bg-white border-[3px] border-black rounded-[3rem] flex items-center justify-center mb-10 p-8 shadow-[12px_12px_0px_#F9C11C] mx-auto w-52 md:w-64">
              <div className="grid grid-cols-4 gap-2 w-full h-full opacity-90">
                {[...Array(16)].map((_, i) => (
                  <div key={i} className={`rounded-md ${i % 3 === 0 ? 'bg-black' : 'bg-gray-50'}`} />
                ))}
              </div>
            </div>

            <div className="grid gap-5 mb-6">
              <button className={`${brandYellow} border-[3px] border-black py-5 rounded-2xl font-black text-sm italic shadow-[6px_6px_0px_#000] active:scale-[0.98] transition-all flex items-center justify-center gap-3`}>
                <span className="text-xl">📥</span> 画像を保存する
              </button>
              <button onClick={copyToClipboard} className="bg-white border-[3px] border-black py-5 rounded-2xl font-black text-sm italic shadow-[6px_6px_0px_#000] active:scale-[0.98] transition-all flex items-center justify-center gap-3">
                <span className="text-xl">🔗</span> リンクをコピー
              </button>
            </div>

            <button onClick={() => setShowShareModal(false)} className="w-full py-2 text-gray-300 font-black text-[10px] uppercase tracking-[0.4em]">Close</button>
          </div>
        </div>
      )}

      {/* --- メインコンテンツ容器 --- */}
      <div className="max-w-7xl mx-auto p-6 md:p-12 pb-44">
        
        {/* --- Header --- */}
        <header className="flex justify-between items-center mb-12 md:mb-20">
          <div className="animate-in fade-in slide-in-from-left-4 duration-700">
            <h1 className="text-3xl md:text-5xl font-black tracking-tighter italic leading-none">PAL-TRUST</h1>
            <p className="text-[10px] md:text-xs font-black text-[#F9C11C] uppercase tracking-widest mt-2 italic">Owner Dashboard</p>
          </div>
          <div className="text-right hidden sm:block">
             <p className="text-[10px] font-black text-gray-300 italic uppercase">#001 Admin Mode</p>
             <p className="text-xs font-black text-black italic mt-1">店舗管理センター</p>
          </div>
        </header>

        {/* --- Grid Layout (iPad/PCで横並び) --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* 左側：メイン統計 (8カラム) */}
          <div className="lg:col-span-8 space-y-10">
            <section className="p-10 md:p-14 rounded-[4rem] bg-black text-white shadow-[12px_12px_0px_#F9C11C] relative overflow-hidden animate-in zoom-in-95 duration-700">
              <div className="absolute top-[-20%] right-[-10%] w-96 h-96 bg-[#F9C11C]/10 rounded-full blur-[100px]" />
              
              <div className="flex flex-col md:flex-row justify-between items-start gap-8 relative z-10">
                <div>
                  <p className="text-xs font-black text-gray-500 tracking-[0.2em] uppercase mb-4 italic">Total Rating</p>
                  <div className="flex items-baseline gap-2">
                    <h2 className="text-8xl md:text-[10rem] font-black tracking-tighter italic leading-none">{stats.rating}</h2>
                    <span className={`${brandYellowText} text-3xl md:text-5xl font-black italic`}>★</span>
                  </div>
                </div>
                <div className="md:text-right bg-white/5 p-6 rounded-[2.5rem] border border-white/10 backdrop-blur-sm">
                  <p className="text-xs font-black text-gray-500 uppercase italic mb-2 tracking-widest">Reviews Count</p>
                  <p className="text-4xl md:text-6xl font-black italic tracking-tighter leading-none">{stats.totalReviews.toLocaleString()}</p>
                  <div className="mt-4 inline-flex items-center gap-2 bg-[#F9C11C] text-black px-4 py-1.5 rounded-full text-[10px] font-black italic uppercase">
                    ↑ 今週 +{stats.newReviewsThisWeek}件
                  </div>
                </div>
              </div>
              
              <div className="mt-16 space-y-4 relative z-10 max-w-2xl">
                {[5, 4, 3, 2, 1].map((star) => (
                  <div key={star} className="flex items-center gap-6">
                    <span className="text-xs font-black w-4 text-gray-600 italic leading-none">{star}</span>
                    <div className="h-3 flex-1 bg-white/5 rounded-full overflow-hidden border border-white/5">
                      <div 
                        className={`h-full rounded-full ${star >= 4 ? 'bg-[#F9C11C]' : 'bg-gray-700'} transition-all duration-1000 ease-out`} 
                        style={{ width: `${star === 5 ? 85 : star === 4 ? 12 : 3}%` }} 
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* 右側：ボタンと最新回答 (4カラム) */}
          <div className="lg:col-span-4 space-y-10">
            {/* アクションボタン */}
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-6">
              <Link href="/reports" className="w-full">
                <button className="w-full h-full bg-white border-[3px] border-black p-8 rounded-[3rem] flex flex-col lg:flex-row items-center justify-center gap-4 shadow-[8px_8px_0px_#000] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all">
                  <span className="text-5xl lg:text-3xl">📊</span>
                  <span className="text-xs font-black italic uppercase">集計レポート</span>
                </button>
              </Link>
              <a href="https://business.google.com/" target="_blank" rel="noopener noreferrer" className="w-full">
                <button className="w-full h-full bg-white border-[3px] border-black p-8 rounded-[3rem] flex flex-col lg:flex-row items-center justify-center gap-4 shadow-[8px_8px_0px_#000] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all">
                  <span className="text-5xl lg:text-3xl">🌐</span>
                  <span className="text-xs font-black italic uppercase">Googleマップ</span>
                </button>
              </a>
            </div>

            {/* 最新の回答 */}
            <section>
              <div className="flex justify-between items-end mb-6 px-2">
                <h3 className="text-xs font-black uppercase tracking-[0.3em] italic border-b-[3px] border-[#F9C11C] pb-1">Feedback</h3>
                <span className="text-[10px] font-black text-gray-300 italic uppercase">All {stats.surveyCount}</span>
              </div>
              <div className="bg-white rounded-[3.5rem] border-[3px] border-black p-10 shadow-[10px_10px_0px_#000]">
                <p className="text-sm font-black text-gray-500 mb-8 leading-relaxed italic">
                  「接客が非常にスムーズで、説明も分かりやすかったです。また利用したいと思いました。」
                </p>
                <div className="flex justify-between items-center pt-8 border-t border-gray-100">
                   <div className="flex gap-1.5 text-xl">
                     {[...Array(5)].map((_, i) => (
                       <span key={i} className={`${i < 4 ? 'text-[#F9C11C]' : 'text-gray-100'}`}>★</span>
                     ))}
                   </div>
                   <span className="text-3xl font-black italic leading-none">4.0</span>
                </div>
              </div>
            </section>
          </div>

        </div>
      </div>

      {/* --- Floating Bottom Nav --- */}
      <nav className="fixed bottom-10 left-1/2 -translate-x-1/2 w-[90%] max-w-md bg-black/90 backdrop-blur-xl rounded-[3rem] h-24 flex justify-around items-center px-10 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] z-50 border border-white/10 ring-1 ring-white/5">
        <Link href="/" className="flex flex-col items-center group">
          <span className="text-[#F9C11C] text-2xl">●</span>
          <span className="text-[#F9C11C] text-[8px] font-black uppercase italic tracking-widest mt-1">Home</span>
        </Link>
        <button onClick={() => setShowShareModal(true)} className="relative group outline-none">
          <div className={`${brandYellow} w-20 h-20 border-[3px] border-black rounded-[2.5rem] flex items-center justify-center text-black font-black text-4xl -mt-20 shadow-[0_15px_30px_rgba(249,193,28,0.4)] active:translate-y-1 active:shadow-none transition-all`}>
            ＋
          </div>
        </button>
        <Link href="/admin" className="flex flex-col items-center opacity-30 hover:opacity-100 transition-all group">
          <span className="text-white text-2xl italic font-serif group-active:rotate-12 transition-transform">⚙</span>
          <span className="text-white text-[8px] font-black uppercase italic tracking-widest mt-1">Admin</span>
        </Link>
      </nav>

    </div>
  );
}