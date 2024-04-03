import express, { Request, Response } from "express";

const errorRouter = express.Router();

import { getError } from "../controllers/error";
errorRouter.post("/", getError);

export default errorRouter;
