import { NextResponse } from "next/server";
import Zohocrm from "@/utils/Zohocrm";

// Helper to get string value from Zoho field (handles both string and object {name, id})
function getFieldValue(field, fallback = "Unknown") {
    if (!field) return fallback;
    if (typeof field === "string") return field;
    if (typeof field === "object" && field.name) return field.name;
    return fallback;
}

// Filter requests by date range
function filterByDateRange(requests, startDate, endDate) {
    if (!startDate && !endDate) return requests;

    return requests.filter((req) => {
        const createdTime = new Date(req.Created_Time || req.created_time);

        if (startDate && createdTime < new Date(startDate)) return false;
        if (endDate) {
            // Include the entire end date (set to end of day)
            const endOfDay = new Date(endDate);
            endOfDay.setHours(23, 59, 59, 999);
            if (createdTime > endOfDay) return false;
        }
        return true;
    });
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
        // Status breakdown (handle both string and object)
        const status = getFieldValue(request.Status, "Unknown");
        stats.by_status[status] = (stats.by_status[status] || 0) + 1;

        // Type breakdown
        const type = getFieldValue(request.Type || request.Request_Type, "Other");
        stats.by_type[type] = (stats.by_type[type] || 0) + 1;

        // Room breakdown
        const room = getFieldValue(request.Room || request.Room_Number, "N/A");
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
            room: getFieldValue(req.Room || req.Room_Number, "N/A"),
            type: getFieldValue(req.Type || req.Request_Type, "Other"),
            status: getFieldValue(req.Status, "Unknown"),
            created_time: req.Created_Time || req.created_time,
        }));

    return stats;
}

export async function GET(request) {
    try {
        // Get query parameters for filtering
        const { searchParams } = new URL(request.url);
        const startDate = searchParams.get("startDate"); // Format: YYYY-MM-DD
        const endDate = searchParams.get("endDate");     // Format: YYYY-MM-DD

        console.log("[Zoho API] Starting request...");
        console.log("[Zoho API] Date filters:", { startDate, endDate });

        // Initialize Zoho CRM handler
        const zohoCRMHandler = new Zohocrm();

        // Generate access token
        console.log("[Zoho API] Generating token...");
        await zohoCRMHandler.generateToken();
        console.log("[Zoho API] Token generated successfully");

        // Fetch ALL Service Requests using pagination
        console.log("[Zoho API] Fetching ALL Service Requests with pagination...");
        const allRequests = await zohoCRMHandler.getAllModuleDataPaginated("Service_Requests", 5000);
        console.log(`[Zoho API] Total fetched: ${allRequests.length} service requests`);

        // Apply date filter if provided
        const filteredRequests = filterByDateRange(allRequests, startDate, endDate);
        console.log(`[Zoho API] After date filter: ${filteredRequests.length} service requests`);

        // Aggregate data
        const stats = aggregateData(filteredRequests);

        return NextResponse.json({
            success: true,
            data: stats,
            total_fetched: allRequests.length,
            filters_applied: { startDate, endDate },
            last_updated: new Date().toISOString(),
        });
    } catch (error) {
        console.error("[Zoho API] Error:", error.message);
        console.error("[Zoho API] Full error:", error);

        return NextResponse.json(
            {
                success: false,
                error: error.message || "Failed to fetch service requests",
            },
            { status: 500 }
        );
    }
}
