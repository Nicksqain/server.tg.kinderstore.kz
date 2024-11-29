import express from "express";
import { syncProducts } from "../controllers/sync";

const syncRouter = express.Router();

syncRouter.get("/products", syncProducts);

export default syncRouter;
