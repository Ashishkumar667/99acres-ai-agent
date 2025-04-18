import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

puppeteer.use(StealthPlugin());

const scrape99Acres = async (city, cityId, keyword) => {
  if (!cityId || !keyword) {
    throw new Error("Missing required query parameters: cityId and keyword");
  }

  const url = `https://www.99acres.com/search/property/buy/${city}?city=${cityId}&keyword=${keyword}&preference=S&area_unit=1&res_com=R`;
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
        const rawTitle = container.querySelector('.projectTuple__projectName')?.innerText.trim() || '';
        const locationBlock = container.querySelector('.tupleNew__locAndTags')?.innerText.trim() || '';
        const fullTitleText = rawTitle || locationBlock.split('\n')[0] || '';
    
        const bhkMatch = locationBlock.match(/(\d+)\s?BHK/i);
        const bhk = bhkMatch ? `${bhkMatch[1]} BHK` : '';
    
        const location = locationBlock.replace(/RESALE.*?in/i, 'in').split('in')[1]?.trim() || locationBlock;
    
        const priceBlock = container.querySelector('.tupleNew__priceAreaWrap')?.innerText.trim() || '';
        const priceMatch = priceBlock.match(/₹[\d,.]+\s?(Lac|Cr)?/i);
        const price = priceMatch ? priceMatch[0] : '';
    
        const areaMatch = priceBlock.match(/([\d,.]+\s?sqft)/i);
        const area = areaMatch ? areaMatch[1] : '';
    
        const status = priceBlock.toLowerCase().includes("ready to move")
          ? "Ready To Move"
          : priceBlock.toLowerCase().includes("under construction")
            ? "Under Construction"
            : '';
    
        results.push({
          title: fullTitleText,
          location,
          price,
          bhk,
          area,
          status
        });
      });
    
      return results;
    });
    
    const filtered = listings.filter(l => l.price && l.bhk && l.area).slice(0, 10);
    
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

export default scrape99Acres;


