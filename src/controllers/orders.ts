import { Request, Response, NextFunction } from "express";

import WooCommerceRestApi from "@woocommerce/woocommerce-rest-api";

export const createOrder = (api: WooCommerceRestApi) => {
  return (req: Request, res: Response) => {
    api
      .post("orders", {
        ...req.body,
      })
      .then((response) => {
        // Successful request
        return res.json(response.data);
      })
      .catch((error) => {
        // Invalid request, for 4xx and 5xx statuses
        return res.status(500).json(error.response.data);
      })
      .finally(() => {
        // Always executed.
      });
  };
};
export const cancelOrder = (api: WooCommerceRestApi) => {
  return (req: Request, res: Response) => {
    const { orderId } = req.params;
    api
      .put(`orders/${orderId}`, {
        status: "cancelled",
      })
      .then((response) => {
        // Successful request
        console.log("Response Status:", response.status);
        console.log("Response Headers:", response.headers);
        console.log("Response Data:", response.data);
        return res.json(response.data);
      })
      .catch((error) => {
        // Invalid request, for 4xx and 5xx statuses
        console.log("Response Status:", error.response.status);
        console.log("Response Headers:", error.response.headers);
        console.log("Response Data:", error.response.data);
        return res.status(500).json(error.response.data);
      })
      .finally(() => {
        // Always executed.
      });
  };
};

export const getOrders = (api: WooCommerceRestApi) => {
  return (req: Request, res: Response) => {
    api
      .get("orders", {
        ...req.query,
        per_page: 100,
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
