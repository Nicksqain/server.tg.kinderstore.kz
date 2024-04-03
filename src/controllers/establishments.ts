import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
export const getEstablishments = async (req: Request, res: Response) => {
  try {
    const establishments = await prisma.branches.findMany({
      // where: {
      //   id: {
      //     not: 1,
      //   },
      // },
    });
    // Преобразование BigInt в Number
    const establishmentsWithNumberIds = establishments.map((establishment) => ({
      ...establishment,
      user_id: Number(establishment.id),
    }));
    return res.json(establishmentsWithNumberIds);
  } catch (error) {
    console.log(error);
    return res.status(500).send("Произошла ошибка!");
  }
};
