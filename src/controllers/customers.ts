import { Request, Response, NextFunction } from "express";

import WooCommerceRestApi from "@woocommerce/woocommerce-rest-api";
import { generatePassword } from "../helpers/crypto";

export const getCustomer = (api: WooCommerceRestApi) => {
  return (req: Request, res: Response) => {
    if (!req.query.tg_phone) {
      // Если параметр tg_phone не был передан
      return res.status(400).json({ expected: "tg_phone" });
    }
    api
      .get(`customers`, {
        tg_phone: req.query.tg_phone,
        per_page: 1,
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

export const createCustomer = (api: WooCommerceRestApi) => {
  return (req: Request, res: Response) => {
    console.log(req.query);

    const { tg_id } = req.body;
    const { email } = req.body;
    const { phone } = req.body;

    const password = generatePassword();

    api
      .post("customers", {
        ...req.body,
        password: password,
      })
      .then((response) => {
        // Successful request
        console.log("Response Status:", response.status);
        console.log("Response Headers:", response.headers);
        console.log("Response Data:", response.data);
        return res.status(201).json(response.data);
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
