import { NextResponse } from "next/server";
import Zohocrm from "@/utils/Zohocrm";

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
        console.log("[Zoho API] Starting request...");

        // Initialize Zoho CRM handler
        const zohoCRMHandler = new Zohocrm();

        // Generate access token
        console.log("[Zoho API] Generating token...");
        await zohoCRMHandler.generateToken();
        console.log("[Zoho API] Token generated successfully");

        // Fetch all Service Requests
        console.log("[Zoho API] Fetching Service Requests...");
        const requests = await zohoCRMHandler.getAllModuleData("Service_Requests", 200);
        console.log(`[Zoho API] Fetched ${requests.length} service requests`);

        // Aggregate data
        const stats = aggregateData(requests);

        return NextResponse.json({
            success: true,
            data: stats,
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
