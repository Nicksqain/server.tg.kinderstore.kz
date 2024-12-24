import { Request, Response } from "express";
import prisma, { StockStatus } from "@prisma/client";
import fs from "fs";
import path from "path";
import { OneCGood, OneCGoodInfo } from "../services/1C/products/types";
import translit from "../utils/translit";
import {
  fetchOneCProductInfo,
  fetchOneCProducts,
} from "../services/1C/products";
import pLimit from "p-limit";
import { logger } from "../logger";

const { PrismaClient } = prisma;
const prismaClient = new PrismaClient({
  transactionOptions: { timeout: 35000 },
});

// Функция для загрузки изображений
async function downloadImage(fileName: string, imageData: string) {
  const buffer = Buffer.from(imageData, "base64");

  const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9-_]/g, "_");
  const fullFilePath = path.join(
    process.env.UPLOADS_MEDIA_PATH || "",
    "products",
    `${sanitizedFileName}.jpg`
  );

  await fs.promises.mkdir(path.dirname(fullFilePath), { recursive: true });
  await fs.promises.writeFile(fullFilePath, buffer);
  return path.posix.join("media", "products", `${sanitizedFileName}.jpg`);
}

// Функция для обработки изображений товара
async function upsertProductImages(
  transaction: prisma.Prisma.TransactionClient,
  productInfo: OneCGoodInfo,
  productSlug: string,
  productSKU: string
) {
  const imagePromises = productInfo.files.map(async (file, index) => {
    const fileName =
      productSKU + "_" + productSlug + (index === 0 ? "" : `_${index + 1}`);
    const imagePath = await downloadImage(fileName, file.data);
    if (!imagePath) {
      throw new Error(
        `Failed to download image for product ${productInfo.product_id}`
      );
    }
    return transaction.image.upsert({
      where: { id: file.id },
      update: { main: file.main, src: imagePath },
      create: {
        id: file.id,
        main: file.main,
        productId: productInfo.product_id,
        src: imagePath,
      },
    });
  });

  await Promise.all(imagePromises);
}

// Функция для установки категорий в БД
async function upsertProductCategories(
  transaction: prisma.Prisma.TransactionClient,
  product: OneCGood
) {
  let parentCategoryId = null;

  // Верхняя категория
  if (product.product_grouplast_name) {
    const lastCategory = await transaction.category.upsert({
      where: { onec_category_id: product.product_last_id },
      update: { name: product.product_grouplast_name },
      create: {
        onec_category_id: product.product_last_id,
        name: product.product_grouplast_name,
        parentCategoryId: null,
        slug: translit(product.product_grouplast_name),
      },
    });
    parentCategoryId = lastCategory.id;
  }

  // Промежуточная категория
  if (product.product_groupmiddle_name) {
    const middleCategory = await transaction.category.upsert({
      where: { onec_category_id: product.product_groupmiddle_id },
      update: { name: product.product_groupmiddle_name },
      create: {
        onec_category_id: product.product_groupmiddle_id,
        name: product.product_groupmiddle_name,
        parentCategoryId,
        slug: translit(product.product_groupmiddle_name),
      },
    });
    parentCategoryId = middleCategory.id;
  }

  // Самая глубокая категория
  const finalCategory = await transaction.category.upsert({
    where: { onec_category_id: product.product_group_id },
    update: { name: product.product_group_name },
    create: {
      onec_category_id: product.product_group_id,
      name: product.product_group_name,
      parentCategoryId,
      slug: translit(product.product_group_name),
    },
  });

  return finalCategory;
}

// Функция для обработки товаров
async function processProduct(
  transaction: prisma.Prisma.TransactionClient,
  product: OneCGood
) {
  let stockStatus = "in_stock" as StockStatus;
  if (product.accounting.length) {
    const totalStock = product.accounting.reduce(
      (acc, item) => acc + item.count,
      0
    );
    if (totalStock > 10) {
      stockStatus = "in_stock";
    } else if (totalStock > 0) {
      stockStatus = "low_stock";
    } else {
      stockStatus = "out_of_stock";
    }
  }

  const [productInfo, finalCategory] = await Promise.all([
    fetchOneCProductInfo(product.product_id),
    upsertProductCategories(transaction, product),
  ]);

  const productSlug = translit(product.product_name);

  // Обновление или создание товара
  await transaction.product.upsert({
    where: { id: product.product_id },
    update: {
      name: product.product_name,
      description: productInfo.description,
      categoryId: finalCategory.id,
    },
    create: {
      id: product.product_id,
      name: product.product_name,
      description: productInfo.description,
      slug: productSlug,
      permalink: `/products/${productSlug}`,
      price: product.price,
      regularPrice: product.price,
      isBestseller: product.bestseller,
      barcodes: product.barcode,
      sku: product.product_art,
      stockStatus: stockStatus,
      categoryId: finalCategory.id,
    },
  });

  await upsertProductImages(
    transaction,
    productInfo,
    productSlug,
    product.product_art
  );

  // Обновление или создание записей учета товара
  const stockUpdates = product.accounting.map((accounting) =>
    transaction.productStock.upsert({
      where: {
        productId_warehouseId: {
          productId: product.product_id,
          warehouseId: accounting.warehouse,
        },
      },
      update: {
        count: accounting.count,
      },
      create: {
        productId: product.product_id,
        warehouseId: accounting.warehouse,
        count: accounting.count,
      },
    })
  );

  await Promise.all(stockUpdates);
}

