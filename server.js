const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const KEEPA_API_KEY = process.env.KEEPA_API_KEY;
const PORT = process.env.PORT || 3000;

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', name: 'Boardly Backend', version: '1.0.0' });
});

// Token check
app.get('/api/token', async (req, res) => {
  try {
    const response = await axios.get(`https://api.keepa.com/token?key=${KEEPA_API_KEY}`);
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Product analysis by ASIN
app.get('/api/product', async (req, res) => {
  const { asin, domain } = req.query;
  if (!asin) return res.status(400).json({ error: 'ASIN required' });
  const domainId = domain || '4'; // 4 = Amazon.fr, 3 = Amazon.de
  try {
    const response = await axios.get(
      `https://api.keepa.com/product?key=${KEEPA_API_KEY}&domain=${domainId}&asin=${asin}&stats=180&history=1`
    );
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Opportunities scan
app.post('/api/opportunities', async (req, res) => {
  const { asins, domain } = req.body;
  if (!asins || !Array.isArray(asins)) return res.status(400).json({ error: 'asins array required' });
  const domainId = domain || '4';
  try {
    const asinList = asins.join(',');
    const response = await axios.get(
      `https://api.keepa.com/product?key=${KEEPA_API_KEY}&domain=${domainId}&asin=${asinList}&stats=90`
    );
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => console.log(`Boardly backend running on port ${PORT}`));
