// ============================================
// Kanban Board Application - Core Module
// Data Management & Utilities
// ============================================

// Common Bootstrap Icons
const COMMON_ICONS = [
    { name: 'list', icon: 'bi-list' },
    { name: 'list-check', icon: 'bi-list-check' },
    { name: 'list-task', icon: 'bi-list-task' },
    { name: 'check', icon: 'bi-check' },
    { name: 'check-circle', icon: 'bi-check-circle' },
    { name: 'check-square', icon: 'bi-check-square' },
    { name: 'circle', icon: 'bi-circle' },
    { name: 'circle-fill', icon: 'bi-circle-fill' },
    { name: 'dot', icon: 'bi-dot' },
    { name: 'record-circle', icon: 'bi-record-circle' },
    { name: 'inbox', icon: 'bi-inbox' },
    { name: 'box', icon: 'bi-box' },
    { name: 'archive', icon: 'bi-archive' },
    { name: 'folder', icon: 'bi-folder' },
    { name: 'folder-open', icon: 'bi-folder2-open' },
    { name: 'clipboard', icon: 'bi-clipboard' },
    { name: 'clipboard-check', icon: 'bi-clipboard-check' },
    { name: 'clipboard-data', icon: 'bi-clipboard-data' },
    { name: 'kanban', icon: 'bi-kanban' },
    { name: 'calendar', icon: 'bi-calendar' },
    { name: 'calendar-check', icon: 'bi-calendar-check' },
    { name: 'clock', icon: 'bi-clock' },
    { name: 'hourglass', icon: 'bi-hourglass' },
    { name: 'hourglass-split', icon: 'bi-hourglass-split' },
    { name: 'alarm', icon: 'bi-alarm' },
    { name: 'stopwatch', icon: 'bi-stopwatch' },
    { name: 'play', icon: 'bi-play-circle' },
    { name: 'pause', icon: 'bi-pause-circle' },
    { name: 'stop', icon: 'bi-stop-circle' },
    { name: 'skip-forward', icon: 'bi-skip-forward' },
    { name: 'arrow-right', icon: 'bi-arrow-right-circle' },
    { name: 'arrow-up', icon: 'bi-arrow-up-circle' },
    { name: 'gear', icon: 'bi-gear' },
    { name: 'tools', icon: 'bi-tools' },
    { name: 'wrench', icon: 'bi-wrench' },
    { name: 'hammer', icon: 'bi-hammer' },
    { name: 'bug', icon: 'bi-bug' },
    { name: 'code', icon: 'bi-code' },
    { name: 'terminal', icon: 'bi-terminal' },
    { name: 'laptop', icon: 'bi-laptop' },
    { name: 'phone', icon: 'bi-phone' },
    { name: 'star', icon: 'bi-star' },
    { name: 'star-fill', icon: 'bi-star-fill' },
    { name: 'heart', icon: 'bi-heart' },
    { name: 'heart-fill', icon: 'bi-heart-fill' },
    { name: 'flag', icon: 'bi-flag' },
    { name: 'flag-fill', icon: 'bi-flag-fill' },
    { name: 'bookmark', icon: 'bi-bookmark' },
    { name: 'pin', icon: 'bi-pin' },
    { name: 'trophy', icon: 'bi-trophy' },
    { name: 'award', icon: 'bi-award' },
    { name: 'rocket', icon: 'bi-rocket' },
    { name: 'lightning', icon: 'bi-lightning' },
    { name: 'fire', icon: 'bi-fire' },
    { name: 'sun', icon: 'bi-sun' },
    { name: 'moon', icon: 'bi-moon' },
    { name: 'cloud', icon: 'bi-cloud' },
    { name: 'umbrella', icon: 'bi-umbrella' },
    { name: 'lightbulb', icon: 'bi-lightbulb' },
    { name: 'flask', icon: 'bi-flask' },
    { name: 'balloon', icon: 'bi-balloon' },
    { name: 'gift', icon: 'bi-gift' },
    { name: 'cart', icon: 'bi-cart' },
    { name: 'bag', icon: 'bi-bag' },
    { name: 'briefcase', icon: 'bi-briefcase' },
    { name: 'building', icon: 'bi-building' },
    { name: 'house', icon: 'bi-house' },
    { name: 'people', icon: 'bi-people' },
    { name: 'person', icon: 'bi-person' },
    { name: 'person-check', icon: 'bi-person-check' },
    { name: 'chat', icon: 'bi-chat' },
    { name: 'envelope', icon: 'bi-envelope' },
    { name: 'bell', icon: 'bi-bell' },
    { name: 'megaphone', icon: 'bi-megaphone' },
    { name: 'graph-up', icon: 'bi-graph-up' },
    { name: 'graph-down', icon: 'bi-graph-down' },
    { name: 'bar-chart', icon: 'bi-bar-chart' },
    { name: 'pie-chart', icon: 'bi-pie-chart' },
    { name: 'wallet', icon: 'bi-wallet' },
    { name: 'cash', icon: 'bi-cash' },
    { name: 'credit-card', icon: 'bi-credit-card' },
    { name: 'tag', icon: 'bi-tag' },
    { name: 'tags', icon: 'bi-tags' },
    { name: 'filter', icon: 'bi-filter' },
    { name: 'funnel', icon: 'bi-funnel' },
    { name: 'search', icon: 'bi-search' },
    { name: 'zoom-in', icon: 'bi-zoom-in' },
    { name: 'eye', icon: 'bi-eye' },
    { name: 'download', icon: 'bi-download' },
    { name: 'upload', icon: 'bi-upload' },
    { name: 'file', icon: 'bi-file-earmark' },
    { name: 'file-text', icon: 'bi-file-earmark-text' },
    { name: 'file-code', icon: 'bi-file-earmark-code' },
    { name: 'image', icon: 'bi-image' },
    { name: 'camera', icon: 'bi-camera' },
    { name: 'link', icon: 'bi-link' },
    { name: 'paperclip', icon: 'bi-paperclip' },
    { name: 'pencil', icon: 'bi-pencil' },
    { name: 'pen', icon: 'bi-pen' },
    { name: 'eraser', icon: 'bi-eraser' },
    { name: 'trash', icon: 'bi-trash' },
    { name: 'x-circle', icon: 'bi-x-circle' },
    { name: 'plus-circle', icon: 'bi-plus-circle' },
    { name: 'dash-circle', icon: 'bi-dash-circle' },
    { name: 'info-circle', icon: 'bi-info-circle' },
    { name: 'question-circle', icon: 'bi-question-circle' },
    { name: 'exclamation-circle', icon: 'bi-exclamation-circle' },
    { name: 'exclamation-triangle', icon: 'bi-exclamation-triangle' },
    { name: 'shield', icon: 'bi-shield' },
    { name: 'shield-check', icon: 'bi-shield-check' },
    { name: 'lock', icon: 'bi-lock' },
    { name: 'unlock', icon: 'bi-unlock' },
    { name: 'key', icon: 'bi-key' }
];

const STORAGE_KEYS = {
    PROJECTS: 'kanban_projects',
    TASKS: 'kanban_tasks',
    CATEGORIES: 'kanban_categories',
    KEY_PERSONS: 'kanban_keypersons',
    SETTINGS: 'kanban_settings',
    COLUMNS: 'kanban_columns',
    SYNC_CONFIG: 'kanban_sync_config'
};

// Temporary storage for tasks being added/edited in project modal
let tempProjectTasks = [];
let editingTaskIndex = null;

const DEFAULT_SETTINGS = {
    warningDays: 3,
    autoDeleteDays: 0,
    theme: 'dark',
    font: 'default',
    docName: 'MyTasks',
    docAuthor: 'Me',
    docVersion: '1.0',
    autoMoveProject: false
};

const DEFAULT_COLUMNS = [
    { id: 'backlog', name: 'Backlog', color: '#6b7280', icon: 'bi-inbox' },
    { id: 'not-started', name: 'Not Started', color: '#64748b', icon: 'bi-circle' },
    { id: 'in-progress', name: 'In Progress', color: '#3b82f6', icon: 'bi-hourglass-split' },
    { id: 'testing', name: 'Testing', color: '#f59e0b', icon: 'bi-flask' },
    { id: 'done', name: 'Done', color: '#10b981', icon: 'bi-check-circle' }
];

const PRIORITY_LABELS = { 1: 'Low', 2: 'Medium', 3: 'High', 4: 'Urgent' };
const STATUS_LABELS = {
    'backlog': 'Backlog',
    'not-started': 'Not Started',
    'in-progress': 'In Progress',
    'testing': 'Testing',
    'done': 'Done'
};
const DEFAULT_CATEGORY_COLOR = '#6b7280';

// Data Management
function loadData(key) {
    try { return JSON.parse(localStorage.getItem(key)); } catch(e) { return null; }
}
function saveData(key, data) { 
    try {
        localStorage.setItem(key, JSON.stringify(data));
        updateLastSave();
    } catch (error) {
        handleStorageError(error);
        throw error; // Re-throw so calling code knows it failed
    }
}
function getProjects() { return loadData(STORAGE_KEYS.PROJECTS) || []; }
function getTasks() { return loadData(STORAGE_KEYS.TASKS) || []; }
function getCategories() { return loadData(STORAGE_KEYS.CATEGORIES) || []; }
function getKeyPersons() { return loadData(STORAGE_KEYS.KEY_PERSONS) || []; }
function getSettings() { return { ...DEFAULT_SETTINGS, ...(loadData(STORAGE_KEYS.SETTINGS) || {}) }; }
function getColumns() { return loadData(STORAGE_KEYS.COLUMNS) || DEFAULT_COLUMNS; }
function saveProjects(p) { saveData(STORAGE_KEYS.PROJECTS, p); }
function saveTasks(t) { saveData(STORAGE_KEYS.TASKS, t); }
function saveCategories(c) { saveData(STORAGE_KEYS.CATEGORIES, c); }
function saveKeyPersons(k) { saveData(STORAGE_KEYS.KEY_PERSONS, k); }
function saveSettings(s) { saveData(STORAGE_KEYS.SETTINGS, s); }
function saveColumns(c) { saveData(STORAGE_KEYS.COLUMNS, c); }
function generateId() { return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9); }

// Date Utilities
function formatDate(dateStr) {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
}
function formatDateShort(dateStr) {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'numeric', year: '2-digit' });
}
function formatDateForInput(dateStr) {
    if (!dateStr) return '';
    return new Date(dateStr).toISOString().split('T')[0];
}
function isOverdue(dateStr) {
    if (!dateStr) return false;
    const d = new Date(dateStr); d.setHours(23,59,59,999);
    return new Date() > d;
}
function isDueSoon(dateStr, days) {
    if (!dateStr) return false;
    const d = new Date(dateStr); d.setHours(23,59,59,999);
    const w = new Date(); w.setDate(w.getDate() + days);
    return new Date() <= d && d <= w;
}
function getDaysUntilDue(dateStr) {
    if (!dateStr) return null;
    const d = new Date(dateStr); d.setHours(0,0,0,0);
    const t = new Date(); t.setHours(0,0,0,0);
    return Math.ceil((d - t) / 86400000);
}
function getDaysSinceCompletion(completedAt) {
    if (!completedAt) return 0;
    return Math.floor((new Date() - new Date(completedAt)) / 86400000);
}

// Priority Calculation
function calculateProjectPriority(project, tasks) {
    const pt = tasks.filter(t => t.projectId === project.id);
    let score = project.priority * 1000;
    if (project.dueDate) {
        const days = getDaysUntilDue(project.dueDate);
        if (days !== null) {
            if (days < 0) score += 5000;
            else if (days <= 3) score += 3000;
            else if (days <= 7) score += 2000;
            else if (days <= 14) score += 1000;
        }
    }
    score += pt.length * 10 + (pt.length - pt.filter(t => t.completed).length) * 5;
    return score;
}
function sortProjects(projects, tasks) {
    return [...projects].sort((a, b) => calculateProjectPriority(b, tasks) - calculateProjectPriority(a, tasks));
}
function sortTasksByDueDate(tasks) {
    return [...tasks].sort((a, b) => {
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate) - new Date(b.dueDate);
    });
}

// Auto-move project based on task completion
function autoMoveProject(projectId) {
    const settings = getSettings();
    if (!settings.autoMoveProject) return;
    
    const projects = getProjects();
    const project = projects.find(p => p.id === projectId);
    if (!project) return;
    
    const columns = getColumns();
    const firstColumn = columns[0].id;
    const lastColumn = columns[columns.length - 1].id;
    
    const projectTasks = getTasks().filter(t => t.projectId === projectId);
    
    // If no tasks, do nothing
    if (projectTasks.length === 0) return;
    
    const allCompleted = projectTasks.every(t => t.completed);
    const hasIncomplete = projectTasks.some(t => !t.completed);
    
    let needsUpdate = false;
    
    // If all tasks are done, move to last column (Done)
    if (allCompleted && project.status !== lastColumn) {
        project.status = lastColumn;
        project.completedAt = new Date().toISOString();
        needsUpdate = true;
    }
    // If has incomplete tasks and currently in last column, move to first column (Backlog)
    else if (hasIncomplete && project.status === lastColumn) {
        project.status = firstColumn;
        delete project.completedAt;
        needsUpdate = true;
    }
    
    if (needsUpdate) {
        saveProjects(projects);
    }
}

// Auto-delete
function checkAutoDelete() {
    const settings = getSettings();
    if (settings.autoDeleteDays <= 0) return;
    const projects = getProjects(), tasks = getTasks();
    let deleted = false;
    const keep = projects.filter(p => {
        if (p.status !== 'done') return true;
        const pt = tasks.filter(t => t.projectId === p.id);
        if (pt.length > 0 && !pt.every(t => t.completed)) return true;
        if (!p.completedAt) { p.completedAt = new Date().toISOString(); return true; }
        if (getDaysSinceCompletion(p.completedAt) >= settings.autoDeleteDays) { deleted = true; return false; }
        return true;
    });
    if (deleted) {
        const ids = keep.map(p => p.id);
        saveProjects(keep);
        saveTasks(tasks.filter(t => ids.includes(t.projectId)));
        showToast('Completed projects auto-deleted', 'success');
        renderKanbanBoard();
    } else saveProjects(projects);
}

