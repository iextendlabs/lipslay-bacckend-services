const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const urls = require('../config/urls');

/**
 * Download, resize, and convert an image to webp if not already exists.
 * @param {string} originalUrl - The original image URL
 * @param {string} outputDir - Absolute path to output directory
 * @param {string} outputFilename - Output filename (e.g. myimg_400x200.webp)
 * @param {number} width - Resize width
 * @param {number} height - Resize height
 * @returns {Promise<string>} - The absolute path to the processed image, or null on error
 */
async function getOrCreateWebpImage(originalUrl, outputDir, outputFilename, width, height) {
  if (!originalUrl) {
    return `${urls.baseUrl}/default.png`;
  }
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
  const outputPath = path.join(outputDir, outputFilename);
  // If already exists, return path
  if (fs.existsSync(outputPath)) return outputPath;
  try {
    const response = await fetch(originalUrl);
    if (!response.ok) throw new Error('Image download failed');
    const buffer = await response.arrayBuffer();
    await sharp(Buffer.from(buffer))
      .resize(width, height)
      .webp({ quality: 80 })
      .toFile(outputPath);
    return outputPath;
  } catch (err) {
    return `${urls.baseUrl}/default.png`;
  }
}

module.exports = { getOrCreateWebpImage };
