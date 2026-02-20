const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// ТОП-15 БАЗОВЫХ ТОВАРОВ (реальные цены Челябинск)
const PRODUCTS = [
  'молоко 2.5%', 'хлеб нарезанный', 'творог 5%', 'яйца c1 10шт', 'картофель',
  'колбаса докторская', 'курица охлажденная', 'масло подсолнечное',
  'макароны', 'рис', 'сахар песок', 'чай черный', 'пиво 0.5л', 'водка 0.5л'
];

const STORES = {
  magnit: 'https://magnit.ru/search/?q=',
  pyaterka: 'https://pyaterochka.ru/catalog/search?q=',
  lenta: 'https://lenta.com/search/?q=',
  krasbel: 'https://krasnoe-belyoe.ru/search/?q='
};

async function parsePrice(url, selector = '.price, [class*="price"], .product-price') {
  try {
    const { data } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml'
      },
      timeout: 10000
    });
    const $ = cheerio.load(data);
    const priceEl = $(selector).first();
    const priceText = priceEl.text().trim().replace(/[^\d,]/g, '').replace(',', '.');
    return parseFloat(priceText) || 0;
  } catch {
    return 0;
  }
}

app.get('/api/prices', async (req, res) => {
  const results = [];
  
  for (const product of PRODUCTS) {
    const row = { product };
    for (const [store, baseUrl] of Object.entries(STORES)) {
      const url = `${baseUrl}${encodeURIComponent(product)}`;
      row[store] = await parsePrice(url);
    }
    results.push(row);
  }
  
  res.json({
    date: new Date().toISOString().split('T')[0],
    products: results
  });
});

app.listen(process.env.PORT || 3000, () => console.log('Сервер цен запущен'));
