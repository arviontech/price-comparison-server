import puppeteer from "puppeteer";

// Define TypeScript interfaces
interface ProductData {
  productTitle?: string;
  productImage?: string;
  description?: string;
  price?: string;
  review?: string;
  source?: string;
}

interface WebsiteSelectors {
  search: string;
  productCard: string;
  title: string;
  image: string;
  price: string;
  description: string;
  review: string;
}

interface WebsiteSelectorsMap {
  [key: string]: WebsiteSelectors;
}

// Define website-specific selectors (UPDATED SELECTORS)
const websiteSelectors: WebsiteSelectorsMap = {
  "daraz.com.bd": {
    search: "input[type='search'], input.search-box__input",
    productCard: "[data-qa-locator='product-item']",
    title: " a[title]", // Fixed title selector
    image: "img[class*='image-'], img[src*='.jpg'], img[src*='.png']",
    price: "[class*='price-'], [class*='currency-']",
    description: "[class*='description-'], [class*='desc-']",
    review: "[class*='rating-'], [class*='review-']",
  },
  // default: {
  //   search: "input[type='search'], input[placeholder*='search' i]",
  //   productCard: "div[class*='card'], div[class*='product']",
  //   title: "h2, h3, h4, [class*='title'], [class*='name']",
  //   image: "img",
  //   price: "[class*='price'], span[class*='amount']",
  //   description: "p[class*='description'], [class*='desc']",
  //   review: "[class*='rating'], [class*='review']",
  // },
};

const urls = ["https://www.daraz.com.bd"];

const extractProduct = async (payload: string): Promise<ProductData[]> => {
  const results: ProductData[] = [];

  for (const url of urls) {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    try {
      console.log(`Scraping ${url}...`);
      await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });

      // Get domain for selector lookup
      const domain = new URL(url).hostname.replace("www.", "");
      const selectors = websiteSelectors[domain] || websiteSelectors.default;

      // Search functionality
      await page.waitForSelector(selectors.search, {
        visible: true,
        timeout: 10000,
      });
      await page.type(selectors.search, payload);
      await page.keyboard.press("Enter");

      // Wait for results to load
      await page
        .waitForNavigation({ waitUntil: "networkidle2", timeout: 15000 })
        .catch(() => {
          console.log("Navigation timeout - continuing anyway");
        });

      // Wait for product cards to render
      await page.waitForSelector(selectors.productCard, { timeout: 10000 });

      // Extract product information (IMPROVED EXTRACTION LOGIC)
      const products = await page.evaluate(
        (selectorsArg: WebsiteSelectors, domainArg: string) => {
          const productCards = Array.from(
            document.querySelectorAll(selectorsArg.productCard)
          );

          return productCards.map((card) => {
            const getContent = (selector: string) => {
              const el = card.querySelector(selector);
              return el ? el.textContent?.trim() : "";
            };

            return {
              productTitle: getContent(selectorsArg.title),

              source: domainArg,
            };
          });
        },
        selectors,
        domain
      );

      console.log(`Extracted ${products.length} products from ${url}`);
      results.push(...products); // Filter out empty titles
    } catch (error) {
      console.error(
        `Error scraping ${url}:`,
        error instanceof Error ? error.message : String(error)
      );
    } finally {
      await browser.close();
    }
  }

  return results;
};

export const ScrapProductService = {
  extractProduct,
};
