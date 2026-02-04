import axios from "axios";

export default class Wati {
  authorizationToken: string;
  constructor() {
    this.authorizationToken = process.env.WATI_AUTHORIZATION_TOKEN || "";
  }

  // whatsapp no should be with 91
  async getMessages(whatsappNo: string) {
    try {
      const response = await axios.get(
        `https://live-mt-server.wati.io/446388/api/v1/getMessages/${whatsappNo}`,
        {
          headers: {
            "content-type": "application/json-patch+json",
            Authorization: `Bearer ${this.authorizationToken}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getReplyToContextMessageByMessageIdAndConversationId(
    messageId: string,
    conversationId: string
  ) {
    try {
      const response = await axios.post(
        `https://live-mt-server.wati.io/446388/api/v1/conversations/getbyconversation/${conversationId}`,
        {
          pageSize: 50,
          lastId: null,
        },
        {
          headers: {
            Authorization: `Bearer ${this.authorizationToken}`,
          },
        }
      );
      let replyToContextMessage = "";
      for (let item of response.data.result.items) {
        if (messageId === item.id) {
          replyToContextMessage = item.replySourceMessage.text;
        }
      }
      return replyToContextMessage;
    } catch (error) {
      throw error;
    }
  }

  async sendTemplateMessage(
    phoneNumber: string,
    templateName: string,
    parameters: Array<{ name: string; value: string }>
  ) {
    try {
      console.log(`[WATI] Sending template message to ${phoneNumber}`);
      console.log(`[WATI] Template: ${templateName}`);
      console.log(`[WATI] Parameters:`, JSON.stringify(parameters, null, 2));

      const response = await axios.post(
        `https://live-mt-server.wati.io/446388/api/v1/sendTemplateMessage?whatsappNumber=${phoneNumber}`,
        {
          template_name: templateName,
          broadcast_name: "Escalation Alert",
          parameters: parameters,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.authorizationToken}`,
          },
        }
      );

      console.log(`[WATI] Success! Response:`, response.data);
      return response.data;
    } catch (error: any) {
      console.error("[WATI] Error sending template message");
      console.error("[WATI] Status:", error.response?.status);
      console.error(
        "[WATI] Response data:",
        JSON.stringify(error.response?.data, null, 2)
      );
      console.error("[WATI] Request data:", {
        phoneNumber,
        templateName,
        parameters,
      });
      throw error;
    }
  }

  async sendTextMessage(phoneNumber: string, messageText: string) {
    try {
      // Encode the message text for URL
      const encodedMessage = encodeURIComponent(messageText);

      const response = await axios.post(
        `https://live-mt-server.wati.io/446388/api/v1/sendSessionMessage/${phoneNumber}?messageText=${encodedMessage}`,
        {},
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.authorizationToken}`,
          },
        }
      );

      console.log("[WATI] Text message sent successfully");
      return response.data;
    } catch (error: any) {
      console.error(
        "[WATI] Error sending text message:",
        error.response?.data || error.message
      );
      throw error;
    }
  }
}
