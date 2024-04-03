import express, { Request, Response } from "express";

import * as productController from "../controllers/products";

const productsRouter = (api: any) => {
  const router = express.Router();

  // Обработчик маршрута
  router.get("/", productController.getProducts(api));
  router.get("/category/:categoryId", productController.getProducts(api));
  router.get("/:productId", productController.getProduct(api));

  return router;
};
export default productsRouter;
