import axios from "axios";

export default class Zohocrm {
    accessToken = "";

    constructor() { }

    async generateToken() {
        const clientId = process.env.ZOHO_CLIENT_ID || "";
        const clientSecret = process.env.ZOHO_CLIENT_SECRET || "";

        const url = "https://accounts.zoho.in/oauth/v2/token";

        const params = new URLSearchParams();
        params.append("client_id", clientId);
        params.append("client_secret", clientSecret);
        params.append("grant_type", "client_credentials");
        params.append("scope", "ZohoCRM.modules.ALL");
        params.append("soid", "ZohoCRM.60041115925");

        try {
            const response = await axios.post(url, params, {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
            });

            const accessToken = response.data.access_token;
            this.accessToken = accessToken;
            return accessToken;
        } catch (error) {
            console.error("[Zohocrm] Token generation error:", error.response?.data || error.message);
            throw error;
        }
    }

    async getModuleDataBySearch(moduleName, criteria, limit = 200) {
        if (!this.accessToken) {
            throw new Error("No access token available. Call generateToken() first.");
        }

        try {
            const response = await axios.get(
                `https://www.zohoapis.in/crm/v2/${moduleName}/search`,
                {
                    headers: {
                        Authorization: `Zoho-oauthtoken ${this.accessToken}`,
                    },
                    params: {
                        criteria: criteria,
                        per_page: limit,
                    },
                }
            );
            return response.data.data || [];
        } catch (error) {
            console.error(`[Zohocrm] Error fetching ${moduleName}:`, error.response?.data || error.message);
            throw error;
        }
    }

    async getAllModuleData(moduleName, limit = 200) {
        if (!this.accessToken) {
            throw new Error("No access token available. Call generateToken() first.");
        }

        try {
            const response = await axios.get(
                `https://www.zohoapis.in/crm/v2/${moduleName}`,
                {
                    headers: {
                        Authorization: `Zoho-oauthtoken ${this.accessToken}`,
                    },
                    params: {
                        per_page: limit,
                    },
                }
            );
            return response.data.data || [];
        } catch (error) {
            console.error(`[Zohocrm] Error fetching all ${moduleName}:`, error.response?.data || error.message);
            throw error;
        }
    }

    async getRecordById(moduleName, recordId) {
        if (!this.accessToken) {
            throw new Error("No access token available");
        }

        try {
            const response = await axios.get(
                `https://www.zohoapis.in/crm/v2/${moduleName}/${recordId}`,
                {
                    headers: {
                        Authorization: `Zoho-oauthtoken ${this.accessToken}`,
                    },
                }
            );

            if (
                !response.data ||
                !response.data.data ||
                response.data.data.length === 0
            ) {
                throw new Error(
                    `Record with ID ${recordId} not found in ${moduleName} module`
                );
            }

            return response.data.data[0];
        } catch (error) {
            if (error.response) {
                const status = error.response.status;
                const message =
                    error.response.data?.message ||
                    error.response.data?.error ||
                    error.message;
                throw new Error(`Zoho API error (${status}): ${message}`);
            }
            throw error;
        }
    }

    async updateRecord(moduleName, recordId, data) {
        if (!this.accessToken) {
            throw new Error("No access token available");
        }

        try {
            const response = await axios.put(
                `https://www.zohoapis.in/crm/v2/${moduleName}/${recordId}`,
                {
                    data: [data],
                },
                {
                    headers: {
                        Authorization: `Zoho-oauthtoken ${this.accessToken}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            return response.data.data[0];
        } catch (error) {
            if (error.response) {
                const status = error.response.status;
                const message =
                    error.response.data?.message ||
                    error.response.data?.error ||
                    error.message;
                throw new Error(`Zoho API error (${status}): ${message}`);
            }
            throw error;
        }
    }
}
