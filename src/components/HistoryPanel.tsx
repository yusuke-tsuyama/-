"use client";
import { useEffect, useState } from "react";
import { fetchDiagnoses, DiagnosisRecord } from "@/lib/supabase";
import { AnalysisResult } from "@/types";

interface Props {
  onLoad: (result: AnalysisResult, text: string) => void;
  refreshTrigger: number;
  inModal?: boolean;
}

export default function HistoryPanel({ onLoad, refreshTrigger, inModal = false }: Props) {
  const [records, setRecords] = useState<DiagnosisRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const loadHistory = async () => {
    setLoading(true);
    setError(null);
    const { data, error: err } = await fetchDiagnoses();
    if (err) {
      setError("履歴の取得に失敗しました。");
      console.error(err);
    } else {
      setRecords((data as DiagnosisRecord[]) || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (inModal || open) loadHistory();
  }, [open, refreshTrigger, inModal]);

  const scoreColor = (s: number) =>
    s >= 80 ? "var(--ok)" : s >= 60 ? "var(--warn)" : "var(--error)";

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:${String(d.getMinutes()).padStart(2, "0")}`;
  };

  const listContent = (
    <>
      {loading ? (
        <div className="p-5 text-sm text-center" style={{ color: "var(--ink-muted)" }}>読み込み中...</div>
      ) : error ? (
        <div className="p-5 text-sm text-center" style={{ color: "var(--error)" }}>⚠️ {error}</div>
      ) : records.length === 0 ? (
        <div className="p-8 text-sm text-center" style={{ color: "var(--ink-muted)" }}>
          <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>📭</div>
          まだ診断履歴がありません。
        </div>
      ) : (
        <div className="divide-y" style={{ borderColor: "var(--border)" }}>
          {records.map((rec) => (
            <button
              key={rec.id}
              className="w-full text-left px-5 py-3 transition-colors flex items-center gap-3"
              style={{ background: "transparent" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--paper)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              onClick={() => {
                try {
                  const result = JSON.parse(rec.result_json) as AnalysisResult;
                  onLoad(result, rec.input_text);
                } catch {
                  alert("履歴の読み込みに失敗しました。");
                }
              }}
            >
              <span className="font-display font-bold text-sm flex-shrink-0 w-10 text-center" style={{ color: scoreColor(rec.score) }}>
                {rec.score}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-xs truncate" style={{ color: "var(--ink)" }}>{rec.input_text.slice(0, 40)}…</p>
                <p className="text-xs mt-0.5" style={{ color: "var(--ink-muted)" }}>{rec.summary.slice(0, 30)}…</p>
              </div>
              <span className="text-xs flex-shrink-0 font-mono" style={{ color: "var(--ink-muted)" }}>
                {rec.created_at ? formatDate(rec.created_at) : ""}
              </span>
            </button>
          ))}
        </div>
      )}
    </>
  );

  if (inModal) return listContent;

  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid var(
