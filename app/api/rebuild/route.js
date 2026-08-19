import { NextResponse } from "next/server";
import { faqUrl } from "@/lib/config";

export async function POST(request) {
    try {
        const { property_id } = await request.json().catch(() => ({}));

        if (!property_id) {
            return NextResponse.json(
                { error: "Missing 'property_id' in request body" },
                { status: 400 }
            );
        }

        const url = `${faqUrl("/rebuild")}?property_id=${encodeURIComponent(property_id)}`;
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({}),
        });

        if (!response.ok) {
            const errorText = await response.text();
            return NextResponse.json(
                { error: `Rebuild API error: ${errorText}` },
                { status: response.status }
            );
        }

        const result = await response.json();
        return NextResponse.json(result);
    } catch (error) {
        console.error("Error calling rebuild API:", error);
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}
