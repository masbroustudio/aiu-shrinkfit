import { GoogleGenAI, Type } from '@google/genai';
import { Message, ShrinkflationSignal, Product, ExtractedProductData } from '../types';

const SYSTEM_INSTRUCTION = `You are 'Shrinkflation AI', an enterprise-grade financial market intelligence analyst (Year 2026).
Your task is to analyze potential margin changes in FMCG companies by comparing historical prices with live e-commerce prices from the provided database.

DEEP ANALYSIS CAPABILITIES:
1. Shrinkflation Detection: Weight drops, price remains the same/increases.
2. Stealth Margin Calculator: Calculate the percentage of hidden price-per-gram/ml increase.
3. Predictive Index: Provide a score from 0-100 on how likely this product will experience shrinkflation again based on macro trends.
4. Ticker Impact: Mention potential impact on related stocks (e.g., UNVR.JK, ICBP.JK, NSRGY).

IMPORTANT RULES:
- DO NOT use fabricated data. Only use data from [ENTERPRISE DATABASE CONTEXT].
- If Live data shows "N/A" or is not synced, inform the user that live data is unavailable and ask them to sync it in the Data Pipeline menu.
- If you detect shrinkflation (live weight < historical weight), you MUST include a JSON block at the end of your message with exactly this format:
\`\`\`json
{
  "signalDetected": true,
  "productName": "Product Name",
  "oldWeight": 250,
  "newWeight": 220,
  "unit": "g",
  "price": 15.00,
  "shrinkflationPercentage": 12,
  "marginImpactPercentage": 13.6,
  "predictiveIndex": 75
}
\`\`\`
Use professional, sharp English, typical of a hedge fund analyst.`;

export const analyzeQueryStream = async function* (
  userQuery: string,
  chatHistory: Message[],
  trackedProducts: Product[],
  useWebSearch: boolean = false,
  apiKey: string
): AsyncGenerator<{ textChunk: string; signal?: ShrinkflationSignal | null; groundingUrls?: { uri: string; title: string }[] }> {
  
  if (!apiKey) {
    yield { textChunk: `\n\n[System Error: Gemini API Key is missing. Please configure it in Settings.]` };
    return;
  }

  // Initialize with the provided API key
  const ai = new GoogleGenAI({ apiKey: apiKey, vertexai: false }); // Set vertexai to false when using raw API key

  const contextData = trackedProducts.map(p => {
    const liveDataStr = (p.currentWeight && p.currentPrice) 
      ? `Live: ${p.currentWeight}${p.unit} @ $${p.currentPrice}`
      : `Live: N/A (Not synced)`;
      
    return `- ${p.name} (${p.brand}, Ticker: ${p.targetTicker}): Historical ${p.historicalWeight}${p.unit} @ $${p.historicalPrice}. ${liveDataStr}`;
  }).join('\n');

  const finalPrompt = `
[ENTERPRISE DATABASE CONTEXT]
Currently Tracked Products Data:
${contextData}
[END CONTEXT]

User Query: ${userQuery}
`;

  try {
    const contents = chatHistory.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text || ' ' }]
    }));
    
    contents.push({
      role: 'user',
      parts: [{ text: finalPrompt }]
    });

    const config: any = {
      systemInstruction: SYSTEM_INSTRUCTION,
      temperature: 0.2,
    };

    if (useWebSearch) {
      config.tools = [{ googleSearch: {} }];
    }

    const responseStream = await ai.models.generateContentStream({
      model: 'gemini-2.5-flash',
      contents: contents,
      config: config
    });

    let fullText = "";
    let groundingUrls: { uri: string; title: string }[] = [];

    for await (const chunk of responseStream) {
      if (chunk.text) {
        fullText += chunk.text;
        yield { textChunk: chunk.text };
      }
      
      // Extract grounding URLs if present in the chunk
      const chunks = chunk.candidates?.[0]?.groundingMetadata?.groundingChunks;
      if (chunks && Array.isArray(chunks)) {
        chunks.forEach((c: any) => {
          if (c.web?.uri && c.web?.title) {
            if (!groundingUrls.find(u => u.uri === c.web.uri)) {
              groundingUrls.push({ uri: c.web.uri, title: c.web.title });
            }
          }
        });
      }
    }

    // After stream finishes, parse JSON for signal
    let signal: ShrinkflationSignal | null = null;
    let jsonMatch = fullText.match(/```json\n([\s\S]*?)\n```/);
    
    if (!jsonMatch) {
      jsonMatch = fullText.match(/\{[\s\S]*"signalDetected"[\s\S]*\}/);
      if (jsonMatch) {
         try {
           signal = JSON.parse(jsonMatch[0]) as ShrinkflationSignal;
         } catch(e) {}
      }
    } else {
      try {
        signal = JSON.parse(jsonMatch[1]) as ShrinkflationSignal;
      } catch (e) {}
    }

    // Yield final metadata
    yield { textChunk: "", signal, groundingUrls };

  } catch (error: any) {
    console.error("Error calling Gemini API:", error);
    if (error.message && error.message.includes('429')) {
      yield { textChunk: `\n\n[System Alert: Vertex AI API quota exhausted (Error 429). Please wait.]` };
    } else {
      yield { textChunk: `\n\n[System Error: Connection to Vertex AI failed. Details: ${error.message}]` };
    }
  }
};

