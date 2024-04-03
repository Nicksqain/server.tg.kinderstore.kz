import express, { Request, Response } from "express";

import * as shippingController from "../controllers/shipping";

const shippingRouter = (api: any) => {
  const router = express.Router();

  // Обработчик маршрута
  router.get("/methods", shippingController.getMethods(api));

  return router;
};
export default shippingRouter;
