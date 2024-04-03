import { Request, Response, NextFunction } from "express";

import WooCommerceRestApi from "@woocommerce/woocommerce-rest-api";

export const getProducts = (api: WooCommerceRestApi) => {
  return (req: Request, res: Response) => {
    console.log(req.query);
    api
      .get("products", {
        ...req.query,
        stock_status: "instock",
        per_page: 12,
      })
      .then((response) => {
        res.setHeader("x-wp-totalpages", response.headers["x-wp-totalpages"]);
        res.setHeader("x-wp-total", response.headers["x-wp-total"]);
        // Successful request
        // console.log("Response Status:", response.status);
        // console.log("Response Headers:", response.headers);
        // console.log("Response Data:", response.data);
        // console.log("Total of pages:", response.headers["x-wp-totalpages"]);
        // console.log("Total of items:", response.headers["x-wp-total"]);
        return res.json(response.data);
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

export const getProduct = (api: WooCommerceRestApi) => {
  return (req: Request, res: Response) => {
    const productIdToFind = req.params.productId;
    api
      .get(`products/${productIdToFind}`, {})
      .then((response) => {
        // Successful request
        return res.json(response.data);
      })
      .catch((error) => {
        return res.status(500).json(error.response.data);
      })
      .finally(() => {
        // Always executed.
      });
  };
};
