// Centralized utility to trim text to a max number of words
// Usage: trimWords('some text', 10)
function trimWords(text, maxWords) {
  if (!text) return "";
  const words = String(text).split(/\s+/);
  return words.length > maxWords ? words.slice(0, maxWords).join(' ') + '...' : text;
}

module.exports = { trimWords };
