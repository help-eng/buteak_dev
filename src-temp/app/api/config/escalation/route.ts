import { NextRequest, NextResponse } from "next/server";
import {
  readEscalationConfig,
  writeEscalationConfig,
  validateConfig,
} from "@/utils/ConfigManager";

/**
 * GET /api/config/escalation
 * Returns the current escalation configuration
 */
export async function GET(req: NextRequest) {
  try {
    const config = readEscalationConfig();

    return NextResponse.json({
      success: true,
      data: config,
      message: "Configuration retrieved successfully",
    });
  } catch (error: any) {
    console.error("[API] Error reading escalation config:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to read configuration",
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/config/escalation
 * Updates the entire escalation configuration
 */
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate the configuration
    const validation = validateConfig(body);
    if (!validation.valid) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid configuration",
          errors: validation.errors,
        },
        { status: 400 }
      );
    }

    // Write the new configuration
    writeEscalationConfig(body);

    return NextResponse.json({
      success: true,
      data: body,
      message: "Configuration updated successfully",
    });
  } catch (error: any) {
    console.error("[API] Error updating escalation config:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to update configuration",
      },
      { status: 500 }
    );
  }
}
