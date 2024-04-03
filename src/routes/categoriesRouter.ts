import express, { Request, Response } from "express";
import { getCategories } from "../controllers/categories";
const categoriesRouter = (api: any) => {
  const router = express.Router();

  // Обработчик маршрута
  router.get("/", getCategories(api));

  return router;
};

export default categoriesRouter;
