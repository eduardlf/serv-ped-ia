import { Router } from 'express';
import { orderController } from '../controllers/orderController';

const router = Router();

// Create order from AI query
router.post('/', orderController.createOrder.bind(orderController));

// Get all orders
router.get('/', orderController.getAllOrders.bind(orderController));

// Get order by ID
router.get('/:id', orderController.getOrderById.bind(orderController));

// Update order status
router.patch('/:id/status', orderController.updateOrderStatus.bind(orderController));

// Chat with AI (for testing the AI service directly)
router.post('/chat', orderController.chatWithAI.bind(orderController));

export { router as orderRoutes };