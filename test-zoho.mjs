// test-zoho-data.mjs - Test different endpoints to find what works
import axios from "axios";

const clientId = "1000.B9Y9GLO4MMATWJ31V0JU3HYJO6PVED";
const clientSecret = "4e30a97eda4e7d265ee8d36fe0fd96a2264dd5d63b";
const url = "https://accounts.zoho.in/oauth/v2/token";

const params = new URLSearchParams();
params.append("client_id", clientId);
params.append("client_secret", clientSecret);
params.append("grant_type", "client_credentials");
params.append("scope", "ZohoCRM.modules.ALL");
params.append("soid", "ZohoCRM.60041115925");

async function test() {
    try {
        // Get token
        const authResponse = await axios.post(url, params, {
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
        });
        const accessToken = authResponse.data.access_token;
        console.log("TOKEN OK\n");

        // Test 1: Try v6 API instead of v8
        console.log("--- Test 1: v6 API ---");
        try {
            const r1 = await axios.get(
                "https://www.zohoapis.in/crm/v6/Service_Requests",
                {
                    headers: { Authorization: `Zoho-oauthtoken ${accessToken}` },
                    params: { per_page: 5 },
                }
            );
            console.log("v6 OK:", r1.data.data?.length, "records");
        } catch (e) {
            console.log("v6 ERROR:", e.response?.status, e.response?.data?.code);
        }

        // Test 2: Try v2 API (older, more stable)
        console.log("\n--- Test 2: v2 API ---");
        try {
            const r2 = await axios.get(
                "https://www.zohoapis.in/crm/v2/Service_Requests",
                {
                    headers: { Authorization: `Zoho-oauthtoken ${accessToken}` },
                    params: { per_page: 5 },
                }
            );
            console.log("v2 OK:", r2.data.data?.length, "records");
        } catch (e) {
            console.log("v2 ERROR:", e.response?.status, e.response?.data?.code);
        }

        // Test 3: Try coql query instead
        console.log("\n--- Test 3: COQL Query ---");
        try {
            const r3 = await axios.post(
                "https://www.zohoapis.in/crm/v8/coql",
                {
                    select_query: "select id, Status, Room, Type from Service_Requests limit 5"
                },
                {
                    headers: {
                        Authorization: `Zoho-oauthtoken ${accessToken}`,
                        "Content-Type": "application/json"
                    },
                }
            );
            console.log("COQL OK:", r3.data.data?.length, "records");
            if (r3.data.data?.[0]) console.log("Sample:", Object.keys(r3.data.data[0]));
        } catch (e) {
            console.log("COQL ERROR:", e.response?.status, e.response?.data?.code || e.response?.data);
        }

    } catch (error) {
        console.log("AUTH ERROR:", error.response?.status, error.response?.data);
    }
}

test();
