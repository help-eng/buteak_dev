import Zohocrm from "@/utils/Zohocrm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const role = req.nextUrl.searchParams.get("role") || "Manager";

    const zohoCRMHandler = new Zohocrm();
    await zohoCRMHandler.generateToken();

    console.log(`[Test] Searching for staff with Role=${role}`);

    // Test 1: Search with Status=Available
    const availableStaff = await zohoCRMHandler.getModuleDataBySearch(
      "Staffs",
      `(Role:equals:${role}) and (Status:equals:Available)`
    );

    // Test 2: Search with only Role
    const allStaffWithRole = await zohoCRMHandler.getModuleDataBySearch(
      "Staffs",
      `(Role:equals:${role})`
    );

    return NextResponse.json({
      success: true,
      role: role,
      availableStaff: availableStaff || [],
      availableCount: availableStaff?.length || 0,
      allStaffWithRole: allStaffWithRole || [],
      allCount: allStaffWithRole?.length || 0,
      status: 200,
    });
  } catch (error: any) {
    console.error("[Test] Error:", error);
    return NextResponse.json({
      success: false,
      message: error.message || "Internal server error",
      status: 500,
    });
  }
}
