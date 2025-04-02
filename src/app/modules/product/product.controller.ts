import catchAsync from "../../utils/catchAsync";
import { ProductService } from "./product.service";

const getProducts = catchAsync(async (req, res) => {
  const { searchTerm } = req.query;
  const payload = searchTerm as string;
  const products = await ProductService.getAllProductsFromDB(payload);
  res.status(200).json({
    statusCode: 200,
    success: true,
    message: "Products fetched successfully",
    data: products,
  });
});

export const ProductController = {
  getProducts,
};
