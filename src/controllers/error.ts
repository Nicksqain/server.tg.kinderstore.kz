import { Request, Response, NextFunction } from "express";

export const getError = async (req: Request, res: Response) => {
  try {
    // Получаем ошибку из тела POST-запроса
    const errorMessage: string = req.body.error;

    // Выводим ошибку в консоль
    console.error("Произошла ошибка:", errorMessage);

    // Отправляем ответ клиенту
    return res.json({ message: "Ошибка успешно обработана" });
  } catch (error) {
    return res.status(500).send("Произошла ошибка!");
  }
};
