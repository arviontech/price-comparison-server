import { model, Schema } from "mongoose";
import { IProduct } from "./product.interface";

const productSchema = new Schema<IProduct>(
  {
    productTitle: {
      type: String,
    },
    productImage: {
      type: String,
    },
    description: {
      type: String,
    },
    price: {
      type: String,
    },
    review: {
      type: String,
    },
    source: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export const Product = model<IProduct>("Product", productSchema);
