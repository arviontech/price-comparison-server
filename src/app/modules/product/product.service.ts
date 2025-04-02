import { ScrapProductService } from "../scrap/scrapProduct/scrapProduct.service";
import { Product } from "./product.model";

const getAllProductsFromDB = async (payload: string) => {
  await ScrapProductService.extractProduct(payload);
  const result = await Product.find({
    productTitle: { $regex: payload, $options: "i" },
  });
  return result;
};

export const ProductService = {
  getAllProductsFromDB,
};
