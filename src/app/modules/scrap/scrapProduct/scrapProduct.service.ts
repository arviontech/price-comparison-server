import puppeteer from "puppeteer";

const extractProduct = async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto("https://shop.shajgoj.com");

  const title = await page.$eval("h5", (el) => el.textContent);
  console.log(title);
  await browser.close();
};

export const ScrapProductService = {
  extractProduct,
};
