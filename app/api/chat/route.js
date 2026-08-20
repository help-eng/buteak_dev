import { NextResponse } from "next/server";
import { FAQ_RETIRED } from "@/lib/config";

/**
 * RETIRED 2026-08-20 — see lib/config.js for the full reasoning.
 *
 * Unlike /update, /rebuild and /delete, there is no design objection to a
 * READ-ONLY chat probe from this dashboard — it mutates nothing and cannot make
 * the two tasks disagree. It is gone only because the chatbot no longer has an
 * address reachable from outside the tds-backend task.
 *
 * Restoring it means adding a guarded proxy route on the NestJS backend, which
 * can reach the sidecar on 127.0.0.1:8000, and pointing this at that route. That
 * is a backend change and a production deploy, so it is left undone rather than
 * guessed at. Ask before building it.
 */
export async function POST() {
    return NextResponse.json(FAQ_RETIRED, { status: 501 });
}
