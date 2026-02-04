import fs from "fs";
import path from "path";

interface GuestRequest {
  serviceId: string;
  title: string;
  room: string;
  staff: string;
  status: string;
  type: string;
  createdTime: string;
  staffCompletedTime: string;
  modifiedTime: string;
  priority: string;
  serviceRating: string;
  lastActivityTime: string;
  serviceRequestOwner: string;
  ack: number;
}

interface EscalationLevel {
  position: string;
  level: string;
  number: string;
}

export default class CsvParser {
  private guestCsvPath: string;
  private infoCsvPath: string;

  constructor() {
    this.guestCsvPath = path.join(process.cwd(), "sample", "guest.csv");
    this.infoCsvPath = path.join(process.cwd(), "sample", "info.csv");
  }

  // Robust CSV line parser that handles quoted fields with commas
  private parseCsvLine(line: string): string[] {
    const result: string[] = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        inQuotes = !inQuotes;
        // Don't include the quotes in the result
      } else if (char === "," && !inQuotes) {
        result.push(current);
        current = "";
      } else {
        current += char;
      }
    }
    // Push the last field
    result.push(current);
    
    return result;
  }

  // Parse guest.csv and return array of service requests
  parseGuestRequests(): GuestRequest[] {
    try {
      const fileContent = fs.readFileSync(this.guestCsvPath, "utf-8");
      
      // Split by newlines, handling both \r\n and \n
      const allLines = fileContent.split(/\r?\n/);
      
      // Filter out empty lines
      const lines = allLines.filter((line) => {
        const trimmed = line.trim();
        return trimmed.length > 0 && trimmed !== ','.repeat(trimmed.length);
      });

      console.log(`[CSV Parser] Total non-empty lines: ${lines.length}`);
      console.log(`[CSV Parser] First line (header): ${lines[0]}`);

      // Skip header line
      const dataLines = lines.slice(1);
      const requests: GuestRequest[] = [];

      for (let i = 0; i < dataLines.length; i++) {
        const line = dataLines[i];
        const fields = this.parseCsvLine(line);

        console.log(
          `[CSV Parser] Line ${i + 2}: ${fields.length} fields, ServiceID: "${fields[0]}", Ack: "${fields[13]}"`
        );

        if (fields.length >= 14) {
          const ackValue = parseInt(fields[13].trim()) || 0;
          
          requests.push({
            serviceId: fields[0].trim(),
            title: fields[1].trim(),
            room: fields[2].trim(),
            staff: fields[3].trim(),
            status: fields[4].trim(),
            type: fields[5].trim(),
            createdTime: fields[6].trim(),
            staffCompletedTime: fields[7].trim(),
            modifiedTime: fields[8].trim(),
            priority: fields[9].trim(),
            serviceRating: fields[10].trim(),
            lastActivityTime: fields[11].trim(),
            serviceRequestOwner: fields[12].trim(),
            ack: ackValue,
          });
          
          console.log(`[CSV Parser] ✓ Added ${fields[0].trim()} with Ack=${ackValue}`);
        } else {
          console.warn(
            `[CSV Parser] ✗ Skipping line ${i + 2}: only ${fields.length} fields (need 14)`
          );
          console.warn(`[CSV Parser]   Line content: ${line.substring(0, 100)}...`);
        }
      }

      console.log(`[CSV Parser] Successfully parsed ${requests.length} requests`);
      console.log(
        `[CSV Parser] Service IDs: ${requests.map((r) => r.serviceId).join(", ")}`
      );
      
      return requests;
    } catch (error) {
      console.error("Error parsing guest.csv:", error);
      throw error;
    }
  }

  // Parse info.csv and return array of escalation levels
  parseEscalationLevels(): EscalationLevel[] {
    try {
      const fileContent = fs.readFileSync(this.infoCsvPath, "utf-8");
      const lines = fileContent.split(/\r?\n/).filter((line) => line.trim());

      // Skip header line
      const dataLines = lines.slice(1);
      const levels: EscalationLevel[] = [];

      for (const line of dataLines) {
        const fields = this.parseCsvLine(line);
        if (fields.length >= 3) {
          levels.push({
            position: fields[0].trim(),
            level: fields[1].trim(),
            number: fields[2].trim(),
          });
        }
      }

      // Sort by level (L0, L1, L2)
      levels.sort((a, b) => a.level.localeCompare(b.level));

      return levels;
    } catch (error) {
      console.error("Error parsing info.csv:", error);
      throw error;
    }
  }

  // Get a specific request by service_id
  getRequestByServiceId(serviceId: string): GuestRequest | null {
    try {
      const requests = this.parseGuestRequests();
      return requests.find((req) => req.serviceId === serviceId) || null;
    } catch (error) {
      console.error("Error getting request by service_id:", error);
      return null;
    }
  }

  // Check if a request is acknowledged
  isRequestAcknowledged(serviceId: string): boolean {
    const request = this.getRequestByServiceId(serviceId);
    return request ? request.ack === 1 : true; // Default to true if not found
  }
}

