// Content script for YouTube ad blocking
console.log("YouTube AdBlock Pro: Content script loaded");

class YouTubeAdBlocker {
  constructor() {
    this.initialized = false;
    this.init();
  }

  init() {
    if (this.initialized) return;
    this.initialized = true;
    
    console.log("YouTube AdBlock Pro: Initializing...");
    
    // Wait for DOM to be ready
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => this.start());
    } else {
      this.start();
    }
  }

  start() {
    this.removeAds();
    this.setupObservers();
    this.injectCustomStyles();
    
    // Continuous monitoring
    setInterval(() => this.removeAds(), 1000);
  }

  removeAds() {
    const adSelectors = [
      ".video-ads",
      ".ytp-ad-module",
      ".ytp-ad-overlay-container",
      ".ytp-ad-player-overlay",
      "#masthead-ad",
      ".ytd-display-ad-renderer",
      ".ytd-banner-promo-renderer",
      ".ytd-ad-slot-renderer"
    ];

    adSelectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(element => {
        // Report the DOM ad to the background script before removing
        this.reportDomAd(element, selector);
        element.remove();
      });
    });

    // Skip video ads
    this.skipVideoAds();
  }
  
  reportDomAd(element, selector) {
    // Only report new ads we haven't seen before
    if (element.dataset.reported) return;
    element.dataset.reported = "true";
    
    // Try to determine the ad type and URL
    let adType = "banner";
    if (selector.includes("video") || selector.includes("player")) {
      adType = "video";
    }
    
    // Find any links within the ad element
    let adUrl = "";
    const links = element.querySelectorAll("a[href]");
    if (links.length > 0) {
      adUrl = links[0].href;
    }
    
    // If no URL found, use the current page URL
    if (!adUrl) {
      adUrl = window.location.href;
    }
    
    // Report to background script
    chrome.runtime.sendMessage({
      action: "reportBlockedAd",
      adInfo: {
        url: adUrl,
        type: adType,
        source: "DOM",
        location: window.location.href,
        timestamp: new Date().toISOString()
      }
    });
  }

  skipVideoAds() {
    // Auto-skip video ads
    const skipButton = document.querySelector(".ytp-ad-skip-button, .ytp-skip-ad-button");
    if (skipButton) {
      skipButton.click();
      console.log("YouTube AdBlock Pro: Skipped video ad");
    }
    
    // Hide ad info bar
    const adInfoBar = document.querySelector(".ytp-ad-info-bar-container");
    if (adInfoBar) {
      adInfoBar.style.display = "none";
    }
    
    // Detect and handle video ads by checking player state
    this.handleVideoAdPlayer();
  }
  
  handleVideoAdPlayer() {
    const videoPlayer = document.querySelector(".html5-video-player");
    if (!videoPlayer) return;
    
    // Check if player has ad overlay class
    if (videoPlayer.classList.contains("ad-showing") || videoPlayer.classList.contains("ad-interrupting")) {
      // Try to skip or fast-forward
      const video = document.querySelector("video");
      if (video) {
        // Try to skip to the end of the video ad
        try {
          if (!video.dataset.adHandled) {
            video.dataset.adHandled = "true";
            video.currentTime = video.duration;
            video.playbackRate = 16; // Speed up playback
            
            // Report blocked video ad
            chrome.runtime.sendMessage({
              action: "reportBlockedAd",
              adInfo: {
                type: "video",
                location: window.location.href,
                title: "Video Ad",
                timestamp: new Date().toISOString()
              }
            });
            
            console.log("YouTube AdBlock Pro: Fast-forwarded video ad");
          }
        } catch (e) {
          console.log("YouTube AdBlock Pro: Error skipping video ad", e);
        }
      }
    } else {
      // Reset ad handling flag when not in ad
      const video = document.querySelector("video");
      if (video && video.dataset.adHandled) {
        delete video.dataset.adHandled;
      }
    }
  }
  
  setupObservers() {
    // Watch for DOM changes to catch dynamically added ads
    this.observer = new MutationObserver((mutations) => {
      let shouldRemoveAds = false;
      
      for (const mutation of mutations) {
        if (mutation.type === "childList" && mutation.addedNodes.length) {
          shouldRemoveAds = true;
          break;
        }
      }
      
      if (shouldRemoveAds) {
        this.removeAds();
      }
    });
    
    // Start observing the document with the configured parameters
    this.observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    // Inject the script that will run in page context
    this.injectScript();
  }
  
  injectCustomStyles() {
    // Additional custom styles can be injected here if needed
    // Note: Most styles are in content.css
  }
  
  injectScript() {
    // Create script element to inject code into page context
    const scriptElement = document.createElement("script");
    scriptElement.src = chrome.runtime.getURL("js/injected.js");
    scriptElement.onload = function() {
      this.remove(); // Remove after injection
    };
    (document.head || document.documentElement).appendChild(scriptElement);
  }
}

// Initialize the ad blocker
new YouTubeAdBlocker();
