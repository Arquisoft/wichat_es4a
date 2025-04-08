/**
 * Returns the language name in Spanish based on the given language code.
 *
 * @param {string} language - The language code (e.g., "es", "en", "fr", "de", "it").
 * @returns {string} The name of the language in Spanish.
 */
function getLanguage(language) {
    switch(language) {
      case "es":
        return "español";
      case "en":
        return "inglés";
      case "fr":
        return "francés";
      case "de":
        return "alemán";
      case "it":
        return "italiano";
      default:
        return "español";
    }
  }
  
  /**
   * Normalizes a string by removing diacritical marks (accents).
   *
   * @param {string} str - The string to be normalized.
   * @returns {string} - The normalized string without diacritical marks.
   */
  function normalizeString(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }
  
  module.exports = {
    getLanguage,
    normalizeString
  };  