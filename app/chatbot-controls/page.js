import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";

/**
 * RETIRED 2026-08-20.
 *
 * This page used to drive /update, /rebuild and /delete on the FAQ chatbot. All
 * three are now unreachable by design — see lib/config.js for why, and why they
 * must not be restored while tds-api runs more than one task.
 *
 * The page is kept, rather than deleted, so that whoever comes looking for the
 * chatbot controls finds out where they went and what to do instead. It is now a
 * server component with no state, no password gate and no fetches.
 */
export default function ChatbotControls() {
    return (
        <main className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-dark-bg dark:via-dark-surface dark:to-dark-surface-1">
            <ThemeToggle />

            <div className="container mx-auto px-4 py-8 max-w-3xl">
                <Link
                    href="/"
                    className="inline-flex items-center text-buteak-primary dark:text-buteak-gold hover:underline mb-6"
                >
                    <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Home
                </Link>

                <h1 className="text-4xl font-bold bg-gradient-to-r from-buteak-primary to-buteak-gold bg-clip-text text-transparent">
                    Chatbot Controls
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2 mb-8">
                    Retired 20 August 2026. This page no longer controls anything.
                </p>

                <div className="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 p-6 mb-6">
                    <h2 className="font-semibold text-amber-900 dark:text-amber-200 mb-2">
                        To pick up a Google Sheet edit
                    </h2>
                    <p className="text-sm text-amber-900/90 dark:text-amber-200/90">
                        Run the <strong>&ldquo;Deploy FAQ Chatbot&rdquo;</strong> GitHub Actions
                        workflow by hand (<code>workflow_dispatch</code> &mdash; no commit needed).
                        It restarts both backend tasks, and each one rebuilds all three property
                        indexes from the sheet in about five seconds.
                    </p>
                </div>

                <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-surface-2 p-6 space-y-4">
                    <h2 className="font-semibold text-gray-900 dark:text-gray-100">
                        What happened
                    </h2>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                        The chatbot moved off the <code>api.buteak.in</code> t3.small on 19 August,
                        briefly ran as its own ECS service at <code>faq.thedailysocial.co.in</code>,
                        and on 20 August became a <strong>sidecar container inside the backend&rsquo;s
                        own task</strong>. It is now reachable only on <code>127.0.0.1:8000</code>
                        from within that task. There is no public endpoint, no load balancer rule
                        and no DNS record, so nothing on this page has anything to call.
                    </p>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                        That was deliberate on two counts. The old{" "}
                        <code>POST /delete?property_id=…</code> was publicly reachable and
                        unauthenticated &mdash; anyone on the internet could wipe a property&rsquo;s
                        search index. And the backend runs <strong>two tasks</strong>, each holding
                        its own in-memory index, so a single reindex would land in one of them and
                        leave the two disagreeing. Removing the write path is what makes the new
                        design correct: every task rebuilds from the same sheet at start and is
                        identical by construction.
                    </p>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                        Full record:{" "}
                        <code className="text-xs">
                            docs/aws_migration/buteak_faq_sidecar_consolidation_2026-08-20.md
                        </code>
                    </p>
                </div>
            </div>
        </main>
    );
}
