"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // 簡易的な認証（後で環境変数などで強化も可能）
    if (password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
      localStorage.setItem('isLoggedIn', 'true');
      router.push('/admin');
    } else {
      alert('パスワードが違います');
    }
  };

  return (
    <div className="min-h-screen bg-[var(--theme-bg)] flex items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full animate-in fade-in zoom-in-95 duration-700">
        
        {/* ロゴエリア */}
        <div className="text-center mb-10">
          <h1 className="text-5xl font-black italic tracking-tighter uppercase leading-none text-[var(--theme-text)]">
            Pal<span className="text-[var(--theme-primary)]">-</span>Trust
          </h1>
          <p className="text-[10px] font-black text-[var(--theme-text)] opacity-40 uppercase tracking-[0.3em] mt-3 italic">Admin Dashboard Access</p>
        </div>

        {/* ログインカード */}
        <div className="bg-[var(--theme-card-bg)] border-[3px] border-[var(--theme-border)] p-10 rounded-[3.5rem] shadow-[12px_12px_0px_var(--theme-border)] relative overflow-hidden">
          {/* 背景の光彩 */}
          <div className="absolute top-[-20%] right-[-10%] w-64 h-64 rounded-full blur-[80px] opacity-20 bg-[var(--theme-primary)]" />

          <form onSubmit={handleLogin} className="relative z-10 space-y-8">
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase italic mb-3 block tracking-widest">Passphrase</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[var(--theme-text)]/10 border-2 border-[var(--theme-border)]/20 rounded-2xl px-6 py-4 text-[var(--theme-text)] font-black italic placeholder:text-[var(--theme-text)]/30 focus:outline-none focus:border-[var(--theme-border)] transition-all"
              />
            </div>

            <button 
              type="submit"
              className="w-full py-5 rounded-2xl border-[3px] border-[var(--theme-border)] bg-[var(--theme-primary)] text-[var(--theme-on-primary)] font-black italic uppercase tracking-tighter text-lg shadow-[4px_4px_0px_var(--theme-border)] active:translate-y-1 active:shadow-none transition-all"
            >
              Enter Dashboard →
            </button>
          </form>
        </div>

        {/* フッター */}
        <p className="text-center mt-10 text-[10px] font-black text-[var(--theme-text)] opacity-30 uppercase italic tracking-widest">
          Secure Access Only
        </p>
      </div>
    </div>
  );
}