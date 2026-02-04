import { NextResponse } from "next/server";

// Zoho CRM API configuration
const ZOHO_ACCOUNTS_URL = "https://accounts.zoho.com/oauth/v2/token";
const ZOHO_API_BASE = "https://www.zohoapis.com/crm/v3";

// In-memory token cache (for development)
let cachedToken = null;
let tokenExpiry = null;

async function getAccessToken() {
    // Check if we have a valid cached token
    if (cachedToken && tokenExpiry && Date.now() < tokenExpiry) {
        return cachedToken;
    }

    try {
        const response = await fetch(ZOHO_ACCOUNTS_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
                client_id: process.env.ZOHO_CLIENT_ID,
                client_secret: process.env.ZOHO_CLIENT_SECRET,
                grant_type: "client_credentials",
                scope: "ZohoCRM.modules.ALL",
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Zoho auth failed: ${errorText}`);
        }

        const data = await response.json();
        cachedToken = data.access_token;
        // Set expiry to 5 minutes before actual expiry for safety
        tokenExpiry = Date.now() + (data.expires_in - 300) * 1000;

        return cachedToken;
    } catch (error) {
        console.error("Error getting Zoho access token:", error);
        throw error;
    }
}

async function fetchServiceRequests(accessToken) {
    try {
        // Fetch Service Requests from Zoho CRM
        const response = await fetch(
            `${ZOHO_API_BASE}/Service_Requests?per_page=200`,
            {
                headers: {
                    Authorization: `Zoho-oauthtoken ${accessToken}`,
                },
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Zoho API error: ${errorText}`);
        }

        const result = await response.json();
        return result.data || [];
    } catch (error) {
        console.error("Error fetching service requests:", error);
        throw error;
    }
}

function aggregateData(requests) {
    const stats = {
        total_count: requests.length,
        by_status: {},
        by_type: {},
        by_room: {},
        recent_requests: [],
    };

    // Aggregate by status, type, and room
    requests.forEach((request) => {
        // Status breakdown
        const status = request.Status || "Unknown";
        stats.by_status[status] = (stats.by_status[status] || 0) + 1;

        // Type breakdown
        const type = request.Type || request.Request_Type || "Other";
        stats.by_type[type] = (stats.by_type[type] || 0) + 1;

        // Room breakdown
        const room = request.Room || request.Room_Number || "N/A";
        if (room !== "N/A") {
            stats.by_room[room] = (stats.by_room[room] || 0) + 1;
        }
    });

    // Get recent requests (last 10)
    stats.recent_requests = requests
        .sort((a, b) => {
            const dateA = new Date(a.Created_Time || a.created_time);
            const dateB = new Date(b.Created_Time || b.created_time);
            return dateB - dateA;
        })
        .slice(0, 10)
        .map((req) => ({
            id: req.id,
            room: req.Room || req.Room_Number || "N/A",
            type: req.Type || req.Request_Type || "Other",
            status: req.Status || "Unknown",
            created_time: req.Created_Time || req.created_time,
        }));

    return stats;
}

export async function GET() {
    try {
        // Get access token
        const accessToken = await getAccessToken();

        // Fetch service requests
        const requests = await fetchServiceRequests(accessToken);

        // Aggregate data
        const stats = aggregateData(requests);

        return NextResponse.json({
            success: true,
            data: stats,
            last_updated: new Date().toISOString(),
        });
    } catch (error) {
        console.error("Error in zoho-service-requests API:", error);
        return NextResponse.json(
            {
                success: false,
                error: error.message || "Failed to fetch service requests",
            },
            { status: 500 }
        );
    }
}
