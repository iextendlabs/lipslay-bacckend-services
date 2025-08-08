

const fs = require('fs');
const path = require('path');
const categoryService = require('../services/categoryService');
const responseFormatter = require('../formatters/responseFormatter');
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

    // Save formatted category as JSON file
    const dirPath = process.env.JSON_CACHE_CATEGORY_PATH || 'src/jsonCache/categories';
    const absDirPath = path.isAbsolute(dirPath) ? dirPath : path.join(__dirname, '../../', dirPath);
    if (!fs.existsSync(absDirPath)) {
      fs.mkdirSync(absDirPath, { recursive: true });
    }

    let fileName = slug;
    if (zone_id) {
      fileName += `_${zone_id}`;
    }
    fileName += '.json';
    const filePath = path.join(absDirPath, fileName);

    fs.writeFileSync(filePath, JSON.stringify(formattedCategory, null, 2), 'utf8');
    // Log to a file instead of console for live site
    const logDir = process.env.JSON_CACHE_LOG_PATH || 'src/jsonCache/logs';
    const absLogDir = path.isAbsolute(logDir) ? logDir : path.join(__dirname, '../../', logDir);
    if (!fs.existsSync(absLogDir)) {
      fs.mkdirSync(absLogDir, { recursive: true });
    }
    const logFile = path.join(absLogDir, 'category_cache.log');
    const logMsg = fs.existsSync(filePath)
      ? `[${new Date().toISOString()}] Category JSON cache created: ${filePath}\n`
      : `[${new Date().toISOString()}] Failed to create category JSON cache: ${filePath}\n`;
    fs.appendFileSync(logFile, logMsg, 'utf8');

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
