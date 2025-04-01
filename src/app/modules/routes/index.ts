import { Router } from "express";
import { ProductRoutes } from "../product/product.routes";
import { ScrapRoutes } from "../scrap/scrapProduct/scrapProduct.routes";

const middlewareRouter = Router();

const router = [
  {
    path: "/products",
    router: ProductRoutes,
  },
  {
    path: "/scrap",
    router: ScrapRoutes,
  },
];

router.forEach((route) => middlewareRouter.use(route.path, route.router));

export default middlewareRouter;
