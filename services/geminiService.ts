import { GoogleGenAI, Type } from "@google/genai";
import { StockData, TitanAnalysis, TitanVerdict } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

function safeJsonParse(text: string | undefined, fallback: any = []) {
  if (!text) return fallback;
  try {
    const cleanText = text.replace(/```json/g, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(cleanText);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch (e) {
    const trimmed = text.trim();
    if (trimmed.startsWith("[") && !trimmed.endsWith("]")) {
      try { return JSON.parse(trimmed + ']'); } catch { return fallback; }
    }
    return fallback;
  }
}

export async function analyzeStocks(stocks: StockData[]): Promise<TitanAnalysis[]> {
  const systemInstruction = `ACT AS: Senior Financial Analyst & Value Investor (Titan Mode).
Re-evaluate the assets based on these 3 STRICT TITAN RULES:

RULE 1: THE "ASSET PLAY" OVERRIDE
- IF (Market Price < 60% of NAV) AND (Debt is Low/Medium)
- SET VERDICT = "DEEP VALUE BUY". Logic: Trading below liquidation value.

RULE 2: THE "ONE-TIME GAIN" TRAP DETECTOR
- IF (P/E < 5) AND (EPS had a massive one-time jump like 300%+) BUT Revenue growth is stagnant.
- SET VERDICT = "TRAIN TRAP / AVOID". Logic: Non-recurring profit trap.

RULE 3: THE VALUATION CEILING
- IF (P/E > 25) AND (EPS Growth < 20% consistently)
- SET VERDICT = "OVERVALUED / SELL". Logic: Manufacturing ceiling reached.

Output Requirements:
- "peStatus": Describe the P/E quality (e.g., "Sustainably Low", "One-time Gain Trap", "Expensive Premium").
- "banglaAdvice": Bengali First-Principles logic (কেন কিনবো? - Keno?).
- "verdictOverride": Map to one of the TitanVerdict keys if a rule triggers.`;

  const prompt = `Re-scan and analyze:
${stocks.map(s => `Ticker: ${s.ticker}, Price: ${s.ltp}, EPS: ${s.eps}, NAV: ${s.nav}, Debt: ${s.debt}, Sponsor: ${s.directorHolding}%`).join('\n')}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              ticker: { type: Type.STRING },
              peStatus: { type: Type.STRING },
              banglaAdvice: { type: Type.STRING },
              verdictOverride: { type: Type.STRING },
              reasoning: { type: Type.STRING },
              allocation: { type: Type.STRING },
              bucket: { type: Type.STRING },
              redFlags: { type: Type.ARRAY, items: { type: Type.STRING } }
            }
          }
        }
      }
    });

    const aiResults = safeJsonParse(response.text);

    return stocks.map((s) => {
      const aiMatch = aiResults.find((r: any) => r && r.ticker === s.ticker) || {};
      
      const ltp = Number(s.ltp) || 0;
      const eps = Number(s.eps) || 0;
      const nav = Number(s.nav) || 0;
      const debt = Number(s.debt) || 0;
      const directorHolding = Number(s.directorHolding) || 0;

      const pe = eps > 0 ? ltp / eps : 0;
      const roe = nav > 0 ? (eps / nav) * 100 : 0;
      const d2e = nav > 0 ? debt / (nav * 100) : 0;
      const navDiscount = nav > 0 ? ((nav - ltp) / nav) * 100 : 0;
      const grahamValue = (eps > 0 && nav > 0) ? Math.sqrt(22.5 * eps * nav) : 0;

      let score = 0;
      let finalVerdict: TitanVerdict = TitanVerdict.HOLD;

      // Rule Implementation Logic
      const isAssetPlay = navDiscount > 40 && d2e < 0.6;
      const isValuationTrap = aiMatch.verdictOverride === "TRAP" || aiMatch.verdictOverride === "TRAIN TRAP";
      const isOvervalued = pe > 25 && aiMatch.verdictOverride !== "GOD_MODE_BUY";

      if (isAssetPlay) {
        finalVerdict = TitanVerdict.DEEP_VALUE;
        score = 95;
      } else if (isValuationTrap) {
        finalVerdict = TitanVerdict.TRAP;
        score = 15;
      } else if (isOvervalued) {
        finalVerdict = TitanVerdict.OVERVALUED;
        score = 25;
      } else {
        if (roe > 15) score += 40;
        if (pe > 0 && pe < 15) score += 30;
        if (directorHolding > 45) score += 20;
        if (d2e < 0.3) score += 10;

        if (score >= 80) finalVerdict = TitanVerdict.GOD_MODE_BUY;
        else if (score >= 60) finalVerdict = TitanVerdict.BUY;
        else if (score >= 40) finalVerdict = TitanVerdict.HOLD;
        else finalVerdict = TitanVerdict.AVOID;
      }

      if (eps <= 0 || directorHolding < 20) finalVerdict = TitanVerdict.DESTROY;

      return {
        stock: { ...s, ltp, eps, nav, debt, directorHolding },
        score,
        verdict: finalVerdict,
        moatType: aiMatch.moatType || "Operational Edge",
        reasoning: aiMatch.reasoning || "Standard Titan-X evaluation.",
        banglaAdvice: aiMatch.banglaAdvice || "ফান্ডামেন্টাল যাচাই করুন।",
        riskGrade: 5,
        redFlags: Array.isArray(aiMatch.redFlags) ? aiMatch.redFlags : [],
        intrinsicValue: grahamValue,
        fairValue: grahamValue > 0 ? grahamValue : ltp * 1.1,
        yield: s.dividend ? (Number(s.dividend) / ltp) * 100 : 0,
        allocation: aiMatch.allocation || "0%",
        bucket: aiMatch.bucket || "Growth/Value",
        debtRisk: d2e > 1 ? "TOXIC" : d2e > 0.6 ? "HIGH" : "LOW",
        navDiscount,
        peStatus: aiMatch.peStatus || "Analyzed",
        metrics: { pe, roe, debtToEquity: d2e }
      };
    });
  } catch (err) {
    console.error("Titan Analysis Error:", err);
    throw new Error("Titan Brain Scan Failure.");
  }
}

export async function parseStockFile(fileData: string, mimeType: string, isText: boolean): Promise<StockData[]> {
  const prompt = `Extract: ticker, ltp, eps, nav, debt, directorHolding. Return JSON array.`;
  const contents = isText ? { parts: [{ text: prompt }, { text: fileData }] } : { parts: [{ text: prompt }, { inlineData: { data: fileData.split(',')[1] || fileData, mimeType } }] };

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents,
      config: { responseMimeType: "application/json" }
    });
    const results = safeJsonParse(response.text);
    return results.map((item: any) => ({
      ticker: String(item.ticker || 'UNKNOWN'),
      ltp: Number(item.ltp) || 0,
      eps: Number(item.eps) || 0,
      nav: Number(item.nav) || 0,
      debt: Number(item.debt) || 0,
      directorHolding: Number(item.directorHolding) || 0,
      dividend: Number(item.dividend) || 0
    }));
  } catch (e) {
    console.error("Parse Error:", e);
    return [];
  }
}