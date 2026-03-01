"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [appSettings, setAppSettings] = useState<any>(null);
  const router = useRouter();

  // テーマカラー取得
  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => setAppSettings(data));
  }, []);

  const themeColor = appSettings?.themeColor || appSettings?.data?.themeColor || "#F9C11C";

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // 簡易的な認証（後で環境変数などで強化も可能）
    if (password === 'admin123') { 
      localStorage.setItem('isLoggedIn', 'true');
      router.push('/admin');
    } else {
      alert('パスワードが違います');
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] flex items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full animate-in fade-in zoom-in-95 duration-700">
        
        {/* ロゴエリア */}
        <div className="text-center mb-10">
          <h1 className="text-5xl font-black italic tracking-tighter uppercase leading-none">
            Pal<span style={{ color: themeColor }}>-</span>Trust
          </h1>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mt-3 italic">Admin Dashboard Access</p>
        </div>

        {/* ログインカード */}
        <div className="bg-[#262626] border-[3px] border-black p-10 rounded-[3.5rem] shadow-[12px_12px_0px_#000] relative overflow-hidden">
          {/* 背景の光彩 */}
          <div className="absolute top-[-20%] right-[-10%] w-64 h-64 rounded-full blur-[80px]" style={{ backgroundColor: `${themeColor}22` }} />

          <form onSubmit={handleLogin} className="relative z-10 space-y-8">
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase italic mb-3 block tracking-widest">Passphrase</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-black/20 border-2 border-white/10 rounded-2xl px-6 py-4 text-white font-black italic placeholder:text-gray-700 focus:outline-none focus:border-white/30 transition-all"
              />
            </div>

            <button 
              type="submit"
              className="w-full py-5 rounded-2xl border-[3px] border-black font-black italic uppercase tracking-tighter text-lg shadow-[4px_4px_0px_#000] active:translate-y-1 active:shadow-none transition-all"
              style={{ backgroundColor: themeColor }}
            >
              Enter Dashboard →
            </button>
          </form>
        </div>

        {/* フッター */}
        <p className="text-center mt-10 text-[10px] font-black text-gray-300 uppercase italic tracking-widest">
          Secure Access Only
        </p>
      </div>
    </div>
  );
}