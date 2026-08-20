import { NextResponse } from "next/server";
import { FAQ_RETIRED } from "@/lib/config";

/**
 * RETIRED 2026-08-20 — see lib/config.js for the full reasoning.
 *
 * This proxied POST /rebuild on the standalone FAQ service. That service was deleted
 * when the chatbot became a sidecar in the tds-backend task; the write endpoints
 * were removed deliberately, not incidentally, and must not be restored while
 * tds-api runs more than one task.
 *
 * 501 rather than a silent success: a control that appears to reindex and does
 * nothing is worse than one that says it is gone.
 */
export async function POST() {
    return NextResponse.json(FAQ_RETIRED, { status: 501 });
}
