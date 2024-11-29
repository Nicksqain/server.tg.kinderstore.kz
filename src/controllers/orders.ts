import { Request, Response, NextFunction } from "express";
import { IOrder } from "src/models/IOrder";
import { PrismaClient } from "@prisma/client";
import botAPIService from "../services/bot";

const prisma = new PrismaClient();
export const createOrder = async (
  req: Request<{}, {}, IOrder>,
  res: Response
) => {
  try {
    const orderData = req.body;
    const orderItems = await prisma.product.findMany({
      where: {
        id: {
          in: orderData.line_items.map((item) => item.product_id),
        },
      },
    });
    console.log(orderData.line_items.map((item) => item.product_id.trim()));
    console.log(orderItems);
    const totalAmount = orderItems.reduce((total, item) => {
      const lineItem = orderData.line_items.find(
        (lineItem) => lineItem.product_id === item.id
      );
      const quantity = lineItem?.quantity || 0;
      const price = item?.price || 0;
      return total + quantity * price;
    }, 0);

    const orderTGMessage = `
*Новый заказ:*

Имя:
${orderData.billing.first_name || ""} ${orderData.billing.last_name || ""}

Телефон:
${orderData.billing.phone}

Адрес:
${orderData.billing.address_1}

Комментарий к заказу:
${orderData.customer_note || ""}

*Товары:*
${orderItems
  .map((item) => {
    const lineItem = orderData.line_items.find(
      (lineItem) => lineItem.product_id === item.id
    );
    const quantity = lineItem?.quantity || 0; // Добавлено значение по умолчанию
    const price = item?.price || 0; // Добавлено значение по умолчанию
    return `- ${item.name} - ${quantity} шт. по ${price} KZT`;
  })
  .join("\n")}

*Общая сумма:* ${totalAmount} KZT
`;
    // console.log(orderTGMessage);
    await botAPIService.notification(orderTGMessage);
    return res.json({ message: "Заказ создан" });
  } catch (error) {
    return res.status(500).json({ message: "Ошибка создания заказа", error });
  }
};

export const cancelOrder = (req: Request, res: Response) => {};

export const getOrders = (req: Request, res: Response) => {};
