/**
 * DOM rendering and flip animation management
 */

let clockElements = {};
let previousTime = '000000';

/**
 * Initialize clock DOM elements
 * @param {HTMLElement} domRoot - Root container for the clock
 */
export function initClock(domRoot) {
  const keys = ['h1', 'h2', 'm1', 'm2', 's1', 's2'];
  
  keys.forEach(key => {
    const element = domRoot.querySelector(`[data-key="${key}"]`);
    if (element) {
      clockElements[key] = element;
    } else {
      console.warn(`Clock element not found for key: ${key}`);
    }
  });
  
  // Get AM/PM indicator
  clockElements.ampm = document.getElementById('ampmIndicator');
  
  console.log('Clock initialized with elements:', Object.keys(clockElements));
}

/**
 * Render time parts with flip animation
 * @param {Object} timeParts - Time parts from clock.js
 */
export function render(timeParts) {
  const keys = ['h1', 'h2', 'm1', 'm2', 's1', 's2'];
  const currentTime = keys.map(key => timeParts[key]).join('');
  
  // Update digits with flip animation
  keys.forEach((key, index) => {
    const element = clockElements[key];
    if (!element) return;
    
    const newDigit = timeParts[key];
    const oldDigit = previousTime[index];
    
    if (newDigit !== oldDigit) {
      // Update content
      element.textContent = newDigit;
      
      // Trigger flip animation
      element.classList.remove('flip-animation');
      // Force reflow to reset animation
      void element.offsetWidth;
      element.classList.add('flip-animation');
      
      // Remove animation class after completion
      setTimeout(() => {
        element.classList.remove('flip-animation');
      }, 600); // Match CSS animation duration
    }
  });
  
  // Update AM/PM indicator
  const ampmElement = clockElements.ampm;
  if (ampmElement) {
    if (timeParts.ampm) {
      ampmElement.textContent = timeParts.ampm;
      ampmElement.classList.add('show');
    } else {
      ampmElement.classList.remove('show');
    }
  }
  
  previousTime = currentTime;
}

/**
 * Reset previous time state (useful when changing timezone)
 */
export function resetState() {
  previousTime = '000000';
}