export const syncProducts = async (req: Request, res: Response) => {
  let isCancelled = false;

  req.on("close", () => {
    isCancelled = true;
    logger.info("Request aborted (syncProducts)");
  });

  try {
    if (!process.env.UPLOADS_MEDIA_PATH) {
      throw new Error("UPLOADS_MEDIA_PATH is not defined");
    }

    if (isCancelled) {
      throw new Error("Запрос был отменен");
    }
    // Получаем список товаров из 1С
    const data = await fetchOneCProducts();
    if (!data) {
      return res.status(500).json({ message: "Ошибка получения данных из 1С" });
    }

    const productsFrom1C = data
      .filter((item) => item.product_art)
      .slice(0, 400); // Ограничение на 100 товаров

    logger.info(`Обработка ${productsFrom1C.length} товаров...`);

    let failureProducts: { product_name: string; product_art: string }[] = [];
    for (const product of productsFrom1C) {
      try {
        if (isCancelled) {
          return;
        }
        await prismaClient.$transaction(async (transaction) => {
          logger.info(`Обработка товара: ${product.product_name}`);
          await processProduct(transaction, product);
        });
      } catch (error) {
        logger.error(`Ошибка обработки товара: ${product.product_name}`, error);
        failureProducts.push({
          product_name: product.product_name,
          product_art: product.product_art,
        });
      }
    }

    const logFailureProducts = () => {
      logger.info(
        "Неудавшиеся синхронизации товаров 1С:",
        JSON.stringify(failureProducts, null, 2)
      );
    };

    const failureRate = (failureProducts.length / productsFrom1C.length) * 100;
    if (failureRate > 15) {
      logger.error(
        `Ошибка синхронизации: менее 85% товаров были успешно синхронизированы. Успешно: ${
          productsFrom1C.length - failureProducts.length
        }, Неудачно: ${failureProducts.length}`
      );
      logFailureProducts();
      return res.status(500).json({
        message:
          "Ошибка синхронизации: менее 85% товаров были успешно синхронизированы.",
      });
    } else {
      logger.info(
        `Синхронизация товаров завершена. Успешно: ${
          productsFrom1C.length - failureProducts.length
        }, Неудачно: ${failureProducts.length}`
      );
      failureProducts.length && logFailureProducts();
    }

    // const limit = pLimit(5); // Ограничение на 10 параллельных транзакций

    // const productPromises = productsFrom1C.map((product) =>
    //   limit(() =>
    //     prismaClient.$transaction(async (transaction) => {
    //       logger.info(`Обработка товара: ${product.product_name}`);
    //       await processProduct(transaction, product);
    //     })
    //   )
    // );

    // await Promise.all(productPromises);
    const categories = await prismaClient.category.findMany({
      where: { parentCategoryId: null }, // Получаем только верхние категории
      include: {
        children: {
          // Получаем все дочерние категории
          include: {
            children: true, // Для получения глубже вложенных категорий
          },
        },
      },
    });
    res.status(200).json({
      message: "Синхронизация 1с номенклатур завершена успешно.",
      categories,
    });
  } catch (error: any) {
    logger.error("Ошибка синхронизации номенклатур 1С:", error);
    return res.status(500).json({
      message: "Ошибка синхронизации номенклатур 1С:",
      error,
    });
  }
};

// Экспортируем контроллер
// module.exports = { sync: router.post.bind(router, "/sync-products") };

// тригер апдейта статуса товара
// CREATE OR REPLACE FUNCTION update_stock_status()
// RETURNS TRIGGER AS $$
// DECLARE
//   total_stock INT;
// BEGIN
//   -- Суммируем остаток на всех складах для данного товара
//   SELECT COALESCE(SUM(count), 0)
//   INTO total_stock
//   FROM "ProductStock"
//   WHERE "productId" = NEW."productId";

//   -- Устанавливаем статус товара в зависимости от общего количества
//   IF total_stock > 10 THEN
//     UPDATE "Product"
//     SET "stockStatus" = 'in_stock'
//     WHERE "id" = NEW."productId";
//   ELSIF total_stock > 0 THEN
//     UPDATE "Product"
//     SET "stockStatus" = 'low_stock'
//     WHERE "id" = NEW."productId";
//   ELSE
//     UPDATE "Product"
//     SET "stockStatus" = 'out_of_stock'
//     WHERE "id" = NEW."productId";
//   END IF;

//   RETURN NEW;
// END;
// $$ LANGUAGE plpgsql;

// -- Создаём триггер
// CREATE TRIGGER stock_update_trigger
// AFTER INSERT OR UPDATE OR DELETE ON "ProductStock"
// FOR EACH ROW EXECUTE FUNCTION update_stock_status();
