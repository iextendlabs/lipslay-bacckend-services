// File-based cache utility using flat-cache
const flatCache = require('flat-cache');
const path = require('path');

// You can change the cacheId and cacheDir as needed
const cacheId = 'lipslay-cache';
const cacheDir = path.resolve(__dirname, '../../.cache');

const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const cache = flatCache.create({ cacheId, cacheDir, ttl: ONE_DAY_MS });

module.exports = {
  get(key) {
    return cache.getKey(key);
  },
  set(key, value) {
    cache.setKey(key, value, ONE_DAY_MS);
    cache.save(true); // true = no debounce, write immediately
  },
  remove(key) {
    cache.removeKey(key);
    cache.save(true);
  },
  clear() {
    cache.destroy();
  }
};
