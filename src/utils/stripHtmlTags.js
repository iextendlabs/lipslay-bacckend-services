// Utility to strip HTML tags from a string
module.exports = function stripHtmlTags(str) {
  if (!str) return '';
  return str.replace(/<[^>]*>/g, '');
};
