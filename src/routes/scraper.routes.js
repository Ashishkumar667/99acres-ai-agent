import { Router } from 'express';
import scrape99Acres from '../../scraper/99acres.js';
import rentScraper from '../../scraper/rent99Acres.js';
import pgScraper from '../../scraper/pg.99acres.js';
import projectScraper from '../../scraper/projects.99acres.js';

const router = Router();

router.get('/scrape', async (req, res) => {
    const { city, cityId, keyword } = req.query;

  try {
    const data = await scrape99Acres(city, cityId, keyword);
    res.json({ count: data.length, data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Scraping failed', error: error.message });
  }
});

router.get('/rent', async(req, res)=>{
 const { city, cityId } = req.query;

try {

    const rentdata = await rentScraper(city, cityId);
    res.json({ count: rentdata.length, data: rentdata });
    
} catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Scraping failed', error: error.message });
  }
});

router.get('/pg', async(req, res)=>{
    const { city, cityId } = req.query;
   
   try {
   
       const rentdata = await pgScraper(city, cityId);
       res.json({ count: rentdata.length, data: rentdata });
       
   } catch (error) {
       console.error(error);
       res.status(500).json({ message: 'Scraping failed', error: error.message });
     }
   });

   router.get('/projects', async(req, res)=>{
    const { city, cityId } = req.query;
   
   try {
   
       const rentdata = await projectScraper(city, cityId);
       res.json({ count: rentdata.length, data: rentdata });
       
   } catch (error) {
       console.error(error);
       res.status(500).json({ message: 'Scraping failed', error: error.message });
     }
   });
   
export default router;
