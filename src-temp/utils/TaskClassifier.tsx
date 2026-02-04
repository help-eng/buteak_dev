import OpenAI from "openai";

export default class TaskClassifier {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async classifyTask(taskDescription: string): Promise<string> {
    const prompt = `You are a hotel task classification AI. Classify the following guest request into one of these categories:

**T1 - Immediate Response (0-15 min)**
Examples: Send bill/invoice, wifi password, bring water bottles, extra towel, toiletries, blankets, pillows, hangers, tissue boxes, remote control, room key card, directions, minor desk tasks

**T2 - Standard Service (15-60 min)**
Examples: Deliver cooked food, room cleaning, laundry pickup/drop, deep cleaning, room turnover, ironing clothes, breakfast trays, extra beds, bathroom cleaning, light bulb replacement, thermostat adjustment, loose tap, shower head, door lock issues, curtain/blind stuck, phone line issues

**T3 - Technical Issues (1-12 hours)**
Examples: AC not cooling, hot water system failure, electrical board malfunction, deep plumbing work, major appliance breakdown (fridge, washing machine), structural issues (ceiling leak, wall damage), elevator malfunction, generator problems, CCTV/security issues

**T4 - Critical Emergency (Immediate broadcast)**
Examples: Active water leakage, electrical hazard (sparking, burning smell), guest medical emergency, fire alarm, gas leakage, complete power failure, sewage backup, broken glass with injury risk, pest infestation (rats, snakes)

Guest Request: "${taskDescription}"

Respond with ONLY the category code: T1, T2, T3, or T4`;

    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are a hotel operations expert. Classify guest requests accurately based on urgency and complexity. Respond with only T1, T2, T3, or T4.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 10,
      });

      const classification =
        response.choices[0]?.message?.content?.trim() || "T2";

      // Validate response
      if (!["T1", "T2", "T3", "T4"].includes(classification)) {
        console.warn(
          `[TaskClassifier] Invalid classification: ${classification}, defaulting to T2`
        );
        return "T2";
      }

      console.log(
        `[TaskClassifier] Task: "${taskDescription}" → ${classification}`
      );
      return classification;
    } catch (error: any) {
      console.error("[TaskClassifier] Error classifying task:", error.message);
      // Default to T2 on error
      return "T2";
    }
  }
}
