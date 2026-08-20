/**
 * The FAQ chatbot no longer has an address this dashboard can reach.
 *
 * Timeline, because this file changed twice in two days:
 *
 *   - until 2026-08-19  it ran on the api.buteak.in t3.small
 *   - 2026-08-19        it moved to its own ECS service at faq.thedailysocial.co.in,
 *                       and this file exported a `faqUrl()` helper pointing there
 *   - 2026-08-20        that service was deleted. The chatbot now runs as a
 *                       non-essential SIDECAR container inside the tds-backend task
 *                       and is reachable only on http://127.0.0.1:8000 — inside the
 *                       task's own network namespace. There is no public endpoint,
 *                       no ALB rule and no DNS record.
 *
 * So `faqUrl()` is gone rather than repointed: there is no value it could hold that
 * would work from here. A loopback address would resolve to whatever machine is
 * running this dashboard, which is not the chatbot.
 *
 * Two reasons the endpoint was removed rather than kept, both of which matter if
 * anyone is tempted to put it back:
 *
 *   1. `POST /delete?property_id=…` was publicly reachable and unauthenticated. It
 *      wiped a property's search index. Anyone on the internet could fire it.
 *   2. `tds-api` runs TWO tasks, so each holds its own in-memory FAISS index. An
 *      /update lands in whichever task the load balancer picked, leaving the two
 *      disagreeing. The sidecar design is only correct BECAUSE the write path is
 *      unreachable: every task rebuilds from the same Google Sheet at start and is
 *      identical by construction.
 *
 * Do not re-expose /update, /rebuild or /delete while tds-api runs more than one
 * task. That is the single change that would break the design.
 *
 * To pick up a Google Sheet edit, run the "Deploy FAQ Chatbot" GitHub Actions
 * workflow by hand (workflow_dispatch, no commit needed). It restarts both tasks and
 * each rebuilds all three property indexes from the sheet in about five seconds.
 *
 * See docs/aws_migration/buteak_faq_sidecar_consolidation_2026-08-20.md in the
 * Vibehouse docs repo.
 */

export const FAQ_RETIRED = {
    error: "The FAQ chatbot is no longer reachable from this dashboard.",
    reason:
        "On 2026-08-20 it stopped being its own ECS service and became a sidecar " +
        "container inside the tds-backend task, reachable only on 127.0.0.1:8000 " +
        "from within that task. faq.thedailysocial.co.in no longer resolves.",
    toReindexAfterASheetEdit:
        'Run the "Deploy FAQ Chatbot" GitHub Actions workflow by hand ' +
        "(workflow_dispatch). It restarts both tasks and each rebuilds all three " +
        "property indexes from the sheet in about five seconds.",
    whyNotJustProxyIt:
        "tds-api runs two tasks, each with its own in-memory index. A single " +
        "/update would land in one of them and leave the two disagreeing. The write " +
        "path being unreachable is what makes the sidecar design correct.",
    doc: "docs/aws_migration/buteak_faq_sidecar_consolidation_2026-08-20.md",
};
