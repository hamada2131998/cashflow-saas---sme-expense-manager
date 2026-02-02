
import { GoogleGenAI, Type } from "@google/genai";
import { Expense, User } from "../types";

export const getSmartInsights = async (expenses: Expense[], users: User[]) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const expenseSummary = expenses.map(e => ({
      amount: e.amount,
      desc: e.description,
      status: e.status,
      employee: users.find(u => u.id === e.employeeId)?.name
    }));

    const prompt = `Analyze the following expense data and provide a concise summary for a business owner. 
    Focus on trends, potential risks of theft or waste, and optimization tips. 
    Data: ${JSON.stringify(expenseSummary)}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: "You are a professional financial auditor and SME consultant. Provide actionable advice in a friendly tone. Limit response to 3-4 bullet points."
      }
    });

    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Could not generate insights at this time. Please check your spending manually.";
  }
};
