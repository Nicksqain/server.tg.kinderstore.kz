import express, { Request, Response } from "express";

import * as orderController from "../controllers/orders";

const ordersRouter = () => {
  const router = express.Router();

  // Обработчик маршрута
  router.get("/", orderController.getOrders);
  router.post("/create", orderController.createOrder);
  router.put("/cancel/:orderId", orderController.cancelOrder);

  return router;
};
export default ordersRouter;
