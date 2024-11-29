//@ts-nocheck
import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const buildCategoryTree = (categories: any, parentId = 0) => {
  const categoryTree = [];
  const filteredCategories = categories.filter(
    (category: any) => category.count > 0
  );
  const childCategories = filteredCategories.filter(
    (category: any) => category.parent === parentId
  );

  for (const childCategory of childCategories) {
    const childNode: any = {
      id: childCategory.id,
      name: childCategory.name,
      slug: childCategory.slug,
      count: childCategory.count,
      children: buildCategoryTree(categories, childCategory.id),
    };
    categoryTree.push(childNode);
  }

  return categoryTree;
};

const getCategoryTreeJSON = (categoryTree: unknown) => {
  return categoryTree;
};

export const getCategories = async (req: Request, res: Response) => {
  try {
    function buildCategoryTree(categories) {
      const categoryMap = {};
      const tree = [];

      // Создаем мапу категорий по id
      categories.forEach((category) => {
        categoryMap[category.id] = { ...category, children: [] };
      });

      // Строим дерево
      categories.forEach((category) => {
        if (category.parent_id) {
          const parent = categoryMap[category.parent_id];
          if (parent) {
            parent.children.push(categoryMap[category.id]);
          }
        } else {
          tree.push(categoryMap[category.id]);
        }
      });

      return tree;
    }

    const result = await prisma.$queryRaw`
      WITH RECURSIVE category_tree AS (
          SELECT 
              c.id,
              c.name,
              c.slug,
              c."parentCategoryId" AS parent_id
          FROM 
              "categories" c
          WHERE 
              c."parentCategoryId" IS NULL  -- Начинаем с корневых категорий

          UNION ALL

          SELECT 
              c.id,
              c.name,
              c.slug,
              c."parentCategoryId" AS parent_id
          FROM 
              "categories" c
          INNER JOIN category_tree ct ON ct.id = c."parentCategoryId"
      )

      SELECT 
          ct.id,
          ct.name,
          ct.slug,
          COALESCE(SUM(CASE WHEN p."stockStatus" = 'in_stock' THEN 1 ELSE 0 END), 0) AS product_count,
          ct.parent_id
      FROM 
          category_tree ct
      LEFT JOIN 
          "products" p ON p."categoryId" = ct.id
      GROUP BY 
          ct.id, ct.name, ct.slug, ct.parent_id
      ORDER BY 
          ct.id;
    `;

    // Строим дерево категорий
    const categoryTree = buildCategoryTree(result);

    // Функция для фильтрации пустых категорий
    function filterEmptyCategories(categories) {
      return categories
        .map((category) => {
          // Рекурсивно фильтруем детей
          const filteredChildren = filterEmptyCategories(category.children);
          const totalProductCount =
            parseInt(category.product_count) +
            filteredChildren.reduce(
              (acc, child) => acc + parseInt(child.product_count),
              0
            );

          // Обновляем product_count текущей категории
          category.product_count = totalProductCount;

          // Возвращаем категорию только если есть товары или дочерние категории
          return totalProductCount > 0 || filteredChildren.length > 0
            ? { ...category, children: filteredChildren }
            : null;
        })
        .filter(Boolean); // Удаляем null значения
    }

    // Фильтруем категории
    const filteredCategoryTree = filterEmptyCategories(categoryTree);

    // Возвращаем дерево категорий
    return res.json({ data: filteredCategoryTree });
  } catch (error) {
    console.error(error); // Логирование ошибки для отладки
    return res
      .status(500)
      .json({ message: "Ошибка получения категорий из 1С", error });
  }
};
