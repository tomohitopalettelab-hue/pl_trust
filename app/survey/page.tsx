"use client";

import React, { useState } from 'react';

export default function SurveyPage() {
  // ステップ管理 (-1: スタート画面, 0: 総評, 1~: 質問, last: 口コミ)
  const [step, setStep] = useState(-1); 
  const [totalRating, setTotalRating] = useState(0);
  const [answers, setAnswers] = useState<Record<number, any>>({});
  const [comment, setComment] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false); // 送信中状態を追加

  const minStarsForGoogle = 4; 
  const customQuestions = [
    { id: 1, type: "rating", text: "接客のスピードはいかがでしたか？" },
    { id: 2, type: "free", text: "具体的に良かった点や、改善すべき点があれば教えてください。" },
  ];

  const brandYellow = "bg-[#F9C11C]";
  const brandYellowText = "text-[#F9C11C]";

  // --- DB送信ハンドラー ---
  const submitSurvey = async (finalComment: string) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/survey', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating: totalRating,
          category: answers[1] ? (answers[1] >= 4 ? "満足" : "改善要望") : "接客", // 質問1の結果から簡易判別
          comment: finalComment || comment || "コメントなし"
        }),
      });

      if (response.ok) {
        alert("アンケートをご送信いただきありがとうございました！");
        // 送信後はトップに戻るなど
        window.location.href = "/";
      } else {
        throw new Error("送信失敗");
      }
    } catch (error) {
      alert("通信エラーが発生しました。もう一度お試しください。");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- ハンドラー ---
  const handleNext = (val: any) => {
    setSelectedRating(val);
    if (step === 0) {
      setTotalRating(val);
    } else if (step > 0) {
      setAnswers({ ...answers, [step]: val });
    }

    setTimeout(() => {
      setStep(step + 1);
      setSelectedRating(null);
    }, 400);
  };

  const generateAiComment = async () => {
    setIsGenerating(true);
    await new Promise(resolve => setTimeout(resolve, 1500)); 
    setComment("お店に入った瞬間から笑顔で迎えてくださり、とても居心地が良かったです。特にスタッフの方の丁寧な説明に感動しました！");
    setIsGenerating(false);
  };

  // --- UI部品（星評価） ---
  const RatingOptions = ({ onSelect }: { onSelect: (v: number) => void }) => (
    <div className="grid grid-cols-1 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500 w-full max-w-md">
      {[5, 4, 3, 2, 1].map((star) => {
        const isSelected = selectedRating === star;
        const getBgColor = (s: number) => {
          if (isSelected) return brandYellow;
          if (s === 5) return brandYellow;
          if (s === 4) return "bg-[#F9C11C]/60";
          if (s === 3) return "bg-[#F9C11C]/30";
          if (s === 2) return "bg-[#F9C11C]/10";
          return "bg-white";
        };

        return (
          <button key={star} onClick={() => onSelect(star)}
            className={`relative flex items-center justify-between p-6 rounded-2xl border-3 border-black font-black text-xl transition-all duration-200 active:scale-95 shadow-[6px_6px_0px_#000] ${getBgColor(star)} ${isSelected ? `translate-x-[2px] translate-y-[2px] shadow-none` : ''}`}
          >
            <span className="flex items-center gap-3">
              <span className="text-2xl">{star >= 4 ? '😊' : star === 3 ? '😐' : '😞'}</span>
              {star === 5 ? '最高！' : star === 4 ? '満足' : star === 3 ? '普通' : star === 2 ? '微妙' : '不満'}
            </span>
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <span key={i} className={`text-sm ${i < star ? 'text-black' : 'text-gray-200'}`}>★</span>
              ))}
            </div>
          </button>
        );
      })}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F4F4F4] text-black font-sans flex flex-col items-center justify-center p-6 overflow-hidden">
      
      {step === -1 ? (
        /* --- STEP -1: スタート画面 --- */
        <main className="w-full max-w-md bg-white border-4 border-black rounded-[3rem] p-10 shadow-[12px_12px_0px_#000] flex flex-col items-center text-center space-y-8 animate-in zoom-in-95 duration-500">
          <div className={`w-24 h-24 ${brandYellow} border-4 border-black rounded-[2rem] flex items-center justify-center text-5xl shadow-[6px_6px_0px_#000] -rotate-3`}>
            ✨
          </div>
          <div className="space-y-2">
            <p className="text-xs font-black tracking-[0.3em] uppercase text-gray-400">Feedback System</p>
            <h1 className="text-5xl font-black italic leading-none tracking-tighter">
              PAL-TRUST <br />
              <span className={brandYellowText}>SURVEY</span>
            </h1>
          </div>
          <p className="text-sm font-bold text-gray-500 leading-relaxed">
            あなたの声が、お店を創る。 <br />
            わずか1分で終わる簡単なアンケートに <br />
            ご協力をお願いします。
          </p>
          <button 
            onClick={() => setStep(0)}
            className={`${brandYellow} w-full border-4 border-black py-6 rounded-2xl font-black text-2xl italic shadow-[8px_8px_0px_#000] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all`}
          >
            START!
          </button>
        </main>
      ) : (
        /* --- アンケート本編 --- */
        <div className="w-full max-w-md flex flex-col items-center">
          {/* プログレスバー */}
          <div className="w-full mb-12">
            <div className="h-4 bg-white border-2 border-black rounded-full overflow-hidden shadow-[4px_4px_0px_#000]">
              <div className={`h-full ${brandYellow} border-r-2 border-black transition-all duration-500`} 
                   style={{ width: `${((step + 1) / (customQuestions.length + 2)) * 100}%` }} />
            </div>
          </div>

          <div className="w-full flex flex-col justify-center">
            {step === 0 ? (
              <div className="animate-in fade-in duration-500">
                <p className="text-xs font-black text-gray-400 mb-2 uppercase tracking-widest text-center md:text-left">Question 1</p>
                <h2 className="text-3xl font-black leading-tight mb-8 italic underline decoration-[#F9C11C] decoration-8 underline-offset-4">本日の満足度は<br/>いかがでしたか？</h2>
                <RatingOptions onSelect={handleNext} />
              </div>
            ) : step <= customQuestions.length ? (
              <div key={step} className="animate-in fade-in slide-in-from-right-4 duration-500">
                <p className="text-xs font-black text-gray-400 mb-2 uppercase italic tracking-tighter">Question {step + 1}</p>
                <h2 className="text-3xl font-black leading-tight mb-10 italic">{customQuestions[step-1].text}</h2>
                {customQuestions[step-1].type === "rating" ? (
                  <RatingOptions onSelect={handleNext} />
                ) : (
                  <div className="space-y-6">
                    <textarea 
                      rows={5}
                      value={answers[step] || ""}
                      onChange={(e) => setAnswers({...answers, [step]: e.target.value})}
                      className="w-full bg-white border-3 border-black p-5 rounded-2xl font-bold outline-none focus:bg-[#F9C11C]/5 shadow-[6px_6px_0px_#000]"
                      placeholder="こちらにご入力ください..."
                    />
                    <button onClick={() => handleNext(answers[step])} className="w-full bg-black text-white p-6 rounded-2xl font-black text-xl shadow-[8px_8px_0px_#F9C11C] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all">
                      次へ進む
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* 着地画面（高評価/低評価） */
              <div className="animate-in zoom-in-95 duration-500 space-y-8">
                {totalRating >= minStarsForGoogle ? (
                  <>
                    <div className="text-center">
                      <div className="w-20 h-20 bg-black rounded-[2rem] flex items-center justify-center text-4xl mx-auto mb-6 shadow-[8px_8px_0px_#F9C11C]">✨</div>
                      <h2 className="text-3xl font-black italic">高評価ありがとうございます！</h2>
                      <p className="text-gray-400 font-bold text-xs mt-4 leading-relaxed">AIが作成した文章をGoogle口コミに投稿しませんか？</p>
                    </div>
                    <div className="relative bg-white border-3 border-black rounded-[2rem] p-5 shadow-[8px_8px_0px_#000]">
                      <textarea value={comment} onChange={(e) => setComment(e.target.value)} className="w-full h-32 bg-transparent font-bold text-sm outline-none resize-none leading-relaxed" placeholder="AIでおまかせ、またはこちらに入力..." />
                      {isGenerating && <div className="absolute inset-0 bg-white/90 rounded-[2rem] flex flex-col items-center justify-center gap-2"><div className="w-6 h-6 border-4 border-black border-t-[#F9C11C] rounded-full animate-spin"></div></div>}
                    </div>
                    <div className="grid gap-4">
                      <button onClick={generateAiComment} className={`${brandYellow} border-3 border-black p-5 rounded-2xl font-black shadow-[6px_6px_0px_#000] active:scale-95 transition-all`}>
                        {comment ? '🔄 再生成する' : '✨ AIに文章作成を任せる'}
                      </button>
                      <button 
                        disabled={isSubmitting}
                        onClick={() => submitSurvey(comment)}
                        className="bg-black text-white p-6 rounded-2xl font-black text-xl shadow-[8px_8px_0px_#F9C11C] disabled:opacity-50"
                      >
                        {isSubmitting ? '送信中...' : 'Google口コミを投稿する'}
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-10 bg-white border-4 border-black rounded-[3rem] p-8 shadow-[12px_12px_0px_#000]">
                    <div className="w-20 h-20 bg-white rounded-[2rem] flex items-center justify-center text-4xl mx-auto mb-8 border-3 border-black shadow-[8px_8px_0px_#E0E0E0]">✉️</div>
                    <h2 className="text-2xl font-black italic mb-6">貴重なご意見を<br/>ありがとうございます。</h2>
                    <p className="text-gray-500 font-bold text-sm leading-relaxed mb-10 px-4">サービスの改善に努めさせていただきます。</p>
                    <button 
                      disabled={isSubmitting}
                      onClick={() => submitSurvey(answers[2] || "")} 
                      className="w-full bg-black text-white p-6 rounded-2xl font-black text-xl shadow-[8px_8px_0px_#F9C11C] disabled:opacity-50"
                    >
                      {isSubmitting ? '送信中...' : '送信して終了'}
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