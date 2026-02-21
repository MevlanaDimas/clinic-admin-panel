import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";


export async function POST(request: Request) {
    try {
        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json({ error: "Gemini API key not configured" }, { status: 500 });
        }
        const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

        const { prompt } = await request.json();

        if (!prompt || typeof prompt !== "string") {
            return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
        }

        const response = await genAI.models.generateContent({
            model: "gemini-2.5-flash-lite",
            contents: `As a creative marketing expert, write a short, professional, and engaging description for a promotion about: "${prompt}".

            Focus on the customer benefits. Keep it to 130 characters. Do not use the original topic in your response.`,
            config: {
                maxOutputTokens: 130,
                temperature: 0.7
            }
        });
    
        return NextResponse.json({ description: response.text });
    } catch (error: unknown) {
        console.log("[GENERATE_DESCRIPTION]", error);

        // Check for rate limiting errors from the Google AI API
        if (error instanceof Error && 'status' in error && (error as Error & { status: number }).status === 429) {
            return NextResponse.json(
                { error: "Limit reached. Please try again in a minute"},
                { status: 429 }
            );
        }
    
        return NextResponse.json(
            { error: "Failed to generate description" },
            { status: 500 }
        );
    }
}