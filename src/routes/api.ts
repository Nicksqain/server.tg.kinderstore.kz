// Deps
import express, { Request, Response } from "express";

// import establishmentsRouter from "./establishmentsRouter";
import categoriesRouter from "./categoriesRouter";
import productsRouter from "./productsRouter";
import ordersRouter from "./ordersRouter";
import customersRouter from "./customersRouter";
import shippingRouter from "./shippingRouter";
// import authRouter from "./authRouter";
// import errorRouter from "./errorRouter";
// import { authMiddleware } from "../middlewares/auth";

// Middlewares
// Express Router
const apiRouter = express.Router();

import WooCommerceRestApi from "@woocommerce/woocommerce-rest-api";

require("dotenv").config();
const api = new WooCommerceRestApi({
  url: process.env.WC_SITE_URL as string,
  consumerKey: process.env.WC_CK as string,
  consumerSecret: process.env.WC_CS as string,
  version: "wc/v3",
});

apiRouter.use("/categories", categoriesRouter(api));
apiRouter.use("/products", productsRouter(api));
apiRouter.use("/orders", ordersRouter(api));
apiRouter.use("/customers", customersRouter(api));
apiRouter.use("/shipping", shippingRouter(api));
// apiRouter.use("/establishments", establishmentsRouter);
// apiRouter.use("/auth", authRouter);
// apiRouter.use("/error", errorRouter);
export default apiRouter;
