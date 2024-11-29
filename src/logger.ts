// @ts-nocheck
import path from "path";
import fs from "fs";
import { createLogger, format, transports } from "winston";
import DailyRotateFile from "winston-daily-rotate-file";

// Директория для логов
const logDirectory = process.env.LOG_DIR || path.join(process.cwd(), "logs");

// Создаём директорию, если её нет
if (!fs.existsSync(logDirectory)) {
  fs.mkdirSync(logDirectory, { recursive: true });
}

// Формат логов
const logFormat = format.combine(
  format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  format.printf(({ timestamp, level, message }) => {
    return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
  })
);

// Создание логгера
export const logger = createLogger({
  level: "info", // Уровень логирования по умолчанию
  format: logFormat,
  transports: [
    // Логи в консоль
    new transports.Console({
      level: "debug", // Логи от debug и выше
    }),
    // Основной лог в файл
    new DailyRotateFile({
      filename: path.join(logDirectory, "app-%DATE%.log"),
      datePattern: "YYYY-MM-DD",
      maxFiles: "14d", // Храним файлы за последние 14 дней
      level: "info", // Логи от info и выше
    }),
    // Логи ошибок
    new transports.File({
      filename: path.join(logDirectory, "error.log"),
      level: "error", // Только ошибки
    }),
  ],
});
