// Deps
import express, { Request, Response } from "express";

// import establishmentsRouter from "./establishmentsRouter";
import categoriesRouter from "./categoriesRouter";
import productsRouter from "./productsRouter";
import ordersRouter from "./ordersRouter";
import customersRouter from "./customersRouter";
// import authRouter from "./authRouter";
// import errorRouter from "./errorRouter";
// import { authMiddleware } from "../middlewares/auth";

// Middlewares
// Express Router
const apiRouter = express.Router();

import WooCommerceRestApi from "@woocommerce/woocommerce-rest-api";

const api = new WooCommerceRestApi({
  url: process.env.WC_SITE_URL as string,
  consumerKey: process.env.WC_CK as string,
  consumerSecret: process.env.WC_CS as string,
  version: "wc/v3",
});

apiRouter.use("/categories", categoriesRouter());
apiRouter.use("/products", productsRouter());
apiRouter.use("/orders", ordersRouter());
apiRouter.use("/customers", customersRouter(api));
// apiRouter.use("/establishments", establishmentsRouter);
// apiRouter.use("/auth", authRouter);
// apiRouter.use("/error", errorRouter);
export default apiRouter;
