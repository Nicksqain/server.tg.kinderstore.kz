import express, { Request, Response } from "express";

import * as orderController from "../controllers/orders";

const ordersRouter = (api: any) => {
  const router = express.Router();

  // Обработчик маршрута
  router.post("/create", orderController.createOrder(api));

  return router;
};
export default ordersRouter;
