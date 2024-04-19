import express from "express";
import cors from "cors";
import { Request, Response, NextFunction } from "express";
// import { PrismaClient } from "@prisma/client";

// Routes
import apiRoutes from "./routes/api";

import morgan from "morgan";
import { authMiddleware } from "./middlewares/auth";

var bodyParser = require("body-parser");
// const prisma = new PrismaClient();
const app = express();
app.use(
  cors({
    exposedHeaders: ["x-wp-total", "x-wp-totalpages"],
  })
);

const setSecurityHeaders = (_: Request, res: Response, next: NextFunction) => {
  res.set({
    "X-Content-Type-Options": "nosniff",
    "Access-Control-Allow-Origin": "*",
    "X-Frame-Options": "DENY",
    "X-XSS-Protection": "1; mode=block",
    "Cross-Origin-Resource-Policy": "same-site",
    "Cross-Origin-Opener-Policy": "same-origin-allow-popups",
    "Cross-Origin-Embedder-Policy": "require-corp",
    "Referrer-Policy": "no-referrer",
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
    "Expect-CT": "enforce, max-age=86400",
    "Content-Security-Policy": `object-src 'none'; script-src 'self'; img-src 'self'; frame-ancestors 'self'; require-trusted-types-for 'script'; block-all-mixed-content; upgrade-insecure-requests`,
    "Permissions-Policy":
      "camera=(), microphone=(), geolocation=(), payment=()",
  });
  next();
};
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(morgan("dev"));

app.disable("x-powered-by");
app.use(setSecurityHeaders);
app.use(express.json({ limit: "4mb" }));
app.use(express.urlencoded({ extended: true }));

// ROUTES
app.use("/frontapi", apiRoutes);
app.get("/", (req: Request, res: Response) => {
  res.send("Application works!");
});

app.listen(process.env.SERVER_PORT, () => {
  console.log(`Application started on port ${process.env.SERVER_PORT}!`);
});
