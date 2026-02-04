import { NextRequest, NextResponse } from "next/server";
import {
  readEscalationConfig,
  writeEscalationConfig,
  validateTimings,
} from "@/utils/ConfigManager";

/**
 * PATCH /api/config/escalation/timings
 * Updates only the timing configuration
 */
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate the timings
    const validation = validateTimings(body);
    if (!validation.valid) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid timings configuration",
          errors: validation.errors,
        },
        { status: 400 }
      );
    }

    // Read current config
    const currentConfig = readEscalationConfig();

    // Update only timings
    const updatedConfig = {
      ...currentConfig,
      timings: body,
    };

    // Write the updated configuration
    writeEscalationConfig(updatedConfig);

    return NextResponse.json({
      success: true,
      data: updatedConfig,
      message: "Timings updated successfully",
    });
  } catch (error: any) {
    console.error("[API] Error updating timings:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to update timings",
      },
      { status: 500 }
    );
  }
}
