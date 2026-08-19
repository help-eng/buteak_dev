/**
 * Where the FAQ chatbot lives.
 *
 * It used to run on the api.buteak.in t3.small. On 2026-08-19 it moved into the
 * tds-production ECS cluster; the app, the routes and the request/response
 * shapes are unchanged, only the host moved. See
 * docs/aws_migration/ in the Vibehouse docs repo.
 *
 * NEXT_PUBLIC_ so the same constant works in both the route handlers and the
 * client pages. Override it to point a local dashboard at a local chatbot.
 */
export const FAQ_API_BASE = (
    process.env.NEXT_PUBLIC_FAQ_API_BASE || "https://faq.thedailysocial.co.in"
).replace(/\/+$/, "");

/** Build a chatbot URL: faqUrl("/chat") -> "https://.../chat" */
export function faqUrl(path) {
    return FAQ_API_BASE + (path.startsWith("/") ? path : "/" + path);
}
