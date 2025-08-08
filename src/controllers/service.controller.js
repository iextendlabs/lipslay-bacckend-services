const fs = require('fs');
const path = require('path');
const serviceService = require('../services/serviceService');
const responseFormatter = require('../formatters/responseFormatter');
require('dotenv').config();

const getServiceBySlug = async (req, res) => {
  try {
    const slug = req.query.query;
    const zone_id = req.query.zoneId ?? null;
    if (!slug || slug.trim() === '') {
      return res.status(400).json({ error: 'Missing or empty service slug.' });
    }

    const service = await serviceService.getServiceBySlug(slug, zone_id);

    if (!service) {
      return res.status(404).json({ error: 'Service not found.' });
    }

    const formattedService = responseFormatter.formatService(service);

    const dirPath = process.env.JSON_CACHE_SERVICE_PATH || 'src/jsonCache/services';
    const absDirPath = path.isAbsolute(dirPath) ? dirPath : path.join(__dirname, '../../', dirPath);
    if (!fs.existsSync(absDirPath)) {
      fs.mkdirSync(absDirPath, { recursive: true });
    }

    // Build filename as slug or slug_zoneid.json if zone_id is present
    let fileName = slug;
    if (zone_id) {
      fileName += `_${zone_id}`;
    }
    fileName += '.json';
    const filePath = path.join(absDirPath, fileName);

    fs.writeFileSync(filePath, JSON.stringify(formattedService, null, 2), 'utf8');
    // Log to a file instead of console for live site
    const logDir = process.env.JSON_CACHE_LOG_PATH || 'src/jsonCache/logs';
    const absLogDir = path.isAbsolute(logDir) ? logDir : path.join(__dirname, '../../', logDir);
    if (!fs.existsSync(absLogDir)) {
      fs.mkdirSync(absLogDir, { recursive: true });
    }
    const logFile = path.join(absLogDir, 'service_cache.log');
    const logMsg = fs.existsSync(filePath)
      ? `[${new Date().toISOString()}] Service JSON cache created: ${filePath}\n`
      : `[${new Date().toISOString()}] Failed to create service JSON cache: ${filePath}\n`;
    fs.appendFileSync(logFile, logMsg, 'utf8');

    res.json(formattedService);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { getServiceBySlug };