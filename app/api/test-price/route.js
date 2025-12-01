import { NextResponse } from "next/server";

export async function POST(request) {
    try {
        const { hotelCode, authCode, runs } = await request.json();

        const finalHotelCode = hotelCode || process.env.NEXT_PUBLIC_HOTEL_CODE || "55402";
        const finalAuthCode = authCode || process.env.NEXT_PUBLIC_AUTH_CODE || "40230910707e9e1bd2-7813-11f0-9";

        // Generate dates
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const fromDate = today.toISOString().split('T')[0];
        const toDate = tomorrow.toISOString().split('T')[0];

        // Construct XML body
        const xmlBody = `<RES_Request>
   <Request_Type>Rate</Request_Type>
   <Authentication>
      <HotelCode>${finalHotelCode}</HotelCode>
      <AuthCode>${finalAuthCode}</AuthCode>
   </Authentication>
   <FromDate>${fromDate}</FromDate>
   <ToDate>${toDate}</ToDate>
</RES_Request>`;

        // Construct URL with query parameters
        const params = new URLSearchParams({
            Request_Type: '-',
            HotelCode: finalHotelCode,
            AuthCode: finalAuthCode,
            FromDate: fromDate,
            ToDate: toDate
        });

        const apiUrl = `https://api.buteak.in/api/prices?${params}`;
        const lambdaUrl = process.env.NEXT_PUBLIC_LAMBDA_URL;

        // Call Lambda function with the price API request
        const lambdaPayload = {
            url: apiUrl,
            method: "POST",
            runs: runs || 5,
            body: xmlBody,
            headers: {
                "Content-Type": "application/xml",
                "X-Requested-With": "XMLHttpRequest"
            },
        };

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

        const lambdaResult = await response.json();

        // Parse the XML response from the first successful call to extract prices
        // Note: The Lambda function returns latency metrics, but we need to parse
        // the actual API response to get room prices

        // For now, return the Lambda result with latency metrics
        // The client can make a separate call to get actual prices if needed
        return NextResponse.json({
            ...lambdaResult,
            fromDate,
            toDate,
            hotelCode: finalHotelCode,
        });
    } catch (error) {
        console.error("Error in price testing:", error);
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}

// Helper function to calculate tax (can be used client-side too)
export function calculateTax(basePrice) {
    const taxRate = basePrice >= 7500 ? 18 : 5;
    const priceWithTax = parseFloat((basePrice * (1 + taxRate / 100)).toFixed(2));
    return { priceWithTax, taxRate };
}
