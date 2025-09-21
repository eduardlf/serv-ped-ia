import { Order, OrderItem } from '../types';
import { aiService } from './aiService';

class OrderService {
  private orders: Order[] = [];

  async createOrderFromQuery(query: string): Promise<Order> {
    try {
      // Get AI assistance to parse the query
      const aiResponse = await aiService.generateOrderFromQuery(query);
      
      // Try to parse the AI response as JSON, fallback to simple parsing
      let parsedOrder: any;
      try {
        parsedOrder = JSON.parse(aiResponse);
      } catch {
        // Fallback: create a simple order from the query
        parsedOrder = this.createSimpleOrderFromQuery(query);
      }

      // Create the order
      const order: Order = {
        id: this.generateOrderId(),
        description: parsedOrder.description || query,
        items: this.parseItems(parsedOrder.items || []),
        totalPrice: this.calculateTotalPrice(parsedOrder.items || []),
        status: 'pending',
        createdAt: new Date()
      };

      this.orders.push(order);
      return order;
    } catch (error) {
      console.error('Error creating order:', error);
      // Fallback: create a basic order without AI assistance
      return this.createFallbackOrder(query);
    }
  }

  private createSimpleOrderFromQuery(query: string): any {
    return {
      description: `Order based on: ${query}`,
      items: [
        {
          name: 'Custom Item',
          quantity: 1,
          price: 10.00
        }
      ]
    };
  }

  private parseItems(items: any[]): OrderItem[] {
    return items.map(item => ({
      name: item.name || 'Unknown Item',
      quantity: item.quantity || 1,
      price: item.price || 0
    }));
  }

  private calculateTotalPrice(items: any[]): number {
    return items.reduce((total, item) => {
      return total + ((item.price || 0) * (item.quantity || 1));
    }, 0);
  }

  private createFallbackOrder(query: string): Order {
    const order: Order = {
      id: this.generateOrderId(),
      description: `Order created from query: ${query}`,
      items: [
        {
          name: 'Custom Item',
          quantity: 1,
          price: 10.00
        }
      ],
      totalPrice: 10.00,
      status: 'pending',
      createdAt: new Date()
    };

    this.orders.push(order);
    return order;
  }

  private generateOrderId(): string {
    return `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  getAllOrders(): Order[] {
    return this.orders;
  }

  getOrderById(id: string): Order | undefined {
    return this.orders.find(order => order.id === id);
  }

  updateOrderStatus(id: string, status: Order['status']): Order | null {
    const order = this.getOrderById(id);
    if (order) {
      order.status = status;
      return order;
    }
    return null;
  }
}

export const orderService = new OrderService();