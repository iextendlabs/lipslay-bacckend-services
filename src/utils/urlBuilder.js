
const urls = require('../config/urls');

const buildUrl = (path, filename) => {
  if (!filename) {
    return `${urls.baseUrl}/default.png`;
  }
  return `${urls.baseUrl}${path}${filename}`;
};

module.exports = { buildUrl };
