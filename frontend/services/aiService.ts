import { GoogleGenAI, Type } from '@google/genai';
import { Message, ShrinkflationSignal, Product, ExtractedProductData } from '../types';

// MUST use process.env.API_KEY directly as per strict environment rules
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY, vertexai: true });

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

export const analyzeQuery = async (
  userQuery: string,
  chatHistory: Message[],
  trackedProducts: Product[],
  useWebSearch: boolean = false
): Promise<{ text: string; signal: ShrinkflationSignal | null; groundingUrls?: { uri: string; title: string }[] }> => {
  
  // Using actual data from state, NO mock data.
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

    // If Web Search feature is enabled, add googleSearch tool
    if (useWebSearch) {
      config.tools = [{ googleSearch: {} }];
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: contents,
      config: config
    });

    const responseText = response.text || "";
    let cleanText = responseText;
    let signal: ShrinkflationSignal | null = null;
    let groundingUrls: { uri: string; title: string }[] = [];

    // Extract URLs from Grounding Metadata if available
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (chunks && Array.isArray(chunks)) {
      chunks.forEach((chunk: any) => {
        if (chunk.web?.uri && chunk.web?.title) {
          // Avoid duplicate URLs
          if (!groundingUrls.find(u => u.uri === chunk.web.uri)) {
            groundingUrls.push({ uri: chunk.web.uri, title: chunk.web.title });
          }
        }
      });
    }

    // Robust JSON Parsing
    let jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/);
    
    if (!jsonMatch) {
      // Fallback: try to find anything that looks like the expected JSON object
      jsonMatch = responseText.match(/\{[\s\S]*"signalDetected"[\s\S]*\}/);
      if (jsonMatch) {
         try {
           signal = JSON.parse(jsonMatch[0]) as ShrinkflationSignal;
           cleanText = responseText.replace(jsonMatch[0], '').trim();
         } catch(e) {
           console.error("Failed fallback JSON parse", e);
         }
      }
    } else {
      try {
        signal = JSON.parse(jsonMatch[1]) as ShrinkflationSignal;
        cleanText = responseText.replace(/```json\n[\s\S]*?\n```/, '').trim();
      } catch (e) {
        console.error("Failed to parse signal JSON", e);
      }
    }

    return { text: cleanText, signal, groundingUrls };

  } catch (error: any) {
    console.error("Error calling Gemini API:", error);
    
    if (error.message && error.message.includes('429')) {
      return {
        text: `System Alert: Vertex AI API quota exhausted (Error 429: Resource Exhausted). Please wait a moment before trying again.`,
        signal: null
      };
    }

    return {
      text: `System Error: Connection to Vertex AI failed. Details: ${error.message || 'Ensure API_KEY environment variable is valid.'}`,
      signal: null
    };
  }
};

export const generateDashboardInsights = async (products: Product[]): Promise<string> => {
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

export const extractProductDataFromUrl = async (url: string): Promise<ExtractedProductData | null> => {
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
