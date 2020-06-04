import { Router } from "express";
import * as services from "services";
import asyncMiddleware from "routes/middlewares/asyncMiddleware";

const router = new Router();

router.get(
  "/",
  asyncMiddleware(async (req, res) => {
    const { searchText, order, orderBy, nextPage = 0 } = req.query;
    if (!searchText) return res.status(404).send("Empty query search");
    const { _uat } = req.cookies;

    const responseProduct = await services.getProducts({
      query: searchText,
      page: nextPage,
      order,
      orderBy,
      userId: req.user.id,
      _uat,
    });

    if (!responseProduct) {
      return res.status(404).send("Empty product search");
    }
    return res.json(responseProduct);
  })
);

export default router;