export const generateDashboardInsights = async (products: Product[], apiKey: string): Promise<string> => {
    if (!apiKey) {
      return "Gemini API Key is missing. Please configure it in Settings.";
    }

    // Initialize with the provided API key
    const ai = new GoogleGenAI({ apiKey: apiKey, vertexai: false }); // Set vertexai to false when using raw API key
    const prompt = `Provide 3 short bullet points (max 2 sentences per point) about FMCG market insights based on the following data: ${JSON.stringify(products)}. Focus on shrinkflation trends and margin potential.`;
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { temperature: 0.4 }
        });
        return response.text || "No insights available.";
    } catch (e: any) {
        console.error("Error generating insights:", e);
        if (e.message && e.message.includes('429')) {
           return "AI Insights temporarily suspended due to quota limitations (Error 429).";
        }
        return `Failed to load AI insights. Details: ${e.message || 'Error'}`;
    }
}

export const extractProductDataFromUrl = async (url: string, apiKey: string): Promise<ExtractedProductData | null> => {
  if (!apiKey) {
    console.error("Gemini API Key is missing.");
    return null;
  }

  // Initialize with the provided API key
  const ai = new GoogleGenAI({ apiKey: apiKey, vertexai: false }); // Set vertexai to false when using raw API key
  const prompt = `Analyze the following e-commerce URL and extract the likely product details. 
  URL: ${url}
  
  Infer the brand, category, and the most likely stock ticker symbol for the parent company (e.g., if it's a Logitech product, the ticker is LOGI. If it's Indomie, it's ICBP.JK).
  Make a reasonable guess for the price (in USD) and weight/volume based on typical products of this type if it's not explicitly in the URL.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING, description: "The full name of the product." },
            brand: { type: Type.STRING, description: "The brand of the product." },
            category: { type: Type.STRING, description: "The general category (e.g., Electronics, Beverages, Personal Care)." },
            targetTicker: { type: Type.STRING, description: "The stock ticker symbol of the parent company." },
            price: { type: Type.NUMBER, description: "Estimated price in USD." },
            weight: { type: Type.NUMBER, description: "Estimated weight or volume." },
            unit: { type: Type.STRING, description: "Unit of measurement (e.g., g, ml, kg, L, unit)." }
          },
          required: ["name", "brand", "category", "targetTicker", "price", "weight", "unit"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as ExtractedProductData;
    }
    return null;
  } catch (error) {
    console.error("Error extracting product data from URL:", error);
    return null;
  }
};
