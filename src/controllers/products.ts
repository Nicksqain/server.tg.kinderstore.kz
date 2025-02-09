import { Request, Response, NextFunction } from "express";
import { PrismaClient, StockStatus } from "@prisma/client";

const prisma = new PrismaClient();

export const getProducts = async (req: Request, res: Response) => {
  req.on("close", () => {
    prisma.$disconnect();
    return res.end();
  });

  try {
    // Извлечение параметров из запроса
    const { category: categorySlug, orderby, order } = req.query;

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
        return res.json({ data: [] });
      }
    }

    // Фильтр для товаров, которые есть в наличии
    filter.stockStatus = {
      in: [StockStatus.in_stock, StockStatus.low_stock],
    };

    // Создание объекта сортировки
    const sort: any = {};
    if (orderby && order) {
      sort[orderby.toString()] = order.toString();
    }

    // Запрос к базе данных с фильтрацией и сортировкой
    const data = await prisma.product.findMany({
      where: filter,
      orderBy: sort,
      include: {
        category: true,
        images: true,
      },
    });

    return res.json({ data });
  } catch (error) {
    console.error(error);
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
