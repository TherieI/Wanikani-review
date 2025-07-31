console.log("[WK Helper] Content script loaded.");

const EXTRA_INFO_TAG = "wk-extra-info"

chrome.storage.sync.get("apiKey", ({ apiKey }) => {
  if (!apiKey) {
    console.warn("[WK Helper] No API key found in storage.");
    return;
  }
  console.log("[WK Helper] Found API key, fetching subjects...");

  const kanjiElement = document.getElementsByClassName("character-header__characters")[0]

  // Initial UI update
  const kanji = kanjiElement ? kanjiElement.textContent.trim() : null
  searchForKanji(apiKey, kanji).then(res => {
    [date, level] = res
    displayNewInfo(date, level)
  })

  // Subsequent UI updates
  const observer = new MutationObserver(() => {
    const kanji = kanjiElement ? kanjiElement.textContent.trim() : null

    searchForKanji(apiKey, kanji).then(res => {
      [date, level] = res
      displayNewInfo(date, level)
    })
  });
  observer.observe(kanjiElement, { childList: true, subtree: true });
});

async function searchForKanji(apiKey, kanji) {
    return fetch("https://api.wanikani.com/v2/subjects?slugs=" + kanji, {
    headers: { Authorization: `Bearer ${apiKey}` }
  })
    .then(res => res.json())
    .then(async sData => {
      subject = sData.data[0]
      level = subject.data.level
      let dateUnlocked = await fetch("https://api.wanikani.com/v2/assignments?subject_ids=" + subject.id, {
        headers: { Authorization: `Bearer ${apiKey}` }
      })
      .then(res => res.json())
      .then(aData => {
        assignment = aData.data[0]
        return assignment.data.unlocked_at
      })
      .catch(err => {
        console.error("[WK Helper] Failed to find date created", err)
        return "80085"
      })
      
      return [formatDate(dateUnlocked), level]
    })
    .catch(err => {
        console.error("[WK Helper] Failed to fetch subjects", err)
        return null
    }
    );
}

function formatDate(rawDate) {
  date = new Date(rawDate)
  return date.getFullYear() + "年" 
    + String(date.getMonth() + 1).padStart(2, '0') + "月"
    + String(date.getDate()).padStart(2, '0') + "日"
}

function displayNewInfo(date, level) {
  const menuBar = document.getElementsByClassName("character-header__menu-navigation-link")[0]
  menuBar.style.display = "flex";
  menuBar.style.alignItems = "center"; // optional, vertical alignment
  menuBar.style.flexWrap = "nowrap";            // prevents wrapping
  menuBar.style.overflowX = "auto";             // lets it scroll horizontally if needed
  menuBar.style.gap = "8px";                    // nice spacing between children
  
  let injectedElement = document.getElementById(EXTRA_INFO_TAG)
  if (!injectedElement) {
    injectedElement = document.createElement("p")
    injectedElement.id = EXTRA_INFO_TAG
    injectedElement.style.width = "auto";
    injectedElement.style.display = "inline-block";
    injectedElement.style.flex = "0 0 auto";       // don’t shrink
    injectedElement.style.whiteSpace = "nowrap";   // don’t wrap
    menuBar.appendChild(injectedElement)
  }
  injectedElement.textContent = `${level}級 ・ ${date}から学び始めた`
}
