// Background script for Focus Timer Chrome Extension

// Handle extension installation
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    // Set default settings
    chrome.storage.sync.set({
      timerSettings: {
        focusTime: 25 * 60,
        breakTime: 5 * 60,
        longBreakTime: 15 * 60,
        sessionsUntilLongBreak: 4
      },
      smilePopupSettings: {
        enabled: true,
        showQuotes: true,
        showCelebration: true,
        customImage: '',
        animationIntensity: 'medium',
        quotesSource: 'motivational',
        autoClose: false,
        closeDelay: 5
      }
    });
  }
});

// Handle timer alarms
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'focusTimer') {
    // Show notification when timer completes
    chrome.notifications.create('timerComplete', {
      type: 'basic',
      iconUrl: 'icons/icon48.png',
      title: 'Focus Timer',
      message: 'Session completed! Time for a break 🎉'
    });
    
    // Play notification sound (if enabled)
    chrome.storage.sync.get(['soundEnabled'], (result) => {
      if (result.soundEnabled !== false) {
        // Chrome extensions can't play audio directly in background
        // This would need to be handled in the popup/content script
      }
    });
  }
});

// Handle notification clicks
chrome.notifications.onClicked.addListener((notificationId) => {
  if (notificationId === 'timerComplete') {
    // Open the extension popup or dashboard
    chrome.action.openPopup();
  }
});

// Message handling between popup and background
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.type) {
    case 'START_TIMER':
      // Set alarm for timer duration
      chrome.alarms.create('focusTimer', {
        delayInMinutes: message.duration / 60
      });
      break;
      
    case 'STOP_TIMER':
      // Clear existing timer alarm
      chrome.alarms.clear('focusTimer');
      break;
      
    case 'GET_STORAGE':
      // Get data from chrome storage
      chrome.storage.sync.get(message.keys, (result) => {
        sendResponse(result);
      });
      return true; // Keep message channel open for async response
      
    case 'SET_STORAGE':
      // Save data to chrome storage
      chrome.storage.sync.set(message.data, () => {
        sendResponse({ success: true });
      });
      return true;
  }
});