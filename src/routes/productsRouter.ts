import express, { Request, Response } from "express";

import * as productController from "../controllers/products";

const productsRouter = () => {
  const router = express.Router();

  // Обработчик маршрута
  router.get("/", productController.getProducts);
  router.get("/category/:categoryId", productController.getProducts);
  router.get("/:productSlug", productController.getProduct);

  return router;
};
export default productsRouter;
