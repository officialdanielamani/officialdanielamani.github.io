// Check user's preference from localStorage or prefers-color-scheme
let isDarkMode = localStorage.getItem('darkMode');
if (isDarkMode === null) {
    isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
} else {
    isDarkMode = isDarkMode === 'true';
}

// Set initial mode
setMode(isDarkMode);

// Toggle mode and save preference to localStorage
const toggleModeButton = document.getElementById('toggleModeButton');
toggleModeButton.textContent = isDarkMode ? 'Switch to Light Mode ☀️' : 'Switch to Dark Mode 🌑';
toggleModeButton.addEventListener('click', function () {
    isDarkMode = !isDarkMode;
    setMode(isDarkMode);
    toggleModeButton.textContent = isDarkMode ? 'Switch to Light Mode ☀️' : 'Switch to Dark Mode 🌑';
    localStorage.setItem('darkMode', isDarkMode);
});

function setMode(isDarkMode) {
    document.body.classList.toggle('dark-mode', isDarkMode);

    // Change table header background color based on mode
    const headers = document.querySelectorAll('#dataTable th');
    headers.forEach(header => {
        if (isDarkMode) {
            header.classList.add('dark-mode');
        } else {
            header.classList.remove('dark-mode');
        }
    });
}

const body = document.body;
let currentFontSize = parseFloat(localStorage.getItem("fontSize")) || 1.25; // Default font size in em
const fontSizeButtonsContainer = document.getElementById("themeButtons");
const fontAccessibilityButton = document.getElementById("toggleFontAccessibility");
let fontAccessibilityEnabled = localStorage.getItem("fontAccessibilityEnabled") === "true";

function updateFontSize() {
    body.style.fontSize = currentFontSize + "em";
    localStorage.setItem("fontSize", currentFontSize);
}

function toggleFontAccessibility() {
    if (!fontAccessibilityEnabled) {
        body.style.fontFamily = "'Open-Dyslexic', Comic Sans MS, Verdana, sans-serif";
        fontAccessibilityButton.textContent = "Font Accessibility: ✔️";
        fontAccessibilityEnabled = true;
    } else {
        body.style.fontFamily = "Arial, Helvetica, sans-serif";
        fontAccessibilityButton.textContent = "Font Accessibility: ❌";
        fontAccessibilityEnabled = false;
    }
    localStorage.setItem("fontAccessibilityEnabled", fontAccessibilityEnabled);
}

function checkFontAccessibility() {
    if (fontAccessibilityEnabled === true) {
        body.style.fontFamily = "'Open-Dyslexic', Comic Sans MS, Verdana, sans-serif";
        fontAccessibilityButton.textContent = "Font Accessibility: ✔️";
    } else {
        body.style.fontFamily = "Arial, Helvetica, sans-serif";
        fontAccessibilityButton.textContent = "Font Accessibility: ❌";
    }
}

document.getElementById("decreaseFontSize").addEventListener("click", function () {
    currentFontSize = Math.max(currentFontSize - 0.25, 0.25); // Decrease by 0.25em, with a minimum of 0.25em
    updateFontSize();
});

document.getElementById("defaultFontSize").addEventListener("click", function () {
    currentFontSize = 1.25; // Set it back to the default size
    updateFontSize();
});

document.getElementById("increaseFontSize").addEventListener("click", function () {
    currentFontSize += 0.25; // Increase by 0.25em
    updateFontSize();
});

document.getElementById("themeSetting").addEventListener("click", function () {
    if (fontSizeButtonsContainer.style.display === "none" || fontSizeButtonsContainer.style.display === "") {
        fontSizeButtonsContainer.style.display = "block";
    } else {
        fontSizeButtonsContainer.style.display = "none";
    }
});

document.getElementById("toggleFontAccessibility").addEventListener("click", function () {
    toggleFontAccessibility();
});

// Initialize the font size and font accessibility settings
updateFontSize();
checkFontAccessibility();
