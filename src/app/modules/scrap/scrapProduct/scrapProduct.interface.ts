// Define interfaces
export interface ProductData {
  productTitle?: string;
  productImage?: string | null;
  description?: string;
  price?: string;
  review?: string;
  source?: string;
}

export interface WebsiteSelectors {
  search: string;
  productCard: string;
  title: string;
  productLink: string;
  image: string;
  price: string;
  description: string;
  review: string;
}

export interface WebsiteSelectorsMap {
  [key: string]: WebsiteSelectors;
}
