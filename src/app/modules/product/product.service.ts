import { ScrapProductService } from "../scrap/scrapProduct/scrapProduct.service";
import { Product } from "./product.model";

const getAllProductsFromDB = async (payload: string) => {
  console.log(payload);
  //check payload
  if (payload !== "") {
    const products = await ScrapProductService.extractProduct(payload);

    if (products.length > 0) {
      for (const product of products) {
        const existingProduct = await Product.findOne({
          productTitle: product.productTitle,
        });
        if (!existingProduct) {
          await Product.create(product);
        } else {
          const isPriceChanged = existingProduct.price !== product.price;
          if (isPriceChanged) {
            await Product.findOneAndUpdate(
              { price: product.productTitle },
              {
                price: product.price,
              },
              { new: true }
            );
          }
        }
      }
    }

    const result = await Product.find({
      productTitle: { $regex: payload, $options: "i" },
    });

    return result;
  } else {
    const result = await Product.find({});
    return result;
  }
};

export const ProductService = {
  getAllProductsFromDB,
};
