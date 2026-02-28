"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminDashboard() {
  // --- 状態管理の settings 部分 ---
  const [settings, setSettings] = useState({
    appName: "PAL-TRUST",
    appSubtitle: "SURVEY",
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
      }
    }
    loadSettings();
  }, []);

  const brandYellow = "bg-[#F9C11C]";
  const brandYellowText = "text-[#F9C11C]";

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
        alert("設定を保存しました！");
      } else {
        throw new Error();
      }
    } catch (e) {
      alert("保存に失敗しました。");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F4F4] text-black font-sans lg:flex">
      {/* サイドナビ */}
      <aside className="hidden lg:flex w-24 xl:w-64 bg-black flex-col items-center py-10 sticky top-0 h-screen">
        <div className="font-black text-white italic text-xl mb-16 xl:text-2xl tracking-tighter">PT. ADMIN</div>
        <nav className="flex flex-col gap-10 flex-1">
          <div className="flex flex-col items-center gap-2">
            <span className={`w-3 h-3 rounded-full ${brandYellow}`} />
            <span className={`hidden xl:block text-[10px] font-black tracking-widest ${brandYellowText}`}>システム設定</span>
          </div>
        </nav>
      </aside>

      <main className="flex-1 p-5 md:p-10 lg:p-16 max-w-[1000px] mx-auto w-full space-y-10">

        <header>
          <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Administrator</p>
          <h1 className="text-4xl font-black italic">システム設定</h1>
        </header>

        {/* 1. 基本・マップ設定 */}
        <section className="bg-white rounded-[2rem] border-3 border-black p-8 shadow-[8px_8px_0px_#000]">
          <h2 className="text-xl font-black mb-6 flex items-center gap-2 italic">
            <span className={`w-2 h-6 ${brandYellow} block border border-black`} />
            基本・マップ設定 <span className="text-[10px] text-gray-400 ml-2 font-normal italic">BASIC & MAP</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-black text-gray-400 mb-2 uppercase">アプリ名（メイン）</label>
              <input
                type="text"
                value={settings.appName}
                onChange={(e) => setSettings({ ...settings, appName: e.target.value })}
                className="w-full bg-[#F8F8F8] border-2 border-black p-4 rounded-xl font-bold outline-none mb-4"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-400 mb-2 uppercase">サブタイトル（イエロー部分）</label>
              <input
                type="text"
                value={settings.appSubtitle}
                onChange={(e) => setSettings({ ...settings, appSubtitle: e.target.value })}
                className="w-full bg-[#F8F8F8] border-2 border-black p-4 rounded-xl font-bold outline-none mb-4"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-400 mb-2 uppercase">Google口コミ誘導の基準（星いくつ以上？）</label>
              <select
                value={settings.minStarsForGoogle}
                onChange={(e) => setSettings({ ...settings, minStarsForGoogle: e.target.value })}
                className="w-full bg-[#F8F8F8] border-2 border-black p-4 rounded-xl font-bold outline-none"
              >
                <option value="5">星5のみ</option>
                <option value="4">星4以上</option>
                <option value="3">星3以上</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-400 mb-2 uppercase">誘導先 Google Map URL</label>
              <input
                type="text"
                value={settings.googleMapUrl}
                onChange={(e) => setSettings({ ...settings, googleMapUrl: e.target.value })}
                placeholder="https://goo.gl/maps/..."
                className="w-full bg-[#F8F8F8] border-2 border-black p-4 rounded-xl font-bold outline-none"
              />
            </div>
          </div>
        </section>

        {/* 2. アンケート項目設定 */}
        <section className="bg-white rounded-[2rem] border-3 border-black p-8 shadow-[8px_8px_0px_#000]">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-black flex items-center gap-2 italic">
              <span className={`w-2 h-6 ${brandYellow} block border border-black`} />
              アンケート項目設定 <span className="text-[10px] text-gray-400 ml-2 font-normal italic">SURVEY ITEMS</span>
            </h2>
            <button onClick={addSurveyItem} className={`${brandYellow} border-2 border-black px-4 py-2 rounded-xl font-black text-xs shadow-[3px_3px_0px_#000]`}>
              ＋ 項目を追加
            </button>
          </div>
          <div className="grid grid-cols-1 gap-4">
            {surveyItems.map((item, index) => (
              <div key={item.id} className="flex flex-col md:flex-row gap-3 bg-[#F8F8F8] p-4 border-2 border-black rounded-xl">
                <div className="flex items-center gap-3 flex-1">
                  <span className="text-[10px] font-black text-gray-400 w-4">{index + 1}</span>
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
                    className="bg-white border-2 border-black px-3 py-1 rounded-lg font-black text-xs outline-none"
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
        <section className="bg-white rounded-[2rem] border-3 border-black p-8 shadow-[8px_8px_0px_#000]">
          <h2 className="text-xl font-black mb-6 flex items-center gap-2 italic">
            <span className={`w-2 h-6 ${brandYellow} block border border-black`} />
            AI口コミ生成テイスト <span className="text-[10px] text-gray-400 ml-2 font-normal italic">AI ENGINE</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-black text-gray-400 mb-2 uppercase">生成文字数目安</label>
              <input type="number" value={settings.aiReviewLength} onChange={(e) => setSettings({ ...settings, aiReviewLength: e.target.value })} className="w-full bg-[#F8F8F8] border-2 border-black p-4 rounded-xl font-bold outline-none" />
            </div>

            <div>
              <label className="block text-[10px] font-black text-gray-400 mb-2 uppercase">口コミのテイスト（5種）</label>
              {/* 口コミのテイスト選択部分 */}
              <select
                value={settings.aiReviewTaste}
                onChange={(e) => setSettings({ ...settings, aiReviewTaste: e.target.value })}
                className="w-full bg-[#F8F8F8] border-2 border-black p-4 rounded-xl font-bold outline-none"
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
        <section className="bg-white rounded-[2rem] border-3 border-black p-8 shadow-[8px_8px_0px_#000]">
          <h2 className="text-xl font-black mb-6 flex items-center gap-2 italic">
            <span className={`w-2 h-6 ${brandYellow} block border border-black`} />
            低評価時のメッセージ <span className="text-[10px] text-gray-400 ml-2 font-normal italic">LOW RATING MESSAGE</span>
          </h2>
          <label className="block text-[10px] font-black text-gray-400 mb-2 uppercase">星が基準より低いお客様に表示する内容</label>
          <textarea
            rows={3}
            value={settings.lowRatingMessage}
            onChange={(e) => setSettings({ ...settings, lowRatingMessage: e.target.value })}
            className="w-full bg-[#F8F8F8] border-2 border-black p-4 rounded-xl font-bold outline-none resize-none focus:bg-[#F9C11C]/5"
            placeholder="改善を約束するメッセージを入力してください"
          />
        </section>

        {/* 5. サンクスページ設定 */}
        <section className="bg-white rounded-[2rem] border-3 border-black p-8 shadow-[8px_8px_0px_#000]">
          <h2 className="text-xl font-black mb-6 flex items-center gap-2 italic">
            <span className={`w-2 h-6 ${brandYellow} block border border-black`} />
            完了画面の設定 <span className="text-[10px] text-gray-400 ml-2 font-normal italic">THANK YOU PAGE</span>
          </h2>
          <label className="block text-[10px] font-black text-gray-400 mb-2 uppercase">高評価だったお客様に表示する内容</label>
          <textarea
            rows={3}
            value={settings.thanksPageContent}
            onChange={(e) => setSettings({ ...settings, thanksPageContent: e.target.value })}
            className="w-full bg-[#F8F8F8] border-2 border-black p-4 rounded-xl font-bold outline-none resize-none"
          />
        </section>

        {/* 下部ボタン */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-6 pb-20">
          <Link href="/" className="w-full md:w-auto order-2 md:order-1">
            <button className="w-full md:w-auto bg-white border-3 border-black px-12 py-6 rounded-[2rem] font-black text-xl shadow-[8px_8px_0px_#000] active:scale-95 transition-all">← 戻る</button>
          </Link>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className={`w-full md:w-auto order-1 md:order-2 bg-black text-white px-20 py-6 rounded-[2rem] font-black text-xl shadow-[8px_8px_0px_#F9C11C] active:scale-95 transition-all ${isSaving ? 'opacity-50' : ''}`}
          >
            {isSaving ? "保存中..." : "設定を保存して反映"}
          </button>
        </div>
      </main>
    </div>
  );
}