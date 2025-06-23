let bannedWords = [];
let isEnabled = true;


chrome.storage.sync.get(["bannedWords", "isEnabled"], (data) => {
  bannedWords = data.bannedWords || [];
  isEnabled = data.isEnabled !== undefined ? data.isEnabled : true;
});


chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === "sync") {
    if (changes.bannedWords) {
      bannedWords = changes.bannedWords.newValue || [];
    }
    if (changes.isEnabled) {
      isEnabled = changes.isEnabled.newValue;
    }
  }
});

chrome.webNavigation.onBeforeNavigate.addListener((details) => {
  if (!isEnabled) return;

  const url = new URL(details.url);
  

  const urlParts = [
    url.hostname,           
    url.pathname,           
    url.search,             
    url.hash                
  ].join(' ').toLowerCase();
  

  const searchParams = [
    url.searchParams.get("q"),      
    url.searchParams.get("query"),  
    url.searchParams.get("search"), 
    url.searchParams.get("p"),      
    url.searchParams.get("wd")   
  ].filter(Boolean).join(' ').toLowerCase();
  
  const fullTextToCheck = `${urlParts} ${searchParams}`;
  
  if (bannedWords.some(word => fullTextToCheck.includes(word.toLowerCase()))) {
    chrome.tabs.update(details.tabId, { url: "https://www.google.com" });
  }
}, { url: [{ urlMatches: ".*" }] });