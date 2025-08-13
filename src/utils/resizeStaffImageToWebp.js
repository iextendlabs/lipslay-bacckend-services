const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const urls = require('../config/urls');

/**
 * Download, resize to 1080x1080, and convert an image to webp format.
 * @param {string} originalUrl - The original image URL
 * @param {string} imageName - The original image filename
 * @returns {Promise<string>} - The web-accessible URL to the processed image, or default.png on error
 */
async function resizeStaffImageToWebp(originalUrl, imageName) {
  if (!originalUrl || !imageName) {
    return null;
  }
  const resizeDir = process.env.RESIZE_IMAGE_PATH;
  const staffImagesFolder = path.join(resizeDir, 'staff-gallery-images');
  if (!fs.existsSync(staffImagesFolder)) fs.mkdirSync(staffImagesFolder, { recursive: true });
  const webpFilename = `${path.parse(imageName).name}_1080x1080.webp`;
  const outputPath = path.join(staffImagesFolder, webpFilename);
  const webUrl = `${urls.baseUrl}/resize-images/staff-gallery-images/${webpFilename}`;
  if (fs.existsSync(outputPath)) return webUrl;
  try {
    const response = await fetch(originalUrl);
    if (!response.ok) throw new Error('Image download failed');
    const buffer = await response.arrayBuffer();
    await sharp(Buffer.from(buffer))
      .resize(1080, 1080, { fit: 'cover' })
      .rotate() // disables EXIF orientation
      .webp({ quality: 80 })
      .toFile(outputPath);
    return webUrl;
  } catch (err) {
    return null;
  }
}

module.exports = { resizeStaffImageToWebp };