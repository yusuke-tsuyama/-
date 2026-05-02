"use client";

import { useState, useEffect } from "react";
import { AnalysisResult } from "@/types";
import { getSupabaseTable } from "@/lib/supabase";
import AppIcon from "@/components/AppIcon";
import ScoreRing from "@/components/ScoreRing";
import CheckCard from "@/components/CheckCard";
import RewritePanel from "@/components/RewritePanel";
import HistoryPanel from "@/components/HistoryPanel";
import TermsModal from "@/components/TermsModal";
import Onboarding from "@/components/Onboarding";

const MAX_CHARS = 3000;


const SAMPLE_TEXT = `私が昨日、友人から聞いた話によると、最近、都市部において、特に若い世代を中心に、読書離れが急速に進んでいるということです。これは非常に深刻な問題だと思います。本を読まないということは、語彙力が低下するということです。語彙力が低下すると、思考力も低下します。思考力が低下すると、様々な問題が発生します。このような問題を解決するためには、学校教育の場において、読書を推進する取り組みを積極的に行っていく必要があると考えられます。`;

function LoadingCard() {
  return <div className="rounded-xl p-4 shimmer" style={{ height: 80 }} />;
}

export default function HomePage() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showTerms, setShowTerms] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [historyRefresh, setHistoryRefresh] = useState(0);
  const [saved, setSaved] = useState(false);
  const [onboardingMode, setOnboardingMode] = useState<"onboarding" | "tutorial-only" | null>("onboarding");

  const handleOnboardingComplete = () => {
    setOnboardingMode(null);
  };

  const handleAnalyze = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const res = await fetch("/api/analyze-writing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "エラーが発生しました。");

      const analysisResult = data as AnalysisResult;
      setResult(analysisResult);

      const table = getSupabaseTable("diagnoses");
      if (table) {
        await table.insert({
          input_text: text.slice(0, 500),
          score: analysisResult.score,
          summary: analysisResult.summary,
          result_json: JSON.stringify(analysisResult),
        });
      }
      setHistoryRefresh((n) => n + 1);

      setTimeout(() => {
        document.getElementById("results")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "エラーが発生しました。");
    } finally {
      setLoading(false);
    }
  };

  const handleLoadHistory = (loadedResult: AnalysisResult, loadedText: string) => {
    setResult(loadedResult);
    setText(loadedText);
    setShowHistory(false);
    setTimeout(() => {
      document.getElementById("results")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };


  const handleSave = async () => {
    if (!result || !text) return;
    const table = getSupabaseTable("diagnoses");
    if (!table) {
      alert("Supabaseが設定されていません。");
      return;
    }
    await table.insert({
      input_text: text.slice(0, 500),
      score: result.score,
      summary: result.summary,
      result_json: JSON.stringify(result),
    });
    setSaved(true);
    setHistoryRefresh((n) => n + 1);
    setTimeout(() => setSaved(false), 3000);
  };

  const charCount = text.length;
  const overLimit = charCount > MAX_CHARS;

  return (
    <div style={{ minHeight: "100vh", background: "var(--paper)" }}>
      {/* Onboarding overlay */}
      {onboardingMode && (
        <Onboarding mode={onboardingMode} onComplete={handleOnboardingComplete} />
      )}

      {/* Terms modal */}
      {showTerms && <TermsModal onClose={() => setShowTerms(false)} />}

      {/* History modal */}
      {showHistory && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          style={{ background: "rgba(26,26,46,0.5)", backdropFilter: "blur(4px)" }}
          onClick={() => setShowHistory(false)}
        >
          <div
            className="w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl overflow-hidden"
            style={{ background: "white", maxHeight: "80vh", display: "flex", flexDirection: "column" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
              <h2 className="font-display font-bold" style={{ color: "var(--ink)" }}>診断履歴</h2>
              <button onClick={() => setShowHistory(false)} className="w-8 h-8 flex items-center justify-center rounded-full" style={{ background: "var(--paper)", color: "var(--ink-muted)" }}>✕</button>
            </div>
            <div className="overflow-y-auto flex-1">
              <HistoryPanel onLoad={handleLoadHistory} refreshTrigger={historyRefresh} inModal />
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header style={{ borderBottom: "1px solid var(--border)", background: "white", position: "sticky", top: 0, zIndex: 40 }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 flex items-center justify-between" style={{ height: 60 }}>
          <div className="flex items-center gap-2.5">
            <AppIcon size={28} />
            <span className="font-display font-bold" style={{ color: "var(--ink)", fontSize: "1rem", letterSpacing: "0.02em" }}>
              日本語クリアチェッカー
            </span>
          </div>
          <div className="flex items-center gap-2">
            {/* Tutorial button */}
            <button
              onClick={() => setOnboardingMode("tutorial-only")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
              style={{ background: "var(--paper)", color: "var(--ink-soft)", border: "1px solid var(--border)" }}
            >
              💡 使い方
            </button>
            {/* History button */}
            <button
              onClick={() => setShowHistory(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
              style={{ background: "var(--paper)", color: "var(--ink-soft)", border: "1px solid var(--border)" }}
            >
              🕐 履歴
            </button>
            <span className="text-xs px-2 py-1 rounded-full hidden sm:block" style={{ background: "var(--accent-light)", color: "var(--accent)" }}>Beta</span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-6">
        {/* Hero */}
        <div className="text-center space-y-3 py-4">
          <div className="flex justify-center mb-3">
            <AppIcon size={52} />
          </div>
          <h1 className="font-display font-bold" style={{ fontSize: "clamp(1.6rem, 4vw, 2.2rem)", color: "var(--ink)", letterSpacing: "-0.01em" }}>
            文章を、もっと伝わる形に。
          </h1>
          <p className="text-sm leading-relaxed max-w-xl mx-auto" style={{ color: "var(--ink-muted)" }}>
            係り受け・読点・主語と述語の距離・重複表現・あいまいな指示語をチェックし、読みやすい文章に整えます。
          </p>
        </div>

        {/* Input */}
        <div className="rounded-2xl overflow-hidden" style={{ background: "white", border: "1px solid var(--border)", boxShadow: "0 1px 4px var(--shadow)" }}>
          <div className="p-4 sm:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium" style={{ color: "var(--ink)" }}>
                診断したい文章を貼り付けてください
              </label>
              <button onClick={() => setText(SAMPLE_TEXT)} className="text-xs px-3 py-1 rounded-full" style={{ background: "var(--accent-light)", color: "var(--accent)", border: "1px solid #c7d9fb" }}>
                サンプルを使う
              </button>
            </div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="ここに文章を入力してください..."
              className="w-full rounded-xl resize-none text-sm leading-relaxed p-4 outline-none"
              style={{ minHeight: 200, background: "var(--paper)", border: `1.5px solid ${overLimit ? "var(--error)" : "var(--border)"}`, color: "var(--ink)", fontFamily: "var(--font-sans)" }}
              rows={10}
            />
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono" style={{ color: overLimit ? "var(--error)" : "var(--ink-muted)" }}>
                {charCount.toLocaleString()} / {MAX_CHARS.toLocaleString()} 文字
              </span>
              <button
                onClick={handleAnalyze}
                disabled={loading || !text.trim() || overLimit}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium text-white"
                style={{ background: loading || !text.trim() || overLimit ? "var(--ink-muted)" : "var(--accent)", cursor: loading || !text.trim() || overLimit ? "not-allowed" : "pointer" }}
              >
                {loading ? (
                  <><span className="inline-block w-4 h-4 rounded-full border-2 border-white border-t-transparent" style={{ animation: "spin 0.7s linear infinite" }} />診断中...</>
                ) : <>🔍 文章を診断する</>}
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="rounded-xl p-4 text-sm" style={{ background: "var(--error-bg)", color: "var(--error)", border: "1px solid #fca5a5" }}>
            ⚠️ {error}
          </div>
        )}

        {(loading || result) && (
          <div id="results" className="space-y-8">
            <div className="rounded-2xl p-6 sm:p-8" style={{ background: "white", border: "1px solid var(--border)", boxShadow: "0 1px 4px var(--shadow)" }}>
              {loading ? (
                <div className="flex items-center gap-6">
                  <div className="w-36 h-36 rounded-full shimmer flex-shrink-0" />
                  <div className="flex-1 space-y-3">
                    <div className="h-5 shimmer rounded-lg w-3/4" />
                    <div className="h-4 shimmer rounded-lg w-1/2" />
                  </div>
                </div>
              ) : result ? (
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                  <div className="flex-shrink-0"><ScoreRing score={result.score} /></div>
                  <div className="flex-1 text-center sm:text-left">
                    <h2 className="font-display font-bold mb-2" style={{ fontSize: "1.2rem", color: "var(--ink)" }}>総合評価</h2>
                    <p style={{ color: "var(--ink-soft)", lineHeight: 1.8 }}>{result.summary}</p>
                    <div className="flex flex-wrap gap-2 mt-4 justify-center sm:justify-start">
                      {(["OK", "注意", "要修正"] as const).map((s) => {
                        const count = result.checks.filter((c) => c.status === s).length;
                        if (count === 0) return null;
                        const colors = { OK: { bg: "var(--ok-bg)", text: "var(--ok)" }, 注意: { bg: "var(--warn-bg)", text: "var(--warn)" }, 要修正: { bg: "var(--error-bg)", text: "var(--error)" } };
                        return <span key={s} className="text-xs px-3 py-1 rounded-full font-medium" style={{ background: colors[s].bg, color: colors[s].text }}>{s} {count}件</span>;
                      })}
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            <div>
              <h2 className="font-display font-bold mb-4" style={{ fontSize: "1.1rem", color: "var(--ink)" }}>チェック項目</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {loading ? Array.from({ length: 8 }).map((_, i) => <LoadingCard key={i} />) : result?.checks.map((item, i) => <CheckCard key={item.name} item={item} index={i} />)}
              </div>
            </div>

            {result?.rewrites && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-display font-bold" style={{ fontSize: "1.1rem", color: "var(--ink)" }}>リライト案</h2>
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium transition-all"
                    style={{
                      background: saved ? "var(--ok-bg)" : "var(--accent-light)",
                      color: saved ? "var(--ok)" : "var(--accent)",
                      border: `1px solid ${saved ? "var(--ok)" : "#c7d9fb"}`,
                    }}
                  >
                    {saved ? "✓ 保存しました" : "💾 履歴に保存する"}
                  </button>
                </div>
                <RewritePanel rewrites={result.rewrites} />
              </div>
            )}

            {loading && <div className="rounded-2xl p-6 shimmer" style={{ height: 200, border: "1px solid var(--border)" }} />}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-20 py-8 text-center text-xs space-y-2" style={{ color: "var(--ink-muted)", borderTop: "1px solid var(--border)" }}>
        <div className="flex items-center justify-center gap-1 mb-1">
          <AppIcon size={16} />
          <span className="font-display font-medium" style={{ color: "var(--ink-soft)" }}>日本語クリアチェッカー</span>
        </div>
        <p>© {new Date().getFullYear()} 合同会社リベルダード. All rights reserved.</p>
        <p>
          <button onClick={() => setShowTerms(true)} className="underline underline-offset-2 hover:opacity-70 transition-opacity">利用規約</button>
          {" · "}
          <button onClick={() => setOnboardingMode("tutorial-only")} className="underline underline-offset-2 hover:opacity-70 transition-opacity">使い方</button>
          {" · "}Powered by Claude AI
        </p>
      </footer>

      <style jsx global>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
