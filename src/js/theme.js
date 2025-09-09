/**
 * Theme management and primary color customization
 */

/**
 * Apply theme to document body
 * @param {string} themeName - Theme name (dark, light, neon)
 */
export function applyTheme(themeName) {
  const validThemes = ['dark', 'light', 'neon'];
  
  if (!validThemes.includes(themeName)) {
    console.warn(`Invalid theme: ${themeName}, using 'dark'`);
    themeName = 'dark';
  }
  
  // Remove existing theme classes
  validThemes.forEach(theme => {
    document.body.classList.remove(`theme-${theme}`);
  });
  
  // Add new theme class
  document.body.classList.add(`theme-${themeName}`);
  
  // Update meta theme-color for mobile browsers
  updateMetaThemeColor(themeName);
  
  console.log(`Applied theme: ${themeName}`);
}

/**
 * Apply primary color with accessibility checks
 * @param {string} hexColor - Hex color string (e.g., "#66a3ff")
 */
export function applyPrimary(hexColor) {
  if (!isValidHexColor(hexColor)) {
    console.warn(`Invalid hex color: ${hexColor}`);
    return;
  }
  
  // Set CSS custom property
  document.documentElement.style.setProperty('--primary', hexColor);
  
  // Calculate and set primary text color for contrast
  const primaryTextColor = getContrastColor(hexColor);
  document.documentElement.style.setProperty('--primary-text', primaryTextColor);
  
  console.log(`Applied primary color: ${hexColor} with text: ${primaryTextColor}`);
}

/**
 * Update meta theme-color based on current theme
 * @param {string} themeName - Current theme name
 */
function updateMetaThemeColor(themeName) {
  const themeColors = {
    dark: '#0b0f14',
    light: '#f8fafc',
    neon: '#000814'
  };
  
  const metaThemeColor = document.querySelector('meta[name="theme-color"]');
  if (metaThemeColor) {
    metaThemeColor.setAttribute('content', themeColors[themeName] || themeColors.dark);
  }
}

/**
 * Validate hex color format
 * @param {string} hex - Hex color string
 * @returns {boolean} Whether the color is valid
 */
function isValidHexColor(hex) {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex);
}

/**
 * Calculate appropriate text color for contrast
 * @param {string} hexColor - Background hex color
 * @returns {string} Contrasting text color
 */
function getContrastColor(hexColor) {
  // Convert hex to RGB
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  
  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // Return white or black based on luminance
  return luminance > 0.5 ? '#000000' : '#ffffff';
}

/**
 * Get current theme from body class
 * @returns {string} Current theme name
 */
export function getCurrentTheme() {
  const validThemes = ['dark', 'light', 'neon'];
  
  for (const theme of validThemes) {
    if (document.body.classList.contains(`theme-${theme}`)) {
      return theme;
    }
  }
  
  return 'dark'; // Default fallback
}