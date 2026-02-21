import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";


export async function POST(request: Request) {
    try {
        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json({ error: "Gemini API key not configured" }, { status: 500 });
        }
        const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

        const { prompt } = await request.json();

        if (!prompt || typeof prompt !== "string") return NextResponse.json({ error: "Content is required"}, { status: 400 });

        const response = await genAI.models.generateContent({
            model: "gemini-2.5-flash-lite",
            contents: `As a healthcare professional, write informative, professional, and engaging summary health news content: "${prompt}".
        
            Focus on giving the costumer new health insights. Keep it to 500 characters. Make it professional as possible. Do not use the original topic in your response.`,
            config: {
                maxOutputTokens: 500,
                temperature: 0.7
            }
        });

        return NextResponse.json({ summary: response.text });
    } catch (error: unknown) {
        console.log("[GENERATE_CONTENT]", error);

        if (error instanceof Error && 'status' in error && (error as Error & { status: number }).status === 429) {
            return NextResponse.json(
                { error: "Limit reached. Please try again in a minute" },
                { status: 429 }
            );
        }

        return NextResponse.json(
            { error: "Failed to generate content" },
            { status: 500 }
        );
    }
}