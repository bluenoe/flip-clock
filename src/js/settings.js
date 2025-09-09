/**
 * Application settings management with localStorage persistence
 */

export const DEFAULTS = {
  soundOn: false,
  is12h: false,
  theme: 'dark',
  primary: '#66a3ff',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
};

/**
 * Load settings from localStorage with defaults fallback
 * @returns {Object} Current settings object
 */
export function loadSettings() {
  try {
    const stored = localStorage.getItem('flip-clock-settings');
    if (stored) {
      const parsed = JSON.parse(stored);
      return { ...DEFAULTS, ...parsed };
    }
  } catch (error) {
    console.warn('Failed to load settings:', error);
  }
  return { ...DEFAULTS };
}

/**
 * Save partial settings to localStorage
 * @param {Object} partial - Partial settings object to merge and save
 */
export function saveSettings(partial) {
  try {
    const current = loadSettings();
    const updated = { ...current, ...partial };
    localStorage.setItem('flip-clock-settings', JSON.stringify(updated));
  } catch (error) {
    console.error('Failed to save settings:', error);
  }
}