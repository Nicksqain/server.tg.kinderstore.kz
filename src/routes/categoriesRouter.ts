import express, { Request, Response } from "express";
import { getCategories } from "../controllers/categories";
const categoriesRouter = () => {
  const router = express.Router();

  // Обработчик маршрута
  router.get("/", getCategories);

  return router;
};

export default categoriesRouter;
