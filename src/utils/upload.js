const multer = require('multer');
const path = require('path');

function createUpload({ getPath, defaultPath }) {
  return multer({
    storage: multer.diskStorage({
      destination: function (req, file, cb) {
        const dest = getPath ? getPath(file) : defaultPath;
        cb(null, dest || defaultPath);
      },
      filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + ext;
        cb(null, uniqueName);
      }
    })
  });
}

module.exports = createUpload;