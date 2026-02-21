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
            contents: `As a healthcare professional, write an informative, professional, and engaging health news article on the topic: "${prompt}".
        
            The article should provide new health insights for the reader. It must be at least 7500 characters long.`,
            config: {
                tools: [{
                    googleSearch: {}
                }]
            }
        });

        const candidate = response.candidates?.[0];

        const sourceLinks =
            candidate?.groundingMetadata?.groundingChunks
                ?.map(chunk => chunk.web?.uri)
                .filter((uri): uri is string => !!uri) || [];

        return NextResponse.json({
            content: response.text,
            sourceLinks: [...new Set(sourceLinks)],
        });
    } catch (error: unknown) {
        console.error("[GENERATE_CONTENT]", error);

        if (error instanceof SyntaxError) {
            console.error("--- Failed to parse JSON from Gemini ---");
        } else if (error instanceof Error && 'status' in error && (error as Error & { status: number }).status === 429) {
            return NextResponse.json(
                { error: "Limit reached. Please try again in a minute" },
                { status: 429 }
            );
        }

        return NextResponse.json(
            { error: "Failed to generate content" },
            { status: 500 }
        )
    }
}