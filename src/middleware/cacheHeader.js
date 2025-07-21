const cacheHeader = (req, res, next) => {
  res.set(
      'Cache-Control',
      `public, max-age=300, stale-while-revalidate=600`
    );
    next();
};

module.exports = cacheHeader;