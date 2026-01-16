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
    warningDaysBeforeStart: 3,
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
    if (!dateStr || days === -1) return false; // -1 = disabled
    const d = new Date(dateStr); d.setHours(23,59,59,999);
    if (days === 0) {
        // Check if due date is today
        const t = new Date(); t.setHours(0,0,0,0);
        const dCopy = new Date(dateStr); dCopy.setHours(0,0,0,0);
        return dCopy.getTime() === t.getTime();
    }
    const w = new Date(); w.setDate(w.getDate() + days);
    return new Date() <= d && d <= w;
}
function isStartingSoon(dateStr, days) {
    if (!dateStr || days === -1) return false; // -1 = disabled
    const d = new Date(dateStr); d.setHours(0,0,0,0);
    const t = new Date(); t.setHours(0,0,0,0);
    if (days === 0) {
        // Check if start date is today
        return d.getTime() === t.getTime();
    }
    // Check if start date is within the next X days
    const w = new Date(); w.setDate(w.getDate() + days);
    w.setHours(23,59,59,999);
    return t <= d && d <= w;
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
