const request = require('supertest');
const express = require('express');
const routes = require('../routes');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());
app.use('/', routes);

describe('API Endpoints', () => {
  it('GET /home should return homepage data', async () => {
    const res = await request(app).get('/home');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('categoryCarousel');
    expect(res.body).toHaveProperty('featuredServices');
    expect(res.body).toHaveProperty('staffMembers');
    expect(res.body).toHaveProperty('testimonials');
    expect(res.body).toHaveProperty('appPromotion');
    expect(res.body).toHaveProperty('faqs');
    expect(res.body).toHaveProperty('newsletter');
  });

  it('GET /search should return services array', async () => {
    const res = await request(app).get('/search?q=test');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('services');
    expect(Array.isArray(res.body.services)).toBe(true);
  });
});