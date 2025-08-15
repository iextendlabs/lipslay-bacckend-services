const fs = require('fs');
const path = require('path');

function writeJsonCache({ data, slug, zone_id, type }) {
  // type: 'category' or 'service'
  const dirEnv =
    type === 'category'
      ? process.env.JSON_CACHE_CATEGORY_PATH
      : type === 'service'
      ? process.env.JSON_CACHE_SERVICE_PATH
      : type === 'staff'
      ? process.env.JSON_CACHE_STAFF_PATH
      : undefined;
  const defaultDir =
    type === 'category'
      ? 'src/jsonCache/categories'
      : type === 'service'
      ? 'src/jsonCache/services'
      : 'src/jsonCache/staff';
  const dirPath = dirEnv || defaultDir;
  const absDirPath = path.isAbsolute(dirPath)
    ? dirPath
    : path.join(__dirname, '../../', dirPath);

  if (!fs.existsSync(absDirPath)) {
    fs.mkdirSync(absDirPath, { recursive: true });
  }

  let fileName = slug;
  if (zone_id) {
    fileName += `_${zone_id}`;
  }
  fileName += '.json';
  const filePath = path.join(absDirPath, fileName);

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');

  // Logging
  const logDir = process.env.JSON_CACHE_LOG_PATH || 'src/jsonCache/logs';
  const absLogDir = path.isAbsolute(logDir)
    ? logDir
    : path.join(__dirname, '../../', logDir);
  if (!fs.existsSync(absLogDir)) {
    fs.mkdirSync(absLogDir, { recursive: true });
  }
  const logFile = path.join(
    absLogDir,
    type === 'category'
      ? 'category_cache.log'
      : type === 'service'
      ? 'service_cache.log'
      : type === 'staff'
      ? 'staff_cache.log'
      : undefined
  );
  const logMsg = fs.existsSync(filePath)
    ? `[${new Date().toISOString()}] ${type.charAt(0).toUpperCase() + type.slice(1)} JSON cache created: ${filePath}\n`
    : `[${new Date().toISOString()}] Failed to create ${type} JSON cache: ${filePath}\n`;
  fs.appendFileSync(logFile, logMsg, 'utf8');
}

module.exports = { writeJsonCache };