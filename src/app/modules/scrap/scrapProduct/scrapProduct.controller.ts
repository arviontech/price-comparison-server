import { NextFunction, Request, Response } from "express";
import { ScrapProductService } from "./scrapProduct.service";

const scrapProductData = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { searchTerm } = req.query;
    const payload = searchTerm as string;
    const result = await ScrapProductService.extractProduct(payload);
    res.status(200).json({
      statusCode: 200,
      success: true,
      message: "Product extracted successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const ScrapProductController = {
  scrapProductData,
};
