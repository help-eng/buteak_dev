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

// Test-mode filter: exclude rooms 000 and 1000 (compared as numbers) when
// testMode is OFF. When testMode is ON, no filter is applied.
function filterTestRooms(requests, testMode) {
    if (testMode) return requests;

    return requests.filter((req) => {
        const roomName = getFieldValue(req.Room || req.Room_Number, "");
        const roomAsNumber = parseFloat(roomName);
        if (Number.isNaN(roomAsNumber)) return true; // keep non-numeric rooms
        return roomAsNumber !== 0 && roomAsNumber !== 1000;
    });
}

// Property filter — drop records where property_id doesn't match
function filterByProperty(requests, propertyId) {
    if (!propertyId || propertyId === "all") return requests;

    return requests.filter((req) => {
        const recordProperty = getFieldValue(req.property_id, "");
        return recordProperty === propertyId;
    });
}

// Normalize the SR Type field into 3 buckets.
// Anything other than Reception/Housekeeping (e.g. stray "L3" escalation
// codes) rolls up under "Other" so the chart stays clean.
function normalizeType(rawType) {
    if (!rawType) return "Other";
    const lower = String(rawType).toLowerCase();
    if (lower === "reception") return "Reception";
    if (lower === "housekeeping") return "Housekeeping";
    return "Other";
}

// Evaluate a single condition against a request record
function evaluateCondition(request, condition) {
    // Get the raw field value
    const rawFieldValue = request[condition.field];

    // Extract the actual value (handles both strings and lookup objects {name, id})
    const fieldValue = getFieldValue(rawFieldValue, "");
    const searchValue = (condition.value || "").trim();

    // Determine comparison type (default to string)
    const compareAs = condition.compareAs || "string";

    // Convert values based on comparison type
    let compareFieldValue, compareSearchValue;

    if (compareAs === "number") {
        // For number comparison, parse both as numbers
        compareFieldValue = parseFloat(fieldValue) || 0;
        compareSearchValue = parseFloat(searchValue) || 0;
    } else {
        // For string comparison, convert to lowercase strings
        compareFieldValue = String(fieldValue).toLowerCase();
        compareSearchValue = searchValue.toLowerCase();
    }

    switch (condition.operator) {
        case "equals":
            if (compareAs === "number") {
                return compareFieldValue === compareSearchValue;
            }
            // For strings, try both exact match and case-insensitive match
            return fieldValue === searchValue || compareFieldValue === compareSearchValue;

        case "not_equals":
            if (compareAs === "number") {
                return compareFieldValue !== compareSearchValue;
            }
            return fieldValue !== searchValue && compareFieldValue !== compareSearchValue;

        case "contains":
            return compareFieldValue.toString().includes(compareSearchValue.toString());

        case "not_contains":
            return !compareFieldValue.toString().includes(compareSearchValue.toString());

        case "starts_with":
            return compareFieldValue.toString().startsWith(compareSearchValue.toString());

        case "is_empty":
            return fieldValue === "" || fieldValue === "unknown" || compareFieldValue === "unknown";

        case "is_not_empty":
            return fieldValue !== "" && fieldValue !== "unknown" && compareFieldValue !== "unknown";

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
        by_month: [],
        recent_requests: [],
        missed_requests: [],
    };

    // Generate last 12 months template
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const fullMonthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const now = new Date();
    const monthsData = {};

    // Initialize last 12 months with 0 counts
    for (let i = 11; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        monthsData[key] = {
            year: date.getFullYear(),
            month: date.getMonth() + 1,
            monthName: fullMonthNames[date.getMonth()],
            monthShort: monthNames[date.getMonth()],
            count: 0
        };
    }

    requests.forEach((request) => {
        // Existing aggregations
        const status = getFieldValue(request.Status, "Unknown");
        stats.by_status[status] = (stats.by_status[status] || 0) + 1;

        const rawType = getFieldValue(request.Type || request.Request_Type, "Other");
        const type = normalizeType(rawType);
        stats.by_type[type] = (stats.by_type[type] || 0) + 1;

        const room = getFieldValue(request.Room || request.Room_Number, "N/A");
        if (room !== "N/A") {
            stats.by_room[room] = (stats.by_room[room] || 0) + 1;
        }

        // Monthly aggregation
        const createdTime = request.Created_Time || request.created_time;
        if (createdTime) {
            const date = new Date(createdTime);
            const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            if (monthsData[key]) {
                monthsData[key].count++;
            }
        }
    });

    // Convert months data to sorted array
    stats.by_month = Object.values(monthsData).sort((a, b) => {
        if (a.year !== b.year) return a.year - b.year;
        return a.month - b.month;
    });

    // Sort once newest-first; recent_requests is the top 10 of all SRs
    const sortedNewestFirst = [...requests].sort((a, b) => {
        const dateA = new Date(a.Created_Time || a.created_time);
        const dateB = new Date(b.Created_Time || b.created_time);
        return dateB - dateA;
    });

    const toListItem = (req) => ({
        id: req.id,
        title: getFieldValue(req.Name, ""),
        room: getFieldValue(req.Room || req.Room_Number, "N/A"),
        type: getFieldValue(req.Type || req.Request_Type, "Other"),
        status: getFieldValue(req.Status, "Unknown"),
        created_time: req.Created_Time || req.created_time,
    });

    stats.recent_requests = sortedNewestFirst.slice(0, 10).map(toListItem);

    // Missed requests: Pending AND older than 1 hour. Already sorted newest-first.
    const oneHourAgoMs = Date.now() - 60 * 60 * 1000;
    stats.missed_requests = sortedNewestFirst
        .filter((req) => {
            if (getFieldValue(req.Status, "") !== "Pending") return false;
            const createdMs = new Date(req.Created_Time || req.created_time).getTime();
            return Number.isFinite(createdMs) && createdMs < oneHourAgoMs;
        })
        .slice(0, 10)
        .map(toListItem);

    return stats;
}

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const startDate = searchParams.get("startDate");
        const endDate = searchParams.get("endDate");
        const queryConditions = searchParams.get("conditions"); // JSON string of conditions
        const testMode = searchParams.get("testMode") === "true";
        const propertyId = searchParams.get("propertyId");

        console.log("[Zoho API] Starting request...");
        console.log("[Zoho API] Date filters:", { startDate, endDate });
        console.log("[Zoho API] testMode:", testMode);
        console.log("[Zoho API] propertyId:", propertyId);
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

        // Test-mode filter: exclude rooms 000/1000 when testMode is OFF.
        // Applied first so the headline "total_fetched" reflects what the user is allowed to see.
        let filteredRequests = filterTestRooms(allRequests, testMode);
        console.log(`[Zoho API] After test-mode filter: ${filteredRequests.length}`);

        // Property filter
        filteredRequests = filterByProperty(filteredRequests, propertyId);
        console.log(`[Zoho API] After property filter: ${filteredRequests.length}`);

        // Date filter
        filteredRequests = filterByDateRange(filteredRequests, startDate, endDate);
        console.log(`[Zoho API] After date filter: ${filteredRequests.length}`);

        // Custom query conditions
        if (parsedConditions && parsedConditions.length > 0) {
            filteredRequests = filterByConditions(filteredRequests, parsedConditions);
            console.log(`[Zoho API] After query filter: ${filteredRequests.length}`);
        }

        const stats = aggregateData(filteredRequests);

        return NextResponse.json({
            success: true,
            data: stats,
            total_fetched: allRequests.length,
            filters_applied: {
                startDate,
                endDate,
                testMode,
                propertyId,
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
