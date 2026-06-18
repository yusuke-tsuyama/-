import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";
import { CLAUDE_MODEL } from "@/lib/constants";

const client = new Anthropic();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const SYSTEM_PROMPT_DIAGNOSIS = `あなたは日本語文章の診断専門家です。
以下の5点のみを診断し、JSONで返してください。説明文は不要です。

【診断基準】

1. 修飾の順序と距離
   NG: 長い修飾語が短い修飾語の後にある（逆順）
   NG: 節より句が先にある
   NG: 修飾語と被修飾語が3語以上離れている
   NG: 入れ子が3重以上で述語が埋没している
   NG: 「〜の〜の〜の〜の」と「の」が3回以上連続し修飾関係が不明
   NG: 修飾節の主語が「が」ではなく「は」になっている
   OK: 長→短、節→句の順。修飾語と被修飾語が直結している

2. 読点の位置
   NG: 接続詞（「しかし」「なぜなら」「だから」「また」「ただし」等）の直後にテンがない
   NG: 副詞的語句（「まず」「次に」「一方」「実は」等）の直後にテンがない
   NG: 逆順修飾語（短→長の順）の境界にテンがない
   NG: 重文（述語が2つある文）の境目にテンがない
   NG: 挿入句の前後にテンがない
   NG: テンが多すぎて思想の単位が不明確（1文に5個以上など）
   OK: 接続詞・副詞的語句の直後、逆順境界、重文境目、挿入句前後のみ

3. 一文の長さ
   NG: 句読点なしで80字超
   NG: 接続助詞（て・が・し・けど）が3回以上連続
   NG: 「〜ました。〜ました。」など同じ語尾が3文以上連続
   NG: 体言止めが3文以上連続
   OK: 1文60字以内目安。語尾・文末表現に変化がある

4. 指示語
   NG: 指示語（「これ」「それ」「この」「その」等）の指示対象が直前の文にない
   NG: 段落をまたいで指示語を使っている
   OK: 指示対象が直前文に明示されている

5. 重複・接続詞の濫用
   NG: 同一接続詞（「しかし」「また」「そして」等）が2文連続
   NG: 接続助詞「が」が1文中に2回以上、または連文で連続
   NG: 同じ語句・表現の無意識な繰り返し
   NG: 一文に「は」が3回以上登場し文の骨格が不明瞭
   OK: 接続詞・表現に適度な変化がある

【出力形式】JSONのみ。説明文不要。
{"score":0-100,"checks":[{"name":"...","status":"OK|注意|要修正","issue":"具体的な該当箇所","reason":"理由"}]}`;

const SYSTEM_PROMPT_REWRITE = `あなたは日本語文章のリライト専門家です。
渡された診断結果をもとに文章を改善してください。

【リライト原則（本多勝一『日本語の作文技術』準拠）】
- 修飾語は長い順・節→句の順に並べる
- 修飾語と被修飾語を離さない。「の」の連打は解消する
- 修飾節の主語には「は」でなく「が」を使う
- 接続詞・副詞的語句の直後にテンをうつ（「しかし、」「まず、」）
- 逆順修飾・重文境目・挿入句の前後にテンをうつ
- 不要なテンは打たない
- 1文は60字以内を目安に。接続助詞の連打を避ける
- 同じ語尾・体言止めの連続を避ける
- 指示語は指示対象が直前にない場合は名詞に戻す
- 同一接続詞・接続助詞「が」の連続を避ける
- 「は」が1文に3回以上なら文を分割または「が」に置き換える

【保護ルール】
- 意図的と判断できる文体・リズムは変えない
- 口語・話し言葉はそのまま保つ
- 元の文字数±20%以内に収める

【パターン別指示】
■ simple：和語中心、短文、語気を維持
■ web：結論先行、箇条書き可、【】で強調
■ business：丁寧体、動詞で言い切る、名詞化禁止

【出力形式】JSONのみ。説明文不要。
{"simple":"...","web":"...","business":"..."}`;

export async function POST(req: NextRequest) {
  try {
    const { text, sessionId } = await req.json();

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "テキストが必要です" }, { status: 400 });
    }

    const diagnosisResponse = await client.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 1000,
      system: SYSTEM_PROMPT_DIAGNOSIS,
      messages: [{ role: "user", content: text }],
    });

    const diagnosisText = diagnosisResponse.content
      .filter((block): block is Anthropic.TextBlock => block.type === "text")
      .map((block) => block.text)
      .join("");

    let diagnosisResult: {
      score: number;
      checks: Array<{ name: string; status: string; issue: string; reason: string }>;
    };

    try {
      const cleanDiagnosis = diagnosisText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      diagnosisResult = JSON.parse(cleanDiagnosis);
    } catch {
      console.error("診断JSON parse失敗:", diagnosisText);
      return NextResponse.json({ error: "診断結果の解析に失敗しました" }, { status: 500 });
    }

    const rewriteResponse = await client.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 4000,
      system: SYSTEM_PROMPT_REWRITE,
      messages: [{
        role: "user",
        content: `元の文章：\n${text}\n\n診断結果：\n${JSON.stringify(diagnosisResult)}`,
      }],
    });

    const rewriteText = rewriteResponse.content
      .filter((block): block is Anthropic.TextBlock => block.type === "text")
      .map((block) => block.text)
      .join("");

    let rewriteResult: { simple: string; web: string; business: string };

    try {
      const cleanRewrite = rewriteText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      rewriteResult = JSON.parse(cleanRewrite);
    } catch {
      console.error("リライトJSON parse失敗:", rewriteText);
      return NextResponse.json({ error: "リライト結果の解析に失敗しました" }, { status: 500 });
    }

    const result = {
      score: diagnosisResult.score,
      checks: diagnosisResult.checks,
      rewrites: rewriteResult,
    };

    if (sessionId) {
      const { error: dbError } = await supabase.from("diagnoses").insert({
        session_id: sessionId,
        original_text: text,
        score: result.score,
        checks: result.checks,
        rewrites: result.rewrites,
        created_at: new Date().toISOString(),
      });
      if (dbError) {
        console.error("Supabase保存エラー:", dbError);
      }
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 });
  }
}
