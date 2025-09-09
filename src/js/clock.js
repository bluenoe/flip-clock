/**
 * Clock logic for time calculation and formatting
 */

/**
 * Get formatted time parts for display
 * @param {Date} date - Date object to format
 * @param {Object} options - Formatting options
 * @param {string} options.timezone - IANA timezone identifier
 * @param {boolean} options.is12h - Whether to use 12-hour format
 * @returns {Object} Time parts object with individual digits and AM/PM
 */
export function getTimeParts(date, { timezone, is12h }) {
  try {
    // Create formatter for the specified timezone
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: is12h
    });

    const parts = formatter.formatToParts(date);
    const timeParts = {};
    
    parts.forEach(part => {
      if (part.type === 'hour' || part.type === 'minute' || part.type === 'second') {
        timeParts[part.type] = part.value;
      } else if (part.type === 'dayPeriod') {
        timeParts.ampm = part.value;
      }
    });

    // Extract individual digits
    const hour = timeParts.hour || '00';
    const minute = timeParts.minute || '00';
    const second = timeParts.second || '00';

    return {
      h1: hour[0] || '0',
      h2: hour[1] || '0',
      m1: minute[0] || '0',
      m2: minute[1] || '0',
      s1: second[0] || '0',
      s2: second[1] || '0',
      ampm: timeParts.ampm || ''
    };
  } catch (error) {
    console.error('Error formatting time:', error);
    // Fallback to local time
    const now = new Date();
    let hours = now.getHours();
    let ampm = '';
    
    if (is12h) {
      ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      if (hours === 0) hours = 12;
    }
    
    const h = String(hours).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    const s = String(now.getSeconds()).padStart(2, '0');
    
    return {
      h1: h[0],
      h2: h[1],
      m1: m[0],
      m2: m[1],
      s1: s[0],
      s2: s[1],
      ampm
    };
  }
}