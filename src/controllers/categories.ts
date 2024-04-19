import { Request, Response } from "express";
import WooCommerceRestApi from "@woocommerce/woocommerce-rest-api";

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

export const getCategories = (api: WooCommerceRestApi) => {
  return (req: Request, res: Response) => {
    api
      .get("products/categories", {
        hide_empty: true,
        per_page: 100,
      })
      .then((response) => {
        // Successful request
        // console.log("Response Status:", response.status);
        // console.log("Response Headers:", response.headers);
        // console.log("Response Data:", response.data);
        // console.log("Total of pages:", response.headers["x-wp-totalpages"]);
        // console.log("Total of items:", response.headers["x-wp-total"]);
        const categoryTree = buildCategoryTree(response.data);
        const categoryTreeJSON = getCategoryTreeJSON(categoryTree);

        // console.log(JSON.stringify(categoryTreeJSON, null, 2));
        return res.json(categoryTreeJSON);
      })
      .catch((error) => {
        // Invalid request, for 4xx and 5xx statuses
        // console.log("Response Status:", error.response.status);
        // console.log("Response Headers:", error.response.headers);
        // console.log("Response Data:", error.response.data);
        return res.status(500).json(error.response.data);
      })
      .finally(() => {
        // Always executed.
      });
  };
};
