
const urls = require('../config/urls');

const buildUrl = (path, filename) => {
  if (!filename) {
    return `${urls.baseUrl}/default.png`;
  }
  if (typeof filename === 'string' && filename.startsWith('http')) {
    return filename;
  }
  return `${urls.baseUrl}${path}${filename}`;
};

module.exports = { buildUrl };
