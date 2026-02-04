// app/api/staff/less-tickets/route.js
import Zohocrm from "@/utils/Zohocrm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const staffRole = req.nextUrl.searchParams.get("staffRole");
    const zohoCRMHandler = new Zohocrm();
    await zohoCRMHandler.generateToken();
    const staffs = await zohoCRMHandler.getModuleDataBySearch(
      "Staffs",
      `(Role:equals:${staffRole}) and (Status:equals:Available)`
    );
    const staffRequestsMap: any = {};
    for (let staff of staffs) {
      const data = await zohoCRMHandler.getModuleDataBySearch(
        "Service_Requests",
        `(Staff:equals:${staff.id})`
      );
      if (data && data.length > 0) {
        staffRequestsMap[staff.id] = data.length;
      } else {
        staffRequestsMap[staff.id] = 0;
      }
    }

    const minId = Object.entries(staffRequestsMap).reduce(
      (minEntry: any, currentEntry: any) => {
        return currentEntry[1] < minEntry[1] ? currentEntry : minEntry;
      }
    )[0];

    const response = {
      staffId: minId,
      mobileNo: staffs.find((staff: any) => staff.id === minId).Mobile,
      totalRequests: staffRequestsMap[minId],
    };
    let responseJson = {
      success: true,
      data: response,
      status: 200,
    };
    return NextResponse.json(responseJson);
  } catch (error: any) {
    return NextResponse.json({
      status: 500,
      message: error.message,
    });
  }
}
