import express, { Request, Response } from "express";
import {
  createCustomer,
  getCustomer,
  updateCustomer,
} from "../controllers/customers";
const customersRouter = (api: any) => {
  const router = express.Router();

  // Обработчик маршрута
  router.get("/", getCustomer(api));
  router.post("/", createCustomer(api));
  router.put("/:customerId", updateCustomer(api));

  return router;
};

export default customersRouter;
