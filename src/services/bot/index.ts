import axios from "axios";

if (!process.env.BOT_API_URL) {
  throw new Error("BOT_API_URL is not set");
}

if (!process.env.BOT_API_USERNAME || !process.env.BOT_API_PASSWORD) {
  throw new Error("BOT_API_USERNAME or BOT_API_PASSWORD is not set");
}

const botAPI = axios.create({
  baseURL: process.env.BOT_API_URL,
  auth: {
    username: process.env.BOT_API_USERNAME,
    password: process.env.BOT_API_PASSWORD,
  },
});

// * ------------------------------

const botAPIService = {
  notification: async (message: string) =>
    await botAPI.post("/order/notification", { message }),
};

export default botAPIService;
