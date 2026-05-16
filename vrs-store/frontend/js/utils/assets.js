/* ================================================================
   ASSETS.JS - Centralized Asset Mapping Engine
   VRS STORE 2026 PRODUCT CATALOG
   
   This file provides a centralized getAssetPath() function that
   normalizes product names to lowercase and matches against a
   strict keyword-to-asset mapping registry.
   
   Usage:
   const assetPath = getAssetPath(productName, productDescription);
   ================================================================ */

/**
 * Centralized Asset Mapping Function
 * @param {string} name - Product name/title
 * @param {string} description - Product description (optional, for additional matching)
 * @returns {string} The image path for the product
 */
function getAssetPath(name, description = '') {
  // Normalize input to lowercase
  const normalizedName = String(name || '').toLowerCase();
  const normalizedDescription = String(description || '').toLowerCase();
  const combinedText = normalizedName + ' ' + normalizedDescription;

  // Gaming Keywords
  if (combinedText.includes('fortnite') || combinedText.includes('v-bucks') || combinedText.includes('crew')) {
    return './images/fortnite.png';
  }
  if (combinedText.includes('roblox') || combinedText.includes('robux')) {
    return './images/roblox.png';
  }
  if (combinedText.includes('gta') || combinedText.includes('grand theft')) {
    return './images/gta.png';
  }
  if (combinedText.includes('valorant') || combinedText.includes('vp')) {
    return './images/valorant.png';
  }

  // AI Subscriptions Keywords
  if (combinedText.includes('chatgpt') || combinedText.includes('gpt-5') || combinedText.includes('openai')) {
    return './images/chatgpt.png';
  }
  if (combinedText.includes('claude') || combinedText.includes('anthropic') || combinedText.includes('sonnet')) {
    return './images/claude.png';
  }
  if (combinedText.includes('perplexity')) {
    return './images/perplexity.png';
  }
  if (combinedText.includes('cursor')) {
    return './images/cursor.png';
  }
  if (combinedText.includes('gemini') || combinedText.includes('google ai')) {
    return './images/gemini.png';
  }
  if (combinedText.includes('midjourney')) {
    return './images/midjourney.png';
  }
  if (combinedText.includes('antigravity')) {
    return './images/antigravity.png';
  }

  // Social & Tools Keywords
  if (combinedText.includes('instagram') || combinedText.includes('username') || combinedText.includes('followers')) {
    return './images/instagram.png';
  }
  if (combinedText.includes('netflix')) {
    return './images/netflix.png';
  }
  if (combinedText.includes('discord') || combinedText.includes('nitro')) {
    return './images/discord.png';
  }
  if (combinedText.includes('burp') || combinedText.includes('pentest') || combinedText.includes('flipper')) {
    return './images/hacker.png';
  }

  // Global Fallback
  console.warn(`[Asset Mapping] No keyword match found for: "${name}". Using fallback image.`);
  return './images/browser.png';
}

/**
 * Legacy Image Map for Category-Based Fallback
 * Used when keyword matching fails
 */
const VRS_LEGACY_IMAGE_MAP = {
  // Gaming
  fortnite: './images/fortnite.png',
  roblox: './images/roblox.png',
  valorant: './images/valorant.png',
  gta: './images/gta.png',
  cs2: './images/game.png',
  pubg: './images/game.png',
  
  // AI
  chatgpt: './images/chatgpt.png',
  claude: './images/claude.png',
  midjourney: './images/midjourney.png',
  canva: './images/canva.png',
  
  // Social
  netflix: './images/netflix.png',
  spotify: './images/spotify.png',
  discord: './images/discord.png',
  youtube: './images/youtube.png',
  
  // Security
  burp_suite: './images/burp-suite.png',
  pentest_tools: './images/hacker.png',
  flipper_zero: './images/flipper-zero.png',
  
  // Default
  default: './images/browser.png'
};

/**
 * Get asset path by category (fallback method)
 * @param {string} category - Product category/subcategory
 * @returns {string} The image path for the category
 */
function getAssetByCategory(category) {
  if (!category) return './images/browser.png';
  return VRS_LEGACY_IMAGE_MAP[category] || './images/browser.png';
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { getAssetPath, getAssetByCategory, VRS_LEGACY_IMAGE_MAP };
}
