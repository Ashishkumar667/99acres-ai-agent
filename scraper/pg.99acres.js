import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

puppeteer.use(StealthPlugin());

const pgScraper = async (city, cityId) => {
  if (!cityId ) {
    throw new Error("Missing required query parameters: cityId and city");
  }

  const url = `https://www.99acres.com/search/property/rent/residential/${city}?city=${cityId}&preference=P&area_unit=1&res_com=R&isPreLeased=N`;
  console.log(`url is ${url}`);

  const browser = await puppeteer.launch({
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1366, height: 768 });
  await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36");

  try {
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 0 });

    await page.waitForSelector('.tupleNew__tupleWrap', { timeout: 10000 });

    const listings = await page.evaluate(() => {
        const results = [];
        const containers = document.querySelectorAll('.tupleNew__tupleWrap');
      
        containers.forEach(container => {
          const title = container.querySelector('.tupleNew__subWrapper')?.innerText.trim().split('\n')[0] || '';
      
          const descriptionBlock = container.querySelector('.srp__tuple__description')?.innerText.trim() || '';
      
          // Try extracting location, bhk, area from this block
          const lines = descriptionBlock.split('\n').filter(Boolean);
          const location = lines[0] || '';
          const bhkMatch = descriptionBlock.match(/(\d+)\s?BHK/i);
          const bhk = bhkMatch ? bhkMatch[0] : '';
      
          const areaMatch = descriptionBlock.match(/([\d,.]+)\s?sq.?ft/i);
          const area = areaMatch ? `${areaMatch[1]} sqft` : '';
      
          const priceBlock = container.querySelector('.tupleNew__priceAreaWrap')?.innerText.trim() || '';
          const priceMatch = priceBlock.match(/₹[\d,.]+/);
          const price = priceMatch ? priceMatch[0] : '';
      
          results.push({
            title,
            location,
            price,
            bhk,
            area,
            status: 'PG'
          });
        });
      
        return results;
      });
      
      
    
      const filtered = listings.filter(l => l.price).slice(0, 10);
      return {
        count: filtered.length,
        data: filtered
      };
    

    await browser.close();
    return listings;
  } catch (error) {
    await browser.close();
    throw new Error("Scraping failed: " + error.message);
  }
};

export default pgScraper;


