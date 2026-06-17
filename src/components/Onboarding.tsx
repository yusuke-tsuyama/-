"use client";

import { useEffect, useState } from "react";
import AppIcon from "./AppIcon";

type Phase = "splash" | "terms" | "tutorial" | "done";

const TUTORIAL_STEPS = [
  {
    icon: "✍️",
    title: "文章を入力する",
    desc: "チェックしたい日本語文章をテキストエリアに貼り付けます。3000字以内が目安です。サンプル文章も用意しています。",
    hint: "ビジネスメール、ブログ記事、レポートなど、どんな文章でもOKです。",
  },
  {
    icon: "🔍",
    title: "診断ボタンを押す",
    desc: "「文章を診断する」ボタンをクリックすると、AIが8つの観点から文章を分析します。10〜20秒ほどお待ちください。",
    hint: "係り受け・読点・主語述語の距離・重複表現など、プロの編集者視点でチェックします。",
  },
  {
    icon: "📊",
    title: "診断結果を確認する",
    desc: "100点満点のスコアと、各チェック項目の評価（OK／注意／要修正）が表示されます。「理由と修正例」も確認できます。",
    hint: "スコアが低くても大丈夫。文章の個性を活かしつつ、読みやすさを改善するための参考にしてください。",
  },
  {
    icon: "📝",
    title: "リライト案を活用する",
    desc: "「読みやすい版」「Web記事向け」「ビジネス文書版」の3種類のリライト案から選んで活用できます。コピーボタンですぐ使えます。",
    hint: "ヘッダーの「使い方」ボタンでいつでもこの画面を再表示できます。",
  },
];

interface Props {
  onComplete: () => void;
  mode?: "onboarding" | "tutorial-only";
}

