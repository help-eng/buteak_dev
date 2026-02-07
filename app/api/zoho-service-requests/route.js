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
            const endOfDay = new Date(endDate);
            endOfDay.setHours(23, 59, 59, 999);
            if (createdTime > endOfDay) return false;
        }
        return true;
    });
}

// Evaluate a single condition against a request record
function evaluateCondition(request, condition) {
    // Get the raw field value
    const rawFieldValue = request[condition.field];

    // Extract the actual value (handles both strings and lookup objects {name, id})
    const fieldValue = getFieldValue(rawFieldValue, "");
    const searchValue = (condition.value || "").trim();

    // For comparison, convert both to lowercase strings
    const fieldValueLower = String(fieldValue).toLowerCase();
    const searchValueLower = searchValue.toLowerCase();

    switch (condition.operator) {
        case "equals":
            // Try both exact match and case-insensitive match
            return fieldValue === searchValue || fieldValueLower === searchValueLower;
        case "not_equals":
            return fieldValue !== searchValue && fieldValueLower !== searchValueLower;
        case "contains":
            return fieldValueLower.includes(searchValueLower);
        case "not_contains":
            return !fieldValueLower.includes(searchValueLower);
        case "starts_with":
            return fieldValueLower.startsWith(searchValueLower);
        case "is_empty":
            return fieldValue === "" || fieldValue === "unknown" || fieldValueLower === "unknown";
        case "is_not_empty":
            return fieldValue !== "" && fieldValue !== "unknown" && fieldValueLower !== "unknown";
        default:
            return true;
    }
}

// Apply custom query conditions with AND/OR logic
function filterByConditions(requests, conditions) {
    if (!conditions || conditions.length === 0) return requests;

    return requests.filter((req) => {
        let result = evaluateCondition(req, conditions[0]);

        for (let i = 1; i < conditions.length; i++) {
            const condition = conditions[i];
            const conditionResult = evaluateCondition(req, condition);

            if (condition.logic === "AND") {
                result = result && conditionResult;
            } else {
                result = result || conditionResult;
            }
        }

        return result;
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

    requests.forEach((request) => {
        const status = getFieldValue(request.Status, "Unknown");
        stats.by_status[status] = (stats.by_status[status] || 0) + 1;

        const type = getFieldValue(request.Type || request.Request_Type, "Other");
        stats.by_type[type] = (stats.by_type[type] || 0) + 1;

        const room = getFieldValue(request.Room || request.Room_Number, "N/A");
        if (room !== "N/A") {
            stats.by_room[room] = (stats.by_room[room] || 0) + 1;
        }
    });

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
        const { searchParams } = new URL(request.url);
        const startDate = searchParams.get("startDate");
        const endDate = searchParams.get("endDate");
        const queryConditions = searchParams.get("conditions"); // JSON string of conditions

        console.log("[Zoho API] Starting request...");
        console.log("[Zoho API] Date filters:", { startDate, endDate });
        console.log("[Zoho API] Query conditions:", queryConditions);

        // Parse conditions if provided
        let parsedConditions = null;
        if (queryConditions) {
            try {
                parsedConditions = JSON.parse(queryConditions);
                console.log("[Zoho API] Parsed conditions:", parsedConditions);
            } catch (e) {
                console.error("[Zoho API] Failed to parse conditions:", e);
            }
        }

        const zohoCRMHandler = new Zohocrm();

        console.log("[Zoho API] Generating token...");
        await zohoCRMHandler.generateToken();
        console.log("[Zoho API] Token generated successfully");

        console.log("[Zoho API] Fetching ALL Service Requests with pagination...");
        const allRequests = await zohoCRMHandler.getAllModuleDataPaginated("Service_Requests", 5000);
        console.log(`[Zoho API] Total fetched: ${allRequests.length} service requests`);

        // Apply date filter
        let filteredRequests = filterByDateRange(allRequests, startDate, endDate);
        console.log(`[Zoho API] After date filter: ${filteredRequests.length} service requests`);

        // Apply custom query conditions
        if (parsedConditions && parsedConditions.length > 0) {
            filteredRequests = filterByConditions(filteredRequests, parsedConditions);
            console.log(`[Zoho API] After query filter: ${filteredRequests.length} service requests`);
        }

        const stats = aggregateData(filteredRequests);

        return NextResponse.json({
            success: true,
            data: stats,
            total_fetched: allRequests.length,
            filters_applied: {
                startDate,
                endDate,
                conditions: parsedConditions
            },
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
