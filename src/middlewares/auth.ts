import { Request, Response, NextFunction } from "express";
import crypto from "crypto";
const TELEGRAM_BOT_TOKEN = process.env.BOT_TOKEN as string;

const verifyTelegramWebAppData = (telegramInitData: string): boolean => {
  const encoded = decodeURIComponent(telegramInitData);

  const secret = crypto
    .createHmac("sha256", "WebAppData")
    .update(TELEGRAM_BOT_TOKEN);

  const arr = encoded.split("&");
  const hashIndex = arr.findIndex((str) => str.startsWith("hash="));
  const hash = arr.splice(hashIndex)[0].split("=")[1];
  arr.sort((a, b) => a.localeCompare(b));
  const dataCheckString = arr.join("\n");

  const _hash = crypto
    .createHmac("sha256", secret.digest())
    .update(dataCheckString)
    .digest("hex");

  return _hash === hash;
};

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const initData = req.headers["initdata"] as string | undefined;

  if (!initData) {
    return res.status(401).json({ message: "Unauthorized - missing headers" });
  }

  const isValid = verifyTelegramWebAppData(initData);

  if (isValid) {
    next(); // Данные подлинные
  } else {
    res.status(401).json({ message: "Unauthorized - invalid data" });
  }
};
