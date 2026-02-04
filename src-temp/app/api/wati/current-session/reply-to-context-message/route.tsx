import Wati from "@/utils/Wati";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const messageId = req.nextUrl.searchParams.get("messageId") || "";
    const conversationId = req.nextUrl.searchParams.get("conversationId") || "";
    const watiHandler = new Wati();
    const messages =
      await watiHandler.getReplyToContextMessageByMessageIdAndConversationId(
        messageId,
        conversationId
      );

    let responseJson = {
      success: true,
      currentSessionMessages: messages,
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
