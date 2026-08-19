import { NextResponse } from "next/server";
import { faqUrl } from "@/lib/config";

export async function POST(request) {
    try {
        const { question, n_results, property_id } = await request.json();

        if (!question) {
            return NextResponse.json(
                { error: "Missing 'question' parameter" },
                { status: 400 }
            );
        }

        const response = await fetch(faqUrl("/chat"), {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                question,
                n_results: n_results || 3,
                property_id: property_id || undefined,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            return NextResponse.json(
                { error: `Chatbot API error: ${errorText}` },
                { status: response.status }
            );
        }

        const result = await response.json();
        return NextResponse.json(result);
    } catch (error) {
        console.error("Error calling chatbot API:", error);
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}
