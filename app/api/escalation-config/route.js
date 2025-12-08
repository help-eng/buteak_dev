import { NextResponse } from "next/server";

const BACKEND_API_URL = "https://api.buteak.in/workflow/api/config/escalation";

export async function GET() {
    try {
        console.log('[API Route] Fetching from:', BACKEND_API_URL);

        const response = await fetch(BACKEND_API_URL, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
            cache: 'no-store', // Disable caching
        });

        console.log('[API Route] Backend response status:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('[API Route] Backend error:', errorText);
            return NextResponse.json(
                { error: `Backend API error: ${errorText}` },
                { status: response.status }
            );
        }

        const result = await response.json();
        console.log('[API Route] Backend returned:', JSON.stringify(result, null, 2));

        return NextResponse.json(result, {
            headers: {
                'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0',
            },
        });
    } catch (error) {
        console.error("Error fetching escalation config:", error);
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}

export async function PUT(request) {
    try {
        const body = await request.json();

        const response = await fetch(BACKEND_API_URL, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const errorText = await response.text();
            return NextResponse.json(
                { error: `Backend API error: ${errorText}` },
                { status: response.status }
            );
        }

        const result = await response.json();
        return NextResponse.json(result);
    } catch (error) {
        console.error("Error updating escalation config:", error);
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}
