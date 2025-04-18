import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

puppeteer.use(StealthPlugin());

const projectScraper = async (city, cityId) => {
  if (!cityId) {
    throw new Error("Missing required query parameters: cityId and city");
  }

  const url = `https://www.99acres.com/search/project/buy/residential/${city}?city=${cityId}&keyword=${city}&preference=S&area_unit=1&res_com=R&isPreLeased=N&refSection=GNB`;
  console.log(`url is ${url}`);

  const browser = await puppeteer.launch({
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1366, height: 768 });
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
  );

  try {
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 0 });

    // Wait for correct project selector
    await page.waitForSelector('.NpsrpTuple__tupleAnchor', { timeout: 15000 });

    // Extract project data
    const listings = await page.evaluate(() => {
      const results = [];
      const anchors = document.querySelectorAll('.NpsrpTuple__tupleAnchor');

      anchors.forEach(anchor => {
        const title = anchor.getAttribute('title') || '';
        const link = anchor.href;
        const fullText = anchor.innerText || '';

        const bhkMatch = fullText.match(/(\d(?:,\s?\d+)*\s?BHK)/i);
        const bhk = bhkMatch ? bhkMatch[1] : '';

        const priceMatch = fullText.match(/₹[\d.,\s\-]+[A-Z]*/);
        const price = priceMatch ? priceMatch[0] : '';

        const locationMatch = fullText.match(/,\s?(.+?)\n/);
        const location = locationMatch ? locationMatch[1].trim() : '';

        const description =
          anchor.closest('tr')?.parentElement?.querySelector('.NpsrpTuple__subHead')?.innerText || '';

        const uspList = [];
        const uspElements = anchor.closest('tr')?.nextElementSibling?.nextElementSibling?.querySelectorAll('li');
        if (uspElements) {
          uspElements.forEach(el => uspList.push(el.textContent.trim()));
        }

        results.push({
          title,
          link,
          bhk,
          price,
          location,
          description,
          usp: uspList,
        });
      });

      return results;
    });

    const filtered = listings.filter(l => l.price).slice(0, 10);

    await browser.close();
    return {
      count: filtered.length,
      data: filtered
    };

  } catch (error) {
    await browser.close();
    throw new Error("Scraping failed: " + error.message);
  }
};

export default projectScraper;
