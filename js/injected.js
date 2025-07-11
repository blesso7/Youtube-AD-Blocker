/**
 * YouTube AdBlock Pro - Injected Script
 * 
 * This script runs in the page context to interact with YouTube's player API
 * and manipulate elements that can't be accessed directly from the content script.
 */

(function() {
  console.log('YouTube AdBlock Pro: Injected script loaded');
  
  // Configuration
  const config = {
    debug: false,
    skipAds: true,
    removeOverlays: true,
    removeEndCards: true,
    interval: 1000 // Milliseconds
  };
  
  // Main function to handle YouTube's ad system
  function handleAds() {
    try {
      // Skip video ads
      skipVideoAds();
      
      // Handle other ad elements
      removeAdElements();
      
      // Disable tracking beacons
      blockTrackingBeacons();
      
      if (config.debug) {
        logPlayerState();
      }
    } catch (error) {
      if (config.debug) {
        console.error('YouTube AdBlock Pro: Error handling ads', error);
      }
    }
  }
  
  // Function to skip video ads
  function skipVideoAds() {
    if (!config.skipAds) return;
    
    // Get the video player
    const player = document.querySelector('video');
    if (!player) return;
    
    // Check if in ad mode
    const adContainer = document.querySelector('.ad-showing');
    if (adContainer) {
      // Try multiple methods to skip the ad
      
      // Method 1: Skip button click
      const skipButton = document.querySelector('.ytp-ad-skip-button');
      if (skipButton) {
        skipButton.click();
        return;
      }
      
      // Method 2: Skip to end of video
      try {
        if (player.duration) {
          player.currentTime = player.duration;
        }
      } catch (e) {
        // Handle errors when setting currentTime
      }
      
      // Method 3: Increase playback rate
      try {
        player.playbackRate = 16;
      } catch (e) {
        // Handle errors when setting playbackRate
      }
    }
  }
  
  // Remove various ad elements
  function removeAdElements() {
    // Ad containers to remove (CSS selectors)
    const adSelectors = [
      '.ytp-ad-overlay-container',
      '.ytp-ad-text-overlay',
      '.ytp-ad-skip-button-container',
      '.video-ads',
      '.ytp-ad-module',
      '.ytd-companion-slot-renderer',
      '.ytd-action-companion-ad-renderer',
      '.ytd-player-legacy-desktop-watch-ads-renderer',
      '.ytd-player-overlay-ad-renderer',
      '.ytd-promoted-sparkles-web-renderer',
      '.ytd-promoted-sparkles-text-search-renderer',
      '.ytd-display-ad-renderer',
      '.ytp-ad-overlay-slot',
      '#player-ads',
      '#masthead-ad',
      '#merch-shelf'
    ];
    
    // Remove each ad element
    adSelectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(element => {
        element.style.display = 'none';
      });
    });
    
    // Handle end screens and cards if configured
    if (config.removeEndCards) {
      removeEndCards();
    }
    
    if (config.removeOverlays) {
      removeOverlays();
    }
  }
  
  // Remove end screen cards
  function removeEndCards() {
    const endCards = document.querySelectorAll('.ytp-ce-element');
    endCards.forEach(card => {
      card.style.display = 'none';
    });
  }
  
  // Remove video overlay ads
  function removeOverlays() {
    const overlays = document.querySelectorAll('.ytp-iv-video-content');
    overlays.forEach(overlay => {
      overlay.style.display = 'none';
    });
  }
  
  // Block tracking beacons
  function blockTrackingBeacons() {
    // Override XMLHttpRequest to block tracking requests
    if (window.XMLHttpRequest.prototype._originalOpen === undefined) {
      window.XMLHttpRequest.prototype._originalOpen = window.XMLHttpRequest.prototype.open;
      
      window.XMLHttpRequest.prototype.open = function(method, url, ...args) {
        // Check if it's a tracking URL
        if (url && typeof url === 'string') {
          if (url.indexOf('/api/stats/') !== -1 || 
              url.indexOf('doubleclick.net') !== -1 ||
              url.indexOf('googleadservices') !== -1) {
            // Block the request by making it fail silently
            this.abort();
            return;
          }
        }
        
        // Call original open for non-tracking requests
        return this._originalOpen(method, url, ...args);
      };
    }
  }
  
  // Log player state for debugging
  function logPlayerState() {
    const player = document.querySelector('video');
    if (!player) return;
    
    // Get player state
    const state = {
      currentTime: player.currentTime,
      duration: player.duration,
      paused: player.paused,
      ended: player.ended,
      playbackRate: player.playbackRate
    };
    
    console.log('YouTube AdBlock Pro: Player state', state);
  }
  
  // Start the ad blocking
  function init() {
    // Run immediately
    handleAds();
    
    // Set up interval to continuously check for ads
    setInterval(handleAds, config.interval);
    
    // Listen for ad-related elements being added to the DOM
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.addedNodes && mutation.addedNodes.length > 0) {
          // Check if any added nodes are ad-related
          for (let node of mutation.addedNodes) {
            if (node.nodeType === Node.ELEMENT_NODE) {
              // Check if the added element is ad-related
              if (node.classList && (
                  node.classList.contains('ad-showing') ||
                  node.classList.contains('ytp-ad-module') ||
                  node.classList.contains('video-ads'))) {
                handleAds();
                break;
              }
            }
          }
        }
      });
    });
    
    // Start observing the document body for changes
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
  
  // Run the initializer
  init();
})();
