import axios from "axios";

export class AIService {
  private aiUrl: string;

  constructor() {
    this.aiUrl = process.env.AI_SERVICE_URL || "http://127.0.0.1:5000";
  }

  async chatCompletion(messages: any[], tools?: any[]) {
    const body: any = {
      messages,
      max_tokens: 128,
    };
    if (tools) body.tools = tools;

    const response = await axios.post(`${this.aiUrl}/v1/chat/completions`, body);
    const message = response.data.choices[0].message.content;
    return { message };
  }
}