import express, { Request, Response } from "express";

const establishmentsRouter = express.Router();

import { getEstablishments } from "../controllers/establishments";
establishmentsRouter.get("/", getEstablishments);

export default establishmentsRouter;
