export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatRequest {
  messages: ChatMessage[];
  max_tokens?: number;
}

export interface ChatResponse {
  choices: Array<{
    message: ChatMessage;
  }>;
}

export interface Order {
  id: string;
  description: string;
  items: OrderItem[];
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: Date;
}

export interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

export interface CreateOrderRequest {
  query: string;
}