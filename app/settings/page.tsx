"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTheme } from '../components/ThemeProvider';

export default function AdminDashboard() {
  // --- 状態管理の settings 部分 ---
  const [settings, setSettings] = useState({
    appName: "PAL-TRUST",
    appSubtitle: "SURVEY",
    themeName: "standard",
    minStarsForGoogle: "4",
    aiReviewLength: "150",
    aiReviewTaste: "friendly",      // 初期値
    aiReplyTaste: "professional",  // 初期値
    thanksPageContent: "本日はご来店ありがとうございました！またのお越しを心よりお待ちしております。",
    lowRatingMessage: "ご不便をおかけし申し訳ございません。いただいた内容は責任を持って店長へ報告し、サービスの改善に努めさせていただきます。",
    googleMapUrl: "https://goo.gl/maps/xxxx",
  });

  const [surveyItems, setSurveyItems] = useState([
    { id: 1, text: "接客の満足度はどうでしたか？", type: "rating" },
    { id: 2, text: "具体的に良かった点や改善点を教えてください", type: "free" },
  ]);

  const [isSaving, setIsSaving] = useState(false);
    const [showToast, setShowToast] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const { changeTheme } = useTheme();

  // --- DBから設定を読み込む ---
  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch('/api/settings');
        const data = await res.json();
        if (data && data.settings) {
          setSettings(data.settings);
          setSurveyItems(data.surveyItems);
        }
      } catch (e) {
        console.error("設定の読み込みに失敗しました");
      } finally {
        setIsLoading(false);
      }
    }
    loadSettings();
  }, []);

  const addSurveyItem = () => {
    if (surveyItems.length < 20) {
      setSurveyItems([...surveyItems, { id: Date.now(), text: "", type: "rating" }]);
    }
  };

  const removeSurveyItem = (id: number) => {
    setSurveyItems(surveyItems.filter(item => item.id !== id));
  };

  const updateSurveyItem = (id: number, fields: any) => {
    setSurveyItems(surveyItems.map(item => item.id === id ? { ...item, ...fields } : item));
  };

  // --- DBへ設定を保存する ---
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings, surveyItems }),
      });
      if (res.ok) {
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      } else {
        throw new Error();
      }
    } catch (e) {
      alert("保存に失敗しました。");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center font-black italic text-2xl">LOADING...</div>;
  }

  return (
<div className="min-h-screen font-sans lg:flex text-[var(--theme-text)] relative">
      {/* --- 自作ポップアップ（背景色をテーマカラーに変更・影なし） --- */}
      <div className={`fixed top-10 left-1/2 -translate-x-1/2 z-[100] transition-all duration-500 ease-out ${showToast ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10 pointer-events-none'}`}>
        <div 
          className="px-10 py-5 rounded-[2.5rem] border-4 border-black flex items-center gap-4 animate-in fade-in zoom-in-95 duration-300"
          style={{ 
            backgroundColor: 'var(--theme-primary)', 
            color: 'var(--theme-on-primary)' 
          }}
        >
          <span className="text-2xl">★</span>
          <div className="flex flex-col text-left">
            <p className="font-black italic tracking-tighter text-2xl uppercase leading-none">Settings Saved!</p>
            <p className="text-[10px] font-black opacity-70 tracking-widest mt-1">設定を保存して反映しました</p>
          </div>
        </div>
      </div>
      {/* 保存中のローディングオーバーレイ */}
      {isSaving && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-3xl shadow-2xl flex flex-col items-center gap-4 animate-in zoom-in-95 duration-300">
            <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
            <p className="font-black italic text-xl text-black tracking-widest">SAVING...</p>
          </div>
        </div>
      )}

      {/* サイドナビ */}
      <aside className="hidden lg:flex w-24 xl:w-64 bg-[var(--theme-card-bg)] border-r border-[var(--theme-border)] flex-col items-center py-10 sticky top-0 h-screen">
        <div className="font-black text-[var(--theme-text)] italic text-xl mb-16 xl:text-2xl tracking-tighter">PT. ADMIN</div>
        <nav className="flex flex-col gap-10 flex-1">
          <div className="flex flex-col items-center gap-2">
            <span className={`w-3 h-3 rounded-full bg-[var(--theme-primary)]`} />
            <span className={`hidden xl:block text-[10px] font-black tracking-widest text-[var(--theme-primary)]`}>システム設定</span>
          </div>
        </nav>
      </aside>

      <main className="flex-1 p-5 md:p-10 lg:p-16 max-w-[1000px] mx-auto w-full space-y-10">

        <header>
          <p className="text-xs font-black text-[var(--theme-text)] opacity-60 uppercase tracking-widest">Administrator</p>
          <h1 className="text-4xl font-black italic">システム設定</h1>
        </header>

        {/* 1. 基本・マップ設定 */}
        <section className="bg-[var(--theme-card-bg)] rounded-[2rem] border-3 border-[var(--theme-border)] p-8 shadow-[8px_8px_0px_var(--theme-border)]">
          <h2 className="text-xl font-black mb-6 flex items-center gap-2 italic">
            <span className={`w-2 h-6 bg-[var(--theme-primary)] block border border-[var(--theme-border)]`} />
            基本・マップ設定 <span className="text-[10px] text-[var(--theme-text)] opacity-60 ml-2 font-normal italic">BASIC & MAP</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-black text-[var(--theme-text)] opacity-60 mb-2 uppercase">アプリ名（メイン）</label>
              <input
                type="text"
                value={settings.appName}
                onChange={(e) => setSettings({ ...settings, appName: e.target.value })}
                className="w-full bg-[var(--theme-text)]/5 border-2 border-[var(--theme-border)] p-4 rounded-xl font-bold outline-none mb-4"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-[var(--theme-text)] opacity-60 mb-2 uppercase">サブタイトル（イエロー部分）</label>
              <input
                type="text"
                value={settings.appSubtitle}
                onChange={(e) => setSettings({ ...settings, appSubtitle: e.target.value })}
                className="w-full bg-[var(--theme-text)]/5 border-2 border-[var(--theme-border)] p-4 rounded-xl font-bold outline-none mb-4"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-[var(--theme-text)] opacity-60 mb-2 uppercase">Google口コミ誘導の基準（星いくつ以上？）</label>
              <select
                value={settings.minStarsForGoogle}
                onChange={(e) => setSettings({ ...settings, minStarsForGoogle: e.target.value })}
                className="w-full bg-[var(--theme-text)]/5 border-2 border-[var(--theme-border)] p-4 rounded-xl font-bold outline-none"
              >
                <option value="5">星5のみ</option>
                <option value="4">星4以上</option>
                <option value="3">星3以上</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black text-[var(--theme-text)] opacity-60 mb-2 uppercase">誘導先 Google Map URL</label>
              <input
                type="text"
                value={settings.googleMapUrl}
                onChange={(e) => setSettings({ ...settings, googleMapUrl: e.target.value })}
                placeholder="https://goo.gl/maps/..."
                className="w-full bg-[var(--theme-text)]/5 border-2 border-[var(--theme-border)] p-4 rounded-xl font-bold outline-none"
              />
            </div>
          </div>
        </section>

        {/* デザインテーマ選択 */}
        <section className="bg-[var(--theme-card-bg)] rounded-[2rem] border-3 border-[var(--theme-border)] p-8 shadow-[8px_8px_0px_var(--theme-border)]">
          <h2 className="text-xl font-black mb-6 flex items-center gap-2 italic">
            <span className={`w-2 h-6 bg-[var(--theme-primary)] block border border-[var(--theme-border)]`} />
            デザインテーマ選択 <span className="text-[10px] text-[var(--theme-text)] opacity-60 ml-2 font-normal italic">DESIGN THEME</span>
          </h2>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {[
              { id: 'standard', name: '標準', color: 'bg-[#F9C11C]', text: 'BLACK' },
              { id: 'minimal', name: 'シンプル', color: 'bg-white', border: 'border-gray-200', text: 'GRAY' },
              { id: 'feminine', name: 'フェミニン', color: 'bg-[#FADADD]', text: 'PINK' },
              { id: 'dark', name: 'ダーク', color: 'bg-[#121212]', border: 'border-[#D4AF37]', text: 'GOLD' },
              { id: 'pop', name: 'ポップ', color: 'bg-[#3B82F6]', text: 'BLUE' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  setSettings({ ...settings, themeName: t.id });
                  changeTheme(t.id); // プレビュー反映
                }}
                className={`flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all duration-200 ${
                  settings.themeName === t.id 
                    ? 'border-[var(--theme-border)] bg-[var(--theme-text)]/5 shadow-[4px_4px_0px_var(--theme-border)] scale-105' 
                    : 'border-transparent bg-[var(--theme-card-bg)] hover:bg-[var(--theme-text)]/5 opacity-60'
                }`}
              >
                <div className={`w-12 h-12 rounded-full ${t.color} ${t.border || 'border-2 border-black'} shadow-sm`} />
                <span className="text-[10px] font-black uppercase tracking-tighter text-center">{t.name}</span>
                {settings.themeName === t.id && (
                  <span className="text-[10px] text-[var(--theme-text)] font-bold">●選択中</span>
                )}
              </button>
            ))}
          </div>
          <p className="mt-4 text-[10px] text-[var(--theme-text)] opacity-60 font-bold italic text-center">※選択したテーマがアンケート画面の配色・形状に即座に反映されます。</p>
        </section>

        {/* 2. アンケート項目設定 */}
        <section className="bg-[var(--theme-card-bg)] rounded-[2rem] border-3 border-[var(--theme-border)] p-8 shadow-[8px_8px_0px_var(--theme-border)]">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-black flex items-center gap-2 italic">
              <span className={`w-2 h-6 bg-[var(--theme-primary)] block border border-[var(--theme-border)]`} />
              アンケート項目設定 <span className="text-[10px] text-[var(--theme-text)] opacity-60 ml-2 font-normal italic">SURVEY ITEMS</span>
            </h2>
            <button onClick={addSurveyItem} className={`bg-[var(--theme-primary)] text-[var(--theme-on-primary)] border-2 border-[var(--theme-border)] px-4 py-2 rounded-xl font-black text-xs shadow-[3px_3px_0px_var(--theme-border)]`}>
              ＋ 項目を追加
            </button>
          </div>
          <div className="grid grid-cols-1 gap-4">
            {surveyItems.map((item, index) => (
              <div key={item.id} className="flex flex-col md:flex-row gap-3 bg-[var(--theme-text)]/5 p-4 border-2 border-[var(--theme-border)] rounded-xl">
                <div className="flex items-center gap-3 flex-1">
                  <span className="text-[10px] font-black text-[var(--theme-text)] opacity-60 w-4">{index + 1}</span>
                  <input
                    type="text"
                    value={item.text}
                    onChange={(e) => updateSurveyItem(item.id, { text: e.target.value })}
                    className="flex-1 bg-transparent font-bold text-sm outline-none"
                    placeholder="質問文を入力してください"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <select
                    value={item.type}
                    onChange={(e) => updateSurveyItem(item.id, { type: e.target.value })}
                    className="bg-[var(--theme-card-bg)] border-2 border-[var(--theme-border)] px-3 py-1 rounded-lg font-black text-xs outline-none"
                  >
                    <option value="rating">★評価(1-5)</option>
                    <option value="free">自由入力</option>
                  </select>
                  <button onClick={() => removeSurveyItem(item.id)} className="text-gray-300 hover:text-red-500 font-black px-2">×</button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 3. AI設定 */}
        <section className="bg-[var(--theme-card-bg)] rounded-[2rem] border-3 border-[var(--theme-border)] p-8 shadow-[8px_8px_0px_var(--theme-border)]">
          <h2 className="text-xl font-black mb-6 flex items-center gap-2 italic">
            <span className={`w-2 h-6 bg-[var(--theme-primary)] block border border-[var(--theme-border)]`} />
            AI口コミ生成テイスト <span className="text-[10px] text-[var(--theme-text)] opacity-60 ml-2 font-normal italic">AI ENGINE</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-black text-[var(--theme-text)] opacity-60 mb-2 uppercase">生成文字数目安</label>
              <input type="number" value={settings.aiReviewLength} onChange={(e) => setSettings({ ...settings, aiReviewLength: e.target.value })} className="w-full bg-[var(--theme-text)]/5 border-2 border-[var(--theme-border)] p-4 rounded-xl font-bold outline-none" />
            </div>

            <div>
              <label className="block text-[10px] font-black text-[var(--theme-text)] opacity-60 mb-2 uppercase">口コミのテイスト（5種）</label>
              {/* 口コミのテイスト選択部分 */}
              <select
                value={settings.aiReviewTaste}
                onChange={(e) => setSettings({ ...settings, aiReviewTaste: e.target.value })}
                className="w-full bg-[var(--theme-text)]/5 border-2 border-[var(--theme-border)] p-4 rounded-xl font-bold outline-none"
              >
                <option value="random">🎲 ランダム（AIが自動で選択）</option> {/* 追加 */}
                <option value="friendly">親しみやすい（自然な会話調）</option>
                <option value="polite">丁寧・誠実（しっかりした敬語）</option>
                <option value="energetic">元気・ワクワク（ポジティブ全開）</option>
                <option value="emotional">感動・エモーショナル（心温まる表現）</option>
                <option value="minimal">シンプル（短く端的に）</option>
              </select>
            </div>
          </div>
        </section>

        {/* 4. 低評価時のメッセージ */}
        <section className="bg-[var(--theme-card-bg)] rounded-[2rem] border-3 border-[var(--theme-border)] p-8 shadow-[8px_8px_0px_var(--theme-border)]">
          <h2 className="text-xl font-black mb-6 flex items-center gap-2 italic">
            <span className={`w-2 h-6 bg-[var(--theme-primary)] block border border-[var(--theme-border)]`} />
            低評価時のメッセージ <span className="text-[10px] text-[var(--theme-text)] opacity-60 ml-2 font-normal italic">LOW RATING MESSAGE</span>
          </h2>
          <label className="block text-[10px] font-black text-[var(--theme-text)] opacity-60 mb-2 uppercase">星が基準より低いお客様に表示する内容</label>
          <textarea
            rows={3}
            value={settings.lowRatingMessage}
            onChange={(e) => setSettings({ ...settings, lowRatingMessage: e.target.value })}
            className="w-full bg-[var(--theme-text)]/5 border-2 border-[var(--theme-border)] p-4 rounded-xl font-bold outline-none resize-none focus:bg-[var(--theme-primary)]/5"
            placeholder="改善を約束するメッセージを入力してください"
          />
        </section>

        {/* 5. サンクスページ設定 */}
        <section className="bg-[var(--theme-card-bg)] rounded-[2rem] border-3 border-[var(--theme-border)] p-8 shadow-[8px_8px_0px_var(--theme-border)]">
          <h2 className="text-xl font-black mb-6 flex items-center gap-2 italic">
            <span className={`w-2 h-6 bg-[var(--theme-primary)] block border border-[var(--theme-border)]`} />
            完了画面の設定 <span className="text-[10px] text-[var(--theme-text)] opacity-60 ml-2 font-normal italic">THANK YOU PAGE</span>
          </h2>
          <label className="block text-[10px] font-black text-[var(--theme-text)] opacity-60 mb-2 uppercase">高評価だったお客様に表示する内容</label>
          <textarea
            rows={3}
            value={settings.thanksPageContent}
            onChange={(e) => setSettings({ ...settings, thanksPageContent: e.target.value })}
            className="w-full bg-[var(--theme-text)]/5 border-2 border-[var(--theme-border)] p-4 rounded-xl font-bold outline-none resize-none"
          />
        </section>

        {/* 下部ボタン */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-6 pb-20">
          <Link href="/admin" className="w-full md:w-auto order-2 md:order-1">
            <button className="w-full md:w-auto bg-[var(--theme-card-bg)] border-3 border-[var(--theme-border)] px-12 py-6 rounded-[2rem] font-black text-xl shadow-[8px_8px_0px_var(--theme-border)] active:scale-95 transition-all">← 戻る</button>
          </Link>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className={`w-full md:w-auto order-1 md:order-2 bg-[var(--theme-text)] text-[var(--theme-bg)] px-20 py-6 rounded-[2rem] font-black text-xl shadow-[8px_8px_0px_var(--theme-primary)] active:scale-95 transition-all ${isSaving ? 'opacity-50' : ''}`}
          >
            {isSaving ? "保存中..." : "設定を保存して反映"}
          </button>
        </div>
      </main>
    </div>
  );
}