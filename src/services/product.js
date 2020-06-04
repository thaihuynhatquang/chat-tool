import axios from "axios";
import db from "models";
import humps from "humps";
import { TOOL_STOCK_CHECK_KEY } from "constants";

const LIMIT = 20;

export const getProducts = async ({
  query,
  page,
  order,
  orderBy,
  userId,
  _uat,
}) => {
  const toolStockChecking = await db.Tool.findOne({
    where: { uniqueKey: TOOL_STOCK_CHECK_KEY },
  });

  if (!toolStockChecking) throw new Error("Tool not defined");
  const channelId =
    toolStockChecking.configs && toolStockChecking.configs.channelId;

  return axios
    .get(toolStockChecking.endpoint, {
      params: {
        mode: "operator",
        [/^\d{6,}$/.test(query) ? "sku" : "name"]: query,
        offset: page * LIMIT,
        limit: LIMIT,
        order,
        orderBy,
        channelId,
        userId,
      },
      withCredentials: true,
      headers: { Authorization: _uat || "" },
    })
    .then((res) => humps.camelizeKeys(res.data));
};
