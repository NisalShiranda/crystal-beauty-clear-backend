import express from 'express';
import { createOrder, deleteOrder, getOrders, updateOrder } from '../controllers/orderController.js';


const orderRouter = express.Router();

orderRouter.post("/", createOrder);
orderRouter.get("/", getOrders);
orderRouter.put("/:orderID", updateOrder); // Assuming you want to get a specific order by ID
orderRouter.delete("/:orderID", deleteOrder); // Assuming you want to delete a specific order by ID

export default orderRouter;