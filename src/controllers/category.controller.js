const fs = require('fs');
const path = require('path');
const categoryService = require('../services/categoryService');
const responseFormatter = require('../formatters/responseFormatter');
const { writeJsonCache } = require('../helpers/jsonCacheHelper');
require('dotenv').config();

const getCategoryBySlug = async (req, res) => {
  try {
    const slug = req.query.category;
    const zone_id = req.query.zoneId ?? null;
    if (!slug || slug.trim() === '') {
      return res.status(400).json({ error: 'Missing or empty category slug.' });
    }

    const category = await categoryService.getCategoryBySlug(slug, zone_id);

    if (!category) {
      return res.status(404).json({ error: 'Category not found.' });
    }

    const formattedCategory = await responseFormatter.formatCategory(category);

    writeJsonCache({
      data: formattedCategory,
      slug,
      zone_id,
      type: 'category'
    });

    res.json(formattedCategory);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const listMainCategories = async (req, res) => {
  try {
    const categories = await categoryService.listMainCategories();
    res.json(categories);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { getCategoryBySlug, listMainCategories };
