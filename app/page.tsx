"use client";

import React, { useState } from 'react';

export default function ResponsiveReviewDashboard() {
  const [showQR, setShowQR] = useState(false);

  return (
    // PCでは左にメニューが来るため flex を使用
    <div className="min-h-screen bg-[#FFFFFF] text-black font-sans lg:flex">
      
      {/* --- QRコードのポップアップ --- */}
      {showQR && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-6"
          onClick={() => setShowQR(false)}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xl animate-in fade-in duration-300" />
          <div 
            className="relative bg-white border-4 border-black p-8 rounded-[3rem] w-full max-w-[340px] shadow-[12px_12px_0px_#E2FF00] animate-in zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-6">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-1">Google Review</p>
              <h3 className="text-2xl font-black">口コミを投稿する</h3>
            </div>
            <div className="aspect-square bg-white border-3 border-black rounded-[2rem] p-4 mb-6">
              <div className="grid grid-cols-3 gap-2 w-full h-full opacity-90">
                {[...Array(9)].map((_, i) => (
                  <div key={i} className="bg-black rounded-sm" />
                ))}
              </div>
            </div>
            <button 
              onClick={() => setShowQR(false)}
              className="w-full py-4 bg-black text-white rounded-2xl font-black text-xs hover:bg-gray-800 transition-all active:scale-95"
            >
              閉じる
            </button>
          </div>
        </div>
      )}

      {/* --- PC用サイドナビゲーション (iPad/PCのみ表示) --- */}
      <aside className="hidden lg:flex w-24 xl:w-64 bg-black flex-col items-center py-10 sticky top-0 h-screen">
        <div className="font-black text-white italic text-xl mb-16 xl:text-2xl">PT.</div>
        <nav className="flex flex-col gap-10 flex-1">
          {['ホーム', '分析', '設定'].map((item, i) => (
            <button key={i} className="group flex flex-col items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${i === 0 ? 'bg-brand' : 'bg-white/20'} group-hover:scale-125 transition-all`} />
              <span className={`hidden xl:block text-[10px] font-black tracking-widest ${i === 0 ? 'text-brand' : 'text-white/40'}`}>{item}</span>
            </button>
          ))}
        </nav>
        <div className="w-12 h-12 bg-brand border-2 border-black rounded-xl flex items-center justify-center font-black text-xs shadow-[4px_4px_0px_#FFFFFF]">ME</div>
      </aside>

      {/* --- メインコンテンツエリア --- */}
      <main className="flex-1 p-5 md:p-10 lg:p-16 max-w-[1400px] mx-auto w-full">
        
        {/* ヘッダー (スマホ・iPadのみ表示) */}
        <header className="flex justify-between items-center mb-10 lg:hidden">
          <div>
            <h1 className="text-2xl font-black tracking-tighter italic">PAL-TRUST</h1>
            <p className="text-[10px] font-bold text-gray-400">Google My Business 管理</p>
          </div>
          <button onClick={() => setShowQR(true)} className="w-12 h-12 bg-brand border-3 border-black rounded-2xl flex items-center justify-center shadow-[4px_4px_0px_#000000]">
            <span className="text-[10px] font-black italic">QR</span>
          </button>
        </header>

        {/* グリッドレイアウト調整 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 xl:gap-8">
          
          {/* メイン統計 (PCでは大きく横長に) */}
          <section className="md:col-span-2 lg:col-span-8 saas-card p-8 md:p-12 rounded-[3rem] bg-black text-white flex flex-col justify-between min-h-[300px]">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] md:text-xs font-bold text-gray-400 tracking-widest uppercase mb-4">Google 評価スコア</p>
                <div className="flex items-baseline gap-4">
                  <h2 className="text-7xl md:text-9xl font-black tracking-tighter">4.8</h2>
                  <span className="text-brand text-2xl md:text-4xl font-black italic">/ 5.0</span>
                </div>
              </div>
              <div className="hidden md:block text-right">
                <span className="bg-brand text-black px-4 py-1.5 rounded-full text-xs font-black italic">RANK: TOP 1%</span>
              </div>
            </div>
            
            <div className="mt-10">
              <div className="flex justify-between text-[10px] font-black mb-2 tracking-widest">
                <span>REVIEWS: 1,284件</span>
                <span className="text-brand">VERY GOOD</span>
              </div>
              <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-brand w-[96%]" />
              </div>
            </div>
          </section>

