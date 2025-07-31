const apiKeyInput = document.getElementById("api-key");
const statusText = document.getElementById("status");
const saveBtn = document.getElementById("save");

// Load existing key on popup open
chrome.storage.sync.get("apiKey", ({ apiKey }) => {
  if (apiKey) {
    apiKeyInput.value = apiKey;
    statusText.textContent = "Token loaded.";
    statusText.style.color = "green";
  }
});

// Save key on click
saveBtn.addEventListener("click", () => {
  const key = apiKeyInput.value.trim();
  if (!key) {
    statusText.textContent = "API key cannot be empty!";
    statusText.style.color = "red";
    return;
  }

  chrome.storage.sync.set({ apiKey: key }, () => {
    statusText.textContent = "Token saved!";
    statusText.style.color = "green";
  });
});
