import * as puppeteer from "puppeteer";
import { Product } from "../../product/product.model";
import {
  ProductData,
  WebsiteSelectors,
  WebsiteSelectorsMap,
} from "./scrapProduct.interface";

// Website selectors
const websiteSelectors: WebsiteSelectorsMap = {
  "daraz.com.bd": {
    search: "input[type='search'], input.search-box__input",
    productCard: "[data-qa-locator='product-item']",
    title: " a[title]",
    productLink: "a[title], a[href]",
    image: "img[type='product']",
    price: "[class*='price-'], [class*='currency-'], .aBrP0, .ooOxS",
    description: "[class*='description-'], [class*='desc-']",
    review: "[class*='rating-'], [class*='review-'], .qzqFw",
  },
};

const urls = ["https://www.daraz.com.bd", "https://shop.shajgoj.com"];

/**
 * Scrape a single URL and extract product data
 */
function scrapeUrl(url: string, payload: string): Promise<ProductData[]> {
  let browser: puppeteer.Browser | null = null;

  return puppeteer
    .launch({
      headless: false,
      args: ["--disable-popup-blocking", "--disable-notifications"],
    })
    .then((b: puppeteer.Browser) => {
      browser = b;
      return browser.newPage();
    })
    .then((page: puppeteer.Page) => {
      return page
        .setViewport({ width: 1366, height: 768 })
        .then(() =>
          page.setUserAgent(
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
          )
        )
        .then(() =>
          page.goto(url, { waitUntil: "networkidle2", timeout: 30000 })
        )
        .then(() => {
          // Get domain and selectors
          const domain = new URL(url).hostname.replace("www.", "");
          const selectors =
            websiteSelectors[domain] || websiteSelectors["daraz.com.bd"];

          // Wait for search input and perform search
          return page
            .waitForSelector(selectors.search, {
              visible: true,
              timeout: 10000,
            })
            .then(() => page.type(selectors.search, payload))
            .then(() => page.keyboard.press("Enter"))
            .then(() => {
              // Handle possible navigation timeout
              return Promise.race([
                page.waitForNavigation({
                  waitUntil: "networkidle2",
                  timeout: 15000,
                }),
                new Promise<void>((resolve) =>
                  setTimeout(() => resolve(), 15000)
                ),
              ]);
            })
            .then(() => {
              // Scroll to load lazy content
              return page.evaluate((): Promise<void> => {
                return new Promise<void>((resolve) => {
                  let scrolls = 0;
                  const maxScrolls = 5;

                  function doScroll(): void {
                    if (scrolls < maxScrolls) {
                      window.scrollBy(0, window.innerHeight);
                      scrolls++;
                      setTimeout(doScroll, 1000);
                    } else {
                      resolve();
                    }
                  }

                  doScroll();
                });
              });
            })
            .then(() => {
              // Wait for product cards
              return Promise.race([
                page.waitForSelector(selectors.productCard, { timeout: 10000 }),
                new Promise<void>((resolve) =>
                  setTimeout(() => resolve(), 10000)
                ),
              ]);
            })
            .then(() => {
              // Extract product data
              return page.evaluate(
                (selectorsArg: WebsiteSelectors, domainArg: string) => {
                  try {
                    const productCards = Array.from(
                      document.querySelectorAll(selectorsArg.productCard) || []
                    );

                    return productCards.map((card) => {
                      try {
                        const getContent = (selector: string) => {
                          try {
                            const el = card.querySelector(selector);
                            return el ? el.textContent?.trim() || "" : "";
                          } catch (e) {
                            return "";
                          }
                        };

                        const getLink = (selector: string) => {
                          try {
                            const el = card.querySelector(selector);
                            return el ? el.getAttribute("href") || "" : "";
                          } catch (e) {
                            return "";
                          }
                        };

                        // Extract image URL
                        let productImage = "";
                        try {
                          const imageElement = card.querySelector(
                            selectorsArg.image
                          );
                          if (imageElement) {
                            productImage =
                              imageElement.getAttribute("data-src") ||
                              imageElement.getAttribute("src") ||
                              imageElement.getAttribute("data-original") ||
                              "";
                          }
                        } catch (e) {
                          console.warn("Error extracting image");
                        }

                        return {
                          productTitle: getContent(selectorsArg.title),
                          productImage,
                          productLink: getLink(selectorsArg.productLink),
                          price: getContent(selectorsArg.price),
                          description: getContent(selectorsArg.description),
                          review: getContent(selectorsArg.review),
                          source: domainArg,
                        };
                      } catch (e) {
                        return {
                          productTitle: "Error extracting data",
                          source: domainArg,
                        };
                      }
                    });
                  } catch (e) {
                    return [];
                  }
                },
                selectors,
                domain
              );
            });
        })
        .then((products: ProductData[]) => {
          console.log(`Extracted ${products.length} products from ${url}`);
          return products;
        })
        .catch((error: Error) => {
          console.error(`Error scraping ${url}:`, error.message);
          return [] as ProductData[];
        })
        .finally(() => {
          if (browser) {
            return browser.close().then(() => [] as ProductData[]);
          }
          return Promise.resolve([] as ProductData[]);
        });
    });
}

/**
 * Process URLs sequentially using reduce
 */
function processUrlsSequentially(
  urls: string[],
  payload: string
): Promise<ProductData[]> {
  return urls.reduce((promise: Promise<ProductData[]>, url: string) => {
    return promise.then((results: ProductData[]) => {
      return scrapeUrl(url, payload).then((newResults: ProductData[]) => [
        ...results,
        ...newResults,
      ]);
    });
  }, Promise.resolve([] as ProductData[]));
}

/**
 * Main extraction function
 */
function extractProduct(payload: string): Promise<ProductData[]> {
  return processUrlsSequentially(urls, payload);
}

export const ScrapProductService = {
  extractProduct,
};
