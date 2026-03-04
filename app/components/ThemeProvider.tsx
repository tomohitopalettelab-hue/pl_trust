'use client';

import React, { createContext, useContext, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { THEMES } from './themes';
import { usePathname, useSearchParams } from 'next/navigation';

type ThemeContextType = {
  theme: typeof THEMES.standard;
  changeTheme: (key: string) => void;
};

const ThemeContext = createContext<ThemeContextType>({
  theme: THEMES.standard,
  changeTheme: () => {},
});

// テーマごとのCSS変数定義
const THEME_COLORS: Record<string, React.CSSProperties> = {
  standard: {
    '--theme-primary': '#F9C11C',       // アクセントカラー（黄色）
    '--theme-on-primary': '#000000',    // ボタン上の文字色
    '--theme-bg': '#FFFFFF',            // 全体の背景
    '--theme-text': '#1A1A1A',          // メイン文字色
    '--theme-card-bg': '#FFFFFF',       // カード背景
    '--theme-border': '#000000',        // ボーダー色
  } as React.CSSProperties,
  minimal: {
    '--theme-primary': '#000000',
    '--theme-on-primary': '#FFFFFF',
    '--theme-bg': '#FFFFFF',
    '--theme-text': '#4B5563',
    '--theme-card-bg': '#F9FAFB',
    '--theme-border': '#E5E7EB',
  } as React.CSSProperties,
  feminine: {
    '--theme-primary': '#FFB7C5',       // パステルピンク
    '--theme-on-primary': '#5D3A3A',
    '--theme-bg': '#FFF0F5',            // ラベンダーブラッシュ
    '--theme-text': '#5D3A3A',
    '--theme-card-bg': '#FFFFFF',
    '--theme-border': '#FFB7C5',
  } as React.CSSProperties,
  dark: {
    '--theme-primary': '#D4AF37',       // ゴールド
    '--theme-on-primary': '#000000',
    '--theme-bg': '#222222',            // 真っ黒回避（ダークグレー）
    '--theme-text': '#E0E0E0',
    '--theme-card-bg': '#2C2C2C',       // カードも少し明るく
    '--theme-border': '#666666',
  } as React.CSSProperties,
  pop: {
    '--theme-primary': '#3B82F6',       // ブルー
    '--theme-on-primary': '#FFFFFF',
    '--theme-bg': '#EFF6FF',
    '--theme-text': '#1E3A8A',
    '--theme-card-bg': '#FFFFFF',
    '--theme-border': '#3B82F6',
  } as React.CSSProperties,
};

export const useTheme = () => useContext(ThemeContext);

function getCustomerIdFromParams(params: URLSearchParams) {
  return params.get('customerId') || params.get('customer') || '';
}

function getStoredThemeKey(customerId: string) {
  if (typeof window === 'undefined') {
    return 'standard';
  }
  const scopedKey = customerId ? window.localStorage.getItem(`themeKey:${customerId}`) : null;
  const defaultKey = window.localStorage.getItem('themeKey:default');
  const candidate = scopedKey || defaultKey || 'standard';
  return THEMES[candidate] ? candidate : 'standard';
}

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [themeKey, setThemeKey] = useState<string>('standard');
  const lastManualChangeRef = useRef(0);

  useLayoutEffect(() => {
    const customerId = getCustomerIdFromParams(searchParams);
    const cachedThemeKey = getStoredThemeKey(customerId);
    if (THEMES[cachedThemeKey]) {
      setThemeKey(cachedThemeKey);
    }
  }, [pathname, searchParams]);

  useEffect(() => {
    let isActive = true;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, 5000);

    const currentManualVersion = lastManualChangeRef.current;
    const customerId = getCustomerIdFromParams(searchParams);
    const url = customerId
      ? `/api/settings?customerId=${encodeURIComponent(customerId)}`
      : '/api/settings';

    const fetchSettings = async () => {
      try {
        const res = await fetch(url, { signal: controller.signal });
        if (res.ok) {
          const data = await res.json();
          // 設定データは { settings: { themeName: '...' } } の形式
          const settings = data?.settings;
          if (
            isActive &&
            currentManualVersion === lastManualChangeRef.current &&
            settings?.themeName &&
            THEMES[settings.themeName]
          ) {
            setThemeKey(settings.themeName);
            if (customerId) {
              window.localStorage.setItem(`themeKey:${customerId}`, settings.themeName);
            } else {
              window.localStorage.setItem('themeKey:default', settings.themeName);
            }
          }
        }
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return;
        }
      } finally {
        clearTimeout(timeoutId);
      }
    };
    fetchSettings();

    return () => {
      isActive = false;
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [pathname, searchParams]);

  const theme = THEMES[themeKey] || THEMES.standard;
  const themeStyles = THEME_COLORS[themeKey] || THEME_COLORS.standard;

  const changeTheme = (key: string) => {
    if (THEMES[key]) {
      lastManualChangeRef.current += 1;
      setThemeKey(key);
      const customerId = getCustomerIdFromParams(searchParams);
      if (customerId) {
        window.localStorage.setItem(`themeKey:${customerId}`, key);
      } else {
        window.localStorage.setItem('themeKey:default', key);
      }
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, changeTheme }}>
      <div 
        id="theme-provider-root"
        className={`min-h-screen w-full ${theme.bg} ${theme.text} transition-colors duration-500`}
        style={themeStyles}
      >
        {children}
      </div>
    </ThemeContext.Provider>
  );
}