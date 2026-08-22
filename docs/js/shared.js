// ===============================
// SHARED UTILITIES FOR ALL PAGES
// ===============================

// Return the current character key, e.g. "character_John"
function getCurrentCharacterKey() {
    return localStorage.getItem("currentCharacter");
}

// Return the character object or an empty object
function getCharacterObject() {
    const key = getCurrentCharacterKey();
    if (!key) return null;

    return JSON.parse(localStorage.getItem(key)) || {};
}

// Save a single field to the character object
function saveCharacterField(field, value) {
    const key = getCurrentCharacterKey();
    if (!key) return;

    const character = JSON.parse(localStorage.getItem(key)) || {};
    character[field] = value;
    localStorage.setItem(key, JSON.stringify(character));
}

// Clear the active character (used by nav bar)
function clearCurrentCharacter() {
    localStorage.removeItem("currentCharacter");
}

// Redirect to selection.html if no character is selected
function requireCharacter() {
    const key = getCurrentCharacterKey();
    if (!key) {
        window.location.href = "selection.html";
    }
}

// Safe image loader (used by profile or followers pages)
function safeLoadImage(imgElement, base64String) {
    if (!imgElement) return;
    if (!base64String) return;

    imgElement.src = base64String;
    imgElement.style.display = "block";
}

// Simple debug logger (optional)
function log(msg) {
    console.log("[RPG]", msg);
}

// ===============================
// NAV BAR CLOSE CHARACTER SUPPORT
// ===============================

document.addEventListener("DOMContentLoaded", () => {
    const closeBtn = document.getElementById("closeCharacter");
    if (closeBtn) {
        closeBtn.addEventListener("click", () => {
            clearCurrentCharacter();
        });
    }
});
