/**
 * Generates a URL-friendly slug from text
 * @param {string} text - The text to slugify
 * @returns {string} - URL-friendly slug
 */
const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    // Replace spaces with hyphens
    .replace(/\s+/g, '-')
    // Remove all non-word characters except hyphens
    .replace(/[^\w\-]+/g, '')
    // Replace multiple hyphens with single hyphen
    .replace(/\-\-+/g, '-')
    // Remove leading/trailing hyphens
    .replace(/^-+/, '')
    .replace(/-+$/, '');
};

/**
 * Generates a unique slug by adding numbers if duplicate exists
 * @param {string} baseSlug - The base slug
 * @param {Model} Model - Mongoose model to check against
 * @param {string} excludeId - ID to exclude from duplicate check (for updates)
 * @returns {Promise<string>} - Unique slug
 */
const generateUniqueSlug = async (baseSlug, Model, excludeId = null) => {
  let slug = baseSlug;
  let counter = 1;
  
  while (true) {
    const query = { slug };
    if (excludeId) {
      query._id = { $ne: excludeId };
    }
    
    const exists = await Model.findOne(query);
    
    if (!exists) {
      return slug;
    }
    
    // If slug exists, append number
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
};

export { slugify, generateUniqueSlug };