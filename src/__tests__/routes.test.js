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

  it('GET /staff should return staff detail or 400/404', async () => {
    // Test missing param
    let res = await request(app).get('/staff');
    expect([400,404]).toContain(res.statusCode);

    // Test with a fake slug/id (should 404)
    res = await request(app).get('/staff?staff=nonexistent');
    expect([400,404]).toContain(res.statusCode);

    // Optionally, test with a real staff slug/id if you have fixtures
    // res = await request(app).get('/staff?staff=1');
    // expect(res.statusCode).toBe(200);
    // expect(res.body).toHaveProperty('id');
    // expect(res.body).toHaveProperty('name');
    // expect(Array.isArray(res.body.services)).toBe(true);
    // expect(Array.isArray(res.body.categories)).toBe(true);
    // expect(Array.isArray(res.body.reviews)).toBe(true);
  });
});