// Markdown Parser
function parseMarkdown(text) {
    if (!text) return '';
    return text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
        .replace(/```([\s\S]*?)```/g,'<pre><code>$1</code></pre>')
        .replace(/`([^`]+)`/g,'<code>$1</code>')
        .replace(/^### (.*$)/gm,'<h3>$1</h3>')
        .replace(/^## (.*$)/gm,'<h2>$1</h2>')
        .replace(/^# (.*$)/gm,'<h1>$1</h1>')
        .replace(/\*\*\*(.+?)\*\*\*/g,'<strong><em>$1</em></strong>')
        .replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>')
        .replace(/\*(.+?)\*/g,'<em>$1</em>')
        .replace(/^- (.+)$/gm,'<ul><li>$1</li></ul>')
        .replace(/^\d+\. (.+)$/gm,'<ol><li>$1</li></ol>')
        .replace(/<\/ul>\s*<ul>/g,'').replace(/<\/ol>\s*<ol>/g,'')
        .replace(/\n\n/g,'</p><p>').replace(/^(.)/,'<p>$1').replace(/(.)$/,'$1</p>');
}

// Storage Usage Calculator
function getLocalStorageSize() {
    let total = 0;
    for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
            total += localStorage[key].length + key.length;
        }
    }
    return total * 2; // UTF-16 uses 2 bytes per character
}

function getLocalStorageQuota() {
    // Most browsers provide 5-10MB
    // Chrome/Edge: ~10MB, Firefox: ~10MB, Safari: ~5MB
    // Use conservative 5MB as default
    const defaultQuota = 5 * 1024 * 1024; // 5MB in bytes
    
    // Try to detect actual quota using Storage API
    if (navigator.storage && navigator.storage.estimate) {
        return navigator.storage.estimate()
            .then(estimate => {
                if (estimate && estimate.quota && estimate.quota > 0) {
                    return estimate.quota;
                }
                return defaultQuota;
            })
            .catch(() => defaultQuota);
    }
    
    // Fallback to default
    return Promise.resolve(defaultQuota);
}

function formatBytes(bytes) {
    if (!bytes || bytes === 0) return '0 Bytes';
    if (isNaN(bytes)) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

async function updateStorageInfo() {
    try {
        const used = getLocalStorageSize();
        const limit = await getLocalStorageQuota();
        const percentage = (used / limit) * 100;
        
        const fillElement = document.getElementById('storageFill');
        const textElement = document.getElementById('storageText');
        
        if (fillElement && textElement) {
            fillElement.style.width = Math.min(percentage, 100) + '%';
            
            // Show warning if limit is not detected properly
            let warningText = '';
            if (limit === 5 * 1024 * 1024) {
                warningText = ' (estimated)';
            }
            
            textElement.textContent = `${formatBytes(used)} / ${formatBytes(limit)}${warningText} (${percentage.toFixed(2)}%)`;
            
            // Color code based on usage
            if (percentage > 80) {
                fillElement.style.background = 'var(--danger)';
            } else if (percentage > 50) {
                fillElement.style.background = 'var(--warning)';
            } else {
                fillElement.style.background = 'var(--success)';
            }
            
            // Show warning if close to limit
            if (percentage > 90) {
                const existingWarning = textElement.parentElement.querySelector('.storage-warning');
                if (!existingWarning) {
                    const warningDiv = document.createElement('div');
                    warningDiv.className = 'storage-warning';
                    warningDiv.innerHTML = '<small>⚠️ Storage almost full! Consider exporting and clearing old data.</small>';
                    textElement.parentElement.appendChild(warningDiv);
                }
            }
        }
    } catch (error) {
        console.error('Error updating storage info:', error);
        const textElement = document.getElementById('storageText');
        if (textElement) {
            const used = getLocalStorageSize();
            textElement.textContent = `${formatBytes(used)} used (quota detection unavailable)`;
        }
    }
}

// Storage error handler
function handleStorageError(error) {
    console.error('LocalStorage error:', error);
    
    if (error.name === 'QuotaExceededError' || error.message.includes('quota')) {
        showToast('Storage quota exceeded! Export your data and clear old items.', 'error');
        
        // Show detailed modal with instructions
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-overlay"></div>
            <div class="modal-content modal-small">
                <div class="modal-header">
                    <h2>Storage Full</h2>
                </div>
                <div class="modal-body">
                    <p style="margin-bottom: 12px;"><strong>Your browser's storage is full!</strong></p>
                    <p style="margin-bottom: 12px;">To continue using the app, you need to:</p>
                    <ol style="margin-left: 20px; margin-bottom: 12px;">
                        <li>Export your data (Settings → Data → Export)</li>
                        <li>Delete old projects/tasks you don't need</li>
                        <li>Or clear all data and import only what you need</li>
                    </ol>
                    <p style="font-size: 0.85rem; color: var(--text-secondary);">
                        <strong>Browser Storage Limits:</strong><br>
                        Most browsers provide 5-10MB of localStorage. Your usage varies by browser:
                        Chrome/Edge (~10MB), Firefox (~10MB), Safari (~5MB)
                    </p>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-primary" onclick="this.closest('.modal').remove(); document.body.style.overflow = '';">OK</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        document.body.style.overflow = 'hidden';
    } else {
        showToast('Error saving data. Check browser settings.', 'error');
    }
}

// Date validation
function validateDates(startDate, dueDate) {
    if (!startDate || !dueDate) return true; // Allow empty dates
    const start = new Date(startDate);
    const due = new Date(dueDate);
    return start <= due;
}

// Migration
// ============================================
// Kanban Board Application - UI Module
// Rendering & Display Functions
// ============================================

// Default initial data
let selectedCategoryColor = DEFAULT_CATEGORY_COLOR;
let confirmCallback = null;
let currentDetailType = null;
let currentDetailId = null;

// Initialize default data if needed
async function initializeDefaultData() {
    // Check if this is first time or after clear
    const hasData = localStorage.getItem(STORAGE_KEYS.CATEGORIES) || 
                    localStorage.getItem(STORAGE_KEYS.KEY_PERSONS) ||
                    localStorage.getItem(STORAGE_KEYS.PROJECTS) ||
                    localStorage.getItem(STORAGE_KEYS.TASKS) ||
                    localStorage.getItem(STORAGE_KEYS.COLUMNS);
    
    console.log('Initializing data, hasData:', !!hasData);
    
    if (!hasData) {
        console.log('No data found, loading base.json...');
        try {
            const response = await fetch('base.json');
            console.log('base.json fetch response:', response.status, response.ok);
            if (response.ok) {
                const baseData = await response.json();
                console.log('Loaded base.json:', baseData);
                if (baseData.categories) saveCategories(baseData.categories);
                if (baseData.keyPersons) saveKeyPersons(baseData.keyPersons);
                if (baseData.projects) saveProjects(baseData.projects);
                if (baseData.tasks) saveTasks(baseData.tasks);
                if (baseData.columns) saveColumns(baseData.columns);
                else saveColumns(DEFAULT_COLUMNS);
                console.log('Successfully loaded default data from base.json');
            } else {
                // Fallback to minimal defaults if base.json not found
                console.warn('base.json not found (status ' + response.status + '), using empty defaults');
                saveCategories([]);
                saveKeyPersons([]);
                saveProjects([]);
                saveTasks([]);
                saveColumns(DEFAULT_COLUMNS);
            }
        } catch (error) {
            // Fallback to minimal defaults on error
            console.error('Failed to load base.json:', error);
            saveCategories([]);
            saveKeyPersons([]);
            saveProjects([]);
            saveTasks([]);
            saveColumns(DEFAULT_COLUMNS);
        }
    } else {
        console.log('Existing data found, skipping base.json load');
        // Ensure data arrays exist even if empty
        if (!localStorage.getItem(STORAGE_KEYS.CATEGORIES)) {
            saveCategories([]);
        }
        if (!localStorage.getItem(STORAGE_KEYS.KEY_PERSONS)) {
            saveKeyPersons([]);
        }
        if (!localStorage.getItem(STORAGE_KEYS.COLUMNS)) {
            saveColumns(DEFAULT_COLUMNS);
        }
    }
}

// Theme & Font
function applyTheme(theme) {
    document.body.setAttribute('data-theme', theme);
    document.querySelectorAll('.theme-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.theme === theme);
    });
    const s = getSettings(); s.theme = theme; saveSettings(s);
}
function applyFont(font) {
    document.body.setAttribute('data-font', font);
    document.querySelectorAll('.font-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.font === font);
    });
    const s = getSettings(); s.font = font; saveSettings(s);
}

// Modal Management
function openModal(id) {
    const m = document.getElementById(id);
    if (m) { m.classList.add('active'); document.body.style.overflow = 'hidden'; }
}
function closeModal(id) {
    const m = document.getElementById(id);
    if (m) { 
        m.classList.remove('active'); 
        document.body.style.overflow = ''; 
        
        // Reset project task inputs when closing project modal
        if (id === 'projectModal') {
            document.getElementById('projectTaskTitle').value = '';
            document.getElementById('projectTaskDueDate').value = '';
            const addBtn = document.getElementById('addProjectTask');
            addBtn.textContent = 'Add';
            addBtn.style.background = '';
            editingTaskIndex = null;
        }
    }
}

// Toast
function showToast(message, type = 'info') {
    const t = document.getElementById('toast');
    t.textContent = message;
    t.className = 'toast show ' + type;
    setTimeout(() => { t.classList.remove('show'); }, 3000);
}

// Confirm Dialog
function showConfirm(message, callback) {
    document.getElementById('confirmMessage').textContent = message;
    confirmCallback = callback;
    openModal('confirmModal');
}

// Warnings
function checkWarnings() {
    const settings = getSettings();
    const projects = getProjects();
    const tasks = getTasks();
    
    let overdueProjects = 0;
    let overdueTasks = 0;
    let dueSoonProjects = 0;
    let dueSoonTasks = 0;
    
    // Check projects
    projects.forEach(p => {
        if (p.status !== 'done' && isOverdue(p.dueDate)) overdueProjects++;
        else if (p.status !== 'done' && isDueSoon(p.dueDate, settings.warningDays)) dueSoonProjects++;
    });
    
    // Check tasks
    tasks.forEach(t => {
        if (!t.completed && isOverdue(t.dueDate)) overdueTasks++;
        else if (!t.completed && isDueSoon(t.dueDate, settings.warningDays)) dueSoonTasks++;
    });
    
    const overdueBanner = document.getElementById('overdueBanner');
    const warningBanner = document.getElementById('warningBanner');
    
    const totalOverdue = overdueProjects + overdueTasks;
    const totalDueSoon = dueSoonProjects + dueSoonTasks;
    
    if (totalOverdue > 0) {
        let overdueText = '';
        if (overdueProjects > 0 && overdueTasks > 0) {
            overdueText = `${overdueProjects} project${overdueProjects > 1 ? 's' : ''} and ${overdueTasks} task${overdueTasks > 1 ? 's' : ''} are overdue!`;
        } else if (overdueProjects > 0) {
            overdueText = `${overdueProjects} project${overdueProjects > 1 ? 's are' : ' is'} overdue!`;
        } else {
            overdueText = `${overdueTasks} task${overdueTasks > 1 ? 's are' : ' is'} overdue!`;
        }
        document.getElementById('overdueText').textContent = overdueText;
        overdueBanner.style.display = 'flex';
    } else {
        overdueBanner.style.display = 'none';
    }
    
    if (totalDueSoon > 0) {
        let dueSoonText = '';
        if (dueSoonProjects > 0 && dueSoonTasks > 0) {
            dueSoonText = `${dueSoonProjects} project${dueSoonProjects > 1 ? 's' : ''} and ${dueSoonTasks} task${dueSoonTasks > 1 ? 's' : ''} due within ${settings.warningDays} day${settings.warningDays > 1 ? 's' : ''}!`;
        } else if (dueSoonProjects > 0) {
            dueSoonText = `${dueSoonProjects} project${dueSoonProjects > 1 ? 's are' : ' is'} due within ${settings.warningDays} day${settings.warningDays > 1 ? 's' : ''}!`;
        } else {
            dueSoonText = `${dueSoonTasks} task${dueSoonTasks > 1 ? 's are' : ' is'} due within ${settings.warningDays} day${settings.warningDays > 1 ? 's' : ''}!`;
        }
        document.getElementById('warningText').textContent = dueSoonText;
        warningBanner.style.display = 'flex';
    } else {
        warningBanner.style.display = 'none';
    }
}

// Render Kanban Board
function renderKanbanBoard() {
    checkAutoDelete();
    const projects = getProjects();
    const tasks = getTasks();
    const categories = getCategories();
    const columns = getColumns();
    const sorted = sortProjects(projects, tasks);
    
    const board = document.getElementById('kanbanBoard');
    board.innerHTML = '';
    
    columns.forEach(column => {
        const colDiv = document.createElement('div');
        colDiv.className = 'kanban-column';
        colDiv.dataset.status = column.id;
        
        const filtered = sorted.filter(p => p.status === column.id);
        const columnColor = column.color || '#6b7280';
        const columnIcon = column.icon || '';
        
        colDiv.innerHTML = `
            <div class="column-header" style="background-color: ${columnColor};">
                <h2>
                    ${columnIcon ? `<i class="${columnIcon}" style="margin-right: 8px;"></i>` : ''}
                    ${escapeHtml(column.name)}
                </h2>
                <span class="column-count">${filtered.length}</span>
            </div>
            <div class="column-cards" id="cards-${column.id}"></div>
        `;
        
        board.appendChild(colDiv);
        
        const container = colDiv.querySelector('.column-cards');
        
        if (filtered.length === 0) {
            container.innerHTML = '<div class="empty-state"><i class="bi bi-inbox" style="font-size: 48px;"></i><p>No projects</p></div>';
        } else {
            filtered.forEach(p => container.appendChild(createProjectCard(p, tasks, categories)));
        }
    });
    
    // Re-attach drag and drop listeners
    setupColumnDragDrop();
    
    checkWarnings();
}

// Create Project Card
function createProjectCard(project, tasks, categories) {
    const card = document.createElement('div');
    card.className = 'project-card';
    card.draggable = true;
    card.dataset.id = project.id;
    
    // Get category color
    let categoryColor = null;
    let categoryName = '';
    if (project.category) {
        const cat = categories.find(c => c.name === project.category);
        if (cat) {
            categoryColor = cat.color;
            categoryName = cat.name;
        }
    }
    
    if (categoryColor) {
        card.style.setProperty('--category-color', categoryColor);
        card.setAttribute('data-category-color', 'true');
    }
    
    if (project.status !== 'done' && isOverdue(project.dueDate)) {
        card.classList.add('late');
    }
    
    const projectTasks = sortTasksByDueDate(tasks.filter(t => t.projectId === project.id));
    const completedTasks = projectTasks.filter(t => t.completed).length;
    const totalTasks = projectTasks.length;
    
    const priorityClass = ['low', 'medium', 'high', 'urgent'][project.priority - 1];
    
    // Card header with category color background
    const headerStyle = categoryColor ? `background: ${categoryColor}; border-bottom-color: ${categoryColor};` : '';
    const headerTextColor = categoryColor ? 'color: white;' : '';
    
    // Build task list HTML
    let tasksHtml = '';
    if (totalTasks > 0) {
        projectTasks.forEach(t => {
            const taskOverdue = !t.completed && isOverdue(t.dueDate);
            const taskClass = t.completed ? 'completed' : (taskOverdue ? 'overdue' : '');
            const dateClass = taskOverdue ? 'task-date-overdue' : 'task-date';
            tasksHtml += `
                <div class="card-task ${taskClass}">
                    <label class="task-checkbox" onclick="event.stopPropagation()">
                        <input type="checkbox" ${t.completed ? 'checked' : ''} onchange="toggleTaskComplete('${t.id}', this.checked)">
                        <span class="task-title">${escapeHtml(t.title)}</span>
                    </label>
                    <div class="task-meta">
                        ${t.dueDate ? `<span class="${dateClass}">${formatDateShort(t.dueDate)}</span>` : ''}
                        <button class="btn-task-info" onclick="event.stopPropagation(); showDetail('task', '${t.id}')">Info</button>
                    </div>
                </div>
            `;
        });
    }
    
    card.innerHTML = `
        <div class="card-header" style="${headerStyle}">
            <div class="card-header-content">
                <div class="card-header-title" style="${headerTextColor}">${escapeHtml(project.title)}</div>
                <span class="card-priority ${priorityClass}">${PRIORITY_LABELS[project.priority]}</span>
            </div>
        </div>
        <div class="card-body">
            <div class="card-meta-row">
                ${categoryName ? `<div class="card-category" style="color: ${categoryColor}; border-color: ${categoryColor};">${escapeHtml(categoryName)}</div>` : '<div></div>'}
                <div class="card-meta-right">
                    <span class="card-progress">${completedTasks}/${totalTasks} Done</span>
                    ${project.dueDate ? `<span class="card-due-date">${formatDateShort(project.dueDate)}</span>` : ''}
                    ${totalTasks > 0 ? `
                        <button class="btn-toggle-tasks-icon" onclick="event.stopPropagation(); toggleCardTasks(this)" title="Show/Hide tasks">
                            <i class="bi bi-chevron-down" style="font-size: 14px;"></i>
                        </button>
                    ` : ''}
                </div>
            </div>
            ${project.keyPersons && project.keyPersons.length > 0 ? `<div class="card-person"><i class="bi bi-person" style="font-size: 14px; margin-right: 4px;"></i>${project.keyPersons.map(k => escapeHtml(k)).join(', ')}</div>` : ''}
            ${totalTasks > 0 ? `
                <div class="card-tasks">
                    ${tasksHtml}
                </div>
            ` : ''}
        </div>
    `;
    
    card.addEventListener('click', (e) => {
        // Don't open detail if clicking on task elements
        if (!e.target.closest('.card-task') && !e.target.closest('.btn-toggle-tasks')) {
            showDetail('project', project.id);
        }
    });
    card.addEventListener('dragstart', handleDragStart);
    card.addEventListener('dragend', handleDragEnd);
    
    return card;
}

// Toggle task completion
function toggleTaskComplete(taskId, completed) {
    const tasks = getTasks();
    const task = tasks.find(t => t.id === taskId);
    if (task) {
        task.completed = completed;
        if (completed) {
            task.completedAt = new Date().toISOString();
        } else {
            delete task.completedAt;
        }
        saveTasks(tasks);
        autoMoveProject(task.projectId); // Check if project should auto-move
        renderKanbanBoard();
    }
}

// Toggle card tasks visibility
function toggleCardTasks(btn) {
    const card = btn.closest('.project-card');
    const tasksDiv = card.querySelector('.card-tasks');
    const isHidden = tasksDiv.style.display === 'none';
    
    tasksDiv.style.display = isHidden ? 'block' : 'none';
    btn.style.transform = isHidden ? 'rotate(0deg)' : 'rotate(180deg)';
}

// Drag & Drop
function handleDragStart(e) {
    e.target.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', e.target.dataset.id);
}
function handleDragEnd(e) {
    e.target.classList.remove('dragging');
}

function setupColumnDragDrop() {
    const columns = getColumns();
    const lastColumnId = columns[columns.length - 1].id;
    
    document.querySelectorAll('.kanban-column').forEach(col => {
        col.addEventListener('dragover', e => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            const afterElement = getDragAfterElement(col, e.clientY);
            const dragging = document.querySelector('.dragging');
            if (afterElement == null) col.querySelector('.column-cards').appendChild(dragging);
            else col.querySelector('.column-cards').insertBefore(dragging, afterElement);
        });
        col.addEventListener('drop', e => {
            e.preventDefault();
            const id = e.dataTransfer.getData('text/plain');
            const newStatus = col.dataset.status;
            const projects = getProjects();
            const tasks = getTasks();
            const p = projects.find(x => x.id === id);
            
            if (p) {
                // Check if trying to move to last column (Done) with incomplete tasks
                if (newStatus === lastColumnId) {
                    const projectTasks = tasks.filter(t => t.projectId === id);
                    const hasIncompleteTasks = projectTasks.some(t => !t.completed);
                    
                    if (hasIncompleteTasks) {
                        showToast(`Cannot move to ${columns[columns.length - 1].name} - project has incomplete tasks`, 'error');
                        renderKanbanBoard(); // Reset card position
                        return;
                    }
                }
                
                p.status = newStatus;
                if (newStatus === lastColumnId && !p.completedAt) p.completedAt = new Date().toISOString();
                else if (newStatus !== lastColumnId) delete p.completedAt;
                saveProjects(projects);
                renderKanbanBoard();
                showToast('Project moved', 'success');
            }
        });
    });
}

function getDragAfterElement(container, y) {
    const els = [...container.querySelectorAll('.project-card:not(.dragging)')];
    return els.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) return { offset, element: child };
        return closest;
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

// Detail View
function showDetail(type, id) {
    currentDetailType = type;
    currentDetailId = id;
    
    const data = type === 'project' ? getProjects().find(p => p.id === id) : getTasks().find(t => t.id === id);
    if (!data) return;
    
    const categories = getCategories();
    const keyPersons = getKeyPersons();
    
    document.getElementById('detailTitle').textContent = type === 'project' ? 'Project Details' : 'Task Details';
    
    // Show/hide Add Task button
    const addTaskBtn = document.getElementById('addTaskFromDetail');
    if (type === 'project') {
        addTaskBtn.style.display = 'inline-flex';
    } else {
        addTaskBtn.style.display = 'none';
    }
    
    let html = `<div class="detail-row"><div class="detail-label">Title:</div><div class="detail-value"><strong>${escapeHtml(data.title)}</strong></div></div>`;
    
    if (type === 'project') {
        html += `<div class="detail-row"><div class="detail-label">Priority:</div><div class="detail-value">${PRIORITY_LABELS[data.priority]}</div></div>`;
        html += `<div class="detail-row"><div class="detail-label">Status:</div><div class="detail-value">${STATUS_LABELS[data.status]}</div></div>`;
        if (data.category) html += `<div class="detail-row"><div class="detail-label">Category:</div><div class="detail-value">${escapeHtml(data.category)}</div></div>`;
        if (data.keyPersons && data.keyPersons.length > 0) {
            html += `<div class="detail-row"><div class="detail-label">Key Persons:</div><div class="detail-value">${data.keyPersons.map(k => escapeHtml(k)).join(', ')}</div></div>`;
        }
        if (data.startDate) html += `<div class="detail-row"><div class="detail-label">Start Date:</div><div class="detail-value">${formatDate(data.startDate)}</div></div>`;
        if (data.dueDate) html += `<div class="detail-row"><div class="detail-label">Due Date:</div><div class="detail-value">${formatDate(data.dueDate)}</div></div>`;
        if (data.details) html += `<div class="detail-row"><div class="detail-label">Details:</div><div class="detail-value"><div class="detail-markdown">${parseMarkdown(data.details)}</div></div></div>`;
        
        const tasks = getTasks().filter(t => t.projectId === id);
        if (tasks.length > 0) {
            html += `<div class="detail-row"><div class="detail-label">Tasks:</div><div class="detail-value"><ul style="margin: 0; padding-left: 20px;">`;
            sortTasksByDueDate(tasks).forEach(t => {
                const status = t.completed ? '✓' : '○';
                const style = t.completed ? 'text-decoration: line-through; color: var(--text-muted);' : '';
                html += `<li style="${style}">${status} ${escapeHtml(t.title)}${t.dueDate ? ' - ' + formatDate(t.dueDate) : ''}</li>`;
            });
            html += `</ul></div></div>`;
        }
    } else {
        const project = getProjects().find(p => p.id === data.projectId);
        html += `<div class="detail-row"><div class="detail-label">Project:</div><div class="detail-value">${project ? escapeHtml(project.title) : 'Unknown'}</div></div>`;
        html += `<div class="detail-row"><div class="detail-label">Status:</div><div class="detail-value">${data.completed ? 'Completed' : 'Not Completed'}</div></div>`;
        if (data.keyPersons && data.keyPersons.length > 0) {
            html += `<div class="detail-row"><div class="detail-label">Key Persons:</div><div class="detail-value">${data.keyPersons.map(k => escapeHtml(k)).join(', ')}</div></div>`;
        }
        if (data.startDate) html += `<div class="detail-row"><div class="detail-label">Start Date:</div><div class="detail-value">${formatDate(data.startDate)}</div></div>`;
        if (data.dueDate) html += `<div class="detail-row"><div class="detail-label">Due Date:</div><div class="detail-value">${formatDate(data.dueDate)}</div></div>`;
        if (data.details) html += `<div class="detail-row"><div class="detail-label">Details:</div><div class="detail-value"><div class="detail-markdown">${parseMarkdown(data.details)}</div></div></div>`;
    }
    
    document.getElementById('detailContent').innerHTML = html;
    openModal('detailModal');
}

// Modals
function openProjectModal(id = null) {
    const title = document.getElementById('projectModalTitle');
    const form = document.getElementById('projectForm');
    const deleteBtn = document.getElementById('deleteProject');
    
    form.reset();
    document.getElementById('projectId').value = '';
    
    // Reset temporary tasks
    tempProjectTasks = [];
    editingTaskIndex = null;
    
    // Update dropdowns and checkboxes
    updateStatusDropdowns();
    updateKeyPersonCheckboxes();
    
    if (id) {
        const p = getProjects().find(x => x.id === id);
        if (!p) return;
        
        title.textContent = 'Edit Project';
        document.getElementById('projectId').value = p.id;
        document.getElementById('projectTitle').value = p.title;
        document.getElementById('projectPriority').value = p.priority;
        document.getElementById('projectStatus').value = p.status;
        document.getElementById('projectCategory').value = p.category || '';
        
        // Set multiple key persons
        setKeyPersonCheckboxes('projectKeyPersons', p.keyPersons || []);
        
        document.getElementById('projectStartDate').value = formatDateForInput(p.startDate);
        document.getElementById('projectDueDate').value = formatDateForInput(p.dueDate);
        document.getElementById('projectDetails').value = p.details || '';
        
        // Load existing tasks for this project
        const existingTasks = getTasks().filter(t => t.projectId === id);
        tempProjectTasks = existingTasks.map(t => ({
            id: t.id,
            title: t.title,
            dueDate: t.dueDate
        }));
        
        deleteBtn.style.display = 'inline-flex';
    } else {
        title.textContent = 'New Project';
        setKeyPersonCheckboxes('projectKeyPersons', []);
        deleteBtn.style.display = 'none';
    }
    
    renderProjectTasksList();
    openModal('projectModal');
}

// Render the temporary tasks list in project modal
function renderProjectTasksList() {
    const list = document.getElementById('projectTasksList');
    if (!list) return;
    
    if (tempProjectTasks.length === 0) {
        list.innerHTML = '<p style="color: var(--text-secondary); font-size: 14px; text-align: center; padding: 12px;">No tasks added yet</p>';
        return;
    }
    
    list.innerHTML = tempProjectTasks.map((task, index) => `
        <div class="project-task-item">
            <div class="project-task-info">
                <div class="project-task-title">${escapeHtml(task.title)}</div>
                <div class="project-task-due">${task.dueDate ? 'Due: ' + formatDate(task.dueDate) : 'No due date'}</div>
            </div>
            <div class="project-task-actions">
                <button type="button" class="project-task-edit" data-index="${index}">Edit</button>
                <button type="button" class="project-task-delete" data-index="${index}">Delete</button>
            </div>
        </div>
    `).join('');
    
    // Add event listeners
    list.querySelectorAll('.project-task-edit').forEach(btn => {
        btn.addEventListener('click', () => editProjectTask(parseInt(btn.dataset.index)));
    });
    list.querySelectorAll('.project-task-delete').forEach(btn => {
        btn.addEventListener('click', () => deleteProjectTask(parseInt(btn.dataset.index)));
    });
}

// Add or update a task in the temporary list
function addOrUpdateProjectTask() {
    const titleInput = document.getElementById('projectTaskTitle');
    const dueDateInput = document.getElementById('projectTaskDueDate');
    
    const title = titleInput.value.trim();
    const dueDate = dueDateInput.value;
    
    if (!title) {
        showToast('Please enter a task name', 'error');
        return;
    }
    
    const taskData = {
        title: title,
        dueDate: dueDate || null
    };
    
    if (editingTaskIndex !== null) {
        // Update existing task
        tempProjectTasks[editingTaskIndex] = {
            ...tempProjectTasks[editingTaskIndex],
            ...taskData
        };
        editingTaskIndex = null;
        showToast('Task updated', 'success');
    } else {
        // Add new task
        tempProjectTasks.push(taskData);
        showToast('Task added', 'success');
    }
    
    // Clear inputs
    titleInput.value = '';
    dueDateInput.value = '';
    
    renderProjectTasksList();
}

// Edit a temporary task
function editProjectTask(index) {
    const task = tempProjectTasks[index];
    document.getElementById('projectTaskTitle').value = task.title;
    document.getElementById('projectTaskDueDate').value = task.dueDate || '';
    editingTaskIndex = index;
    
    // Update button text
    const addBtn = document.getElementById('addProjectTask');
    addBtn.textContent = 'Update';
    addBtn.style.background = 'var(--warning)';
}

// Delete a temporary task
function deleteProjectTask(index) {
    tempProjectTasks.splice(index, 1);
    
    // Reset editing state if we were editing this task
    if (editingTaskIndex === index) {
        editingTaskIndex = null;
        document.getElementById('projectTaskTitle').value = '';
        document.getElementById('projectTaskDueDate').value = '';
        const addBtn = document.getElementById('addProjectTask');
        addBtn.textContent = 'Add';
        addBtn.style.background = '';
    } else if (editingTaskIndex !== null && editingTaskIndex > index) {
        editingTaskIndex--;
    }
    
    renderProjectTasksList();
    showToast('Task removed', 'success');
}

function openTaskModal(id = null, projectId = null) {
    const title = document.getElementById('taskModalTitle');
    const form = document.getElementById('taskForm');
    const deleteBtn = document.getElementById('deleteTask');
    
    document.getElementById('taskId').value = '';
    
    // Update dropdown first to populate options
    updateProjectDropdown();
    updateKeyPersonCheckboxes();
    
    if (id) {
        const t = getTasks().find(x => x.id === id);
        if (!t) return;
        
        title.textContent = 'Edit Task';
        document.getElementById('taskId').value = t.id;
        document.getElementById('taskTitle').value = t.title;
        document.getElementById('taskProject').value = t.projectId;
        
        // Set multiple key persons
        setKeyPersonCheckboxes('taskKeyPersons', t.keyPersons || []);
        
        document.getElementById('taskStartDate').value = formatDateForInput(t.startDate);
        document.getElementById('taskDueDate').value = formatDateForInput(t.dueDate);
        document.getElementById('taskDetails').value = t.details || '';
        
        deleteBtn.style.display = 'inline-flex';
    } else {
        title.textContent = 'New Task';
        form.reset();
        setKeyPersonCheckboxes('taskKeyPersons', []);
        deleteBtn.style.display = 'none';
        
        // Set project after reset and dropdown update
        if (projectId) {
            document.getElementById('taskProject').value = projectId;
        }
    }
    
    openModal('taskModal');
}

// CRUD Operations
function createProject(data) {
    if (data.startDate && data.dueDate && !validateDates(data.startDate, data.dueDate)) {
        showToast('Start date cannot be after due date', 'error');
        return;
    }
    const projects = getProjects();
    const newProjectId = generateId();
    projects.push({ id: newProjectId, ...data, priority: parseInt(data.priority) });
    saveProjects(projects);
    
    // Save temporary tasks if any
    if (tempProjectTasks.length > 0) {
        const tasks = getTasks();
        tempProjectTasks.forEach(tempTask => {
            const taskData = {
                id: generateId(),
                title: tempTask.title,
                projectId: newProjectId,
                dueDate: tempTask.dueDate,
                completed: false,
                keyPerson: '',
                startDate: '',
                details: ''
            };
            tasks.push(taskData);
        });
        saveTasks(tasks);
    }
    
    renderKanbanBoard();
}

function updateProject(id, data) {
    if (data.startDate && data.dueDate && !validateDates(data.startDate, data.dueDate)) {
        showToast('Start date cannot be after due date', 'error');
        return;
    }
    
    // Check if trying to set status to Done with incomplete tasks
    if (data.status === 'done') {
        const tasks = getTasks();
        const projectTasks = tasks.filter(t => t.projectId === id);
        const hasIncompleteTasks = projectTasks.some(t => !t.completed);
        
        if (hasIncompleteTasks) {
            showToast('Cannot set to Done - project has incomplete tasks', 'error');
            return;
        }
    }
    
    const projects = getProjects();
    const p = projects.find(x => x.id === id);
    if (p) {
        Object.assign(p, data, { priority: parseInt(data.priority) });
        if (data.status === 'done' && !p.completedAt) p.completedAt = new Date().toISOString();
        else if (data.status !== 'done') delete p.completedAt;
        saveProjects(projects);
        
        // Sync tasks from tempProjectTasks
        const allTasks = getTasks();
        const existingTaskIds = tempProjectTasks.filter(t => t.id).map(t => t.id);
        
        // Remove tasks that were deleted in the modal
        const updatedTasks = allTasks.filter(t => {
            if (t.projectId === id) {
                return existingTaskIds.includes(t.id);
            }
            return true;
        });
        
        // Update or add tasks
        tempProjectTasks.forEach(tempTask => {
            if (tempTask.id) {
                // Update existing task
                const task = updatedTasks.find(t => t.id === tempTask.id);
                if (task) {
                    task.title = tempTask.title;
                    task.dueDate = tempTask.dueDate;
                }
            } else {
                // Add new task
                updatedTasks.push({
                    id: generateId(),
                    title: tempTask.title,
                    projectId: id,
                    dueDate: tempTask.dueDate,
                    completed: false,
                    keyPerson: '',
                    startDate: '',
                    details: ''
                });
            }
        });
        
        saveTasks(updatedTasks);
        renderKanbanBoard();
    }
}

function deleteProject(id) {
    saveProjects(getProjects().filter(p => p.id !== id));
    saveTasks(getTasks().filter(t => t.projectId !== id));
    renderKanbanBoard();
}

function createTask(data) {
    if (data.startDate && data.dueDate && !validateDates(data.startDate, data.dueDate)) {
        showToast('Start date cannot be after due date', 'error');
        return;
    }
    const tasks = getTasks();
    tasks.push({ id: generateId(), ...data, completed: false });
    saveTasks(tasks);
    autoMoveProject(data.projectId); // Check if project should auto-move
    renderKanbanBoard();
}

function updateTask(id, data) {
    if (data.startDate && data.dueDate && !validateDates(data.startDate, data.dueDate)) {
        showToast('Start date cannot be after due date', 'error');
        return;
    }
    const tasks = getTasks();
    const t = tasks.find(x => x.id === id);
    if (t) {
        const wasCompleted = t.completed;
        Object.assign(t, data);
        if (!wasCompleted && t.completed) t.completedAt = new Date().toISOString();
        saveTasks(tasks);
        autoMoveProject(t.projectId); // Check if project should auto-move
        renderKanbanBoard();
    }
}

function deleteTask(id) {
    const tasks = getTasks();
    const task = tasks.find(t => t.id === id);
    const projectId = task ? task.projectId : null;
    
    saveTasks(tasks.filter(t => t.id !== id));
    
    if (projectId) {
        autoMoveProject(projectId); // Check if project should auto-move
    }
    
    renderKanbanBoard();
}

// Categories & Key Persons
function addCategory(name, color) {
    if (!name.trim()) return false;
    const cats = getCategories();
    if (cats.find(c => c.name === name.trim())) { showToast('Category already exists', 'error'); return false; }
    cats.push({ name: name.trim(), color: color || DEFAULT_CATEGORY_COLOR });
    saveCategories(cats);
    renderCategoryList();
    updateCategoryDropdowns();
    return true;
}

function addKeyPerson(name) {
    if (!name.trim()) return false;
    const kps = getKeyPersons();
    if (kps.includes(name.trim())) { showToast('Key person already exists', 'error'); return false; }
    kps.push(name.trim());
    saveKeyPersons(kps);
    renderKeyPersonList();
    updateKeyPersonDropdowns();
    return true;
}

function renderCategoryList() {
    const list = document.getElementById('categoryList');
    const cats = getCategories();
    const projects = getProjects();
    list.innerHTML = '';
    
    if (cats.length === 0) {
        list.innerHTML = '<li style="border: none; background: transparent; color: var(--text-muted); text-align: center;">No categories yet</li>';
        return;
    }
    
    cats.forEach((c, index) => {
        const li = document.createElement('li');
        const usageCount = projects.filter(p => p.category === c.name).length;
        const canDelete = usageCount === 0;
        
        li.innerHTML = `
            <div class="category-info">
                <div class="category-color" style="background: ${c.color}"></div>
                <span>${escapeHtml(c.name)}</span>
                ${usageCount > 0 ? `<small style="color: var(--text-muted); margin-left: 8px;">(${usageCount} project${usageCount > 1 ? 's' : ''})</small>` : ''}
            </div>
            <div style="display: flex; gap: 8px;">
                <button class="btn-edit-category" data-index="${index}" title="Edit">
                    <i class="bi bi-pencil" style="font-size: 16px;"></i>
                </button>
                <button class="delete-item" data-index="${index}" ${!canDelete ? 'disabled title="Cannot delete - in use by projects"' : 'title="Delete category"'}>
                    <i class="bi bi-trash" style="font-size: 16px;"></i>
                </button>
            </div>
        `;
        list.appendChild(li);
    });
    
    // Add event listeners for edit buttons
    document.querySelectorAll('.btn-edit-category').forEach(btn => {
        btn.addEventListener('click', () => {
            const index = parseInt(btn.dataset.index);
            editCategory(index);
        });
    });
    
    // Add event listeners for delete buttons
    document.querySelectorAll('#categoryList .delete-item').forEach(btn => {
        btn.addEventListener('click', () => {
            if (btn.disabled) return;
            const index = parseInt(btn.dataset.index);
            deleteCategory(index);
        });
    });
}

let editingCategoryIndex = null;

function editCategory(index) {
    const cats = getCategories();
    if (index < 0 || index >= cats.length) return;
    
    editingCategoryIndex = index;
    const cat = cats[index];
    
    document.getElementById('editCategoryName').value = cat.name;
    
    // Set color palette
    const colorPalette = document.getElementById('editCategoryColorPalette');
    colorPalette.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
    const colorSwatch = colorPalette.querySelector(`[data-color="${cat.color}"]`);
    if (colorSwatch) colorSwatch.classList.add('active');
    
    setupColorPalette('editCategoryColorPalette');
    openModal('editCategoryModal');
    setTimeout(() => document.getElementById('editCategoryName').focus(), 100);
}

function saveEditCategory() {
    const cats = getCategories();
    if (editingCategoryIndex === null || editingCategoryIndex < 0 || editingCategoryIndex >= cats.length) return;
    
    const newName = document.getElementById('editCategoryName').value.trim();
    const colorPalette = document.getElementById('editCategoryColorPalette');
    const selectedColor = colorPalette.querySelector('.color-swatch.active');
    const newColor = selectedColor ? selectedColor.dataset.color : '#6b7280';
    
    if (!newName) {
        showToast('Please enter a category name', 'error');
        return;
    }
    
    const oldName = cats[editingCategoryIndex].name;
    
    // Check for duplicate (excluding current)
    if (cats.some((c, i) => i !== editingCategoryIndex && c.name.toLowerCase() === newName.toLowerCase())) {
        showToast('Category already exists', 'error');
        return;
    }
    
    // Update category
    cats[editingCategoryIndex].name = newName;
    cats[editingCategoryIndex].color = newColor;
    
    // Update all projects using this category
    if (oldName !== newName) {
        const projects = getProjects();
        projects.forEach(p => {
            if (p.category === oldName) p.category = newName;
        });
        saveProjects(projects);
    }
    
    saveCategories(cats);
    renderCategoryList();
    updateCategoryDropdowns();
    renderKanbanBoard();
    closeModal('editCategoryModal');
    editingCategoryIndex = null;
    showToast('Category updated', 'success');
}


function deleteCategory(index) {
    const cats = getCategories();
    if (index < 0 || index >= cats.length) return;
    
    const cat = cats[index];
    const projects = getProjects();
    const usageCount = projects.filter(p => p.category === cat.name).length;
    
    if (usageCount > 0) {
        showToast(`Cannot delete - used by ${usageCount} project${usageCount > 1 ? 's' : ''}`, 'error');
        return;
    }
    
    showConfirm(`Delete category "${cat.name}"?`, () => {
        cats.splice(index, 1);
        saveCategories(cats);
        renderCategoryList();
        updateCategoryDropdowns();
        showToast('Category deleted', 'success');
    });
}

function renderKeyPersonList() {
    const list = document.getElementById('keyPersonList');
    const kps = getKeyPersons();
    const projects = getProjects();
    const tasks = getTasks();
    list.innerHTML = '';
    
    if (kps.length === 0) {
        list.innerHTML = '<li style="border: none; background: transparent; color: var(--text-muted); text-align: center;">No key persons yet</li>';
        return;
    }
    
    kps.forEach((k, index) => {
        const li = document.createElement('li');
        const usageCount = projects.filter(p => p.keyPersons && p.keyPersons.includes(k)).length + 
                          tasks.filter(t => t.keyPersons && t.keyPersons.includes(k)).length;
        const canDelete = usageCount === 0;
        
        li.innerHTML = `
            <div style="display: flex; align-items: center; gap: 8px;">
                <span>${escapeHtml(k)}</span>
                ${usageCount > 0 ? `<small style="color: var(--text-muted);">(${usageCount} item${usageCount > 1 ? 's' : ''})</small>` : ''}
            </div>
            <div style="display: flex; gap: 8px;">
                <button class="btn-edit-keyperson" data-index="${index}" title="Edit name">
                    <i class="bi bi-pencil" style="font-size: 16px;"></i>
                </button>
                <button class="delete-item" data-index="${index}" ${!canDelete ? 'disabled title="Cannot delete - in use"' : 'title="Delete key person"'}>
                    <i class="bi bi-trash" style="font-size: 16px;"></i>
                </button>
            </div>
        `;
        list.appendChild(li);
    });
    
    // Add event listeners for edit buttons
    document.querySelectorAll('.btn-edit-keyperson').forEach(btn => {
        btn.addEventListener('click', () => {
            const index = parseInt(btn.dataset.index);
            editKeyPerson(index);
        });
    });
    
    // Add event listeners for delete buttons
    document.querySelectorAll('#keyPersonList .delete-item').forEach(btn => {
        btn.addEventListener('click', () => {
            if (btn.disabled) return;
            const index = parseInt(btn.dataset.index);
            deleteKeyPerson(index);
        });
    });
}

let editingKeyPersonIndex = null;

function editKeyPerson(index) {
    const kps = getKeyPersons();
    if (index < 0 || index >= kps.length) return;
    
    editingKeyPersonIndex = index;
    const oldName = kps[index];
    
    document.getElementById('editKeyPersonName').value = oldName;
    openModal('editKeyPersonModal');
    
    // Focus on input
    setTimeout(() => {
        document.getElementById('editKeyPersonName').focus();
    }, 100);
}

function saveEditKeyPerson() {
    const kps = getKeyPersons();
    if (editingKeyPersonIndex === null || editingKeyPersonIndex < 0 || editingKeyPersonIndex >= kps.length) return;
    
    const oldName = kps[editingKeyPersonIndex];
    const newName = document.getElementById('editKeyPersonName').value;
    
    if (newName && newName.trim() && newName.trim() !== oldName) {
        const trimmedName = newName.trim();
        
        // Check for duplicates
        if (kps.some((k, i) => i !== editingKeyPersonIndex && k === trimmedName)) {
            showToast('Key person already exists', 'error');
            return;
        }
        
        // Update the name
        kps[editingKeyPersonIndex] = trimmedName;
        
        // Update all projects and tasks using this key person
        const projects = getProjects();
        const tasks = getTasks();
        let updated = false;
        
        projects.forEach(p => {
            if (p.keyPersons && p.keyPersons.includes(oldName)) {
                const idx = p.keyPersons.indexOf(oldName);
                p.keyPersons[idx] = trimmedName;
                updated = true;
            }
        });
        
        tasks.forEach(t => {
            if (t.keyPersons && t.keyPersons.includes(oldName)) {
                const idx = t.keyPersons.indexOf(oldName);
                t.keyPersons[idx] = trimmedName;
                updated = true;
            }
        });
        
        saveKeyPersons(kps);
        if (updated) {
            saveProjects(projects);
            saveTasks(tasks);
        }
        
        renderKeyPersonList();
        updateKeyPersonDropdowns();
        renderKanbanBoard();
        showToast('Key person updated', 'success');
        
        closeModal('editKeyPersonModal');
        editingKeyPersonIndex = null;
    }
}

function deleteKeyPerson(index) {
    const kps = getKeyPersons();
    if (index < 0 || index >= kps.length) return;
    
    const name = kps[index];
    const projects = getProjects();
    const tasks = getTasks();
    const usageCount = projects.filter(p => p.keyPersons && p.keyPersons.includes(name)).length + 
                       tasks.filter(t => t.keyPersons && t.keyPersons.includes(name)).length;
    
    if (usageCount > 0) {
        showToast(`Cannot delete - used by ${usageCount} item${usageCount > 1 ? 's' : ''}`, 'error');
        return;
    }
    
    showConfirm(`Delete key person "${name}"?`, () => {
        kps.splice(index, 1);
        saveKeyPersons(kps);
        renderKeyPersonList();
        updateKeyPersonDropdowns();
        showToast('Key person deleted', 'success');
    });
}

function updateCategoryDropdowns() {
    const cats = getCategories();
    const selects = [document.getElementById('projectCategory')];
    selects.forEach(s => {
        const current = s.value;
        s.innerHTML = '<option value="">-- None --</option>';
        cats.forEach(c => s.innerHTML += `<option value="${escapeHtml(c.name)}">${escapeHtml(c.name)}</option>`);
        s.value = current;
    });
}

function updateKeyPersonCheckboxes() {
    const kps = getKeyPersons();
    const containers = [
        document.getElementById('projectKeyPersons'),
        document.getElementById('taskKeyPersons')
    ];
    
    containers.forEach(container => {
        if (!container) return;
        
        if (kps.length === 0) {
            container.innerHTML = '';
            return;
        }
        
        // Store currently checked values
        const checked = Array.from(container.querySelectorAll('input[type="checkbox"]:checked'))
            .map(cb => cb.value);
        
        container.innerHTML = '';
        kps.forEach(kp => {
            const label = document.createElement('label');
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.value = kp;
            checkbox.name = 'keyPersons';
            if (checked.includes(kp)) {
                checkbox.checked = true;
            }
            
            const span = document.createElement('span');
            span.textContent = kp;
            
            label.appendChild(checkbox);
            label.appendChild(span);
            container.appendChild(label);
        });
    });
}

function setKeyPersonCheckboxes(containerId, selectedPersons) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const checkboxes = container.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(cb => {
        cb.checked = selectedPersons.includes(cb.value);
    });
}

function getSelectedKeyPersons(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return [];
    
    return Array.from(container.querySelectorAll('input[type="checkbox"]:checked'))
        .map(cb => cb.value);
}

function updateKeyPersonDropdowns() {
    // Legacy function - no longer used but kept for compatibility
    updateKeyPersonCheckboxes();
}

function updateProjectDropdown() {
    const projects = getProjects();
    const select = document.getElementById('taskProject');
    const current = select.value;
    select.innerHTML = '<option value="">-- Select Project --</option>';
    projects.forEach(p => select.innerHTML += `<option value="${p.id}">${escapeHtml(p.title)}</option>`);
    select.value = current;
}

// Utility
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
// ============================================
// Kanban Board Application - Events Module
// Event Listeners & Interactions
// ============================================

// Markdown Preview Toggle
function setupMarkdownPreview(textareaId, toggleBtnId, previewId) {
    const textarea = document.getElementById(textareaId);
    const toggleBtn = document.getElementById(toggleBtnId);
    const preview = document.getElementById(previewId);
    
    if (!textarea || !toggleBtn || !preview) return;
    
    let isPreview = false;
    
    toggleBtn.addEventListener('click', () => {
        isPreview = !isPreview;
        
        if (isPreview) {
            // Show preview
            preview.innerHTML = parseMarkdown(textarea.value) || '<p style="color: var(--text-muted);">No content to preview</p>';
            textarea.style.display = 'none';
            preview.style.display = 'block';
            toggleBtn.innerHTML = `
                <i class="bi bi-pencil" style="font-size: 16px; margin-right: 4px;"></i>
                Edit
            `;
        } else {
            // Show editor
            textarea.style.display = 'block';
            preview.style.display = 'none';
            toggleBtn.innerHTML = `
                <i class="bi bi-eye" style="font-size: 16px; margin-right: 4px;"></i>
                Preview
            `;
        }
    });
}

// Date validation setup
function setupDateValidation(startDateId, dueDateId) {
    const startDate = document.getElementById(startDateId);
    const dueDate = document.getElementById(dueDateId);
    
    if (!startDate || !dueDate) return;
    
    const validate = () => {
        if (startDate.value && dueDate.value) {
            if (new Date(startDate.value) > new Date(dueDate.value)) {
                dueDate.setCustomValidity('Due date must be after start date');
                showToast('Due date must be after start date', 'error');
            } else {
                dueDate.setCustomValidity('');
            }
        } else {
            dueDate.setCustomValidity('');
        }
    };
    
    startDate.addEventListener('change', validate);
    dueDate.addEventListener('change', validate);
}

// Export Data
function exportData() {
    const settings = getSettings();
    const data = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        documentInfo: {
            name: settings.docName,
            author: settings.docAuthor,
            version: settings.docVersion
        },
        projects: getProjects(),
        tasks: getTasks(),
        categories: getCategories(),
        keyPersons: getKeyPersons(),
        settings: settings
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob), a = document.createElement('a');
    const filename = `${settings.docName.replace(/[^a-z0-9]/gi, '_')}-${new Date().toISOString().split('T')[0]}.json`;
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
    showToast('Data exported successfully', 'success');
}

// Import Data
function importData(file, merge = true) {
    const reader = new FileReader();
    reader.onload = e => {
        try {
            const data = JSON.parse(e.target.result);
            
            if (merge) {
                if (data.projects) {
                    const existing = getProjects();
                    const merged = [...existing];
                    data.projects.forEach(newProj => {
                        const idx = merged.findIndex(p => p.id === newProj.id);
                        if (idx >= 0) merged[idx] = newProj;
                        else merged.push(newProj);
                    });
                    saveProjects(merged);
                }
                if (data.tasks) {
                    const existing = getTasks();
                    const merged = [...existing];
                    data.tasks.forEach(newTask => {
                        const idx = merged.findIndex(t => t.id === newTask.id);
                        if (idx >= 0) merged[idx] = newTask;
                        else merged.push(newTask);
                    });
                    saveTasks(merged);
                }
            } else {
                Object.values(STORAGE_KEYS).forEach(k => { if (k !== STORAGE_KEYS.SETTINGS && k !== STORAGE_KEYS.SYNC_CONFIG) localStorage.removeItem(k); });
                if (data.projects) saveProjects(data.projects);
                if (data.tasks) saveTasks(data.tasks);
            }
            
            if (data.categories) {
                const ex = getCategories();
                const all = [...ex, ...data.categories.filter(c => !ex.find(x => (typeof x === 'string' ? x : x.name) === (typeof c === 'string' ? c : c.name)))].map(c => typeof c === 'string' ? { name: c, color: DEFAULT_CATEGORY_COLOR } : c);
                saveCategories(all);
            }
            if (data.keyPersons) { const ex = getKeyPersons(); saveKeyPersons([...ex, ...data.keyPersons.filter(k => !ex.includes(k))]); }
            if (data.settings) {
                const currentSettings = getSettings();
                saveSettings({ ...currentSettings, ...data.settings });
            }
            
            renderKanbanBoard(); renderCategoryList(); renderKeyPersonList(); updateCategoryDropdowns(); updateKeyPersonDropdowns();
            updateStorageInfo();
            showToast(`Data imported successfully (${merge ? 'merged' : 'replaced'})`, 'success');
        } catch (err) { showToast('Error importing data', 'error'); console.error(err); }
    };
    reader.readAsText(file);
}

// Clear All Data
function clearAllData() {
    Object.values(STORAGE_KEYS).forEach(k => { if (k !== STORAGE_KEYS.SETTINGS) localStorage.removeItem(k); });
    showToast('All data cleared. Reloading...', 'success');
    setTimeout(() => {
        location.reload();
    }, 1000);
}

// Open clear data modal
function openClearDataModal() {
    const settings = getSettings();
    document.getElementById('confirmDocName').textContent = settings.docName;
    document.getElementById('clearDataConfirmInput').value = '';
    document.getElementById('confirmClearData').disabled = true;
    openModal('clearDataModal');
}

// Event Listeners Setup
function setupEventListeners() {
    // Header buttons
    document.getElementById('btnAddProject').addEventListener('click', () => openProjectModal());
    document.getElementById('btnAddTask').addEventListener('click', () => openTaskModal());
    document.getElementById('btnSettings').addEventListener('click', () => { 
        renderCategoryList(); 
        renderKeyPersonList();
        renderColumnList();
        updateStorageInfo();
        openModal('settingsModal'); 
    });
    
    // Warning banners
    document.getElementById('closeOverdue').addEventListener('click', () => { 
        document.getElementById('overdueBanner').style.display = 'none'; 
    });
    document.getElementById('closeWarning').addEventListener('click', () => { 
        document.getElementById('warningBanner').style.display = 'none'; 
    });
    
    // Project Modal
    document.getElementById('closeProjectModal').addEventListener('click', () => closeModal('projectModal'));
    document.getElementById('cancelProject').addEventListener('click', () => closeModal('projectModal'));
    document.querySelector('#projectModal .modal-overlay').addEventListener('click', () => closeModal('projectModal'));
    document.getElementById('saveProject').addEventListener('click', () => {
        const form = document.getElementById('projectForm');
        if (!form.checkValidity()) { form.reportValidity(); return; }
        const id = document.getElementById('projectId').value;
        const data = { 
            title: document.getElementById('projectTitle').value, 
            priority: document.getElementById('projectPriority').value, 
            status: document.getElementById('projectStatus').value, 
            category: document.getElementById('projectCategory').value, 
            keyPersons: getSelectedKeyPersons('projectKeyPersons'),
            startDate: document.getElementById('projectStartDate').value,
            dueDate: document.getElementById('projectDueDate').value, 
            details: document.getElementById('projectDetails').value 
        };
        if (id) { updateProject(id, data); showToast('Project updated', 'success'); }
        else { createProject(data); showToast('Project created', 'success'); }
        closeModal('projectModal');
    });
    document.getElementById('deleteProject').addEventListener('click', () => {
        const id = document.getElementById('projectId').value, p = getProjects().find(x => x.id === id), tc = getTasks().filter(t => t.projectId === id).length;
        showConfirm(`Delete project "${p.title}"? This will also delete ${tc} associated task(s).`, () => { 
            deleteProject(id); 
            closeModal('projectModal'); 
            showToast('Project deleted', 'success'); 
        });
    });
    
    // Project Modal - Task Management
    document.getElementById('addProjectTask').addEventListener('click', (e) => {
        e.preventDefault();
        addOrUpdateProjectTask();
    });
    
    // Allow Enter key to add task in project modal
    document.getElementById('projectTaskTitle').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addOrUpdateProjectTask();
        }
    });
    
    document.getElementById('projectTaskDueDate').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addOrUpdateProjectTask();
        }
    });
    
    // Task Modal
    document.getElementById('closeTaskModal').addEventListener('click', () => closeModal('taskModal'));
    document.getElementById('cancelTask').addEventListener('click', () => closeModal('taskModal'));
    document.querySelector('#taskModal .modal-overlay').addEventListener('click', () => closeModal('taskModal'));
    document.getElementById('saveTask').addEventListener('click', () => {
        const form = document.getElementById('taskForm');
        if (!form.checkValidity()) { form.reportValidity(); return; }
        const id = document.getElementById('taskId').value;
        const data = { 
            title: document.getElementById('taskTitle').value, 
            projectId: document.getElementById('taskProject').value, 
            keyPersons: getSelectedKeyPersons('taskKeyPersons'),
            startDate: document.getElementById('taskStartDate').value,
            dueDate: document.getElementById('taskDueDate').value, 
            details: document.getElementById('taskDetails').value
        };
        if (id) { updateTask(id, data); showToast('Task updated', 'success'); }
        else { createTask(data); showToast('Task created', 'success'); }
        closeModal('taskModal');
    });
    document.getElementById('deleteTask').addEventListener('click', () => {
        const id = document.getElementById('taskId').value, t = getTasks().find(x => x.id === id);
        showConfirm(`Delete task "${t.title}"?`, () => { 
            deleteTask(id); 
            closeModal('taskModal'); 
            showToast('Task deleted', 'success'); 
        });
    });
    
    // Settings Modal
    document.getElementById('closeSettingsModal').addEventListener('click', () => closeModal('settingsModal'));
    document.getElementById('closeSettings').addEventListener('click', () => closeModal('settingsModal'));
    document.querySelector('#settingsModal .modal-overlay').addEventListener('click', () => closeModal('settingsModal'));
    
    // Settings Tabs
    document.querySelectorAll('.settings-tab').forEach(t => t.addEventListener('click', () => {
        document.querySelectorAll('.settings-tab').forEach(x => x.classList.remove('active'));
        document.querySelectorAll('.settings-panel').forEach(x => x.classList.remove('active'));
        t.classList.add('active');
        document.getElementById(`panel-${t.dataset.tab}`).classList.add('active');
        if (t.dataset.tab === 'data') {
            updateStorageInfo();
        }
    }));
    
    // Settings - Document Info
    document.getElementById('docName').addEventListener('change', e => {
        const s = getSettings();
        s.docName = e.target.value || 'MyTasks';
        saveSettings(s);
        updateHeaderInfo();
    });
    document.getElementById('docAuthor').addEventListener('change', e => {
        const s = getSettings();
        s.docAuthor = e.target.value || 'Me';
        saveSettings(s);
    });
    document.getElementById('docVersion').addEventListener('change', e => {
        const s = getSettings();
        s.docVersion = e.target.value || '1.0';
        saveSettings(s);
        updateHeaderInfo();
    });
    
    // Settings - General
    document.getElementById('warningDays').addEventListener('change', e => { 
        const s = getSettings(); 
        s.warningDays = parseInt(e.target.value) || 3; 
        saveSettings(s); 
        checkWarnings(); 
    });
    document.getElementById('autoDeleteDays').addEventListener('change', e => { 
        const s = getSettings(); 
        s.autoDeleteDays = parseInt(e.target.value) || 0; 
        saveSettings(s); 
    });
    document.getElementById('autoMoveProject').addEventListener('change', e => {
        const s = getSettings();
        s.autoMoveProject = e.target.checked;
        saveSettings(s);
        showToast(e.target.checked ? 'Auto-move enabled' : 'Auto-move disabled', 'success');
    });
    
    // Theme & Font
    document.querySelectorAll('.theme-btn').forEach(b => b.addEventListener('click', () => applyTheme(b.dataset.theme)));
    document.querySelectorAll('.font-btn').forEach(b => b.addEventListener('click', () => applyFont(b.dataset.font)));
    
    // Categories
    document.querySelectorAll('#categoryColorPalette .color-swatch').forEach(s => s.addEventListener('click', () => {
        document.querySelectorAll('#categoryColorPalette .color-swatch').forEach(x => x.classList.remove('active'));
        s.classList.add('active');
        selectedCategoryColor = s.dataset.color;
    }));
    document.getElementById('addCategory').addEventListener('click', () => { 
        const i = document.getElementById('newCategory'); 
        if (addCategory(i.value, selectedCategoryColor)) { 
            i.value = ''; 
            showToast('Category added', 'success'); 
        } 
    });
    document.getElementById('newCategory').addEventListener('keypress', e => { 
        if (e.key === 'Enter') { 
            e.preventDefault(); 
            const i = document.getElementById('newCategory'); 
            if (addCategory(i.value, selectedCategoryColor)) { 
                i.value = ''; 
                showToast('Category added', 'success'); 
            } 
        } 
    });
    
    // Key Persons
    document.getElementById('addKeyPerson').addEventListener('click', () => { 
        const i = document.getElementById('newKeyPerson'); 
        if (addKeyPerson(i.value)) { 
            i.value = ''; 
            showToast('Key person added', 'success'); 
        } 
    });
    document.getElementById('newKeyPerson').addEventListener('keypress', e => { 
        if (e.key === 'Enter') { 
            e.preventDefault(); 
            const i = document.getElementById('newKeyPerson'); 
            if (addKeyPerson(i.value)) { 
                i.value = ''; 
                showToast('Key person added', 'success'); 
            } 
        } 
    });
    
    // Data Management
    document.getElementById('exportData').addEventListener('click', exportData);
    let importMode = 'merge';
    document.getElementById('importDataReplace')?.addEventListener('click', () => { importMode = 'replace'; document.getElementById('importFile').click(); });
    document.getElementById('importDataMerge')?.addEventListener('click', () => { importMode = 'merge'; document.getElementById('importFile').click(); });
    document.getElementById('importFile').addEventListener('change', e => { 
        if (e.target.files.length > 0) { 
            importData(e.target.files[0], importMode === 'merge'); 
            e.target.value = ''; 
        } 
    });
    document.getElementById('clearAllData').addEventListener('click', openClearDataModal);
    
    // Edit Key Person Modal
    document.getElementById('closeEditKeyPerson').addEventListener('click', () => {
        closeModal('editKeyPersonModal');
        editingKeyPersonIndex = null;
    });
    document.getElementById('cancelEditKeyPerson').addEventListener('click', () => {
        closeModal('editKeyPersonModal');
        editingKeyPersonIndex = null;
    });
    document.getElementById('saveEditKeyPerson').addEventListener('click', saveEditKeyPerson);
    document.querySelector('#editKeyPersonModal .modal-overlay').addEventListener('click', () => {
        closeModal('editKeyPersonModal');
        editingKeyPersonIndex = null;
    });
    document.getElementById('editKeyPersonName').addEventListener('keypress', e => {
        if (e.key === 'Enter') {
            e.preventDefault();
            saveEditKeyPerson();
        }
    });
    
    // Edit Category Modal
    document.getElementById('closeEditCategory').addEventListener('click', () => {
        closeModal('editCategoryModal');
        editingCategoryIndex = null;
    });
    document.getElementById('cancelEditCategory').addEventListener('click', () => {
        closeModal('editCategoryModal');
        editingCategoryIndex = null;
    });
    document.getElementById('saveEditCategory').addEventListener('click', saveEditCategory);
    document.querySelector('#editCategoryModal .modal-overlay').addEventListener('click', () => {
        closeModal('editCategoryModal');
        editingCategoryIndex = null;
    });
    document.getElementById('editCategoryName').addEventListener('keypress', e => {
        if (e.key === 'Enter') {
            e.preventDefault();
            saveEditCategory();
        }
    });
    
    // Clear Data Modal
    document.getElementById('cancelClearData').addEventListener('click', () => closeModal('clearDataModal'));
    document.querySelector('#clearDataModal .modal-overlay').addEventListener('click', () => closeModal('clearDataModal'));
    document.getElementById('clearDataConfirmInput').addEventListener('input', e => {
        const settings = getSettings();
        const btn = document.getElementById('confirmClearData');
        btn.disabled = e.target.value !== settings.docName;
    });
    document.getElementById('confirmClearData').addEventListener('click', () => {
        closeModal('clearDataModal');
        clearAllData();
    });
    
    // Column Management
    document.getElementById('addColumn').addEventListener('click', addColumn);
    document.getElementById('newColumnName').addEventListener('keypress', e => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addColumn();
        }
    });
    
    // Column color palette
    setupColorPalette('columnColorPalette');
    
    // Column icon picker
    setupIconPicker('columnIconSearch', 'columnIconPicker', 'newColumnIcon', 'columnIconPreview');
    document.getElementById('clearColumnIcon').addEventListener('click', () => {
        document.getElementById('newColumnIcon').value = '';
        document.getElementById('columnIconPreview').innerHTML = '';
        document.getElementById('columnIconPicker').style.display = 'none';
    });
    
    // Edit Column Modal
    document.getElementById('closeEditColumn').addEventListener('click', () => {
        closeModal('editColumnModal');
        editingColumnIndex = null;
    });
    document.getElementById('cancelEditColumn').addEventListener('click', () => {
        closeModal('editColumnModal');
        editingColumnIndex = null;
    });
    document.getElementById('saveEditColumn').addEventListener('click', saveEditColumn);
    
    // Edit column color palette
    setupColorPalette('editColumnColorPalette');
    
    // Edit column icon picker
    setupIconPicker('editColumnIconSearch', 'editColumnIconPicker', 'editColumnIcon', 'editColumnIconPreview');
    document.getElementById('clearEditColumnIcon').addEventListener('click', () => {
        document.getElementById('editColumnIcon').value = '';
        document.getElementById('editColumnIconPreview').innerHTML = '';
        document.getElementById('editColumnIconPicker').style.display = 'none';
    });
    document.querySelector('#editColumnModal .modal-overlay').addEventListener('click', () => {
        closeModal('editColumnModal');
        editingColumnIndex = null;
    });
    document.getElementById('editColumnName').addEventListener('keypress', e => {
        if (e.key === 'Enter') {
            e.preventDefault();
            saveEditColumn();
        }
    });
    
    // Detail Modal
    document.getElementById('closeDetailModal').addEventListener('click', () => closeModal('detailModal'));
    document.getElementById('closeDetail').addEventListener('click', () => closeModal('detailModal'));
    document.querySelector('#detailModal .modal-overlay').addEventListener('click', () => closeModal('detailModal'));
    document.getElementById('addTaskFromDetail').addEventListener('click', () => {
        closeModal('detailModal');
        openTaskModal(null, currentDetailId); // currentDetailId is the project ID
    });
    document.getElementById('editDetail').addEventListener('click', () => {
        closeModal('detailModal');
        if (currentDetailType === 'project') {
            openProjectModal(currentDetailId);
        } else {
            openTaskModal(currentDetailId);
        }
    });
    
    // Confirm Modal
    document.getElementById('confirmCancel').addEventListener('click', () => { 
        confirmCallback = null; 
        closeModal('confirmModal'); 
    });
    document.getElementById('confirmOk').addEventListener('click', () => { 
        if (confirmCallback) { 
            confirmCallback(); 
            confirmCallback = null; 
        } 
        closeModal('confirmModal'); 
    });
    document.querySelector('#confirmModal .modal-overlay').addEventListener('click', () => { 
        confirmCallback = null; 
        closeModal('confirmModal'); 
    });
    
    // Markdown Preview Setup
    setupMarkdownPreview('projectDetails', 'projectMarkdownToggle', 'projectMarkdownPreview');
    setupMarkdownPreview('taskDetails', 'taskMarkdownToggle', 'taskMarkdownPreview');
    
    // Date Validation Setup
    setupDateValidation('projectStartDate', 'projectDueDate');
    setupDateValidation('taskStartDate', 'taskDueDate');
}
// ============================================
// Kanban Board Application - Main Entry
// Initialization
// ============================================

// Update header document info
function updateHeaderInfo() {
    const settings = getSettings();
    const headerInfo = document.getElementById('headerDocInfo');
    if (headerInfo) {
        const syncCfg = getSyncConfig();
        const isGitHubConfigured = syncCfg.gistId && syncCfg.token;
        const autoSyncEnabled = isGitHubConfigured && syncCfg.autoSaveInterval > 0;
        
        let icon = '';
        if (isGitHubConfigured) {
            icon = autoSyncEnabled 
                ? '<i class="bi bi-cloud-check" style="color: var(--success); margin-left: 8px;" title="Auto-sync enabled"></i>'
                : '<i class="bi bi-cloud" style="color: var(--text-secondary); margin-left: 8px;" title="Sync configured (manual)"></i>';
        } else {
            icon = '<i class="bi bi-laptop" style="color: var(--text-secondary); margin-left: 8px;" title="Local storage only"></i>';
        }
        
        if (isGitHubConfigured && syncCfg.lastSync) {
            // Show Last Sync with GitHub sync timestamp
            const lastSyncText = new Date(syncCfg.lastSync).toLocaleString('en-GB', { 
                day: '2-digit', 
                month: '2-digit', 
                year: 'numeric', 
                hour: '2-digit', 
                minute: '2-digit' 
            });
            headerInfo.innerHTML = `${settings.docName} | v${settings.docVersion} | Last Sync: ${lastSyncText}${icon}`;
        } else {
            // Show Last Save with localStorage timestamp
            const lastSave = localStorage.getItem('kanban_lastSave');
            const lastSaveText = lastSave ? new Date(lastSave).toLocaleString('en-GB', { 
                day: '2-digit', 
                month: '2-digit', 
                year: 'numeric', 
                hour: '2-digit', 
                minute: '2-digit' 
            }) : 'Never';
            headerInfo.innerHTML = `${settings.docName} | v${settings.docVersion} | Last Save: ${lastSaveText}${icon}`;
        }
    }
}

// Update last save timestamp
function updateLastSave() {
    localStorage.setItem('kanban_lastSave', new Date().toISOString());
    updateHeaderInfo();
}

// Initialize Application
async function init() {
    // Initialize default data on first run
    await initializeDefaultData();
    
    // Load settings
    const s = getSettings();
    
    // Apply theme and font
    applyTheme(s.theme);
    applyFont(s.font);
    
    // Set form values
    document.getElementById('docName').value = s.docName;
    document.getElementById('docAuthor').value = s.docAuthor;
    document.getElementById('docVersion').value = s.docVersion;
    document.getElementById('warningDays').value = s.warningDays;
    document.getElementById('autoDeleteDays').value = s.autoDeleteDays || 0;
    document.getElementById('autoMoveProject').checked = s.autoMoveProject || false;
    
    // Setup event listeners
    setupEventListeners();
    
    // Update header info
    updateHeaderInfo();
    
    // Render initial board
    renderKanbanBoard();
    
    // Update dropdowns
    updateCategoryDropdowns();
    updateKeyPersonDropdowns();
    
    // Update storage info
    updateStorageInfo();
    
    // Check for sync
    setTimeout(() => checkAutoSync(), 1000);
}

// Migrate single keyPerson to keyPersons array

// Start application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    init().catch(error => {
        console.error('Initialization error:', error);
        showToast('Failed to initialize app', 'error');
    });
});

// Column Management
let editingColumnIndex = null;
let columnDragSrcIndex = null;

// Helper function for color palette
function setupColorPalette(paletteId) {
    const palette = document.getElementById(paletteId);
    if (!palette) return;
    
    palette.querySelectorAll('.color-swatch').forEach(swatch => {
        swatch.addEventListener('click', () => {
            palette.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
            swatch.classList.add('active');
        });
    });
}

// Helper function for icon picker
function setupIconPicker(searchInputId, pickerDivId, hiddenInputId, previewDivId) {
    const searchInput = document.getElementById(searchInputId);
    const pickerDiv = document.getElementById(pickerDivId);
    const hiddenInput = document.getElementById(hiddenInputId);
    const previewDiv = document.getElementById(previewDivId);
    
    if (!searchInput || !pickerDiv || !hiddenInput || !previewDiv) return;
    
    searchInput.addEventListener('input', () => {
        const query = searchInput.value.toLowerCase().trim();
        
        if (query.length === 0) {
            pickerDiv.style.display = 'none';
            return;
        }
        
        const filtered = COMMON_ICONS.filter(icon => 
            icon.name.includes(query) || icon.icon.includes(query)
        );
        
        if (filtered.length === 0) {
            pickerDiv.innerHTML = '<p style="color: var(--text-muted); padding: 8px;">No icons found</p>';
            pickerDiv.style.display = 'block';
            return;
        }
        
        pickerDiv.innerHTML = filtered.map(icon => `
            <button type="button" class="icon-option" data-icon="${icon.icon}" style="display: inline-flex; align-items: center; gap: 8px; padding: 8px 12px; margin: 4px; border: 1px solid var(--border); background: var(--bg-primary); border-radius: 6px; cursor: pointer; transition: all 0.2s;">
                <i class="${icon.icon}" style="font-size: 18px; color: var(--text-primary);"></i>
                <span style="font-size: 0.85rem; color: var(--text-secondary);">${icon.name}</span>
            </button>
        `).join('');
        
        pickerDiv.style.display = 'block';
        
        pickerDiv.querySelectorAll('.icon-option').forEach(btn => {
            btn.addEventListener('click', () => {
                const selectedIcon = btn.dataset.icon;
                hiddenInput.value = selectedIcon;
                previewDiv.innerHTML = `
                    <div style="display: inline-flex; align-items: center; gap: 8px; padding: 8px 12px; background: var(--bg-secondary); border-radius: 6px; border: 1px solid var(--border);">
                        <i class="${selectedIcon}" style="font-size: 18px; color: var(--text-primary);"></i>
                        <span style="font-size: 0.9rem; color: var(--text-primary);">Selected: ${selectedIcon}</span>
                    </div>
                `;
                pickerDiv.style.display = 'none';
                searchInput.value = '';
            });
            
            btn.addEventListener('mouseenter', () => {
                btn.style.background = 'var(--accent-light)';
                btn.style.borderColor = 'var(--accent)';
            });
            
            btn.addEventListener('mouseleave', () => {
                btn.style.background = 'var(--bg-primary)';
                btn.style.borderColor = 'var(--border)';
            });
        });
    });
}

function generateColumnId(name) {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function renderColumnList() {
    const list = document.getElementById('columnList');
    const columns = getColumns();
    const projects = getProjects();
    list.innerHTML = '';
    
    if (columns.length === 0) {
        list.innerHTML = '<li style="border: none; background: transparent; color: var(--text-muted); text-align: center;">No columns configured</li>';
        return;
    }
    
    columns.forEach((col, index) => {
        const li = document.createElement('li');
        li.dataset.index = index;
        
        const usageCount = projects.filter(p => p.status === col.id).length;
        const isFirst = index === 0;
        const isLast = index === columns.length - 1;
        const canDrag = !isFirst && !isLast;
        const canDelete = canDrag && columns.length > 2 && usageCount === 0;
        
        if (canDrag) {
            li.draggable = true;
        }
        
        li.innerHTML = `
            <div class="column-info">
                ${canDrag ? `
                    <div class="column-drag-handle">
                        <i class="bi bi-grip-vertical" style="font-size: 20px;"></i>
                    </div>
                ` : '<div style="width: 20px;"></div>'}
                <div style="width: 24px; height: 24px; border-radius: 4px; background: ${col.color || '#6b7280'}; display: flex; align-items: center; justify-content: center;">
                    ${col.icon ? `<i class="${col.icon}" style="font-size: 12px; color: white;"></i>` : ''}
                </div>
                <span class="column-name">${escapeHtml(col.name)}</span>
                ${isFirst ? '<span class="column-badge">First (Backlog)</span>' : ''}
                ${isLast ? '<span class="column-badge">Last (Done)</span>' : ''}
                ${usageCount > 0 ? `<small style="color: var(--text-muted); margin-left: 8px;">(${usageCount} project${usageCount > 1 ? 's' : ''})</small>` : ''}
            </div>
            <div class="column-actions">
                <button class="btn-edit-column" data-index="${index}" title="Edit">
                    <i class="bi bi-pencil" style="font-size: 16px;"></i>
                </button>
                <button class="btn-delete-column" data-index="${index}" ${!canDelete ? 'disabled' : ''} title="${!canDelete ? (isFirst || isLast ? 'Cannot delete first or last column' : columns.length <= 2 ? 'Need at least 2 columns' : 'Column in use') : 'Delete'}">
                    <i class="bi bi-trash" style="font-size: 16px;"></i>
                </button>
            </div>
        `;
        
        list.appendChild(li);
        
        // Drag and drop for reordering (only for middle columns)
        if (canDrag) {
            li.addEventListener('dragstart', e => {
                columnDragSrcIndex = index;
                li.classList.add('dragging');
            });
            
            li.addEventListener('dragend', e => {
                li.classList.remove('dragging');
                columnDragSrcIndex = null;
            });
        }
        
        // Allow dropping on any column except first and last
        if (!isFirst && !isLast) {
            li.addEventListener('dragover', e => {
                e.preventDefault();
                const draggingItem = list.querySelector('.dragging');
                if (draggingItem && draggingItem !== li) {
                    const rect = li.getBoundingClientRect();
                    const next = (e.clientY - rect.top) / (rect.bottom - rect.top) > 0.5;
                    list.insertBefore(draggingItem, next ? li.nextSibling : li);
                }
            });
            
            li.addEventListener('drop', e => {
                e.preventDefault();
                if (columnDragSrcIndex !== null) {
                    // Get current order from DOM
                    const items = Array.from(list.querySelectorAll('li'));
                    const newOrder = [];
                    
                    // First column always stays first
                    newOrder.push(columns[0]);
                    
                    // Get middle columns based on current DOM order
                    items.forEach(item => {
                        const idx = parseInt(item.dataset.index);
                        // Skip first and last columns
                        if (idx > 0 && idx < columns.length - 1) {
                            newOrder.push(columns[idx]);
                        }
                    });
                    
                    // Last column always stays last
                    newOrder.push(columns[columns.length - 1]);
                    
                    saveColumns(newOrder);
                    renderColumnList();
                    updateStatusDropdowns();
                    renderKanbanBoard();
                    showToast('Columns reordered', 'success');
                }
            });
        }
    });
    
    // Event listeners for edit/delete
    list.querySelectorAll('.btn-edit-column').forEach(btn => {
        btn.addEventListener('click', () => editColumn(parseInt(btn.dataset.index)));
    });
    
    list.querySelectorAll('.btn-delete-column').forEach(btn => {
        btn.addEventListener('click', () => {
            if (!btn.disabled) deleteColumn(parseInt(btn.dataset.index));
        });
    });
}

function addColumn() {
    const input = document.getElementById('newColumnName');
    const iconInput = document.getElementById('newColumnIcon');
    const colorPalette = document.getElementById('columnColorPalette');
    const name = input.value.trim();
    const icon = iconInput.value.trim() || '';
    const selectedColor = colorPalette.querySelector('.color-swatch.active');
    const color = selectedColor ? selectedColor.dataset.color : '#6b7280';
    
    if (!name) {
        showToast('Please enter a column name', 'error');
        return;
    }
    
    const columns = getColumns();
    
    if (columns.length >= 12) {
        showToast('Maximum 12 columns allowed', 'error');
        return;
    }
    
    const id = generateColumnId(name);
    if (columns.find(c => c.id === id)) {
        showToast('Column already exists', 'error');
        return;
    }
    
    // Insert before last column instead of at the end
    columns.splice(columns.length - 1, 0, { id, name, color, icon });
    saveColumns(columns);
    renderColumnList();
    updateStatusDropdowns();
    renderKanbanBoard();
    
    // Reset inputs
    input.value = '';
    iconInput.value = '';
    document.getElementById('columnIconPreview').innerHTML = '';
    document.getElementById('columnIconPicker').style.display = 'none';
    colorPalette.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
    colorPalette.querySelector('.color-swatch[data-color="#6b7280"]').classList.add('active');
    
    showToast('Column added', 'success');
}

function editColumn(index) {
    const columns = getColumns();
    if (index < 0 || index >= columns.length) return;
    
    editingColumnIndex = index;
    const col = columns[index];
    
    document.getElementById('editColumnName').value = col.name;
    document.getElementById('editColumnIcon').value = col.icon || '';
    
    // Set color palette
    const colorPalette = document.getElementById('editColumnColorPalette');
    colorPalette.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
    const colorSwatch = colorPalette.querySelector(`[data-color="${col.color || '#6b7280'}"]`);
    if (colorSwatch) colorSwatch.classList.add('active');
    
    // Set icon preview
    const iconPreview = document.getElementById('editColumnIconPreview');
    if (col.icon) {
        iconPreview.innerHTML = `
            <div style="display: inline-flex; align-items: center; gap: 8px; padding: 8px 12px; background: var(--bg-secondary); border-radius: 6px; border: 1px solid var(--border);">
                <i class="${col.icon}" style="font-size: 18px; color: var(--text-primary);"></i>
                <span style="font-size: 0.9rem; color: var(--text-primary);">Selected: ${col.icon}</span>
            </div>
        `;
    } else {
        iconPreview.innerHTML = '';
    }
    
    openModal('editColumnModal');
    setTimeout(() => document.getElementById('editColumnName').focus(), 100);
}

function saveEditColumn() {
    const columns = getColumns();
    if (editingColumnIndex === null || editingColumnIndex < 0 || editingColumnIndex >= columns.length) return;
    
    const newName = document.getElementById('editColumnName').value.trim();
    const iconInput = document.getElementById('editColumnIcon');
    const newIcon = iconInput.value.trim() || '';
    const colorPalette = document.getElementById('editColumnColorPalette');
    const selectedColor = colorPalette.querySelector('.color-swatch.active');
    const newColor = selectedColor ? selectedColor.dataset.color : '#6b7280';
    
    if (!newName) {
        showToast('Please enter a column name', 'error');
        return;
    }
    
    const oldCol = columns[editingColumnIndex];
    const newId = generateColumnId(newName);
    
    // Check for duplicate (excluding current)
    if (columns.some((c, i) => i !== editingColumnIndex && c.id === newId)) {
        showToast('Column name already exists', 'error');
        return;
    }
    
    // Update column
    columns[editingColumnIndex].name = newName;
    columns[editingColumnIndex].color = newColor;
    columns[editingColumnIndex].icon = newIcon;
    const oldId = oldCol.id;
    columns[editingColumnIndex].id = newId;
    
    // Update all projects using this column
    if (oldId !== newId) {
        const projects = getProjects();
        projects.forEach(p => {
            if (p.status === oldId) p.status = newId;
        });
        saveProjects(projects);
    }
    
    saveColumns(columns);
    renderColumnList();
    updateStatusDropdowns();
    renderKanbanBoard();
    closeModal('editColumnModal');
    editingColumnIndex = null;
    showToast('Column updated', 'success');
}

function deleteColumn(index) {
    const columns = getColumns();
    if (index < 0 || index >= columns.length) return;
    
    // Cannot delete first or last column
    if (index === 0 || index === columns.length - 1) {
        showToast('Cannot delete first or last column', 'error');
        return;
    }
    
    if (columns.length <= 2) {
        showToast('Need at least 2 columns', 'error');
        return;
    }
    
    const col = columns[index];
    const projects = getProjects();
    const usageCount = projects.filter(p => p.status === col.id).length;
    
    if (usageCount > 0) {
        showToast(`Cannot delete - used by ${usageCount} project${usageCount > 1 ? 's' : ''}`, 'error');
        return;
    }
    
    showConfirm(`Delete column "${col.name}"?`, () => {
        columns.splice(index, 1);
        saveColumns(columns);
        renderColumnList();
        updateStatusDropdowns();
        renderKanbanBoard();
        showToast('Column deleted', 'success');
    });
}

function updateStatusDropdowns() {
    const columns = getColumns();
    const selects = [document.getElementById('projectStatus')];
    
    selects.forEach(select => {
        if (!select) return;
        const current = select.value;
        select.innerHTML = '';
        columns.forEach(col => {
            const option = document.createElement('option');
            option.value = col.id;
            option.textContent = col.name;
            select.appendChild(option);
        });
        // Restore selection if still valid
        if (columns.find(c => c.id === current)) {
            select.value = current;
        }
    });
}

// ============================================
// Sync Module - GitHub Gist Backend
// ============================================

// Auto Sync Check on Load
async function checkAutoSync() {
    const cfg = getSyncConfig();
    if (!cfg.gistId || !cfg.token) return;
    
    let attempts = 0;
    let gistData = null;
    
    while (attempts < 3) {
        try {
            const gist = await gistRequest('GET', cfg.gistId, cfg.token);
            const file = gist.files[cfg.fileName || 'kanban-sync.json'];
            if (file && file.content) {
                gistData = JSON.parse(file.content);
                break;
            }
        } catch (error) {
            attempts++;
            console.log(`Sync check attempt ${attempts} failed:`, error);
            if (attempts < 3) await new Promise(r => setTimeout(r, 1000));
        }
    }
    
    if (!gistData) {
        console.warn('Failed to connect to sync after 3 attempts');
        showToast('Sync unavailable - connection failed', 'warning');
        return;
    }
    
    const localData = getAllKanbanData();
    
    // Compare hash
    const cloudHash = hashData(gistData);
    const localHash = hashData(localData);
    
    if (cloudHash === localHash) {
        showToast('Your data is up to date with sync data on GitHub', 'success');
        return;
    }
    
    const cloudTime = gistData.syncTimestamp ? new Date(gistData.syncTimestamp) : new Date(0);
    const localTime = localData.syncTimestamp ? new Date(localData.syncTimestamp) : new Date(0);
    
    const msgEl = document.getElementById('syncCheckMessage');
    const detailsEl = document.getElementById('syncCheckDetails');
    const actionsEl = document.getElementById('syncCheckActions');
    
    msgEl.textContent = `Do you want to sync with "${cfg.fileName || 'kanban-sync.json'}"?`;
    detailsEl.innerHTML = `
        <div><strong>Cloud last update:</strong> ${cloudTime.toLocaleString()}</div>
        <div><strong>Local last update:</strong> ${localTime.toLocaleString()}</div>
    `;
    actionsEl.style.display = 'flex';
    
    openModal('syncCheckModal');
}

function hashData(data) {
    const str = JSON.stringify({
        projects: data.projects || [],
        tasks: data.tasks || [],
        categories: data.categories || [],
        keyPersons: data.keyPersons || [],
        columns: data.columns || []
    });
    
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return hash.toString(36);
}

const SYNC_STORAGE_KEY = 'kanban_sync_config';
let autoSaveIntervalId = null;
let lastSyncedDataHash = null;

function getSyncConfig() {
    try { return JSON.parse(localStorage.getItem(SYNC_STORAGE_KEY)) || {}; } 
    catch(e) { return {}; }
}

function saveSyncConfig(config) {
    localStorage.setItem(SYNC_STORAGE_KEY, JSON.stringify(config));
}

function getAllKanbanData() {
    const settings = getSettings();
    return {
        projects: getProjects(),
        tasks: getTasks(),
        categories: getCategories(),
        keyPersons: getKeyPersons(),
        settings: settings,
        columns: getColumns(),
        syncTimestamp: settings.syncTimestamp || new Date().toISOString()
    };
}

function setAllKanbanData(data) {
    if (data.projects) saveProjects(data.projects);
    if (data.tasks) saveTasks(data.tasks);
    if (data.categories) saveCategories(data.categories);
    if (data.keyPersons) saveKeyPersons(data.keyPersons);
    if (data.settings) {
        const updatedSettings = { ...data.settings, syncTimestamp: data.syncTimestamp };
        saveSettings(updatedSettings);
    } else if (data.syncTimestamp) {
        const currentSettings = getSettings();
        saveSettings({ ...currentSettings, syncTimestamp: data.syncTimestamp });
    }
    if (data.columns) saveColumns(data.columns);
}

function mergeKanbanData(data) {
    if (data.projects) {
        const existing = getProjects();
        const merged = [...existing];
        data.projects.forEach(newProj => {
            const idx = merged.findIndex(p => p.id === newProj.id);
            if (idx >= 0) merged[idx] = newProj;
            else merged.push(newProj);
        });
        saveProjects(merged);
    }
    if (data.tasks) {
        const existing = getTasks();
        const merged = [...existing];
        data.tasks.forEach(newTask => {
            const idx = merged.findIndex(t => t.id === newTask.id);
            if (idx >= 0) merged[idx] = newTask;
            else merged.push(newTask);
        });
        saveTasks(merged);
    }
    if (data.categories) saveCategories(data.categories);
    if (data.keyPersons) saveKeyPersons(data.keyPersons);
    if (data.settings) {
        const updatedSettings = { ...data.settings, syncTimestamp: data.syncTimestamp };
        saveSettings(updatedSettings);
    } else if (data.syncTimestamp) {
        const currentSettings = getSettings();
        saveSettings({ ...currentSettings, syncTimestamp: data.syncTimestamp });
    }
    if (data.columns) saveColumns(data.columns);
}

async function gistRequest(method, gistId, token, content = null, fileName = 'kanban-sync.json') {
    // Check if running from file:// protocol
    if (window.location.protocol === 'file:') {
        throw new Error('Sync requires HTTP server. Run: npx serve or python -m http.server');
    }
    
    const url = `https://api.github.com/gists/${gistId}`;
    const options = {
        method: method,
        headers: {
            'Authorization': `token ${token}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json'
        }
    };
    
    if (content !== null) {
        const files = {};
        files[fileName] = {
            content: JSON.stringify(content, null, 2)
        };
        options.body = JSON.stringify({ files });
    }
    
    const response = await fetch(url, options);
    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || `HTTP ${response.status}`);
    }
    return response.json();
}

async function testSyncConnection(gistId, token, fileName = 'kanban-sync.json') {
    try {
        const gist = await gistRequest('GET', gistId, token);
        if (!gist.files[fileName]) {
            throw new Error(`Gist must contain a file named "${fileName}"`);
        }
        return { success: true, owner: gist.owner?.login || 'unknown' };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

async function pushToGist(gistId, token, fileName = 'kanban-sync.json') {
    const data = getAllKanbanData();
    const currentSettings = getSettings();
    currentSettings.syncTimestamp = data.syncTimestamp;
    saveSettings(currentSettings);
    
    await gistRequest('PATCH', gistId, token, data, fileName);
    const config = getSyncConfig();
    config.lastSync = new Date().toISOString();
    config.lastAction = 'push';
    saveSyncConfig(config);
    
    // Store hash of synced data
    lastSyncedDataHash = hashData(data);
    
    return data.syncTimestamp;
}

async function autoSaveToGist() {
    const cfg = getSyncConfig();
    if (!cfg.gistId || !cfg.token || !cfg.autoSaveInterval || cfg.autoSaveInterval === 0) {
        return;
    }
    
    // Check if data has changed
    const currentData = getAllKanbanData();
    const currentHash = hashData(currentData);
    
    if (lastSyncedDataHash === currentHash) {
        console.log('Auto-save skipped: no changes detected');
        return;
    }
    
    try {
        // Flash save button green
        flashSaveButton();
        
        await pushToGist(cfg.gistId, cfg.token, cfg.fileName || 'kanban-sync.json');
        console.log('Auto-save successful');
        
        // Update both header and settings displays
        updateHeaderInfo();
        updateLastSyncDisplay();
    } catch (error) {
        console.error('Auto-save failed:', error);
        showWarningBanner(`Auto-save failed: ${error.message}`, 'warning');
    }
}

function flashSaveButton() {
    const btn = document.getElementById('btnManualSave');
    if (!btn) return;
    
    btn.classList.add('flash-green');
    setTimeout(() => {
        btn.classList.remove('flash-green');
    }, 5000);
}

function startAutoSave() {
    stopAutoSave();
    const cfg = getSyncConfig();
    if (cfg.autoSaveInterval && cfg.autoSaveInterval > 0) {
        const intervalMs = cfg.autoSaveInterval * 60 * 1000;
        autoSaveIntervalId = setInterval(autoSaveToGist, intervalMs);
        console.log(`Auto-save started: every ${cfg.autoSaveInterval} minutes`);
    }
}

function stopAutoSave() {
    if (autoSaveIntervalId) {
        clearInterval(autoSaveIntervalId);
        autoSaveIntervalId = null;
        console.log('Auto-save stopped');
    }
}

function showWarningBanner(message, type = 'warning') {
    const banner = document.getElementById('warningBanner');
    const text = document.getElementById('warningText');
    if (banner && text) {
        text.textContent = message;
        banner.style.display = 'flex';
        banner.className = type === 'error' ? 'overdue-banner' : 'warning-banner';
    }
}

async function manualSave() {
    const cfg = getSyncConfig();
    
    try {
        // Save to localStorage
        saveData(STORAGE_KEYS.PROJECTS, getProjects());
        saveData(STORAGE_KEYS.TASKS, getTasks());
        
        // If GitHub configured, sync to cloud
        if (cfg.gistId && cfg.token) {
            showToast('Saving to cloud...', 'info');
            await pushToGist(cfg.gistId, cfg.token);
            showToast('Saved successfully!', 'success');
            updateLastSyncDisplay();
        } else {
            showToast('Saved locally', 'success');
        }
    } catch (error) {
        console.error('Save failed:', error);
        if (error.message.includes('HTTP')) {
            showWarningBanner('Connection Issue: Unable to sync to GitHub', 'error');
            showToast('Saved locally, cloud sync failed', 'warning');
        } else if (error.message.includes('Gist')) {
            showWarningBanner('GitHub Gist error: ' + error.message, 'error');
            showToast('Saved locally, cloud sync failed', 'warning');
        } else {
            showWarningBanner('Save error: ' + error.message, 'error');
            showToast('Save failed', 'error');
        }
    }
}

function updateLastSyncDisplay() {
    const cfg = getSyncConfig();
    const lastSyncEl = document.getElementById('lastSyncTime');
    if (lastSyncEl && cfg.lastSync) {
        const syncDate = new Date(cfg.lastSync);
        const formattedTime = syncDate.toLocaleString('en-GB', { 
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric', 
            hour: '2-digit', 
            minute: '2-digit',
            second: '2-digit'
        });
        lastSyncEl.textContent = `Last sync: ${formattedTime} (${cfg.lastAction || 'unknown'})`;
    }
}

async function pullFromGist(gistId, token, fileName = 'kanban-sync.json', merge = false) {
    const gist = await gistRequest('GET', gistId, token);
    const file = gist.files[fileName];
    if (!file || !file.content) {
        throw new Error(`No sync data found in Gist (file: ${fileName})`);
    }
    const data = JSON.parse(file.content);
    if (!data.projects && !data.tasks) {
        throw new Error('Invalid sync data format');
    }
    
    if (merge) {
        mergeKanbanData(data);
    } else {
        Object.values(STORAGE_KEYS).forEach(k => { if (k !== STORAGE_KEYS.SYNC_CONFIG) localStorage.removeItem(k); });
        setAllKanbanData(data);
    }
    
    const config = getSyncConfig();
    config.lastSync = new Date().toISOString();
    config.lastAction = merge ? 'pull-merge' : 'pull-replace';
    saveSyncConfig(config);
    return data.syncTimestamp;
}

function initSyncUI() {
    const config = getSyncConfig();
    const gistIdInput = document.getElementById('syncGistId');
    const tokenInput = document.getElementById('syncGistToken');
    const fileNameInput = document.getElementById('syncFileName');
    const autoSaveSelect = document.getElementById('autoSaveInterval');
    const actionsSection = document.getElementById('syncActionsSection');
    
    if (gistIdInput && config.gistId) gistIdInput.value = config.gistId;
    if (tokenInput && config.token) tokenInput.value = config.token;
    if (fileNameInput && config.fileName) fileNameInput.value = config.fileName;
    if (autoSaveSelect && config.autoSaveInterval !== undefined) {
        autoSaveSelect.value = config.autoSaveInterval || 0;
    }
    
    if (config.gistId && config.token) {
        actionsSection.style.display = 'block';
    }
    
    updateLastSyncDisplay();
    
    if (window._syncUIInitialized) return;
    window._syncUIInitialized = true;
    
    // Test Connection
    document.getElementById('testSyncConnection')?.addEventListener('click', async () => {
        const gistId = gistIdInput.value.trim();
        const token = tokenInput.value.trim();
        const fileName = fileNameInput.value.trim() || 'kanban-sync.json';
        const statusEl = document.getElementById('syncStatus');
        
        if (!gistId || !token) {
            statusEl.style.display = 'block';
            statusEl.style.background = 'var(--danger)';
            statusEl.style.color = 'white';
            statusEl.textContent = '❌ Please enter both Gist ID and Token';
            return;
        }
        
        statusEl.style.display = 'block';
        statusEl.style.background = 'var(--bg-tertiary)';
        statusEl.style.color = 'var(--text)';
        statusEl.textContent = '⏳ Testing connection...';
        
        const result = await testSyncConnection(gistId, token, fileName);
        
        if (result.success) {
            statusEl.style.background = 'var(--success)';
            statusEl.style.color = 'white';
            statusEl.textContent = `✅ Connected! Gist owner: ${result.owner}`;
        } else {
            statusEl.style.background = 'var(--danger)';
            statusEl.style.color = 'white';
            statusEl.textContent = `❌ Failed: ${result.error}`;
        }
    });
    
    // Save Settings
    document.getElementById('saveSyncSettings')?.addEventListener('click', () => {
        const gistId = gistIdInput.value.trim();
        const token = tokenInput.value.trim();
        const fileName = fileNameInput.value.trim() || 'kanban-sync.json';
        const autoSaveInterval = parseInt(autoSaveSelect.value);
        
        if (!gistId || !token) {
            showToast('Please enter both Gist ID and Token', 'error');
            return;
        }
        
        saveSyncConfig({ ...config, gistId, token, fileName, autoSaveInterval });
        actionsSection.style.display = 'block';
        
        // Restart auto-save with new interval
        startAutoSave();
        
        if (autoSaveInterval > 0) {
            showToast(`Sync settings saved. Auto-save every ${autoSaveInterval} min`, 'success');
        } else {
            showToast('Sync settings saved. Auto-save disabled', 'success');
        }
    });
    
    // Push
    document.getElementById('syncPush')?.addEventListener('click', () => {
        const cfg = getSyncConfig();
        if (!cfg.gistId || !cfg.token) {
            showToast('Please configure sync settings first', 'error');
            return;
        }
        openModal('pushConfirmModal');
    });
    
    // Pull Replace
    document.getElementById('syncPullReplace')?.addEventListener('click', () => {
        const cfg = getSyncConfig();
        if (!cfg.gistId || !cfg.token) {
            showToast('Please configure sync settings first', 'error');
            return;
        }
        openModal('pullReplaceConfirmModal');
    });
    
    // Pull Merge
    document.getElementById('syncPullMerge')?.addEventListener('click', () => {
        const cfg = getSyncConfig();
        if (!cfg.gistId || !cfg.token) {
            showToast('Please configure sync settings first', 'error');
            return;
        }
        openModal('pullMergeConfirmModal');
    });
    
    // Clear Sync Settings - open modal
    document.getElementById('clearSyncSettings')?.addEventListener('click', () => {
        openModal('clearSyncModal');
    });
}

// Clear Sync Modal handlers
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('closeClearSyncModal')?.addEventListener('click', () => closeModal('clearSyncModal'));
    document.getElementById('cancelClearSync')?.addEventListener('click', () => closeModal('clearSyncModal'));
    document.querySelector('#clearSyncModal .modal-overlay')?.addEventListener('click', () => closeModal('clearSyncModal'));
    
    document.getElementById('confirmClearSync')?.addEventListener('click', () => {
        const gistIdInput = document.getElementById('syncGistId');
        const tokenInput = document.getElementById('syncGistToken');
        const fileNameInput = document.getElementById('syncFileName');
        const actionsSection = document.getElementById('syncActionsSection');
        
        localStorage.removeItem(SYNC_STORAGE_KEY);
        if (gistIdInput) gistIdInput.value = '';
        if (tokenInput) tokenInput.value = '';
        if (fileNameInput) fileNameInput.value = 'kanban-sync.json';
        if (actionsSection) actionsSection.style.display = 'none';
        
        const lastSyncEl = document.getElementById('lastSyncTime');
        if (lastSyncEl) lastSyncEl.textContent = 'Last sync: Never';
        
        const statusEl = document.getElementById('syncStatus');
        if (statusEl) statusEl.style.display = 'none';
        
        updateHeaderInfo();
        showToast('Sync settings cleared', 'success');
        closeModal('clearSyncModal');
    });
    
    // Sync Check Modal
    document.getElementById('closeSyncCheckModal')?.addEventListener('click', () => closeModal('syncCheckModal'));
    document.querySelector('#syncCheckModal .modal-overlay')?.addEventListener('click', () => closeModal('syncCheckModal'));
    document.getElementById('syncCheckNo')?.addEventListener('click', () => closeModal('syncCheckModal'));
    
    document.getElementById('syncCheckPullReplace')?.addEventListener('click', async () => {
        closeModal('syncCheckModal');
        const cfg = getSyncConfig();
        try {
            showToast('Pulling data...', 'info');
            await pullFromGist(cfg.gistId, cfg.token, cfg.fileName || 'kanban-sync.json', false);
            showToast('Data pulled successfully! Refreshing...', 'success');
            setTimeout(() => location.reload(), 1000);
        } catch (error) {
            showToast(`Pull failed: ${error.message}`, 'error');
        }
    });
    
    document.getElementById('syncCheckPullMerge')?.addEventListener('click', async () => {
        closeModal('syncCheckModal');
        const cfg = getSyncConfig();
        try {
            showToast('Merging data...', 'info');
            await pullFromGist(cfg.gistId, cfg.token, cfg.fileName || 'kanban-sync.json', true);
            showToast('Data merged successfully! Refreshing...', 'success');
            setTimeout(() => location.reload(), 1000);
        } catch (error) {
            showToast(`Merge failed: ${error.message}`, 'error');
        }
    });
    
    // Push Confirm Modal
    document.getElementById('closePushConfirmModal')?.addEventListener('click', () => closeModal('pushConfirmModal'));
    document.querySelector('#pushConfirmModal .modal-overlay')?.addEventListener('click', () => closeModal('pushConfirmModal'));
    document.getElementById('cancelPush')?.addEventListener('click', () => closeModal('pushConfirmModal'));
    
    document.getElementById('confirmPush')?.addEventListener('click', async () => {
        closeModal('pushConfirmModal');
        const cfg = getSyncConfig();
        try {
            showToast('Pushing data...', 'info');
            await pushToGist(cfg.gistId, cfg.token, cfg.fileName || 'kanban-sync.json');
            updateLastSyncDisplay();
            updateHeaderInfo();
            showToast('Data pushed successfully!', 'success');
        } catch (error) {
            if (error.message.includes('HTTP')) {
                showWarningBanner('Connection Issue: Unable to sync to GitHub', 'error');
            } else if (error.message.includes('Gist')) {
                showWarningBanner('GitHub Gist error: ' + error.message, 'error');
            }
            showToast(`Push failed: ${error.message}`, 'error');
        }
    });
    
    // Pull Replace Confirm Modal
    document.getElementById('closePullReplaceConfirmModal')?.addEventListener('click', () => closeModal('pullReplaceConfirmModal'));
    document.querySelector('#pullReplaceConfirmModal .modal-overlay')?.addEventListener('click', () => closeModal('pullReplaceConfirmModal'));
    document.getElementById('cancelPullReplace')?.addEventListener('click', () => closeModal('pullReplaceConfirmModal'));
    
    document.getElementById('confirmPullReplace')?.addEventListener('click', async () => {
        closeModal('pullReplaceConfirmModal');
        const cfg = getSyncConfig();
        try {
            showToast('Pulling data...', 'info');
            await pullFromGist(cfg.gistId, cfg.token, cfg.fileName || 'kanban-sync.json', false);
            updateLastSyncDisplay();
            showToast('Data pulled successfully! Refreshing...', 'success');
            setTimeout(() => location.reload(), 1000);
        } catch (error) {
            if (error.message.includes('HTTP')) {
                showWarningBanner('Connection Issue: Unable to sync from GitHub', 'error');
            } else if (error.message.includes('Gist')) {
                showWarningBanner('GitHub Gist error: ' + error.message, 'error');
            }
            showToast(`Pull failed: ${error.message}`, 'error');
        }
    });
    
    // Pull Merge Confirm Modal
    document.getElementById('closePullMergeConfirmModal')?.addEventListener('click', () => closeModal('pullMergeConfirmModal'));
    document.querySelector('#pullMergeConfirmModal .modal-overlay')?.addEventListener('click', () => closeModal('pullMergeConfirmModal'));
    document.getElementById('cancelPullMerge')?.addEventListener('click', () => closeModal('pullMergeConfirmModal'));
    
    document.getElementById('confirmPullMerge')?.addEventListener('click', async () => {
        closeModal('pullMergeConfirmModal');
        const cfg = getSyncConfig();
        try {
            showToast('Merging data...', 'info');
            await pullFromGist(cfg.gistId, cfg.token, cfg.fileName || 'kanban-sync.json', true);
            updateLastSyncDisplay();
            showToast('Data merged successfully! Refreshing...', 'success');
            setTimeout(() => location.reload(), 1000);
        } catch (error) {
            if (error.message.includes('HTTP')) {
                showWarningBanner('Connection Issue: Unable to sync from GitHub', 'error');
            } else if (error.message.includes('Gist')) {
                showWarningBanner('GitHub Gist error: ' + error.message, 'error');
            }
            showToast(`Merge failed: ${error.message}`, 'error');
        }
    });
});

// Initialize sync UI when settings modal opens
document.addEventListener('DOMContentLoaded', () => {
    // Start auto-save if configured
    startAutoSave();
    
    // Hook manual save button
    const manualSaveBtn = document.getElementById('btnManualSave');
    if (manualSaveBtn) {
        manualSaveBtn.addEventListener('click', manualSave);
    }
    
    // Hook into settings button to init sync UI
    const settingsBtn = document.getElementById('btnSettings');
    if (settingsBtn) {
        settingsBtn.addEventListener('click', () => {
            // Small delay to ensure modal is open
            setTimeout(initSyncUI, 50);
        });
    }
    
    // Also init if settings tab is clicked directly
    document.addEventListener('click', (e) => {
        if (e.target.matches('[data-tab="sync"]')) {
            setTimeout(initSyncUI, 50);
        }
    });
});