export default function Onboarding({ onComplete, mode = "onboarding" }: Props) {
  const [phase, setPhase] = useState<Phase>(mode === "tutorial-only" ? "tutorial" : "splash");
  const [step, setStep] = useState(0);
  const [agreed, setAgreed] = useState(false);
  const [visible, setVisible] = useState(false);
  const [showTermsFull, setShowTermsFull] = useState(false);

  useEffect(() => {
    if (mode === "onboarding" && localStorage.getItem("nihongo_checker_onboarded")) {
      onComplete();
      return;
    }
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  // Auto-advance splash after 4s
  useEffect(() => {
    if (phase !== "splash") return;
    const t = setTimeout(() => setPhase("terms"), 4000);
    return () => clearTimeout(t);
  }, [phase]);

  const handleComplete = () => {
    if (mode === "onboarding") {
      localStorage.setItem("nihongo_checker_onboarded", "1");
    }
    setVisible(false);
    setTimeout(onComplete, 400);
  };

  const overlayStyle: React.CSSProperties = {
    position: "fixed",
    inset: 0,
    zIndex: 100,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "1rem",
    background: "rgba(26,26,46,0.6)",
    backdropFilter: "blur(8px)",
    opacity: visible ? 1 : 0,
    transition: "opacity 0.4s ease",
  };

  const cardStyle: React.CSSProperties = {
    background: "white",
    borderRadius: "1.5rem",
    width: "100%",
    maxWidth: 480,
    overflow: "hidden",
    boxShadow: "0 24px 64px rgba(26,26,46,0.18)",
    transform: visible ? "translateY(0)" : "translateY(24px)",
    transition: "transform 0.4s ease",
  };

  /* ─── SPLASH ─── */
  if (phase === "splash") {
    return (
      <div style={{ ...overlayStyle, background: "var(--ink)", backdropFilter: "none" }}>
        <div style={{ textAlign: "center", color: "white" }}>
          <div style={{ marginBottom: "1.5rem", animation: "splashPop 0.6s cubic-bezier(0.34,1.56,0.64,1) forwards" }}>
            <AppIcon size={72} />
          </div>
          <div className="font-display font-bold" style={{ fontSize: "1.6rem", letterSpacing: "0.04em", opacity: visible ? 1 : 0, transition: "opacity 0.6s ease 0.3s" }}>
            日本語クリアチェッカー
          </div>
          <div style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.5)", marginTop: "0.5rem", opacity: visible ? 1 : 0, transition: "opacity 0.6s ease 0.5s" }}>
            provided by 合同会社リベルダード
          </div>
          <div style={{ marginTop: "2rem", padding: "0.75rem 1.25rem", background: "rgba(255,255,255,0.08)", borderRadius: "0.75rem", maxWidth: 320, opacity: visible ? 1 : 0, transition: "opacity 0.6s ease 0.7s" }}>
            <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.4)", marginBottom: "0.4rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>更新履歴</div>
            <p style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.7)", lineHeight: 1.7, textAlign: "left" }}>
              <strong style={{ color: "rgba(255,255,255,0.9)" }}>2026年6月17日</strong>：診断のアルゴリズム変更及び操作画面の改修を行いました。
            </p>
          </div>
          <button
            onClick={() => setPhase("terms")}
            style={{ marginTop: "1.5rem", fontSize: "0.75rem", color: "rgba(255,255,255,0.4)", background: "none", border: "none", cursor: "pointer", textDecoration: "underline", opacity: visible ? 1 : 0, transition: "opacity 0.6s ease 1s" }}
          >
            スキップ
          </button>
        </div>
        <style>{`@keyframes splashPop { from { opacity:0; transform:scale(0.6); } to { opacity:1; transform:scale(1); } }`}</style>
      </div>
    );
  }

  /* ─── TERMS ─── */
  if (phase === "terms") {
    return (
      <div style={overlayStyle}>
        <div style={cardStyle}>
          {/* Header */}
          <div style={{ background: "var(--accent)", padding: "1.5rem", textAlign: "center" }}>
            <AppIcon size={36} />
            <div className="font-display font-bold" style={{ color: "white", fontSize: "1.1rem", marginTop: "0.75rem" }}>
              ご利用の前に
            </div>
          </div>

          {/* Body */}
          <div style={{ padding: "1.5rem", maxHeight: "55vh", overflowY: "auto" }}>
            {showTermsFull ? (
              <div style={{ fontSize: "0.8rem", color: "var(--ink-soft)", lineHeight: 1.9 }} className="space-y-4">
                <p style={{ color: "var(--ink-muted)", fontSize: "0.72rem" }}>最終更新日：2025年1月1日</p>
                <section>
                  <strong style={{ color: "var(--ink)", display: "block", marginBottom: 4 }}>第1条（目的）</strong>
                  本サービス「日本語クリアチェッカー」は、合同会社リベルダードが提供する日本語文章の診断・改善支援ツールです。
                </section>
                <section>
                  <strong style={{ color: "var(--ink)", display: "block", marginBottom: 4 }}>第2条（利用条件）</strong>
                  個人情報・機密情報を含む文章の入力はご遠慮ください。第三者の著作権を侵害するコンテンツ、違法・有害なコンテンツの入力を禁止します。
                </section>
                <section>
                  <strong style={{ color: "var(--ink)", display: "block", marginBottom: 4 }}>第3条（データの取り扱い）</strong>
                  入力された文章および診断結果は、サービス改善を目的として最大90日間保存される場合があります。個人を特定できる形での第三者への提供は行いません。
                </section>
                <section>
                  <strong style={{ color: "var(--ink)", display: "block", marginBottom: 4 }}>第4条（AIの性質）</strong>
                  診断はAI（Claude）によって行われます。結果は参考情報であり、正確性・完全性を保証するものではありません。
                </section>
                <section>
                  <strong style={{ color: "var(--ink)", display: "block", marginBottom: 4 }}>第5条（免責事項）</strong>
                  当社は、本サービスの利用によって生じた損害について、一切の責任を負いません。
                </section>
                <button onClick={() => setShowTermsFull(false)} style={{ color: "var(--accent)", fontSize: "0.8rem", textDecoration: "underline", background: "none", border: "none", cursor: "pointer" }}>
                  ▲ 閉じる
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <p style={{ fontSize: "0.85rem", color: "var(--ink-soft)", lineHeight: 1.8 }}>
                  「日本語クリアチェッカー」をご利用いただくにあたり、以下の点をご確認ください。
                </p>
                <ul style={{ fontSize: "0.82rem", color: "var(--ink-soft)", lineHeight: 1.9 }} className="space-y-2">
                  {[
                    "個人情報・機密情報を含む文章は入力しないでください。",
                    "入力文章はサービス改善のため最大90日間保存されます。",
                    "診断結果はAIによるものであり、参考情報としてご活用ください。",
                    "商業目的での無断転用はご遠慮ください。",
                  ].map((item, i) => (
                    <li key={i} style={{ display: "flex", gap: "0.5rem" }}>
                      <span style={{ color: "var(--accent)", flexShrink: 0 }}>✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <button onClick={() => setShowTermsFull(true)} style={{ color: "var(--accent)", fontSize: "0.8rem", textDecoration: "underline", background: "none", border: "none", cursor: "pointer" }}>
                  利用規約の全文を読む ▶
                </button>
              </div>
            )}
          </div>

          {/* Agree checkbox + button */}
          <div style={{ padding: "1rem 1.5rem 1.5rem", borderTop: "1px solid var(--border)" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "0.6rem", cursor: "pointer", marginBottom: "1rem" }}>
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                style={{ width: 18, height: 18, accentColor: "var(--accent)", cursor: "pointer" }}
              />
              <span style={{ fontSize: "0.85rem", color: "var(--ink)" }}>
                利用規約に同意する
              </span>
            </label>
            <button
              onClick={() => agreed && setPhase("tutorial")}
              disabled={!agreed}
              style={{
                width: "100%",
                padding: "0.75rem",
                borderRadius: "0.75rem",
                background: agreed ? "var(--accent)" : "var(--border)",
                color: agreed ? "white" : "var(--ink-muted)",
                fontWeight: 600,
                fontSize: "0.9rem",
                border: "none",
                cursor: agreed ? "pointer" : "not-allowed",
                transition: "all 0.2s",
              }}
            >
              同意して次へ →
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ─── TUTORIAL ─── */
  if (phase === "tutorial") {
    const current = TUTORIAL_STEPS[step];
    const isLast = step === TUTORIAL_STEPS.length - 1;

    return (
      <div style={overlayStyle}>
        <div style={cardStyle}>
          {/* Progress bar */}
          <div style={{ height: 4, background: "var(--border)" }}>
            <div style={{ height: "100%", background: "var(--accent)", width: `${((step + 1) / TUTORIAL_STEPS.length) * 100}%`, transition: "width 0.4s ease" }} />
          </div>

          {/* Step indicator */}
          <div style={{ display: "flex", justifyContent: "center", gap: "0.4rem", padding: "1rem 1.5rem 0" }}>
            {TUTORIAL_STEPS.map((_, i) => (
              <button
                key={i}
                onClick={() => setStep(i)}
                style={{
                  width: i === step ? 24 : 8,
                  height: 8,
                  borderRadius: 4,
                  background: i === step ? "var(--accent)" : i < step ? "var(--accent-mid)" : "var(--border)",
                  border: "none",
                  cursor: "pointer",
                  transition: "all 0.3s",
                  opacity: i <= step ? 1 : 0.5,
                }}
              />
            ))}
          </div>

          {/* Content */}
          <div style={{ padding: "1.5rem", textAlign: "left" }}>
            <div style={{ fontSize: "3rem", marginBottom: "1rem", lineHeight: 1 }}>{current.icon}</div>
            <div style={{ fontSize: "0.75rem", color: "var(--accent)", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "0.5rem" }}>
              STEP {step + 1} / {TUTORIAL_STEPS.length}
            </div>
            <h3 className="font-display font-bold" style={{ fontSize: "1.3rem", color: "var(--ink)", marginBottom: "0.75rem", textAlign: "left" }}>
              {current.title}
            </h3>
            <p style={{ fontSize: "0.875rem", color: "var(--ink-soft)", lineHeight: 1.8, marginBottom: "1rem", textAlign: "left" }}>
              {current.desc}
            </p>
            <div style={{ background: "var(--accent-light)", borderRadius: "0.75rem", padding: "0.75rem 1rem", fontSize: "0.8rem", color: "var(--accent)", lineHeight: 1.7, textAlign: "left" }}>
              💡 {current.hint}
            </div>
          </div>

          {/* Navigation */}
          <div style={{ padding: "1rem 1.5rem 1.5rem", display: "flex", gap: "0.75rem", borderTop: "1px solid var(--border)" }}>
            {step > 0 && (
              <button
                onClick={() => setStep(step - 1)}
                style={{ flex: 1, padding: "0.7rem", borderRadius: "0.75rem", background: "var(--paper)", color: "var(--ink-soft)", fontWeight: 600, fontSize: "0.875rem", border: "1px solid var(--border)", cursor: "pointer" }}
              >
                ← 戻る
              </button>
            )}
            <button
              onClick={() => isLast ? handleComplete() : setStep(step + 1)}
              style={{ flex: 2, padding: "0.7rem", borderRadius: "0.75rem", background: "var(--accent)", color: "white", fontWeight: 600, fontSize: "0.875rem", border: "none", cursor: "pointer" }}
            >
              {isLast ? "はじめる 🎉" : "次へ →"}
            </button>
          </div>

          {/* Skip */}
          <div style={{ textAlign: "center", paddingBottom: "1rem" }}>
            <button onClick={handleComplete} style={{ fontSize: "0.75rem", color: "var(--ink-muted)", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>
              スキップ
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
