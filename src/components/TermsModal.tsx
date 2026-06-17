"use client";
import { useEffect, useState } from "react";

interface Props {
  onClose: () => void;
  initialTab?: "terms" | "privacy";
}

export default function TermsModal({ onClose, initialTab = "terms" }: Props) {
  const [activeTab, setActiveTab] = useState<"terms" | "privacy">(initialTab);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(26,26,46,0.5)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-2xl overflow-hidden"
        style={{ background: "white", maxHeight: "80vh", display: "flex", flexDirection: "column" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          <h2 className="font-display font-bold text-lg" style={{ color: "var(--ink)" }}>
            {activeTab === "terms" ? "利用規約" : "プライバシーポリシー"}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full text-lg"
            style={{ background: "var(--paper)", color: "var(--ink-muted)" }}
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="flex" style={{ borderBottom: "1px solid var(--border)", background: "var(--paper)" }}>
          {(["terms", "privacy"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="px-5 py-3 text-sm font-medium transition-colors"
              style={{
                borderBottom: activeTab === tab ? "2px solid var(--accent)" : "2px solid transparent",
                color: activeTab === tab ? "var(--accent)" : "var(--ink-muted)",
                background: "transparent",
              }}
            >
              {tab === "terms" ? "利用規約" : "プライバシーポリシー"}
            </button>
          ))}
        </div>

        {/* Body */}
        {activeTab === "terms" ? (
          <div className="overflow-y-auto px-6 py-5 space-y-5 text-sm" style={{ color: "var(--ink-soft)", lineHeight: 1.9 }}>
            <p style={{ color: "var(--ink-muted)", fontSize: "0.75rem" }}>最終更新日：2026年6月17日</p>

            <section>
              <h3 className="font-semibold mb-1" style={{ color: "var(--ink)" }}>第1条（サービスの目的）</h3>
              <p>本サービス「日本語クリアチェッカー」（以下「本サービス」）は、合同会社リベルダード（以下「当社」）が提供する日本語文章の診断・改善支援ツールです。ユーザーが入力した文章をAIが分析し、読みやすさの観点から改善提案を行うことを目的としています。</p>
            </section>

            <section>
              <h3 className="font-semibold mb-1" style={{ color: "var(--ink)" }}>第2条（利用条件）</h3>
              <p>本サービスは、以下の条件に同意した方がご利用いただけます。</p>
              <ul className="list-disc ml-5 mt-1 space-y-1">
                <li>個人情報・機密情報を含む文章の入力はご遠慮ください</li>
                <li>第三者の著作権を侵害するコンテンツの入力を禁止します</li>
                <li>違法・有害なコンテンツの入力を禁止します</li>
                <li>本サービスの診断結果を商業目的で無断転用することを禁止します</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold mb-1" style={{ color: "var(--ink)" }}>第3条（データの取り扱い）</h3>
              <p className="mb-2">ユーザーが入力した文章は、診断処理のため外部AI API（Anthropic Claude）に送信されます。各区分の詳細は以下のとおりです。</p>
              <div className="space-y-3">
                <div>
                  <p className="font-medium" style={{ color: "var(--ink)" }}>① 外部API送信</p>
                  <p>入力文章および診断処理に必要な情報を、Anthropic社が提供するClaude APIに送信します。送信されたデータはAnthropic社のプライバシーポリシーに従って処理されます。</p>
                </div>
                <div>
                  <p className="font-medium" style={{ color: "var(--ink)" }}>② 保存する情報</p>
                  <p>診断結果（スコア・評価・リライト案）および入力文章の先頭500文字は、サービス改善を目的として当社データベースに最大90日間保存されます。</p>
                </div>
                <div>
                  <p className="font-medium" style={{ color: "var(--ink)" }}>③ 保存しない情報</p>
                  <p>500文字を超える入力文章の後半部分、および個人を特定できる情報は保存しません。保存データは期間経過後に自動削除されます。</p>
                </div>
              </div>
            </section>

            <section>
              <h3 className="font-semibold mb-1" style={{ color: "var(--ink)" }}>第4条（AIの性質と利用範囲）</h3>
              <p className="mb-2">本サービスの診断はAI（Claude）によって行われます。以下の点をご理解のうえご利用ください。</p>
              <ul className="list-disc ml-5 mt-1 space-y-1">
                <li>診断結果は参考情報であり、正確性・完全性を保証するものではありません</li>
                <li>AIの判断には誤りや偏りが含まれる場合があります</li>
                <li>医療・法律・金融に関する専門的判断の代替としてご利用いただくことはできません</li>
                <li>最終的な文章の判断はユーザー自身が行ってください</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold mb-1" style={{ color: "var(--ink)" }}>第5条（免責事項）</h3>
              <p className="mb-2">当社は、本サービスの利用によって生じた損害について、責任を負いかねます。サービスは予告なく変更・停止される場合があります。</p>
              <p>医療・法律・金融・その他専門的な判断が必要な事項については、必ず該当分野の専門家にご相談ください。</p>
            </section>

            <section>
              <h3 className="font-semibold mb-1" style={{ color: "var(--ink)" }}>第6条（お問い合わせ）</h3>
              <p>本規約に関するお問い合わせは、合同会社リベルダードまでご連絡ください。</p>
            </section>
          </div>
        ) : (
          <div className="overflow-y-auto px-6 py-5 space-y-5 text-sm" style={{ color: "var(--ink-soft)", lineHeight: 1.9 }}>
            <p style={{ color: "var(--ink-muted)", fontSize: "0.75rem" }}>最終更新日：2026年6月17日</p>

            <section>
              <h3 className="font-semibold mb-1" style={{ color: "var(--ink)" }}>第1条（取得する情報）</h3>
              <p>本サービスでは、以下の情報を取得します。</p>
              <ul className="list-disc ml-5 mt-1 space-y-1">
                <li>ユーザーが入力した文章（診断処理のため）</li>
                <li>診断結果データ（スコア・評価・リライト案）</li>
                <li>サービス利用状況に関する匿名の統計情報</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold mb-1" style={{ color: "var(--ink)" }}>第2条（保存・非保存・Cookieについて）</h3>
              <div className="space-y-2">
                <p><span className="font-medium" style={{ color: "var(--ink)" }}>保存する情報：</span>診断結果および入力文章の先頭500文字を最大90日間保存します。</p>
                <p><span className="font-medium" style={{ color: "var(--ink)" }}>保存しない情報：</span>入力文章の500文字超の部分、パスワード、決済情報等の機密情報は保存しません。</p>
                <p><span className="font-medium" style={{ color: "var(--ink)" }}>Cookie：</span>本サービスでは、オンボーディング完了状態の管理にlocalStorageを使用します。第三者トラッキングCookieは使用しません。</p>
              </div>
            </section>

            <section>
              <h3 className="font-semibold mb-1" style={{ color: "var(--ink)" }}>第3条（外部APIへの送信）</h3>
              <p>入力文章は診断処理のためAnthropic社（米国）が提供するClaude APIに送信されます。送信データはAnthropic社のプライバシーポリシーに従って処理されます。APIへの送信は暗号化通信（HTTPS）で行われます。</p>
            </section>

            <section>
              <h3 className="font-semibold mb-1" style={{ color: "var(--ink)" }}>第4条（第三者への提供）</h3>
              <p>当社は、以下の場合を除き、取得した情報を第三者に提供しません。</p>
              <ul className="list-disc ml-5 mt-1 space-y-1">
                <li>ユーザーの同意がある場合</li>
                <li>法令に基づく場合</li>
                <li>サービス運営に必要な業務委託先への提供（守秘義務契約を締結した場合）</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold mb-1" style={{ color: "var(--ink)" }}>第5条（個人情報入力についての注意）</h3>
              <p>本サービスへのご利用にあたり、氏名・住所・電話番号・メールアドレス・マイナンバーなどの個人情報を入力しないようご注意ください。万が一、個人情報が含まれる文章を入力された場合でも、当社は当該情報の管理について責任を負いかねます。</p>
            </section>

            <section>
              <h3 className="font-semibold mb-1" style={{ color: "var(--ink)" }}>第6条（ポリシーの変更）</h3>
              <p>本プライバシーポリシーは、法令の改正やサービスの変更に伴い、予告なく変更される場合があります。変更後のポリシーはサービス上に掲載した時点で効力を生じます。定期的にご確認いただくことをお勧めします。</p>
            </section>

            <section>
              <h3 className="font-semibold mb-1" style={{ color: "var(--ink)" }}>第7条（お問い合わせ）</h3>
              <p>プライバシーポリシーに関するお問い合わせは、合同会社リベルダードまでご連絡ください。</p>
            </section>
          </div>
        )}

        {/* Footer */}
        <div
          className="px-6 py-4 flex justify-end"
          style={{ borderTop: "1px solid var(--border)" }}
        >
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl text-sm font-medium text-white"
            style={{ background: "var(--accent)" }}
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
}
