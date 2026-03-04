"use client";

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import LoadingSpinner from '../components/LoadingSpinner';

function ThanksContent() {
  const searchParams = useSearchParams();
  const rating = Number(searchParams.get('rating') || 0);
  const customerId = searchParams.get('customerId') || searchParams.get('customer') || 'default';
  const [appSettings, setAppSettings] = useState<any>(null);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch(`/api/settings?customerId=${encodeURIComponent(customerId)}`);
        const data = await res.json();
        if (data) setAppSettings(data.settings);
      } catch (e) {
        console.error(e);
      }
    }
    fetchSettings();
  }, [customerId]);

  const brandYellow = "bg-[#F9C11C]";
  const isHighRating = rating >= Number(appSettings?.minStarsForGoogle || 4);

  return (
    <main className="w-full max-w-md bg-white border-4 border-black rounded-[3rem] p-12 shadow-[12px_12px_0px_#000] flex flex-col items-center text-center space-y-8 animate-in zoom-in-95 duration-500">
      
      <div className={`w-24 h-24 ${brandYellow} border-4 border-black rounded-full flex items-center justify-center text-5xl shadow-[6px_6px_0px_#000]`}>
        {isHighRating ? "✨" : "🙏"}
      </div>

      <div className="space-y-4">
        <h1 className="text-4xl font-black italic uppercase tracking-tighter">
          {isHighRating ? "THANK YOU!" : "MESSAGE"}
        </h1>
        <div className={`${brandYellow} inline-block px-4 py-1 transform -skew-x-12 border-2 border-black`}>
          <p className="text-xs font-black uppercase tracking-widest italic">
            {isHighRating ? "口コミへのご協力感謝します" : "アンケート完了"}
          </p>
        </div>
      </div>

      <p className="text-sm font-bold text-gray-600 leading-relaxed italic">
        {isHighRating 
          ? (appSettings?.thanksPageContent ?? "...")
          : (appSettings?.lowRatingMessage ?? "...")
        }
      </p>

      {/* ボタン類をすべて削除しました。これでアンケートフローが完結します。 */}
    </main>
  );
}

export default function ThanksPage() {
  return (
    <div className="min-h-screen bg-[#F4F4F4] text-black font-sans flex flex-col items-center justify-center p-6">
      <Suspense fallback={<LoadingSpinner />}>
        <ThanksContent />
      </Suspense>
      
      <footer className="mt-12 text-[10px] font-black text-gray-300 uppercase tracking-widest italic">
        Powered by PAL-TRUST System
      </footer>
    </div>
  );
}