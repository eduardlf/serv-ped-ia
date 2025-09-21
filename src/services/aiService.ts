import axios from 'axios';
import { ChatMessage, ChatRequest, ChatResponse } from '../types';

class AIService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.AI_SERVICE_URL || 'http://127.0.0.1:5000';
  }

  async chatCompletion(messages: ChatMessage[], maxTokens: number = 128): Promise<string> {
    try {
      const request: ChatRequest = {
        messages,
        max_tokens: maxTokens
      };

      const response = await axios.post<ChatResponse>(
        `${this.baseUrl}/v1/chat/completions`,
        request,
        {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 30000 // 30 seconds timeout
        }
      );

      if (response.data?.choices?.[0]?.message?.content) {
        return response.data.choices[0].message.content;
      }

      throw new Error('Invalid response format from AI service');
    } catch (error) {
      console.error('AI Service Error:', error);
      throw new Error('Failed to communicate with AI service');
    }
  }

  async generateOrderFromQuery(query: string): Promise<string> {
    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: 'You are an AI assistant that helps create order summaries. Parse the user query and create a structured order with items, quantities, and estimated prices in JSON format.'
      },
      {
        role: 'user',
        content: query
      }
    ];

    return this.chatCompletion(messages, 256);
  }
}

export const aiService = new AIService();