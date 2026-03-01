"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { THEMES } from '../components/themes';

export default function SurveyPage() {
  const router = useRouter();
  // --- 以下、元の状態管理のコードに続きます ---


  // --- 状態管理 ---
  const [step, setStep] = useState(-1);
  const [totalRating, setTotalRating] = useState(0);
  const [answers, setAnswers] = useState<Record<number, any>>({});
  const [comment, setComment] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);

  // DBからの設定データ
  const [loading, setLoading] = useState(true);
  const [appSettings, setAppSettings] = useState<any>(null);
  const [surveyItems, setSurveyItems] = useState<any[]>([]);

  // --- ここを追加 ---
  // 管理画面の設定(appSettings)にテーマ名があればそれを、なければ standard を使います
  const theme = THEMES[appSettings?.themeName] || THEMES.standard;
  // ----------------

  // --- DBから設定（アプリ名・質問事項・基準値）を読み込む ---
  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch('/api/settings');
        const data = await res.json();
        if (data) {
          setAppSettings(data.settings);
          setSurveyItems(data.surveyItems);
        }
      } catch (e) {
        console.error("設定の取得に失敗しました");
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, []);

  // --- ハンドラー ---
  const handleNext = (val: any) => {
    setSelectedRating(val);

    // 最初の質問（ステップ0）の回答をメインの満足度とする
    if (step === 0) {
      setTotalRating(val);
    }

    // 各質問の回答を保存（currentItemのIDを使用）
    const currentQuestion = surveyItems[step];
    if (currentQuestion) {
      setAnswers({ ...answers, [currentQuestion.id]: val });
    }

    setTimeout(() => {
      setStep(step + 1);
      setSelectedRating(null);
    }, 400);
  };

  // AI口コミ生成（実際のロジックをここに組めます）
  const generateAiComment = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/generate-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answers: answers,
          surveyItems: surveyItems,
          settings: appSettings // これを追加！管理画面の設定を丸ごと送る
        }),
      });
      const data = await res.json();
      setComment(data.comment);
    } catch (e) {
      console.error("AI生成エラー:", e);
      setComment("申し訳ありません。文章の作成に失敗しました。");
    } finally {
      setIsGenerating(false);
    }
  };

  // --- アンケート最終送信（コピー ＆ マップ遷移） ---
  // --- アンケート最終送信（コピー ＆ マップ遷移） ---
  const submitSurvey = async () => {
    const minStars = Number(appSettings?.minStarsForGoogle || 4);
    const isHighRating = totalRating >= minStars;

    // 保存するコメントを決定するロジック
    let finalComment = "";

    if (isHighRating) {
      // 高評価の場合：AIが生成・編集した「comment」を優先
      finalComment = comment;
    } else {
      // 低評価の場合：前のステップ（surveyItems）で入力した「自由回答」を探してセット
      const freeItem = surveyItems.find(item => item.type === 'free');
      if (freeItem && answers[freeItem.id]) {
        finalComment = answers[freeItem.id];
      }
    }

    const payload = {
      rating: totalRating,
      comment: finalComment || "", // 何もなければ空文字
      all_answers: answers
    };

    try {
      // 1. データをDBに保存（ここでレポートに追加されます）
      await fetch('/api/surveys-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      // 2. 高評価ならコピー ＆ マップ遷移
      if (isHighRating) {
        if (comment) {
          try {
            await navigator.clipboard.writeText(comment);
          } catch (err) {
            console.error('コピーに失敗しました', err);
          }
        }
        if (appSettings?.googleMapUrl) {
          window.open(appSettings.googleMapUrl, '_blank');
        }
      }

      // 3. サンクスページへ移動
      router.push(`/thanks?rating=${totalRating}`);
    } catch (e) {
      alert("送信に失敗しました");
    }
  };

  // --- UI部品（星評価） ---
  const RatingOptions = ({ onSelect }: { onSelect: (v: number) => void }) => (
    <div className="grid grid-cols-1 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500 w-full max-w-md">
      {[5, 4, 3, 2, 1].map((star) => {
        const isSelected = selectedRating === star;
        const getBgColor = (s: number) => {
          if (isSelected) return "bg-[var(--theme-primary)] text-[var(--theme-on-primary)]";
          if (s === 5) return "bg-[var(--theme-primary)] text-[var(--theme-on-primary)]";
          if (s === 4) return "bg-[var(--theme-primary)]/60";
          if (s === 3) return "bg-[var(--theme-primary)]/30";
          if (s === 2) return "bg-[var(--theme-primary)]/10";
          return "bg-[var(--theme-card-bg)]";
        };

        return (
          <button key={star} onClick={() => onSelect(star)}
            className={`relative flex items-center justify-between p-6 rounded-2xl border-3 border-[var(--theme-border)] font-black text-xl transition-all duration-200 active:scale-95 shadow-[6px_6px_0px_var(--theme-border)] ${getBgColor(star)} ${isSelected ? `translate-x-[2px] translate-y-[2px] shadow-none` : ''}`}
          >
            <span className="flex items-center gap-3">
              <span className="text-2xl">{star >= 4 ? '😊' : star === 3 ? '😐' : '😞'}</span>
              {star === 5 ? '最高！' : star === 4 ? '満足' : star === 3 ? '普通' : star === 2 ? '微妙' : '不満'}
            </span>
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <span key={i} className={`text-sm ${i < star ? 'text-[var(--theme-text)]' : 'text-[var(--theme-border)] opacity-30'}`}>★</span>
              ))}
            </div>
          </button>
        );
      })}
    </div>
  );

  if (loading) return <div className="min-h-screen flex items-center justify-center font-black italic tracking-tighter">LOADING...</div>;

  return (
    <div className={`min-h-screen ${theme.bg} text-[var(--theme-text)] font-sans flex flex-col items-center justify-center p-6 overflow-hidden`}>

      {step === -1 ? (
        /* --- STEP -1: インパクト抜群のスタート画面 --- */
        <main className={`w-full max-w-md ${theme.card} p-10 flex flex-col items-center text-center space-y-8 animate-in zoom-in-95 duration-500`}>
          <div className={`w-24 h-24 ${theme.accentBg} border-4 border-[var(--theme-border)] rounded-[2rem] flex items-center justify-center text-5xl shadow-[6px_6px_0px_var(--theme-border)] -rotate-3`}>
            ✨
          </div>
          <div className="space-y-2">
            <p className="text-xs font-black tracking-[0.3em] uppercase text-gray-400">Feedback System</p>
           <h1 className={`text-5xl ${theme.text} leading-none tracking-tighter`}>
  {appSettings?.appName || "PAL-TRUST"} <br />
  <span className={theme.accentText}>{appSettings?.appSubtitle || "SURVEY"}</span>
</h1>
          </div>
          <p className="text-sm font-bold text-gray-500 leading-relaxed">
            あなたの声が、お店を創る。 <br />
            わずか1分で終わる簡単なアンケートに <br />
            ご協力をお願いします。
          </p>
         <button
  onClick={() => setStep(0)}
  className={`w-full ${theme.button} py-6 text-2xl italic`}
>
  START!
</button>
        </main>
      ) : (
        /* --- アンケート本編 --- */
        <div className="w-full max-w-md flex flex-col items-center">
          {/* プログレスバー */}
          <div className="w-full mb-12">
            <div className="h-4 bg-[var(--theme-card-bg)] border-2 border-[var(--theme-border)] rounded-full overflow-hidden shadow-[4px_4px_0px_var(--theme-border)]">
              <div className={`h-full bg-[var(--theme-primary)] border-r-2 border-[var(--theme-border)] transition-all duration-500`}
                style={{ width: `${((step + 1) / (surveyItems.length + 1)) * 100}%` }} />
            </div>
          </div>

          <div className="w-full flex flex-col justify-center">
            {step < surveyItems.length ? (
              <div key={step} className="animate-in fade-in slide-in-from-right-4 duration-500">
                <p className="text-xs font-black text-[var(--theme-text)] opacity-60 mb-2 uppercase italic tracking-tighter">Question {step + 1}</p>
                <h2 className={`text-3xl font-black leading-tight mb-10 italic ${step === 0 ? 'underline decoration-[var(--theme-primary)] decoration-8 underline-offset-4' : ''}`}>
                  {surveyItems[step].text}
                </h2>

                {surveyItems[step].type === "rating" ? (
                  <RatingOptions onSelect={handleNext} />
                ) : (
                  <div className="space-y-6">
                    <textarea
                      rows={5}
                      value={answers[surveyItems[step].id] || ""}
                      onChange={(e) => setAnswers({ ...answers, [surveyItems[step].id]: e.target.value })}
                      className="w-full bg-[var(--theme-card-bg)] text-[var(--theme-text)] border-3 border-[var(--theme-border)] p-5 rounded-2xl font-bold outline-none focus:bg-[var(--theme-primary)]/5 shadow-[6px_6px_0px_var(--theme-border)]"
                      placeholder="こちらにご入力ください..."
                    />
                    <button
                      onClick={() => handleNext(answers[surveyItems[step].id])}
                      disabled={!answers[surveyItems[step].id]}
                      className="w-full bg-[var(--theme-text)] text-[var(--theme-bg)] p-6 rounded-2xl font-black text-xl shadow-[8px_8px_0px_var(--theme-primary)] border-2 border-transparent active:translate-x-1 active:translate-y-1 active:shadow-none transition-all disabled:opacity-50"
                    >
                      次へ進む
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* --- 着地画面（高評価/低評価の完全分岐） --- */
              <div className="animate-in zoom-in-95 duration-500 space-y-8">
                {totalRating >= Number(appSettings?.minStarsForGoogle || 4) ? (
                  /* --- 【高評価ルート】口コミ投稿へ誘導 --- */
                  <>
                    <div className="text-center">
                      <div className="w-20 h-20 bg-[var(--theme-text)] text-[var(--theme-bg)] rounded-[2rem] flex items-center justify-center text-4xl mx-auto mb-6 shadow-[8px_8px_0px_var(--theme-primary)]">✨</div>
                      <h2 className="text-3xl font-black italic">高評価ありがとうございます！</h2>
                      <p className="text-[var(--theme-text)] opacity-60 font-bold text-xs mt-4 leading-relaxed">AIが作成した文章をGoogle口コミに投稿しませんか？</p>
                    </div>

                    <div className="relative bg-[var(--theme-card-bg)] border-3 border-[var(--theme-border)] rounded-[2rem] p-5 shadow-[8px_8px_0px_var(--theme-border)]">
                      <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        className="w-full h-32 bg-transparent text-[var(--theme-text)] font-bold text-sm outline-none resize-none leading-relaxed"
                        placeholder="AIでおまかせ、またはこちらに入力..."
                      />
                      {isGenerating && (
                        <div className="absolute inset-0 bg-white/90 rounded-[2rem] flex flex-col items-center justify-center gap-2">
                          <div className="w-6 h-6 border-4 border-black border-t-[var(--theme-primary)] rounded-full animate-spin"></div>
                        </div>
                      )}
                    </div>

                    <div className="grid gap-4">
                      <button
                        onClick={generateAiComment}
                        className={`bg-[var(--theme-primary)] text-[var(--theme-on-primary)] border-3 border-[var(--theme-border)] p-5 rounded-2xl font-black shadow-[6px_6px_0px_var(--theme-border)] active:scale-95 transition-all`}
                      >
                        {comment ? '🔄 再生成する' : '✨ AIに文章作成を任せる'}
                      </button>

                      <button
                        onClick={submitSurvey}
                        className="bg-[var(--theme-text)] text-[var(--theme-bg)] p-6 rounded-2xl font-black text-xl shadow-[8px_8px_0px_var(--theme-primary)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
                      >
                        Google口コミを投稿する
                      </button>
                    </div>
                  </>
                ) : (
                  /* --- 【低評価ルート】お詫びと送信のみ --- */
                  <div className="text-center py-10 bg-[var(--theme-card-bg)] border-4 border-[var(--theme-border)] rounded-[3rem] p-8 shadow-[12px_12px_0px_var(--theme-border)]">
                    <div className="w-20 h-20 bg-[var(--theme-card-bg)] rounded-[2rem] flex items-center justify-center text-4xl mx-auto mb-8 border-3 border-[var(--theme-border)] shadow-[8px_8px_0px_var(--theme-text)] opacity-80">✉️</div>
                    <h2 className="text-2xl font-black italic mb-6">貴重なご意見を<br />ありがとうございます。</h2>
                    <p className="text-[var(--theme-text)] opacity-70 font-bold text-sm leading-relaxed mb-10 px-4">
                      {appSettings?.lowRatingMessage || "サービスの改善に努めさせていただきます。"}
                    </p>
                    <button
                      onClick={submitSurvey}
                      className="w-full bg-[var(--theme-text)] text-[var(--theme-bg)] p-6 rounded-2xl font-black text-xl shadow-[8px_8px_0px_var(--theme-primary)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
                    >
                      送信して終了
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}