import Wati from "@/utils/Wati";
import Zohocrm from "@/utils/Zohocrm";
import TaskClassifier from "@/utils/TaskClassifier";
import { NextRequest, NextResponse } from "next/server";
import { readEscalationConfig } from "@/utils/ConfigManager";

// Helper function to wait for specified milliseconds
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Helper function to extract room number as string
function extractRoomNumber(room: any): string {
  if (!room) return "NA";
  if (typeof room === "string") return room;
  if (typeof room === "object") {
    if (room.name) return String(room.name);
    if (room.id) return String(room.id);
  }
  return String(room);
}

// Get dynamic configuration
function getConfig() {
  return readEscalationConfig();
}

// Async escalation process (sequential with waiting and status checks)
async function runEscalation(
  recordId: string,
  levels: string[],
  category: string,
  initialWait: number = 1
) {
  // Load dynamic configuration
  const config = getConfig();
  const zohoCRMHandler = new Zohocrm();
  await zohoCRMHandler.generateToken();
  const watiHandler = new Wati();

  try {
    console.log(
      `[Escalation] Starting escalation for record ID: ${recordId} through levels: ${levels.join(
        " → "
      )}`
    );

    // Get the service request details from Zoho
    const request = await zohoCRMHandler.getRecordById(
      "Service_Requests",
      recordId
    );
    if (!request) {
      console.error(`[Escalation] Service request ${recordId} not found`);
      return;
    }

    console.log(
      `[Escalation] Service request data:`,
      JSON.stringify(request, null, 2)
    );

    // Extract room number and fetch guest details once
    const roomNumber = extractRoomNumber(request.Room || request.Room_Number);
    console.log(`[Escalation] Extracted room number: "${roomNumber}"`);

    let guestName = "NA";
    let guestPhone = "NA";
    let userType = "Non-Guest";

    if (roomNumber && roomNumber !== "000") {
      userType = "Guest";
      try {
        console.log(
          `[Escalation] Looking for guest with room number: "${roomNumber}"`
        );
        const guests = await zohoCRMHandler.getModuleDataBySearch(
          "Guests",
          `(Room:equals:${roomNumber})`
        );

        console.log(
          `[Escalation] Guest search returned ${guests?.length || 0} results`
        );
        if (guests && guests.length > 0) {
          console.log(
            `[Escalation] Guest data:`,
            JSON.stringify(guests[0], null, 2)
          );
          const guest = guests[0];
          guestName = guest.Guest_Name || guest.Name || "NA";
          guestPhone = guest.Phone_No || guest.Mobile || guest.Phone || "NA";
          console.log(
            `[Escalation] Extracted - Name: "${guestName}", Phone: "${guestPhone}"`
          );
        } else {
          console.log(`[Escalation] No guest found for room "${roomNumber}"`);
        }
      } catch (error: any) {
        console.error(
          `[Escalation] Error fetching guest details:`,
          error.message
        );
      }
    } else {
      console.log(`[Escalation] Room is "000" or empty, skipping guest lookup`);
    }

    // INITIAL WAIT: Give the original staff time to respond before escalating
    // Skip initial wait if initial_wait parameter is 0 (e.g., when no staff available)
    if (initialWait === 0) {
      console.log(
        `[Escalation] initial_wait=0, skipping initial wait and proceeding directly to escalation`
      );
    } else {
      // Wait time is based on task category (T1/T2/T3/T4)
      const initialWaitTime =
        config.timings[category as keyof typeof config.timings] ||
        config.timings.T2;
      console.log(
        `[Escalation] Category: ${category}, Initial wait of ${
          initialWaitTime / 1000
        } seconds before checking status...`
      );
      await wait(initialWaitTime);

      // Check if status has changed (original staff may have responded)
      const initialCheck = await zohoCRMHandler.getRecordById(
        "Service_Requests",
        recordId
      );
      if (initialCheck.Status !== "Pending") {
        console.log(
          `[Escalation] Service request ${recordId} status changed to ${initialCheck.Status} during initial wait. No escalation needed.`
        );
        return; // Stop - original staff responded
      }
    }

    console.log(
      `[Escalation] Status still 'Pending' after initial wait. Proceeding with escalation through ${levels.length} level(s).`
    );

    // Iterate through each escalation level
    for (const level of levels) {
      const role = config.levels[level];
      if (!role) {
        console.error(`[Escalation] Unknown level: ${level}. Skipping.`);
        continue;
      }

      console.log(
        `[Escalation] Processing level ${level} (${role}) for ${recordId}`
      );

      // Fetch staff members with this role from Zoho
      const staffMembers = await zohoCRMHandler.getModuleDataBySearch(
        "Staffs",
        `(Role:equals:${role})`
      );

      if (!staffMembers || staffMembers.length === 0) {
        console.error(`[Escalation] No ${role} found. Skipping level ${level}`);
        continue;
      }

      console.log(`[Escalation] Found ${staffMembers.length} ${role}(s)`);

      // Update the Staff field to the first staff member at this level
      // This ensures Make.com can find the correct staff when they acknowledge
      try {
        console.log(
          `[Escalation] Updating Staff field to ${staffMembers[0].Name1} (${staffMembers[0].id})`
        );
        await zohoCRMHandler.updateRecord("Service_Requests", recordId, {
          Staff: staffMembers[0].id,
        });
        console.log(
          `[Escalation] Staff field updated successfully to ${staffMembers[0].Name1}`
        );
      } catch (error: any) {
        console.error(
          `[Escalation] Failed to update Staff field:`,
          error.message
        );
        // Continue with escalation even if update fails
      }

      // Send message to all staff at this level
      for (const staff of staffMembers) {
        const parameters = [
          { name: "severity", value: "Escalation" },
          { name: "reasonCode", value: staff.Role || "NA" },
          { name: "level", value: "High" },
          { name: "userType", value: userType },
          { name: "userName", value: guestName },
          { name: "system", value: "Buteak Suites" },
          { name: "text", value: request.Name || request.Title || "NA" },
          { name: "roomNo", value: roomNumber },
          { name: "phone", value: guestPhone },
        ];

        try {
          console.log(
            `[Escalation] Sending initial message to ${staff.Name1} (${staff.Role}) at ${staff.Mobile}`
          );
          await watiHandler.sendTemplateMessage(
            staff.Mobile,
            "escalation_template",
            parameters
          );
          console.log(`[Escalation] Initial message sent to ${staff.Name1}`);
        } catch (error: any) {
          console.error(
            `[Escalation] Failed to send initial message to ${staff.Name1}:`,
            error.message
          );
        }
      }

      // Wait for configured duration
      console.log(
        `[Escalation] Waiting ${
          config.timings.escalationWait / 1000
        } seconds...`
      );
      await wait(config.timings.escalationWait);

      // Check if request status has changed
      const currentRecord = await zohoCRMHandler.getRecordById(
        "Service_Requests",
        recordId
      );
      if (currentRecord.Status !== "Pending") {
        console.log(
          `[Escalation] Service request ${recordId} status changed to ${currentRecord.Status}. Stopping escalation.`
        );
        return;
      }

      // Send reminder messages to all staff at this level
      for (const staff of staffMembers) {
        const parameters = [
          { name: "severity", value: "Escalation" },
          { name: "reasonCode", value: staff.Role || "NA" },
          { name: "level", value: "High" },
          { name: "userType", value: userType },
          { name: "userName", value: guestName },
          { name: "system", value: "Buteak Suites" },
          { name: "text", value: request.Name || request.Title || "NA" },
          { name: "roomNo", value: roomNumber },
          { name: "phone", value: guestPhone },
        ];

        try {
          console.log(
            `[Escalation] Sending reminder to ${staff.Name1} at ${staff.Mobile}`
          );
          await watiHandler.sendTemplateMessage(
            staff.Mobile,
            "escalation_template",
            parameters
          );
          console.log(`[Escalation] Reminder sent to ${staff.Name1}`);
        } catch (error: any) {
          console.error(
            `[Escalation] Failed to send reminder to ${staff.Name1}:`,
            error.message
          );
        }
      }

      // Wait before moving to next level
      console.log(
        `[Escalation] Waiting ${
          config.timings.escalationWait / 1000
        } seconds before next level...`
      );
      await wait(config.timings.escalationWait);

      // Check again if request status has changed
      const finalCheck = await zohoCRMHandler.getRecordById(
        "Service_Requests",
        recordId
      );
      if (finalCheck.Status !== "Pending") {
        console.log(
          `[Escalation] Service request ${recordId} status changed to ${finalCheck.Status}. Stopping escalation.`
        );
        return;
      }
    }

    console.log(
      `[Escalation] Completed all escalation levels for record ID: ${recordId}`
    );
  } catch (error: any) {
    console.error(
      `[Escalation] Error during escalation for ${recordId}:`,
      error.message
    );
  }
}

