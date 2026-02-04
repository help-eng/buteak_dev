import Wati from "@/utils/Wati";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const mobileNo = req.nextUrl.searchParams.get("mobileNo") || "";
    const watiHandler = new Wati();
    const messages = await watiHandler.getMessages(mobileNo);
    const currentSessionMessages = [];
    if (messages.messages.items.length > 0) {
      for (let message of messages.messages.items) {
        if (
          message.eventType === "ticket" &&
          message.eventDescription === "The chat has been closed by Bot"
        ) {
          break;
        }

        if (message.type && message.text) {
          currentSessionMessages.push({
            text: message.text,
            type: message.type,
            messagedBy: message.owner ? "Company" : "Customer",
          });
        }
      }
    }

    let responseJson = {
      success: true,
      currentSessionMessages: currentSessionMessages,
      status: 200,
    };
    return NextResponse.json(responseJson);
  } catch (error) {
    return NextResponse.json({
      status: 500,
      error,
    });
  }
}
