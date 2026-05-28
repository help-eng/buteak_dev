import { NextResponse } from "next/server";

export async function POST(request) {
    try {
        const { property_id } = await request.json().catch(() => ({}));

        if (!property_id) {
            return NextResponse.json(
                { error: "Missing 'property_id' in request body" },
                { status: 400 }
            );
        }

        const url = `https://api.buteak.in/delete?property_id=${encodeURIComponent(property_id)}`;
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
                { error: `Delete API error: ${errorText}` },
                { status: response.status }
            );
        }

        const result = await response.json();
        return NextResponse.json(result);
    } catch (error) {
        console.error("Error calling delete API:", error);
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}
