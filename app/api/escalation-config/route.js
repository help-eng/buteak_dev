import { NextResponse } from "next/server";

/**
 * RETIRED 2026-08-19.
 *
 * This used to proxy https://api.buteak.in/workflow/api/config/escalation — a route
 * in the `buteak_workflow` Next.js app on the t3.small. That app was the make.com-era
 * helper for the service flow and has been superseded by the NestJS backend. It had
 * taken **zero requests** in the ten days of nginx logs still retained on the box, and
 * its own application log had not been written to since 2026-07-21. It was not
 * migrated, and the box it runs on is being terminated.
 *
 * There is no drop-in replacement, and this is deliberately NOT repointed at a
 * best guess, because the escalation model itself changed underneath it:
 *
 *   - Escalation is now driven by `staff.escalation_level` POSITION rather than by
 *     role name, and the ladder is staff-only — the admin_users rungs were dropped.
 *   - Configuration lives behind the admin API, which is JWT-guarded:
 *       GET   /admin/sla-config
 *       POST  /admin/sla-config
 *       PATCH /admin/sla-config/:taskCategory
 *       GET   /admin/escalation-levels/:propertyId
 *       PATCH /admin/escalation-levels/:propertyId/:level
 *     on https://api.thedailysocial.co.in
 *
 * Wiring this page back up therefore means adding admin authentication to the
 * dashboard AND translating between the old flat config shape and the per-property
 * ladder. That is real work with a real chance of writing bad escalation config, so
 * it is left explicit rather than half-done: an honest 501 beats a page that appears
 * to save and silently does not.
 *
 * Until then, edit escalation configuration through the admin frontend.
 */

const RETIRED = {
    error: "Escalation config is no longer served by this dashboard.",
    reason:
        "It proxied the buteak_workflow app on the api.buteak.in t3.small, which was " +
        "superseded by the NestJS backend and is being decommissioned.",
    replacement: {
        host: "https://api.thedailysocial.co.in",
        endpoints: [
            "GET   /admin/sla-config",
            "POST  /admin/sla-config",
            "PATCH /admin/sla-config/:taskCategory",
            "GET   /admin/escalation-levels/:propertyId",
            "PATCH /admin/escalation-levels/:propertyId/:level",
        ],
        auth: "Admin JWT required — this dashboard has no admin login yet.",
        note:
            "Escalation now ladders by staff.escalation_level position, not role name, " +
            "so the old flat config shape does not map across one-to-one.",
    },
    useInstead: "The admin frontend.",
};

export async function GET() {
    return NextResponse.json(RETIRED, { status: 501 });
}

export async function PUT() {
    // Explicitly refuse writes. Silently accepting them and dropping them on the
    // floor would be the worst outcome here.
    return NextResponse.json(RETIRED, { status: 501 });
}
