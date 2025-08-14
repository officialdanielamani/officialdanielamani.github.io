/**
 * Optimized Theme Manager
 * Lightweight, efficient theme and accessibility controller
 */

class ThemeManager {
    constructor() {
        // Initialize settings with defaults
        this.settings = {
            darkMode: this.getSetting('darkMode', this.getSystemPreference()),
            fontSize: parseFloat(this.getSetting('fontSize', '1.25')),
            dyslexicFont: this.getSetting('dyslexicFont', 'false') === 'true'
        };
        
        // Cache DOM elements
        this.elements = {};
        this.cacheElements();
        
        // Initialize the theme
        this.init();
    }
    
    /**
     * Get setting from localStorage with fallback
     */
    getSetting(key, defaultValue) {
        const value = localStorage.getItem(key);
        return value !== null ? value : defaultValue;
    }
    
    /**
     * Set setting in localStorage and update internal state
     */
    setSetting(key, value) {
        localStorage.setItem(key, value.toString());
        this.settings[key] = value;
    }
    
    /**
     * Get system color scheme preference
     */
    getSystemPreference() {
        return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    
    /**
     * Cache frequently accessed DOM elements
     */
    cacheElements() {
        const elementIds = [
            'themeSetting', 'themeButtons', 'toggleMode', 
            'decreaseFont', 'resetFont', 'increaseFont', 'toggleFont'
        ];
        
        elementIds.forEach(id => {
            this.elements[id] = document.getElementById(id);
        });
        
        this.elements.body = document.body;
    }
    
    /**
     * Initialize theme and bind events
     */
    init() {
        this.updateTheme();
        this.updateFontSize();
        this.updateFont();
        this.bindEvents();
        this.updateButtonTexts();
    }
    
    /**
     * Bind event listeners to buttons
     */
    bindEvents() {
        const eventMap = {
            themeSetting: () => this.toggleSettings(),
            toggleMode: () => this.toggleDarkMode(),
            decreaseFont: () => this.changeFontSize(-0.25),
            resetFont: () => this.resetFontSize(),
            increaseFont: () => this.changeFontSize(0.25),
            toggleFont: () => this.toggleFont()
        };
        
        Object.entries(eventMap).forEach(([elementKey, handler]) => {
            const element = this.elements[elementKey];
            if (element) {
                element.addEventListener('click', handler);
            }
        });
        
        // Listen for system theme changes
        if (window.matchMedia) {
            window.matchMedia('(prefers-color-scheme: dark)')
                .addEventListener('change', (e) => {
                    if (this.getSetting('darkMode', null) === null) {
                        this.settings.darkMode = e.matches;
                        this.updateTheme();
                    }
                });
        }
    }
    
    /**
     * Toggle theme settings visibility
     */
    toggleSettings() {
        const buttons = this.elements.themeButtons;
        const setting = this.elements.themeSetting;
        
        if (buttons && setting) {
            const isVisible = buttons.classList.toggle('show');
            setting.setAttribute('aria-expanded', isVisible.toString());
        }
    }
    
    /**
     * Toggle between dark and light mode
     */
    toggleDarkMode() {
        this.setSetting('darkMode', !this.settings.darkMode);
        this.updateTheme();
        this.updateButtonTexts();
    }
    
    /**
     * Apply dark/light theme to the page
     */
    updateTheme() {
        this.elements.body.classList.toggle('dark-mode', this.settings.darkMode);
    }
    
    /**
     * Change font size by delta
     */
    changeFontSize(delta) {
        const newSize = Math.max(0.75, Math.min(3, this.settings.fontSize + delta));
        this.setSetting('fontSize', newSize);
        this.updateFontSize();
    }
    
    /**
     * Reset font size to default
     */
    resetFontSize() {
        this.setSetting('fontSize', 1.25);
        this.updateFontSize();
    }
    
    /**
     * Apply font size to body
     */
    updateFontSize() {
        this.elements.body.style.fontSize = this.settings.fontSize + 'em';
    }
    
    /**
     * Toggle dyslexia-friendly font
     */
    toggleFont() {
        this.setSetting('dyslexicFont', !this.settings.dyslexicFont);
        this.updateFont();
        this.updateButtonTexts();
    }
    
    /**
     * Apply font family based on accessibility setting
     */
    updateFont() {
        const family = this.settings.dyslexicFont 
            ? "'Open-Dyslexic', 'Comic Sans MS', Verdana, sans-serif"
            : "Arial, Helvetica, sans-serif";
        this.elements.body.style.fontFamily = family;
    }
    
    /**
     * Update button text labels based on current state
     */
    updateButtonTexts() {
        const texts = {
            toggleMode: this.settings.darkMode ? '☀️ Light Mode' : '🌙 Dark Mode',
            toggleFont: this.settings.dyslexicFont ? '✅ Standard Font' : '👁️ Dyslexic Font'
        };
        
        Object.entries(texts).forEach(([elementKey, text]) => {
            const element = this.elements[elementKey];
            if (element) {
                element.textContent = text;
            }
        });
    }
}

/**
 * Initialize ThemeManager when DOM is ready
 */
function initializeTheme() {
    new ThemeManager();
}

// Auto-initialize based on document state
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeTheme);
} else {
    initializeTheme();
}

// Export for manual initialization if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ThemeManager;
}