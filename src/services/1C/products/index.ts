import api from "..";
import { AxiosResponse } from "axios";
import { OneCGood, OneCGoodInfo } from "./types";

export const fetchOneCProducts = async () =>
  await api
    .get<any, AxiosResponse<OneCGood[]>>(
      `/telegram_bot/goods?is_published=true`
    )
    .then((response) => response.data);

export const fetchOneCProductInfo = async (product_id: string) =>
  await api
    .get<any, AxiosResponse<OneCGoodInfo>>(`/telegram_bot/images/${product_id}`)
    .then((response) => response.data);
