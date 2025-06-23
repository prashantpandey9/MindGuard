document.addEventListener("DOMContentLoaded", () => {
  const textarea = document.getElementById("bannedWords");
  const status = document.getElementById("status");
  const saveBtn = document.getElementById("saveBtn");
  const clearBtn = document.getElementById("clearBtn");
  const enableToggle = document.getElementById("enableToggle");
  const wordCount = document.getElementById("wordCount");
  const statusIndicator = document.getElementById("statusIndicator");

  
  chrome.storage.sync.get(["bannedWords", "isEnabled"], (data) => {
    const bannedWords = data.bannedWords || [];
    const isEnabled = data.isEnabled !== undefined ? data.isEnabled : true;
    
    textarea.value = bannedWords.join("\n");
    updateWordCount(bannedWords.length);
    updateToggleState(isEnabled);
    updateStatusIndicator(isEnabled);
  });

  saveBtn.addEventListener("click", () => {
    const words = textarea.value
      .split("\n")
      .map(word => word.trim())
      .filter(Boolean);
    
    chrome.storage.sync.set({ bannedWords: words }, () => {
      updateWordCount(words.length);
      showStatus("Settings saved successfully! ✨", "success");
    });
  });

  clearBtn.addEventListener("click", () => {
    if (confirm("Are you sure you want to clear all blocked words?")) {
      textarea.value = "";
      chrome.storage.sync.set({ bannedWords: [] }, () => {
        updateWordCount(0);
        showStatus("All blocked words cleared! 🗑️", "success");
      });
    }
  });

  enableToggle.addEventListener("click", () => {
    const isCurrentlyEnabled = enableToggle.classList.contains("active");
    const newState = !isCurrentlyEnabled;
    
    chrome.storage.sync.set({ isEnabled: newState }, () => {
      updateToggleState(newState);
      updateStatusIndicator(newState);
      showStatus(
        newState ? "Extension enabled! 🟢" : "Extension disabled! 🔴", 
        "success"
      );
    });
  });

  function updateWordCount(count) {
    wordCount.textContent = count;
  }

  function updateToggleState(isEnabled) {
    if (isEnabled) {
      enableToggle.classList.add("active");
    } else {
      enableToggle.classList.remove("active");
    }
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

  let saveTimeout;
  textarea.addEventListener("input", () => {
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
      const words = textarea.value
        .split("\n")
        .map(word => word.trim())
        .filter(Boolean);
      updateWordCount(words.length);
    }, 300);
  });

  document.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "s") {
      e.preventDefault();
      saveBtn.click();
    }
    
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      saveBtn.click();
    }
  });
});