// YouTube AdBlock Pro - Version 2.0.0
// Enhanced popup script with blocked ad list and improved UI controls

document.addEventListener('DOMContentLoaded', function() {
  // DOM Elements
  const statusText = document.getElementById('statusText');
  const statusDot = document.querySelector('.status-dot');
  const blockedCount = document.getElementById('blockedCount');
  const trackedCount = document.getElementById('trackedCount');
  const toggleButton = document.getElementById('toggleButton');
  const toggleText = document.getElementById('toggleText');
  const resetButton = document.getElementById('resetButton');
  const refreshPage = document.getElementById('refreshPage');
  const reportIssue = document.getElementById('reportIssue');
  const adsList = document.getElementById('adsList');
  const recentList = document.getElementById('recentList');
  const tabButtons = document.querySelectorAll('.tab-button');
  const tabPanes = document.querySelectorAll('.tab-pane');
  const filterButtons = document.querySelectorAll('.filter-btn');
  const toggleSwitches = document.querySelectorAll('.toggle-switch input');
  const versionNumber = document.getElementById('versionNumber');

  // State
  let state = {
    enabled: true,
    blockedCount: 0,
    trackedCount: 0,
    blockedAds: [],
    activeTab: 'dashboard',
    activeFilter: 'all'
  };

  // Initialize
  function init() {
    loadStats();
    setupEventListeners();
    setupTabNavigation();
    updateUI();
    loadBlockedAds();
  }

  // Load statistics from background script
  function loadStats() {
    try {
      chrome.runtime.sendMessage({ action: 'getStatus' }, function(response) {
        if (chrome.runtime.lastError) {
          console.error('Error:', chrome.runtime.lastError);
          return;
        }
        
        if (response) {
          state.enabled = response.enabled !== false;
          state.blockedCount = response.blockedCount || 0;
          state.trackedCount = Math.floor(state.blockedCount * 0.3);
          updateUI();
        }
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  }

  // Load blocked ads list
  function loadBlockedAds() {
    try {
      chrome.runtime.sendMessage({ action: 'getBlockedAds' }, function(response) {
        if (chrome.runtime.lastError) {
          console.error('Error:', chrome.runtime.lastError);
          return;
        }
        
        if (response && response.blockedAds) {
          state.blockedAds = response.blockedAds;
          renderBlockedAdsList();
          renderRecentAds();
        }
      });
    } catch (error) {
      console.error('Failed to load blocked ads:', error);
    }
  }

  // Render the list of blocked ads
  function renderBlockedAdsList() {
    if (!adsList) return;
    
    adsList.innerHTML = '';
    
    if (state.blockedAds.length === 0) {
      const emptyMessage = document.createElement('div');
      emptyMessage.className = 'empty-state';
      emptyMessage.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
          <path d="M15 9L9 15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          <path d="M9 9L15 15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
        <p>No ads blocked yet</p>
        <span>Visit YouTube to start blocking ads</span>
      `;
      adsList.appendChild(emptyMessage);
      return;
    }
    
    // Filter ads based on current filter
    let filteredAds = state.blockedAds;
    if (state.activeFilter !== 'all') {
      filteredAds = state.blockedAds.filter(ad => ad.type === state.activeFilter);
    }
    
    // Create ad items
    filteredAds.forEach(ad => {
      const adItem = document.createElement('div');
      adItem.className = 'ad-item';
      
      const iconClass = ad.type === 'video' ? 'video' : 'banner';
      const iconSvg = ad.type === 'video' 
        ? '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" stroke-width="2"/><path d="M10 9L15 12L10 15V9Z" fill="currentColor"/></svg>'
        : '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" stroke-width="2"/><path d="M7 9H17" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M7 12H17" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M7 15H12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
      
      adItem.innerHTML = `
        <div class="ad-icon ${iconClass}">
          ${iconSvg}
        </div>
        <div class="ad-info">
          <div class="ad-title">${ad.domain || extractDomain(ad.url)}</div>
          <div class="ad-meta">
            <span class="ad-time">${formatTimeAgo(ad.timestamp)}</span>
            <span class="ad-type ${iconClass}">${ad.type === 'video' ? 'Video Ad' : 'Banner Ad'}</span>
          </div>
        </div>
      `;
      
      adsList.appendChild(adItem);
    });
  }
  
  // Render recent ads in dashboard
  function renderRecentAds() {
    if (!recentList) return;
    
    recentList.innerHTML = '';
    
    if (state.blockedAds.length === 0) {
      const emptyMessage = document.createElement('div');
      emptyMessage.className = 'empty-state';
      emptyMessage.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
          <path d="M15 9L9 15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          <path d="M9 9L15 15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
        <p>No ads blocked yet</p>
        <span>Visit YouTube to start blocking ads</span>
      `;
      recentList.appendChild(emptyMessage);
      return;
    }
    
    // Show only the most recent 3 ads
    const recentAds = state.blockedAds.slice(0, 3);
    
    recentAds.forEach(ad => {
      const recentItem = document.createElement('div');
      recentItem.className = 'recent-item';
      
      const iconSvg = ad.type === 'video' 
        ? '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" stroke-width="2"/><path d="M10 9L15 12L10 15V9Z" fill="currentColor"/></svg>'
        : '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" stroke-width="2"/><path d="M7 9H17" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M7 12H17" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M7 15H12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
      
      recentItem.innerHTML = `
        <div class="recent-icon">
          ${iconSvg}
        </div>
        <div class="recent-info">
          <div class="recent-title">${ad.domain || extractDomain(ad.url)}</div>
          <div class="recent-time">${formatTimeAgo(ad.timestamp)}</div>
        </div>
      `;
      
      recentList.appendChild(recentItem);
    });
  }
  
  // Format timestamp to relative time
  function formatTimeAgo(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHr = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHr / 24);
    
    if (diffSec < 60) {
      return 'Just now';
    } else if (diffMin < 60) {
      return `${diffMin} min${diffMin !== 1 ? 's' : ''} ago`;
    } else if (diffHr < 24) {
      return `${diffHr} hour${diffHr !== 1 ? 's' : ''} ago`;
    } else {
      return `${diffDay} day${diffDay !== 1 ? 's' : ''} ago`;
    }
  }
  
  // Extract domain from URL
  function extractDomain(url) {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname;
    } catch (e) {
      // Fallback if URL parsing fails
      const match = url.match(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)/);
      return match ? match[1] : 'unknown';
    }
  }

  // Set up tab navigation
  function setupTabNavigation() {
    tabButtons.forEach(button => {
      button.addEventListener('click', () => {
        const tab = button.getAttribute('data-tab');
        
        // Update active tab button
        tabButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        
        // Show corresponding tab pane
        const targetPane = document.getElementById(`${tab}Pane`);
        tabPanes.forEach(pane => pane.classList.remove('active'));
        if (targetPane) targetPane.classList.add('active');
        
        state.activeTab = tab;
      });
    });
    
    // Set up filter buttons
    filterButtons.forEach(button => {
      button.addEventListener('click', () => {
        const filter = button.getAttribute('data-filter');
        
        // Update active filter button
        filterButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        
        state.activeFilter = filter;
        renderBlockedAdsList();
      });
    });
  }

  // Set up event listeners
  function setupEventListeners() {
    // Toggle button
    toggleButton.addEventListener('click', function() {
      state.enabled = !state.enabled;
      chrome.runtime.sendMessage({ 
        action: 'toggle',
        value: state.enabled
      }, function(response) {
        if (response) {
          state.enabled = response.enabled;
          updateUI();
        }
      });
    });
    
    // Reset button
    resetButton.addEventListener('click', function() {
      chrome.runtime.sendMessage({ action: 'reset' }, function(response) {
        if (response && response.success) {
          state.blockedCount = 0;
          state.trackedCount = 0;
          state.blockedAds = [];
          updateUI();
          renderBlockedAdsList();
          renderRecentAds();
        }
      });
    });
    
    // Refresh page button
    refreshPage.addEventListener('click', function() {
      chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        if (tabs[0]) {
          chrome.tabs.reload(tabs[0].id);
        }
      });
    });
    
    // Report issue button
    reportIssue.addEventListener('click', function() {
      chrome.tabs.create({
        url: "https://github.com/yourusername/youtube-adblock-pro/issues/new"
      });
    });
    
    // Toggle switches in settings
    toggleSwitches.forEach(toggle => {
      toggle.addEventListener('change', function() {
        const settingName = this.closest('.toggle-switch').getAttribute('data-setting');
        const isChecked = this.checked;
        
        // Special case for the main toggle
        if (settingName === 'blockYouTubeAds') {
          chrome.runtime.sendMessage({ 
            action: 'toggle',
            value: isChecked
          }, function(response) {
            if (response) {
              state.enabled = response.enabled;
              updateUI();
            }
          });
        } else {
          // Handle other settings
          chrome.runtime.sendMessage({ 
            action: 'updateSetting',
            setting: settingName,
            value: isChecked
          });
        }
      });
    });
    
    // Website link
    const websiteLink = document.getElementById('websiteLink');
    if (websiteLink) {
      websiteLink.addEventListener('click', function(e) {
        e.preventDefault();
        chrome.tabs.create({
          url: "https://github.com/yourusername/youtube-adblock-pro"
        });
      });
    }
  }

  // Update UI based on current state
  function updateUI() {
    // Update status indicator
    if (statusDot && statusText) {
      if (state.enabled) {
        statusDot.classList.remove('disabled');
        statusText.textContent = 'Active';
      } else {
        statusDot.classList.add('disabled');
        statusText.textContent = 'Disabled';
      }
    }
    
    // Update counts
    if (blockedCount) {
      blockedCount.textContent = state.blockedCount.toString();
    }
    
    if (trackedCount) {
      trackedCount.textContent = state.trackedCount.toString();
    }
    
    // Update toggle button
    if (toggleButton && toggleText) {
      if (state.enabled) {
        toggleText.textContent = 'Disable';
      } else {
        toggleText.textContent = 'Enable';
      }
    }
    
    // Update settings toggle switches
    const blockYouTubeAdsToggle = document.getElementById('blockYouTubeAdsToggle');
    if (blockYouTubeAdsToggle) {
      blockYouTubeAdsToggle.checked = state.enabled;
    }
    
    // Update version number
    if (versionNumber) {
      chrome.runtime.getManifest().version;
      versionNumber.textContent = `v${chrome.runtime.getManifest().version}`;
    }
  }

  // Initialize the popup
  init();
});
