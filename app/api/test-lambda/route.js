import { NextResponse } from "next/server";

export async function POST(request) {
    try {
        const { url, method, runs, body, headers } = await request.json();

        if (!url) {
            return NextResponse.json(
                { error: "Missing 'url' parameter" },
                { status: 400 }
            );
        }

        const lambdaUrl = process.env.NEXT_PUBLIC_LAMBDA_URL;

        // Prepare the payload for Lambda function
        const lambdaPayload = {
            url,
            method: method || "GET",
            runs: runs || 5,
            body: body || null,
            headers: headers || {},
        };

        // Call the Lambda function
        const response = await fetch(lambdaUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(lambdaPayload),
        });

        if (!response.ok) {
            const errorText = await response.text();
            return NextResponse.json(
                { error: `Lambda function error: ${errorText}` },
                { status: response.status }
            );
        }

        const result = await response.json();
        return NextResponse.json(result);
    } catch (error) {
        console.error("Error calling Lambda function:", error);
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}
