import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getProducts = async (req: Request, res: Response) => {
  req.on("close", () => {
    prisma.$disconnect();
    return res.end();
  });

  try {
    // Извлечение параметров из запроса
    const { category: categorySlug } = req.query; // Изменено на categorySlug

    // Создание объекта фильтрации
    const filter: any = {};

    // Если slug категории указан, добавляем его в фильтр
    if (categorySlug) {
      // Сначала находим категорию по slug
      const category = await prisma.category.findUnique({
        where: {
          products: { some: {} },
          slug: categorySlug.toString(), // Фильтрация по slug
        },
      });

      // Если категория найдена, добавляем её id в фильтр
      if (category) {
        filter.categoryId = category.id; // Используем categoryId для фильтрации продуктов
      } else {
        // Если категория не найдена, можно вернуть пустой массив или ошибку
        return res.json({ data: [] });
      }
    }

    // Запрос к базе данных с фильтрацией
    const data = await prisma.product.findMany({
      where: filter,
      include: {
        category: true,
        images: true,
      },
    });

    return res.json({ data });
  } catch (error) {
    console.error(error); // Логирование ошибки для отладки
    return res
      .status(500)
      .json({ message: "Ошибка получения номенклатур из 1С" });
  }
};

export const getProduct = async (req: Request, res: Response) => {
  try {
    const productSlugToFind = req.params.productSlug;
    const data = await prisma.product.findUnique({
      where: {
        slug: productSlugToFind,
      },
      include: {
        category: true,
        images: true,
      },
    });
    return res.json({ data });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Ошибка получения номенклатур из 1С", error });
  }
};
