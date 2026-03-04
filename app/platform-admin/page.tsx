"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import LoadingSpinner from '../components/LoadingSpinner';

type CustomerAccount = {
  customerId: string;
  customerName: string;
  mainPagePath: string;
  createdAt: string;
  updatedAt: string;
};

type CustomerListItem = {
  customerId: string;
  customerName: string;
  mainPagePath: string;
  hasPassword: boolean;
  surveyCount: number;
  averageRating: number;
  lastResponseAt: string | null;
  currentSettings: Record<string, unknown> | null;
  surveyItems: Array<{ id: number; text: string; type: string }>;
};

type CreateAccountResponse = {
  ok: boolean;
  customerId: string;
  mainPagePath: string;
};

type CreateAccountErrorResponse = {
  error?: string;
};

export default function PlatformAdminPage() {
  const router = useRouter();
  const [authChecking, setAuthChecking] = useState(true);
  const [accounts, setAccounts] = useState<CustomerAccount[]>([]);
  const [loadingAccounts, setLoadingAccounts] = useState(true);
  const [customerList, setCustomerList] = useState<CustomerListItem[]>([]);
  const [loadingCustomerList, setLoadingCustomerList] = useState(true);
  const [baseUrl, setBaseUrl] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [newCustomerId, setNewCustomerId] = useState('');
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [savingAccount, setSavingAccount] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('platformAdminLoggedIn') === 'true';
    if (!isLoggedIn) {
      router.replace('/platform-admin/login');
      return;
    }
    setAuthChecking(false);
  }, [router]);

  useEffect(() => {
    setBaseUrl(window.location.origin);
  }, []);

  useEffect(() => {
    if (authChecking) {
      return;
    }

    const loadAccounts = async () => {
      setLoadingAccounts(true);
      try {
        const res = await fetch('/api/admin/customer-accounts');
        const data: CustomerAccount[] = await res.json();
        setAccounts(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('顧客アカウント取得に失敗しました:', error);
        setAccounts([]);
      } finally {
        setLoadingAccounts(false);
      }
    };

    loadAccounts();
  }, [authChecking]);

  useEffect(() => {
    if (authChecking) {
      return;
    }

    const loadCustomerList = async () => {
      setLoadingCustomerList(true);
      try {
        const res = await fetch('/api/admin/customers-list');
        const data: CustomerListItem[] = await res.json();
        setCustomerList(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('顧客一覧の取得に失敗しました:', error);
        setCustomerList([]);
      } finally {
        setLoadingCustomerList(false);
      }
    };

    loadCustomerList();
  }, [authChecking]);

  const filteredCustomerList = useMemo(() => {
    const keyword = searchKeyword.trim().toLowerCase();
    if (!keyword) return customerList;

    return customerList.filter((item) => {
      const idMatch = item.customerId.toLowerCase().includes(keyword);
      const nameMatch = (item.customerName || '').toLowerCase().includes(keyword);
      return idMatch || nameMatch;
    });
  }, [customerList, searchKeyword]);

  const refreshAccounts = async () => {
    const res = await fetch('/api/admin/customer-accounts');
    const data: CustomerAccount[] = await res.json();
    setAccounts(Array.isArray(data) ? data : []);
  };

  const refreshCustomerList = async () => {
    const res = await fetch('/api/admin/customers-list');
    const data: CustomerListItem[] = await res.json();
    setCustomerList(Array.isArray(data) ? data : []);
  };

  const handleSaveAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword) {
      alert('パスワードを入力してください');
      return;
    }

    setSavingAccount(true);
    try {
      const res = await fetch('/api/admin/customer-accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId: newCustomerId, customerName: newCustomerName, password: newPassword }),
      });

      const data: CreateAccountResponse | CreateAccountErrorResponse = await res.json();
      if (!res.ok) {
        throw new Error('error' in data ? data.error || '保存に失敗しました' : '保存に失敗しました');
      }

      await refreshAccounts();
      await refreshCustomerList();
      const createdCustomerId = (data as CreateAccountResponse).customerId;
      const createdMainPagePath = (data as CreateAccountResponse).mainPagePath;
      setNewCustomerId('');
      setNewCustomerName('');
      setNewPassword('');
      alert(`顧客を登録しました\nID: ${createdCustomerId}\nmain: ${createdMainPagePath}`);
    } catch (error) {
      alert(error instanceof Error ? error.message : '保存に失敗しました');
    } finally {
      setSavingAccount(false);
    }
  };

  const handleDeleteAccount = async (customerId: string) => {
    const ok = confirm(`顧客 ${customerId} を削除しますか？`);
    if (!ok) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/customer-accounts?customerId=${encodeURIComponent(customerId)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || '削除に失敗しました');
      }
      await refreshAccounts();
      await refreshCustomerList();
    } catch (error) {
      alert(error instanceof Error ? error.message : '削除に失敗しました');
    }
  };

  const handleCopyUrl = async (copyKey: string, url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedKey(copyKey);
      setTimeout(() => {
        setCopiedKey((prev) => (prev === copyKey ? null : prev));
      }, 1500);
    } catch (error) {
      alert('URLのコピーに失敗しました');
    }
  };

  if (authChecking) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-[var(--theme-bg)] text-[var(--theme-text)] p-6 md:p-10 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        <header>
          <p className="text-xs font-black uppercase tracking-widest text-[var(--theme-text)]/50">Platform Admin</p>
          <h1 className="text-3xl md:text-4xl font-black italic tracking-tight">顧客別データ管理</h1>
          <p className="text-sm font-bold text-[var(--theme-text)]/60 mt-2">顧客を選択すると、対象顧客の回答データを確認できます。</p>
        </header>

        <section className="bg-[var(--theme-card-bg)] border-[3px] border-[var(--theme-border)] rounded-[2rem] p-6 shadow-[8px_8px_0px_var(--theme-border)]">
          <h2 className="text-xl font-black italic mb-4">顧客ID / パスワード管理</h2>

          <form onSubmit={handleSaveAccount} className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
            <input
              type="text"
              value={newCustomerId}
              onChange={(e) => setNewCustomerId(e.target.value)}
              placeholder="顧客ID（空欄で自動生成）"
              className="bg-[var(--theme-bg)] border-2 border-[var(--theme-border)] rounded-xl px-4 py-3 font-black outline-none"
            />
            <input
              type="text"
              value={newCustomerName}
              onChange={(e) => setNewCustomerName(e.target.value)}
              placeholder="顧客名"
              className="bg-[var(--theme-bg)] border-2 border-[var(--theme-border)] rounded-xl px-4 py-3 font-black outline-none"
            />
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="password"
              className="bg-[var(--theme-bg)] border-2 border-[var(--theme-border)] rounded-xl px-4 py-3 font-black outline-none"
            />
            <button
              type="submit"
              disabled={savingAccount}
              className="bg-[var(--theme-primary)] text-[var(--theme-on-primary)] border-2 border-[var(--theme-border)] rounded-xl px-4 py-3 font-black disabled:opacity-60"
            >
              {savingAccount ? 'SAVING...' : 'ID/PWを保存'}
            </button>
          </form>

          {loadingAccounts ? (
            <p className="text-sm font-black text-[var(--theme-text)]/60">アカウント読み込み中...</p>
          ) : accounts.length === 0 ? (
            <p className="text-sm font-black text-[var(--theme-text)]/60">顧客アカウントが未登録です。</p>
          ) : (
            <div className="space-y-2">
              {accounts.map((account) => (
                <div key={account.customerId} className="bg-[var(--theme-bg)] border-2 border-[var(--theme-border)] rounded-xl px-4 py-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="font-black text-sm">{account.customerName || '（顧客名未設定）'}</p>
                    <p className="text-[10px] font-black text-[var(--theme-text)]/60">ID: {account.customerId}</p>
                    <p className="text-[10px] font-black text-[var(--theme-text)]/60">main: {account.mainPagePath}</p>
                    <p className="text-[10px] font-black text-[var(--theme-text)]/50">更新: {new Date(account.updatedAt).toLocaleString('ja-JP')}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteAccount(account.customerId)}
                    className="px-3 py-2 rounded-lg border-2 border-[var(--theme-border)] font-black text-xs"
                  >
                    削除
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="bg-[var(--theme-card-bg)] border-[3px] border-[var(--theme-border)] rounded-[2rem] p-6 shadow-[8px_8px_0px_var(--theme-border)]">
          <h2 className="text-xl font-black italic mb-4">顧客一覧（main / survey 提供情報）</h2>

          <div className="mb-4">
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="顧客IDまたは顧客名で検索"
              className="w-full md:w-[420px] bg-[var(--theme-bg)] border-2 border-[var(--theme-border)] rounded-xl px-4 py-3 font-black outline-none"
            />
          </div>

          {loadingCustomerList ? (
            <p className="text-sm font-black text-[var(--theme-text)]/60">顧客一覧を読み込み中...</p>
          ) : customerList.length === 0 ? (
            <p className="text-sm font-black text-[var(--theme-text)]/60">顧客情報がまだありません。</p>
          ) : filteredCustomerList.length === 0 ? (
            <p className="text-sm font-black text-[var(--theme-text)]/60">検索結果がありません。</p>
          ) : (
            <div className="space-y-3">
              {filteredCustomerList.map((item) => {
                const appName = String(item.currentSettings?.appName || item.customerName || '未設定');
                const themeName = String(item.currentSettings?.themeName || 'standard');
                const mapRule = String(item.currentSettings?.minStarsForGoogle || '4');
                const mainPath = item.mainPagePath || `/main?customerId=${encodeURIComponent(item.customerId)}`;
                const surveyPath = `/survey?customerId=${encodeURIComponent(item.customerId)}`;
                const mainUrl = `${baseUrl}${mainPath}`;
                const surveyUrl = `${baseUrl}${surveyPath}`;

                return (
                  <article key={item.customerId} className="bg-[var(--theme-bg)] border-2 border-[var(--theme-border)] rounded-xl p-4 space-y-3">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                      <div>
                        <p className="text-lg font-black">{item.customerName || '（顧客名未設定）'}</p>
                        <p className="text-[11px] font-black text-[var(--theme-text)]/50">顧客ID: {item.customerId}</p>
                      </div>
                      <div className="text-[11px] font-black text-[var(--theme-text)]/60">
                        PW: {item.hasPassword ? '設定済み（再設定可）' : '未設定'}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] font-black">
                      <p>main URL: {mainUrl || mainPath}</p>
                      <p>survey URL: {surveyUrl || surveyPath}</p>
                      <p>現在テーマ: {themeName}</p>
                      <p>Google誘導基準: ★{mapRule}以上</p>
                      <p>アプリ表示名: {appName}</p>
                      <p>回答数: {item.surveyCount} / 平均: {item.averageRating.toFixed(2)}</p>
                    </div>

                    <div className="text-[11px] font-black text-[var(--theme-text)]/70">
                      survey設問データ: {item.surveyItems.length > 0 ? item.surveyItems.map((q) => q.text).join(' / ') : '未設定'}
                    </div>

                    <div className="flex gap-2 flex-wrap">
                      <button
                        onClick={() => handleCopyUrl(`main:${item.customerId}`, mainUrl)}
                        className="px-3 py-2 rounded-lg border-2 border-[var(--theme-border)] font-black text-xs"
                      >
                        {copiedKey === `main:${item.customerId}` ? 'コピー済み！' : 'main URLをコピー'}
                      </button>
                      <button
                        onClick={() => handleCopyUrl(`survey:${item.customerId}`, surveyUrl)}
                        className="px-3 py-2 rounded-lg border-2 border-[var(--theme-border)] font-black text-xs"
                      >
                        {copiedKey === `survey:${item.customerId}` ? 'コピー済み！' : 'survey URLをコピー'}
                      </button>
                      <Link
                        href={`/platform-admin/customers/${encodeURIComponent(item.customerId)}`}
                        className="px-3 py-2 rounded-lg border-2 border-[var(--theme-border)] font-black text-xs"
                      >
                        詳細を見る
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