{/* 右側のスタッツ (ズレを修正したバージョン) */}
          <div className="md:col-span-1 lg:col-span-4 grid grid-cols-2 lg:grid-cols-1 gap-6">
            <div className="saas-card p-6 md:p-8 rounded-[2.5rem] flex flex-col justify-center min-h-[160px] lg:h-[calc(50%-12px)]">
              <p className="text-[10px] md:text-xs font-black text-gray-400 uppercase mb-2">口コミ総数</p>
              <p className="text-4xl md:text-5xl font-black italic leading-none">
                1,284<span className="text-sm ml-1 not-italic">件</span>
              </p>
            </div>
            <div className="saas-card p-6 md:p-8 rounded-[2.5rem] flex flex-col justify-center min-h-[160px] lg:h-[calc(50%-12px)] bg-[#FF8AFF]">
              <p className="text-[10px] md:text-xs font-black text-black uppercase mb-2">月間成長率</p>
              <p className="text-4xl md:text-5xl font-black italic leading-none">+24%</p>
            </div>
          </div>

          {/* アクションボタン (PCでは横並びに) */}
          <div className="md:col-span-2 lg:col-span-6 grid grid-cols-2 gap-6">
            <button 
              onClick={() => setShowQR(true)}
              className="btn-action bg-brand border-3 border-black p-8 rounded-[2.5rem] flex flex-col items-center justify-center gap-4 shadow-[8px_8px_0px_#000000]"
            >
              <span className="text-4xl">📱</span>
              <span className="text-xs md:text-sm font-black">QRコード表示</span>
            </button>
            <button className="btn-action bg-black border-3 border-black p-8 rounded-[2.5rem] flex flex-col items-center justify-center gap-4 text-white shadow-[8px_8px_0px_#E2FF00]">
              <span className="text-4xl">📩</span>
              <span className="text-xs md:text-sm font-black">アンケート送付</span>
            </button>
          </div>

          {/* 最新のアンケート (PCでは中サイズ) */}
          <section className="md:col-span-2 lg:col-span-6 saas-card rounded-[3rem] border-3 border-black overflow-hidden">
            <div className="p-8">
              <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-6">最新アンケート指標</h3>
              <p className="text-sm font-bold mb-6">「接客の満足度はどうでしたか？」</p>
              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className={`w-10 h-10 md:w-12 md:h-12 rounded-xl border-3 border-black flex items-center justify-center text-sm font-black ${i <= 4 ? 'bg-brand shadow-[3px_3px_0px_#000000]' : 'bg-white'}`}>
                      {i}
                    </div>
                  ))}
                </div>
                <span className="text-4xl font-black italic">4.2</span>
              </div>
            </div>
          </section>

          {/* 口コミリスト (PCで横幅いっぱいに使う) */}
          <section className="md:col-span-2 lg:col-span-12">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Google 最新口コミフィード</h3>
              <button className="text-xs font-black border-b-2 border-black">すべての口コミを管理</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { name: "Sato様", text: "雰囲気が最高でした！", color: "bg-blue-500" },
                { name: "Tanaka様", text: "スタッフの対応が神。", color: "bg-red-500" },
                { name: "Suzuki様", text: "また来週も来ます。", color: "bg-yellow-500" }
              ].map((item, i) => (
                <div key={i} className="saas-card p-6 rounded-[2rem] flex gap-4 items-center">
                  <div className={`w-12 h-12 rounded-full border-2 border-black shrink-0 ${item.color}`} />
                  <div>
                    <p className="text-xs font-black">{item.name}</p>
                    <p className="text-[11px] text-gray-500 font-bold line-clamp-1">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>

      {/* スマホ用ボトムナビ (PCでは非表示) */}
      <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-sm bg-black rounded-[2.5rem] h-20 flex justify-around items-center px-6 shadow-2xl z-50">
        <button className="text-brand text-2xl">●</button>
        <div className="w-14 h-14 bg-brand border-3 border-black rounded-2xl flex items-center justify-center text-black font-black text-2xl -mt-12 shadow-lg shadow-brand/40 transition-transform active:scale-90">＋</div>
        <button className="text-white/30 text-2xl">★</button>
      </div>
    </div>
  );
}