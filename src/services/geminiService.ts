import { GoogleGenAI, Type } from "@google/genai";

export interface IkezuResult {
  omote: string;
  ura: string;
}

let aiInstance: GoogleGenAI | null = null;

function getAI() {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is missing");
    }
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
}

export async function convertToIkezu(input: string, level: number): Promise<IkezuResult> {
  console.log("Starting conversion for:", input, "at level:", level);
  
  try {
    const ai = getAI();
    const levelDescription = [
    "Lv1: やんわり（ほぼ褒め。一見すると100%善意に見えるが、深読みすると少し怖い）",
    "Lv2: じんわり（軽く皮肉。上品な言葉の中に、明確な違和感やトゲを忍ばせる）",
    "Lv3: しっかりいけず（意味がわかると刺さる。極めて上品だが、内容は痛烈な批判）"
  ][level - 1];

  const systemInstruction = `
あなたは京都の「いけず文化」を極めた、上品で知的な京都人です。
ユーザーが入力した率直・直接的・チクチクした発言を、京都風の遠回しで上品な嫌味表現（いけず）に変換してください。

# 目的
・相手を直接否定しない
・一見褒めているように見えるが、文脈的に皮肉が伝わる
・読んだ人が「ちょっと引っかかる」余白を残す

# ルール
・露骨な悪口は禁止
・ストレートな否定（例：ダメ、違う）は使わない
・必ず柔らかい言い回しにする
・関西弁ではなく「京都っぽい丁寧語」を使う
・語尾に「〜どすなぁ」「〜やろか」「〜はりますなぁ」などを適度に使う
・短く、上品にまとめる（1〜2文）
・「余白」を大切にし、説明しすぎない

# トーン調整
現在の嫌味レベル: ${levelDescription}

# 出力形式
JSON形式で返してください。
{
  "omote": "京都風の嫌味表現",
  "ura": "ユーザーの発言の本音を、ストレートな標準語で一言に要約したもの"
}
`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: input,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            omote: { type: Type.STRING },
            ura: { type: Type.STRING },
          },
          required: ["omote", "ura"],
        },
      },
    });

    return JSON.parse(response.text || "{}") as IkezuResult;
  } catch (e) {
    console.error("Failed to convert to Ikezu:", e);
    return {
      omote: "えらい賑やかなことでんなぁ（変換に失敗しました）",
      ura: e instanceof Error ? e.message : "不明なエラー"
    };
  }
}
