import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `あなたは日本語文章の専門家です。ユーザーが入力した日本語文を以下の観点から診断し、必ずJSONのみで返答してください。マークダウンのコードブロックや説明文は一切含めないでください。

【診断ルール】
1. 係り受けの分かりやすさ：修飾語と被修飾語をなるべく近づける
2. 主語と述語の距離：主語と述語を離しすぎない
3. 読点の位置：意味の切れ目に読点を置く
4. 一文の長さ：一文に複数の意味を詰め込みすぎない
5. 指示語の明確さ：「これ」「それ」「この」「その」等が何を指すか明確にする
6. 重複表現：同じ意味の言い換えや不要な繰り返しを指摘する
7. 文の順序：重要な語を文末近くでぼかさない、読者が一度で意味を取れる語順にする
8. 読みやすさ：文章全体の流れが具体→解釈→主張になっているか

【重要な注意点】
- 文章の個性を消しすぎないこと
- 過度な指摘は避け、本当に問題のある箇所のみを指摘する
- 各statusは「OK」「注意」「要修正」のいずれか

【リライトの絶対ルール】
- リライトは元の文章と必ず同程度の長さ・ボリュームにすること。短く要約・圧縮することを禁止する
- 元の文章の全段落・全見出し・全論点を漏らさず含めること
- 内容を削除・省略することを禁止する
- 元の文章が長い場合も、その長さに完全に対応したリライトを出力すること
- 元の文章に見出し（【】など）がある場合は、リライトにも同様の見出しを維持すること

返すJSONの形式：
{
  "score": 数値(0-100),
  "summary": "全体評価の一言コメント",
  "checks": [
    {
      "name": "係り受けの分かりやすさ",
      "status": "OK" | "注意" | "要修正",
      "issue": "指摘内容（OKの場合は問題なしの旨）",
      "reason": "修正理由（OKの場合は評価理由）",
      "example": "修正例または良い点の例示"
    },
    {
      "name": "主語と述語の距離",
      "status": "OK" | "注意" | "要修正",
      "issue": "指摘内容",
      "reason": "修正理由",
      "example": "修正例"
    },
    {
      "name": "読点の位置",
      "status": "OK" | "注意" | "要修正",
      "issue": "指摘内容",
      "reason": "修正理由",
      "example": "修正例"
    },
    {
      "name": "一文の長さ",
      "status": "OK" | "注意" | "要修正",
      "issue": "指摘内容",
      "reason": "修正理由",
      "example": "修正例"
    },
    {
      "name": "指示語の明確さ",
      "status": "OK" | "注意" | "要修正",
      "issue": "指摘内容",
      "reason": "修正理由",
      "example": "修正例"
    },
    {
      "name": "重複表現",
      "status": "OK" | "注意" | "要修正",
      "issue": "指摘内容",
      "reason": "修正理由",
      "example": "修正例"
    },
    {
      "name": "文の順序",
      "status": "OK" | "注意" | "要修正",
      "issue": "指摘内容",
      "reason": "修正理由",
      "example": "修正例"
    },
    {
      "name": "読みやすさ",
      "status": "OK" | "注意" | "要修正",
      "issue": "指摘内容",
      "reason": "修正理由",
      "example": "修正例"
    }
  ],
  "rewrites": {
    "simple": "読みやすい版（元の文章の構成・段落・見出しをすべて維持しながら、自然な日本語に整えた完全版。元の文字数と同程度のボリュームを保つこと）",
    "web": "Web記事向け版（元の文章の内容・構成をすべて維持しながら、見出しや段落を活用してスキャンしやすく整えた完全版。元の文字数と同程度のボリュームを保つこと）",
    "business": "硬めのビジネス文書版（元の文章の構成・内容をすべて維持しながら、丁寧で格調ある表現に整えた完全版。元の文字数と同程度のボリュームを保つこと）"
  }
}`;

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "テキストが入力されていません。" }, { status: 400 });
    }

    if (text.length > 4000) {
      return NextResponse.json({ error: "文字数が多すぎます（3000字以内でお願いします）。" }, { status: 400 });
    }

    const message = await client.messages.create({
      model: "claude-opus-4-5-20251101",
      max_tokens: 8000,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `以下の文章を診断してください。元の文章の文字数は${text.length}字です。リライト案は必ず同程度のボリュームで出力してください：\n\n${text}`,
        },
      ],
    });

    const rawText = message.content
      .filter((b) => b.type === "text")
      .map((b) => (b as { type: "text"; text: string }).text)
      .join("");

    // Strip markdown code fences if present
    const cleaned = rawText.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/i, "").trim();

    let result;
    try {
      result = JSON.parse(cleaned);
    } catch {
      return NextResponse.json({ error: "診断結果の解析に失敗しました。もう一度お試しください。" }, { status: 500 });
    }

    return NextResponse.json(result);
  } catch (err: unknown) {
    console.error("Analysis error:", err);
    const message = err instanceof Error ? err.message : "不明なエラーが発生しました。";
    return NextResponse.json({ error: `エラーが発生しました: ${message}` }, { status: 500 });
  }
}
