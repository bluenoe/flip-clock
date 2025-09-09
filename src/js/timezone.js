/**
 * Timezone management and picker functionality
 */

let timezones = [];
let currentTimezone = 'UTC';

/**
 * Load timezones data and initialize picker
 */
export async function initTimezones() {
  try {
    const response = await fetch('/src/data/timezones.json');
    timezones = await response.json();
    console.log(`Loaded ${timezones.length} timezones`);
  } catch (error) {
    console.error('Failed to load timezones:', error);
    // Fallback to basic timezones
    timezones = [
      { id: 'UTC', label: 'UTC (Coordinated Universal Time)' },
      { id: 'America/New_York', label: 'New York (Eastern Time)' },
      { id: 'America/Chicago', label: 'Chicago (Central Time)' },
      { id: 'America/Denver', label: 'Denver (Mountain Time)' },
      { id: 'America/Los_Angeles', label: 'Los Angeles (Pacific Time)' },
      { id: 'Europe/London', label: 'London (GMT/BST)' },
      { id: 'Europe/Paris', label: 'Paris (CET/CEST)' },
      { id: 'Asia/Tokyo', label: 'Tokyo (JST)' },
      { id: 'Asia/Shanghai', label: 'Shanghai (CST)' },
      { id: 'Asia/Ho_Chi_Minh', label: 'Ho Chi Minh City (ICT)' }
    ];
  }
}

/**
 * Search timezones by query
 * @param {string} query - Search query
 * @returns {Array} Filtered timezones
 */
export function searchTimezones(query) {
  if (!query.trim()) {
    return timezones.slice(0, 10); // Return first 10 if no query
  }
  
  const lowerQuery = query.toLowerCase();
  return timezones.filter(tz => 
    tz.label.toLowerCase().includes(lowerQuery) ||
    tz.id.toLowerCase().includes(lowerQuery)
  ).slice(0, 10); // Limit results
}

/**
 * Set current timezone
 * @param {string} timezoneId - IANA timezone identifier
 */
export function setTimezone(timezoneId) {
  // Validate timezone
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: timezoneId });
    currentTimezone = timezoneId;
    console.log(`Timezone set to: ${timezoneId}`);
  } catch (error) {
    console.error(`Invalid timezone: ${timezoneId}`, error);
  }
}

/**
 * Get current timezone
 * @returns {string} Current timezone identifier
 */
export function getCurrentTimezone() {
  return currentTimezone;
}

/**
 * Get user's default timezone
 * @returns {string} Default timezone from browser
 */
export function getDefaultTimezone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch (error) {
    console.error('Failed to get default timezone:', error);
    return 'UTC';
  }
}

/**
 * Find timezone info by ID
 * @param {string} timezoneId - Timezone identifier
 * @returns {Object|null} Timezone info or null if not found
 */
export function getTimezoneInfo(timezoneId) {
  return timezones.find(tz => tz.id === timezoneId) || null;
}

/**
 * Setup timezone picker UI
 * @param {HTMLElement} searchInput - Search input element
 * @param {HTMLElement} dropdown - Dropdown container element
 * @param {Function} onSelect - Callback when timezone is selected
 */
export function setupTimezonePicker(searchInput, dropdown, onSelect) {
  let selectedIndex = -1;
  
  // Handle input changes
  searchInput.addEventListener('input', (e) => {
    const query = e.target.value;
    const results = searchTimezones(query);
    renderDropdown(results, dropdown, onSelect);
    selectedIndex = -1;
  });
  
  // Handle keyboard navigation
  searchInput.addEventListener('keydown', (e) => {
    const options = dropdown.querySelectorAll('.timezone-option');
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        selectedIndex = Math.min(selectedIndex + 1, options.length - 1);
        updateSelection(options, selectedIndex);
        break;
        
      case 'ArrowUp':
        e.preventDefault();
        selectedIndex = Math.max(selectedIndex - 1, -1);
        updateSelection(options, selectedIndex);
        break;
        
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && options[selectedIndex]) {
          const timezoneId = options[selectedIndex].dataset.timezone;
          selectTimezone(timezoneId, searchInput, dropdown, onSelect);
        }
        break;
        
      case 'Escape':
        dropdown.classList.remove('show');
        selectedIndex = -1;
        break;
    }
  });
  
  // Show dropdown on focus
  searchInput.addEventListener('focus', () => {
    const results = searchTimezones(searchInput.value);
    renderDropdown(results, dropdown, onSelect);
  });
  
  // Hide dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (!searchInput.contains(e.target) && !dropdown.contains(e.target)) {
      dropdown.classList.remove('show');
    }
  });
}

/**
 * Render timezone dropdown options
 */
function renderDropdown(timezones, dropdown, onSelect) {
  dropdown.innerHTML = '';
  
  if (timezones.length === 0) {
    dropdown.innerHTML = '<div class="timezone-option">No timezones found</div>';
  } else {
    timezones.forEach(tz => {
      const option = document.createElement('div');
      option.className = 'timezone-option';
      option.textContent = tz.label;
      option.dataset.timezone = tz.id;
      option.addEventListener('click', () => {
        selectTimezone(tz.id, dropdown.previousElementSibling, dropdown, onSelect);
      });
      dropdown.appendChild(option);
    });
  }
  
  dropdown.classList.add('show');
}

/**
 * Update visual selection in dropdown
 */
function updateSelection(options, selectedIndex) {
  options.forEach((option, index) => {
    option.classList.toggle('selected', index === selectedIndex);
  });
  
  // Scroll selected option into view
  if (selectedIndex >= 0 && options[selectedIndex]) {
    options[selectedIndex].scrollIntoView({ block: 'nearest' });
  }
}

/**
 * Select a timezone and update UI
 */
function selectTimezone(timezoneId, searchInput, dropdown, onSelect) {
  const timezoneInfo = getTimezoneInfo(timezoneId);
  if (timezoneInfo) {
    searchInput.value = timezoneInfo.label;
  } else {
    searchInput.value = timezoneId;
  }
  
  dropdown.classList.remove('show');
  setTimezone(timezoneId);
  onSelect(timezoneId);
}