/**
 * Main application bootstrap and event handling
 */

import { loadSettings, saveSettings } from './settings.js';
import { getTimeParts } from './clock.js';
import { initClock, render, resetState } from './renderer.js';
import { toggleSound, playTick, isSoundEnabled } from './sound.js';
import { applyTheme, applyPrimary } from './theme.js';
import { 
  initTimezones, 
  setupTimezonePicker, 
  setTimezone, 
  getCurrentTimezone,
  getTimezoneInfo 
} from './timezone.js';
import { registerSW } from './pwa.js';

// Global state
let currentSettings = {};
let clockInterval = null;

/**
 * Initialize the application
 */
async function initApp() {
  try {
    console.log('Initializing Flip Clock app...');
    
    // Load settings
    currentSettings = loadSettings();
    console.log('Loaded settings:', currentSettings);
    
    // Initialize modules
    await initTimezones();
    initClock(document.getElementById('clock'));
    
    // Apply settings
    applyTheme(currentSettings.theme);
    applyPrimary(currentSettings.primary);
    setTimezone(currentSettings.timezone);
    
    // Setup UI
    setupUI();
    setupTimezonePicker(
      document.getElementById('timezoneSearch'),
      document.getElementById('timezoneDropdown'),
      handleTimezoneChange
    );
    
    // Start clock
    startClock();
    
    // Register PWA
    registerSW();
    
    console.log('App initialized successfully');
    
  } catch (error) {
    console.error('Failed to initialize app:', error);
  }
}

/**
 * Setup UI event handlers
 */
function setupUI() {
  // Sound toggle
  const soundToggle = document.getElementById('soundToggle');
  if (soundToggle) {
    soundToggle.setAttribute('aria-pressed', currentSettings.soundOn.toString());
    soundToggle.querySelector('.label').textContent = 
      currentSettings.soundOn ? 'Sound On' : 'Sound Off';
    soundToggle.querySelector('.icon').textContent = 
      currentSettings.soundOn ? '🔊' : '🔇';
    
    soundToggle.addEventListener('click', handleSoundToggle);
  }
  
  // Time format toggle
  const timeFormatToggle = document.getElementById('timeFormatToggle');
  if (timeFormatToggle) {
    timeFormatToggle.setAttribute('aria-pressed', currentSettings.is12h.toString());
    timeFormatToggle.querySelector('.label').textContent = 
      currentSettings.is12h ? '12h' : '24h';
    
    timeFormatToggle.addEventListener('click', handleTimeFormatToggle);
  }
  
  // Theme selector
  const themeSelect = document.getElementById('themeSelect');
  if (themeSelect) {
    themeSelect.value = currentSettings.theme;
    themeSelect.addEventListener('change', handleThemeChange);
  }
  
  // Primary color picker
  const primaryColor = document.getElementById('primaryColor');
  if (primaryColor) {
    primaryColor.value = currentSettings.primary;
    primaryColor.addEventListener('input', handlePrimaryColorChange);
  }
  
  // Timezone search
  const timezoneSearch = document.getElementById('timezoneSearch');
  if (timezoneSearch) {
    const timezoneInfo = getTimezoneInfo(currentSettings.timezone);
    timezoneSearch.value = timezoneInfo ? timezoneInfo.label : currentSettings.timezone;
  }
}

/**
 * Start the clock with 1-second interval
 */
function startClock() {
  // Initial render
  updateClock();
  
  // Set up interval
  clockInterval = setInterval(updateClock, 1000);
  console.log('Clock started');
}

/**
 * Update clock display and play tick sound
 */
function updateClock() {
  const now = new Date();
  const timeParts = getTimeParts(now, {
    timezone: getCurrentTimezone(),
    is12h: currentSettings.is12h
  });
  
  render(timeParts);
  
  // Play tick sound if enabled
  if (currentSettings.soundOn) {
    playTick();
  }
}

/**
 * Handle sound toggle
 */
function handleSoundToggle(event) {
  const newSoundState = !currentSettings.soundOn;
  
  // Update settings
  currentSettings.soundOn = newSoundState;
  saveSettings({ soundOn: newSoundState });
  
  // Update UI
  event.target.setAttribute('aria-pressed', newSoundState.toString());
  event.target.querySelector('.label').textContent = 
    newSoundState ? 'Sound On' : 'Sound Off';
  event.target.querySelector('.icon').textContent = 
    newSoundState ? '🔊' : '🔇';
  
  // Enable/disable sound
  toggleSound(newSoundState);
  
  console.log('Sound toggled:', newSoundState);
}

/**
 * Handle time format toggle
 */
function handleTimeFormatToggle(event) {
  const newFormat = !currentSettings.is12h;
  
  // Update settings
  currentSettings.is12h = newFormat;
  saveSettings({ is12h: newFormat });
  
  // Update UI
  event.target.setAttribute('aria-pressed', newFormat.toString());
  event.target.querySelector('.label').textContent = newFormat ? '12h' : '24h';
  
  // Force immediate update
  updateClock();
  
  console.log('Time format toggled:', newFormat ? '12h' : '24h');
}

/**
 * Handle theme change
 */
function handleThemeChange(event) {
  const newTheme = event.target.value;
  
  // Update settings
  currentSettings.theme = newTheme;
  saveSettings({ theme: newTheme });
  
  // Apply theme
  applyTheme(newTheme);
  
  console.log('Theme changed:', newTheme);
}

/**
 * Handle primary color change
 */
function handlePrimaryColorChange(event) {
  const newColor = event.target.value;
  
  // Update settings
  currentSettings.primary = newColor;
  saveSettings({ primary: newColor });
  
  // Apply color
  applyPrimary(newColor);
  
  console.log('Primary color changed:', newColor);
}

/**
 * Handle timezone change
 */
function handleTimezoneChange(timezoneId) {
  // Update settings
  currentSettings.timezone = timezoneId;
  saveSettings({ timezone: timezoneId });
  
  // Reset renderer state for smooth transition
  resetState();
  
  // Force immediate update
  updateClock();
  
  console.log('Timezone changed:', timezoneId);
}

/**
 * Handle page visibility change for performance
 */
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    // Page is hidden, could reduce update frequency
    console.log('Page hidden');
  } else {
    // Page is visible, ensure clock is accurate
    updateClock();
    console.log('Page visible');
  }
});

/**
 * Handle app errors
 */
window.addEventListener('error', (event) => {
  console.error('App error:', event.error);
});

/**
 * Initialize app when DOM is ready
 */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}