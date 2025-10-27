
import { GoogleGenAI } from "@google/genai";
import { StockItem, SalesRecord, PurchaseOrder } from '../types';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

let ai: GoogleGenAI | null = null;

if (API_KEY) {
  ai = new GoogleGenAI({ apiKey: API_KEY });
} else {
  console.warn("VITE_GEMINI_API_KEY not set. AI analytics features will be disabled.");
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
}

export const getBusinessAnalytics = async (
  stock: StockItem[],
  sales: SalesRecord[],
  pos: PurchaseOrder[]
): Promise<string> => {
  if (!ai || !API_KEY) {
    return Promise.resolve("AI Analytics is disabled. Please configure VITE_GEMINI_API_KEY in your environment variables to enable AI-powered insights.");
  }

  const prompt = `
    You are a senior business analyst for a specialty coffee company in Indonesia.
    Analyze the following business data and provide concise, actionable insights. All monetary values are in Indonesian Rupiah (Rp).
    Format your response as markdown.

    **Current Inventory:**
    ${stock.map(s => `- ${s.variety} (${s.type}): ${s.quantityKg.toFixed(2)} kg`).join('\n')}

    **Recent Sales:**
    ${sales.slice(-10).map(s => `- ${s.saleDate}: ${formatCurrency(s.totalAmount)} for ${s.items.map(i => `${i.quantityKg}kg of ${i.variety}`).join(', ')}`).join('\n')}

    **Active Purchase Orders:**
    ${pos.filter(p => p.status !== 'Completed' && p.status !== 'Rejected').map(p => `- PO #${p.id.slice(0, 4)}: ${p.items.map(i => `${i.quantityKg}kg of ${i.variety}`).join(', ')}, Status: ${p.status}`).join('\n')}

    **Analysis Request:**
    1.  **Inventory Health:** Identify which coffee varieties are low in stock (under 50kg) and suggest reordering.
    2.  **Sales Performance:** Which coffee variety is the top seller based on recent sales quantity?
    3.  **Business Suggestion:** Based on sales trends and current inventory, suggest a new blend to create or a variety to promote.
    4.  **Operational Alert:** Point out any potential issues, like pending POs that might affect low-stock items.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    // FIX: Use the 'text' property directly to get the response string.
    return response.text;
  } catch (error) {
    console.error("Error fetching analytics from Gemini:", error);
    return "Error: Could not fetch AI-powered analytics. The API key might be invalid or the service may be unavailable.";
  }
};
