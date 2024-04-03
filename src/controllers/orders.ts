import { Request, Response, NextFunction } from "express";

import WooCommerceRestApi from "@woocommerce/woocommerce-rest-api";

export const createOrder = (api: WooCommerceRestApi) => {
  return (req: Request, res: Response) => {
    console.log(req.query);
    api
      .post("orders", {
        ...req.body,
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
