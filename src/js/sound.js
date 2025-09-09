/**
 * Audio management for tick sound
 */

let audioContext = null;
let tickBuffer = null;
let soundEnabled = false;
let userHasInteracted = false;

/**
 * Initialize audio system (must be called after user interaction)
 */
export async function initSound() {
  try {
    // Create audio context
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    // Load tick sound
    const response = await fetch('/audio/tick.mp3');
    const arrayBuffer = await response.arrayBuffer();
    tickBuffer = await audioContext.decodeAudioData(arrayBuffer);
    
    console.log('Sound system initialized');
  } catch (error) {
    console.warn('Failed to initialize sound:', error);
  }
}

/**
 * Enable/disable sound with user interaction gate
 * @param {boolean} enabled - Whether sound should be enabled
 */
export function toggleSound(enabled) {
  soundEnabled = enabled;
  
  // Initialize sound system on first enable (requires user interaction)
  if (enabled && !userHasInteracted) {
    userHasInteracted = true;
    initSound();
  }
}

/**
 * Play tick sound if enabled and audio is ready
 */
export function playTick() {
  if (!soundEnabled || !audioContext || !tickBuffer) {
    return;
  }
  
  try {
    // Don't play if page is not visible (battery optimization)
    if (document.hidden) {
      return;
    }
    
    // Resume audio context if suspended
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }
    
    // Create and play sound
    const source = audioContext.createBufferSource();
    source.buffer = tickBuffer;
    source.connect(audioContext.destination);
    source.start();
  } catch (error) {
    console.warn('Failed to play tick sound:', error);
  }
}

/**
 * Get current sound state
 * @returns {boolean} Whether sound is enabled
 */
export function isSoundEnabled() {
  return soundEnabled;
}