const cache = require('../utils/cache');

const clearCache = (req, res) => {
  cache.clear();
  res.json({ message: 'Cache cleared successfully.' });
};

module.exports = { clearCache };
