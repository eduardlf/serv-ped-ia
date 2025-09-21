import { Request, Response } from 'express';
import { orderService } from '../services/orderService';
import { aiService } from '../services/aiService';
import { CreateOrderRequest } from '../types';

export class OrderController {
  async createOrder(req: Request, res: Response): Promise<void> {
    try {
      const { query }: CreateOrderRequest = req.body;

      if (!query || typeof query !== 'string') {
        res.status(400).json({
          error: 'Query is required and must be a string'
        });
        return;
      }

      const order = await orderService.createOrderFromQuery(query);

      res.status(201).json({
        success: true,
        order
      });
    } catch (error) {
      console.error('Error in createOrder:', error);
      res.status(500).json({
        error: 'Failed to create order'
      });
    }
  }

  async getAllOrders(req: Request, res: Response): Promise<void> {
    try {
      const orders = orderService.getAllOrders();
      res.json({
        success: true,
        orders
      });
    } catch (error) {
      console.error('Error in getAllOrders:', error);
      res.status(500).json({
        error: 'Failed to retrieve orders'
      });
    }
  }

  async getOrderById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const order = orderService.getOrderById(id);

      if (!order) {
        res.status(404).json({
          error: 'Order not found'
        });
        return;
      }

      res.json({
        success: true,
        order
      });
    } catch (error) {
      console.error('Error in getOrderById:', error);
      res.status(500).json({
        error: 'Failed to retrieve order'
      });
    }
  }

  async updateOrderStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!['pending', 'confirmed', 'cancelled'].includes(status)) {
        res.status(400).json({
          error: 'Invalid status. Must be one of: pending, confirmed, cancelled'
        });
        return;
      }

      const order = orderService.updateOrderStatus(id, status);

      if (!order) {
        res.status(404).json({
          error: 'Order not found'
        });
        return;
      }

      res.json({
        success: true,
        order
      });
    } catch (error) {
      console.error('Error in updateOrderStatus:', error);
      res.status(500).json({
        error: 'Failed to update order status'
      });
    }
  }

  async chatWithAI(req: Request, res: Response): Promise<void> {
    try {
      const { query } = req.body;

      if (!query || typeof query !== 'string') {
        res.status(400).json({
          error: 'Query is required and must be a string'
        });
        return;
      }

      const response = await aiService.chatCompletion([
        { role: 'user', content: query }
      ]);

      res.json({
        success: true,
        response
      });
    } catch (error) {
      console.error('Error in chatWithAI:', error);
      res.status(500).json({
        error: 'Failed to communicate with AI service'
      });
    }
  }
}

export const orderController = new OrderController();