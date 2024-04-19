import express, { Request, Response } from "express";

import * as orderController from "../controllers/orders";

const ordersRouter = (api: any) => {
  const router = express.Router();

  // Обработчик маршрута
  router.get("/", orderController.getOrders(api));
  router.post("/create", orderController.createOrder(api));
  router.put("/cancel/:orderId", orderController.cancelOrder(api));

  return router;
};
export default ordersRouter;