// Async broadcast process (parallel, no waiting or status checks)
async function runBroadcast(recordId: string, levels: string[]) {
  // Load dynamic configuration
  const config = getConfig();
  const zohoCRMHandler = new Zohocrm();
  await zohoCRMHandler.generateToken();
  const watiHandler = new Wati();

  try {
    console.log(
      `[Broadcast] Starting broadcast for record ID: ${recordId} to levels: ${levels.join(
        ", "
      )}`
    );

    // Get the service request details from Zoho
    const request = await zohoCRMHandler.getRecordById(
      "Service_Requests",
      recordId
    );
    if (!request) {
      console.error(`[Broadcast] Service request ${recordId} not found`);
      return;
    }

    console.log(
      `[Broadcast] Service request data:`,
      JSON.stringify(request, null, 2)
    );

    // Extract room number and fetch guest details once
    const roomNumber = extractRoomNumber(request.Room || request.Room_Number);
    console.log(`[Broadcast] Extracted room number: "${roomNumber}"`);

    let guestName = "NA";
    let guestPhone = "NA";
    let userType = "Non-Guest";

    if (roomNumber && roomNumber !== "000") {
      userType = "Guest";
      try {
        console.log(
          `[Broadcast] Looking for guest with room number: "${roomNumber}"`
        );
        const guests = await zohoCRMHandler.getModuleDataBySearch(
          "Guests",
          `(Room:equals:${roomNumber})`
        );

        if (guests && guests.length > 0) {
          const guest = guests[0];
          guestName = guest.Guest_Name || guest.Name || "NA";
          guestPhone = guest.Phone_No || guest.Mobile || guest.Phone || "NA";
          console.log(
            `[Broadcast] Extracted - Name: "${guestName}", Phone: "${guestPhone}"`
          );
        }
      } catch (error: any) {
        console.error(
          `[Broadcast] Error fetching guest details:`,
          error.message
        );
      }
    }

    // Collect all staff from all levels
    const allStaff: any[] = [];
    for (const level of levels) {
      const role = config.levels[level];
      if (!role) {
        console.error(`[Broadcast] Unknown level: ${level}. Skipping.`);
        continue;
      }

      console.log(`[Broadcast] Fetching ${role}(s) for level ${level}`);
      const staffMembers = await zohoCRMHandler.getModuleDataBySearch(
        "Staffs",
        `(Role:equals:${role})`
      );

      if (staffMembers && staffMembers.length > 0) {
        console.log(`[Broadcast] Found ${staffMembers.length} ${role}(s)`);
        allStaff.push(...staffMembers);
      } else {
        console.log(`[Broadcast] No ${role} found for level ${level}`);
      }
    }

    if (allStaff.length === 0) {
      console.log(
        `[Broadcast] No staff found for any level. Broadcast aborted.`
      );
      return;
    }

    console.log(
      `[Broadcast] Sending broadcast to ${allStaff.length} staff member(s)`
    );

    // Send message to all staff simultaneously (no waiting)
    const sendPromises = allStaff.map(async (staff) => {
      const parameters = [
        { name: "severity", value: "Broadcast" },
        { name: "reasonCode", value: staff.Role || "NA" },
        { name: "level", value: "High" },
        { name: "userType", value: userType },
        { name: "userName", value: guestName },
        { name: "system", value: "Buteak Suites" },
        { name: "text", value: request.Name || request.Title || "NA" },
        { name: "roomNo", value: roomNumber },
        { name: "phone", value: guestPhone },
      ];

      try {
        console.log(
          `[Broadcast] Sending to ${staff.Name1} (${staff.Role}) at ${staff.Mobile}`
        );
        await watiHandler.sendTemplateMessage(
          staff.Mobile,
          "escalation_template",
          parameters
        );
        console.log(`[Broadcast] Message sent to ${staff.Name1}`);
      } catch (error: any) {
        console.error(
          `[Broadcast] Failed to send to ${staff.Name1}:`,
          error.message
        );
      }
    });

    // Wait for all messages to be sent
    await Promise.all(sendPromises);

    console.log(`[Broadcast] Broadcast completed for record ID: ${recordId}`);
  } catch (error: any) {
    console.error(
      `[Broadcast] Error during broadcast for ${recordId}:`,
      error.message
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    // Parse request body
    const body = await req.json();
    const { recordId, levels, type, initial_wait } = body;

    // Validate required fields
    if (!recordId) {
      return NextResponse.json({
        success: false,
        message: "recordId is required",
        status: 400,
      });
    }

    if (!levels || !Array.isArray(levels) || levels.length === 0) {
      return NextResponse.json({
        success: false,
        message: "levels must be a non-empty array (e.g., ['L1', 'L2'])",
        status: 400,
      });
    }

    if (!type || (type !== "escalate" && type !== "broadcast")) {
      return NextResponse.json({
        success: false,
        message: "type must be either 'escalate' or 'broadcast'",
        status: 400,
      });
    }

    // Validate levels against dynamic configuration
    const config = getConfig();
    const validLevels = Object.keys(config.levels);
    const invalidLevels = levels.filter(
      (level: string) => !validLevels.includes(level)
    );
    if (invalidLevels.length > 0) {
      return NextResponse.json({
        success: false,
        message: `Invalid levels: ${invalidLevels.join(
          ", "
        )}. Valid levels are: ${validLevels.join(", ")}`,
        status: 400,
      });
    }

    console.log(
      `[API] Starting ${type} for record ID: ${recordId} with levels: ${levels.join(
        ", "
      )}`
    );

    // Initialize Zoho handler
    const zohoCRMHandler = new Zohocrm();
    await zohoCRMHandler.generateToken();

    // Get the service request from Zoho
    const request = await zohoCRMHandler.getRecordById(
      "Service_Requests",
      recordId
    );

    if (!request) {
      return NextResponse.json({
        success: false,
        message: `Service request with ID ${recordId} not found`,
        status: 404,
      });
    }

    console.log(
      `[API] Service request found: ${request.Name}, Status: ${request.Status}`
    );

    // Get task description from Service_Request Title/Name field
    const task = request.Title || request.Name || "Unknown task";
    console.log(`[API] Task classification starting for: "${task}"`);

    // Classify the task using GPT-4o-mini
    const taskClassifier = new TaskClassifier();
    const category = await taskClassifier.classifyTask(task);

    console.log(`[API] Task classified as: ${category}`);

    // T4 tasks are ALWAYS broadcast, regardless of type parameter
    let finalType = type;
    if (category === "T4") {
      finalType = "broadcast";
      console.log(
        `[API] Task is T4 (Critical Emergency) - forcing broadcast mode`
      );
    }

    // For escalation, check if already handled
    if (finalType === "escalate" && request.Status !== "Pending") {
      return NextResponse.json({
        success: true,
        message: `Service request already handled. Current status: ${request.Status}`,
        recordId: recordId,
        task: task,
        category: category,
        type: finalType,
        levels: levels,
        currentStatus: request.Status,
        status: 200,
      });
    }

    // Start escalation or broadcast process in background
    if (finalType === "escalate") {
      // Pass initial_wait parameter (defaults to 1 if not provided)
      const initialWaitValue = initial_wait !== undefined ? initial_wait : 1;
      runEscalation(recordId, levels, category, initialWaitValue).catch(
        (error) => {
          console.error(
            `[API] Unhandled error in escalation for ${recordId}:`,
            error
          );
        }
      );
    } else {
      runBroadcast(recordId, levels).catch((error) => {
        console.error(
          `[API] Unhandled error in broadcast for ${recordId}:`,
          error
        );
      });
    }

    // Return immediate response
    return NextResponse.json({
      success: true,
      message:
        finalType === "escalate" ? "Escalation started" : "Broadcast sent",
      recordId: recordId,
      task: task,
      category: category,
      type: finalType,
      levels: levels,
      requestName: request.Name,
      status: 200,
    });
  } catch (error: any) {
    console.error("[API] Error:", error);
    return NextResponse.json({
      success: false,
      message: error.message || "Internal server error",
      status: 500,
    });
  }
}
