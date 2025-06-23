document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.getElementById('toggle');
  const settingsBtn = document.getElementById('settingsBtn');
  const quickAddBtn = document.getElementById('quickAddBtn');
  const wordCount = document.getElementById('wordCount');
  const statusIndicator = document.getElementById('statusIndicator');
  const status = document.getElementById('status');


  chrome.storage.sync.get(["bannedWords", "isEnabled"], (data) => {
    const bannedWords = data.bannedWords || [];
    const isEnabled = data.isEnabled !== undefined ? data.isEnabled : true;
    
    updateToggleState(isEnabled);
    updateWordCount(bannedWords.length);
    updateStatusIndicator(isEnabled);
  });


  toggle.addEventListener("click", () => {
    const isCurrentlyEnabled = toggle.classList.contains("active");
    const newState = !isCurrentlyEnabled;
    
    chrome.storage.sync.set({ isEnabled: newState }, () => {
      updateToggleState(newState);
      updateStatusIndicator(newState);
      showStatus(
        newState ? "Filter enabled! 🟢" : "Filter disabled! 🔴", 
        "success"
      );
    });
  });


  settingsBtn.addEventListener("click", () => {
    chrome.tabs.create({ url: chrome.runtime.getURL("settings.html") });
  });


  quickAddBtn.addEventListener("click", () => {
    const word = prompt("Enter a word to block:");
    if (word && word.trim()) {
      chrome.storage.sync.get("bannedWords", (data) => {
        const bannedWords = data.bannedWords || [];
        const trimmedWord = word.trim().toLowerCase();
        
        if (bannedWords.includes(trimmedWord)) {
          showStatus("Word already blocked! ⚠️", "error");
          return;
        }
        
        bannedWords.push(trimmedWord);
        chrome.storage.sync.set({ bannedWords: bannedWords }, () => {
          updateWordCount(bannedWords.length);
          showStatus(`"${trimmedWord}" added to blocked words! ✅`, "success");
        });
      });
    }
  });


  function updateToggleState(isEnabled) {
    if (isEnabled) {
      toggle.classList.add("active");
    } else {
      toggle.classList.remove("active");
    }
  }


  function updateWordCount(count) {
    wordCount.textContent = count;
  }


  function updateStatusIndicator(isEnabled) {
    if (isEnabled) {
      statusIndicator.textContent = "✓";
      statusIndicator.style.color = "#38a169";
    } else {
      statusIndicator.textContent = "✗";
      statusIndicator.style.color = "#e53e3e";
    }
  }


  function showStatus(message, type) {
    status.textContent = message;
    status.className = `status ${type} show`;
    
    setTimeout(() => {
      status.classList.remove("show");
    }, 3000);
  }


  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === "sync") {
      if (changes.bannedWords) {
        const newWords = changes.bannedWords.newValue || [];
        updateWordCount(newWords.length);
      }
      if (changes.isEnabled) {
        const newState = changes.isEnabled.newValue;
        updateToggleState(newState);
        updateStatusIndicator(newState);
      }
    }
  });


  document.addEventListener("keydown", (e) => {

    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      toggle.click();
    }
    
  
    if (e.key === "s") {
      e.preventDefault();
      settingsBtn.click();
    }
    
  
    if (e.key === "q") {
      e.preventDefault();
      quickAddBtn.click();
    }
  });

  settingsBtn.title = "Open settings (S)";
  quickAddBtn.title = "Quick add word (Q)";
  toggle.title = "Toggle filter (Space/Enter)";
});