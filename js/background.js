/**
 * @fileoverview Background script for YouTube AdBlock Pro
 * @version 2.0.0
 * @author YouTube AdBlock Pro Team
 * @license MIT
 * @description Main background script that handles network requests blocking,
 * tracks statistics, and manages extension functionality.
 */

console.log("YouTube AdBlock Pro: Background script loaded");

/**
 * Core state variables for the ad blocker
 */
let enabled = true;
let blockedCount = 0;
let blockedAds = [];
const MAX_STORED_ADS = 100;

/**
 * Initialize the ad blocker functionality
 * Sets up network request filtering and loads saved settings
 */
function initAdBlocker() {
  // Setup web request filtering for ads
  chrome.webRequest.onBeforeRequest.addListener(
    function(details) {
      if (!enabled) return { cancel: false };
      
      // Check if the URL matches ad patterns
      if (isAdUrl(details.url)) {
        blockedCount++;
        
        // Add to blocked ads list with metadata
        const adType = determineAdType(details.url);
        const newAd = {
          id: generateId(),
          url: details.url,
          timestamp: new Date().toISOString(),
          type: adType,
          domain: extractDomain(details.url)
        };
        
        // Add to the beginning of the array (newest first)
        blockedAds.unshift(newAd);
        
        // Keep array size limited
        if (blockedAds.length > MAX_STORED_ADS) {
          blockedAds.pop();
        }
        
        // Save to storage
        saveBlockedAdsToStorage();
        updateBadge();
        console.log("Blocked ad:", details.url);
        return { cancel: true };
      }
      return { cancel: false };
    },
    {
      urls: [
        "*://*.doubleclick.net/*",
        "*://*.googleadservices.com/*", 
        "*://*.googlesyndication.com/*",
        "*://*.google-analytics.com/*",
        "*://googleads.g.doubleclick.net/*",
        "*://*.youtube.com/api/stats/ads*",
        "*://*.youtube.com/pagead/*",
        "*://*.youtube.com/ptracking*"
      ]
    },
    ["blocking"]
  );

  // Load saved settings
  chrome.storage.sync.get(["enabled", "blockedCount", "blockedAds"], function(result) {
    enabled = result.enabled !== undefined ? result.enabled : true;
    blockedCount = result.blockedCount || 0;
    blockedAds = result.blockedAds || [];
    updateBadge();
  });
}

/**
 * Determines if a URL is an advertisement URL
 * @param {string} url - The URL to check
 * @returns {boolean} True if the URL matches known ad patterns
 */
function isAdUrl(url) {
  const adPatterns = [
    /doubleclick\.net/,
    /googleadservices\.com/,
    /googlesyndication\.com/,
    /google-analytics\.com/,
    /youtube\.com\/api\/stats\/ads/,
    /youtube\.com\/pagead/,
    /youtube\.com\/ptracking/
  ];
  
  return adPatterns.some(pattern => pattern.test(url));
}

/**
 * Determines the type of advertisement based on URL patterns
 * @param {string} url - The URL to analyze
 * @returns {string} The type of advertisement ('video' or 'banner')
 */
function determineAdType(url) {
  // Check for video ad patterns
  if (
    url.includes('/videoplayback') || 
    url.includes('api/stats/ads') ||
    url.includes('get_video_info')
  ) {
    return 'video';
  }
  
  // Default to banner for other ad types
  return 'banner';
}

/**
 * Extracts the domain from a URL
 * @param {string} url - The full URL
 * @returns {string} The extracted domain name
 */
function extractDomain(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch (e) {
    // Fallback if URL parsing fails
    const match = url.match(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)/);
    return match ? match[1] : '';
  }
}

/**
 * Generates a unique identifier for each blocked ad
 * @returns {string} A unique ID
 */
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

/**
 * Updates the browser action badge with current blocked count
 */
function updateBadge() {
  chrome.browserAction.setBadgeText({ text: blockedCount.toString() });
  chrome.browserAction.setBadgeBackgroundColor({ color: '#6366f1' });
  
  // Update icon based on enabled state
  const iconPath = enabled ? 'icons/icon48.png' : 'icons/icon48-disabled.png';
  chrome.browserAction.setIcon({ path: iconPath });
}

/**
 * Saves the current blocked ads list to storage
 */
function saveBlockedAdsToStorage() {
  chrome.storage.sync.set({ 
    'enabled': enabled,
    'blockedCount': blockedCount,
    'blockedAds': blockedAds
  }, function() {
    // Optional callback
    // console.log('Saved blocked ads to storage');
  });
}

/**
 * Resets the counter and blocked ads history
 */
function resetCounter() {
  blockedCount = 0;
  blockedAds = [];
  saveBlockedAdsToStorage();
  updateBadge();
}

/**
 * Toggles the enabled state of the ad blocker
 * @param {boolean} newState - The new state to set
 */
function toggleEnabled(newState) {
  enabled = newState !== undefined ? newState : !enabled;
  saveBlockedAdsToStorage();
  updateBadge();
  return enabled;
}

/**
 * Message handler for communication with popup and content scripts
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.action) {
    case 'getStatus':
      sendResponse({
        enabled: enabled,
        blockedCount: blockedCount,
        blockedAds: blockedAds
      });
      break;
    
    case 'toggle':
      const newState = toggleEnabled(message.value);
      sendResponse({ enabled: newState });
      break;
    
    case 'reset':
      resetCounter();
      sendResponse({ success: true });
      break;
      
    case 'getBlockedAds':
      sendResponse({ blockedAds: blockedAds });
      break;
      
    case 'reportBlockedAd':
      // Content script reports a DOM-level ad that was blocked
      if (message.adInfo) {
        blockedCount++;
        
        const newAd = {
          id: generateId(),
          url: message.adInfo.location || 'dom-element',
          timestamp: new Date().toISOString(),
          type: message.adInfo.type || 'banner',
          title: message.adInfo.title || 'DOM Ad Element'
        };
        
        blockedAds.unshift(newAd);
        
        if (blockedAds.length > MAX_STORED_ADS) {
          blockedAds.pop();
        }
        
        saveBlockedAdsToStorage();
        updateBadge();
      }
      sendResponse({ success: true });
      break;
  }
  
  return true; // Keep the message channel open for async responses
});

// Initialize the ad blocker
initAdBlocker();
