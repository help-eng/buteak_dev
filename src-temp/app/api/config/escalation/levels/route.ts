import { NextRequest, NextResponse } from "next/server";
import {
  readEscalationConfig,
  writeEscalationConfig,
  validateLevels,
} from "@/utils/ConfigManager";

/**
 * PATCH /api/config/escalation/levels
 * Updates only the levels configuration
 */
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate the levels
    const validation = validateLevels(body);
    if (!validation.valid) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid levels configuration",
          errors: validation.errors,
        },
        { status: 400 }
      );
    }

    // Read current config
    const currentConfig = readEscalationConfig();

    // Update only levels
    const updatedConfig = {
      ...currentConfig,
      levels: body,
    };

    // Write the updated configuration
    writeEscalationConfig(updatedConfig);

    return NextResponse.json({
      success: true,
      data: updatedConfig,
      message: "Levels updated successfully",
    });
  } catch (error: any) {
    console.error("[API] Error updating levels:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to update levels",
      },
      { status: 500 }
    );
  }
}
