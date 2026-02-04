import axios from "axios";

export default class Zohocrm {
  accessToken: string = "";
  constructor() {}

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
      throw error;
    }
  }

  async getModuleDataBySearch(
    moduleName: string,
    criteria: string,
    limit: Number = 10
  ) {
    if (this.accessToken) {
      const response = await axios.get(
        `https://www.zohoapis.in/crm/v8/${moduleName}/search`,
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
      return response.data.data;
    }
    return "INVALID ACCESS TOKEN";
  }

  async getRecordById(moduleName: string, recordId: string) {
    if (!this.accessToken) {
      throw new Error("No access token available");
    }

    try {
      const response = await axios.get(
        `https://www.zohoapis.in/crm/v8/${moduleName}/${recordId}`,
        {
          headers: {
            Authorization: `Zoho-oauthtoken ${this.accessToken}`,
          },
        }
      );

      // Check if data exists in response
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
    } catch (error: any) {
      // If it's an axios error, provide more details
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

  async updateRecord(moduleName: string, recordId: string, data: any) {
    if (!this.accessToken) {
      throw new Error("No access token available");
    }

    try {
      const response = await axios.put(
        `https://www.zohoapis.in/crm/v8/${moduleName}/${recordId}`,
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
    } catch (error: any) {
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
