import { GoogleGenAI, Type } from "@google/genai";
import { Expense, ExpenseCategory } from "../types";

// NOTE: Using a hard requirement for process.env.API_KEY as per instructions.
// If the key is missing, the app will prompt the user (handled in UI).

export const parseExpenseText = async (text: string): Promise<Omit<Expense, 'id' | 'created_at'>[]> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const systemInstruction = `
    You are an expense tracking assistant. 
    Extract food-related expenses from the user's natural language input.
    Categorize them into one of the following: Food, Drink, Snack, Grocery, Dining Out, Other.
    Return a JSON array of objects.
    If the currency is not specified, assume the user's local currency units (just the number).
    If date is not specified, use today's date: ${new Date().toISOString().split('T')[0]}.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: text,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              description: { type: Type.STRING },
              amount: { type: Type.NUMBER },
              date: { type: Type.STRING, description: "YYYY-MM-DD format" },
              category: { 
                type: Type.STRING, 
                enum: [
                  "Food", "Drink", "Snack", "Grocery", "Dining Out", "Other"
                ] 
              }
            },
            required: ["description", "amount", "date", "category"]
          }
        }
      }
    });

    const jsonText = response.text;
    if (!jsonText) return [];
    
    const parsed = JSON.parse(jsonText);
    return parsed as Omit<Expense, 'id' | 'created_at'>[];

  } catch (error) {
    console.error("Gemini parsing error:", error);
    throw error;
  }
};