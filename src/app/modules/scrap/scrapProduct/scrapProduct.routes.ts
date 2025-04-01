import { Router } from "express";
import { ScrapProductController } from "./scrapProduct.controller";

const router = Router();

router.get("/scrap-products", ScrapProductController.scrapProductData);

export const ScrapRoutes = router;
