// ============================================
// Kanban Board Application - Core Module
// Data Management & Utilities
// ============================================

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

// FIXED: Only update timestamp when data actually changes
function saveData(key, data) { 
    try {
        const newDataStr = JSON.stringify(data);
        const existingDataStr = localStorage.getItem(key);
        
        // Only update localStorage if data actually changed
        if (newDataStr !== existingDataStr) {
            localStorage.setItem(key, newDataStr);
            updateLastSave();
        }
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
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB');
}
function formatDateLong(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}
function formatDateTime(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleString('en-GB', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
    });
}
function getDaysUntil(dateStr) {
    if (!dateStr) return null;
    const now = new Date();
    now.setHours(0,0,0,0);
    const target = new Date(dateStr);
    target.setHours(0,0,0,0);
    return Math.ceil((target - now)/(1000*60*60*24));
}
function getDaysSinceCompletion(completedAt) {
    if (!completedAt) return 0;
    return Math.floor((Date.now() - new Date(completedAt).getTime())/(1000*60*60*24));
}
function getPriorityBadgeClass(pri) {
    switch(pri) {
        case 4: return 'priority-urgent';
        case 3: return 'priority-high';
        case 2: return 'priority-medium';
        case 1: default: return 'priority-low';
    }
}
function shouldShowStartWarning(project) {
    if (!project.startDate) return false;
    const s = getSettings();
    const days = getDaysUntil(project.startDate);
    return days <= s.warningDaysBeforeStart && days >= 0;
}
function shouldShowDueWarning(project) {
    if (!project.dueDate) return false;
    const s = getSettings();
    const days = getDaysUntil(project.dueDate);
    return days <= s.warningDays && days >= 0;
}
function shouldShowOverdue(project) {
    if (!project.dueDate) return false;
    const days = getDaysUntil(project.dueDate);
    return days < 0;
}

// Project Filtering
function filterProjects(projects) {
    const cat = document.getElementById('filterCategory')?.value;
    const status = document.getElementById('filterStatus')?.value;
    const pri = document.getElementById('filterPriority')?.value;
    const key = document.getElementById('filterKeyPerson')?.value;
    const search = document.getElementById('filterSearch')?.value.toLowerCase().trim();
    
    return projects.filter(p => {
        if (cat && cat !== 'all' && p.category !== cat) return false;
        if (status && status !== 'all' && p.status !== status) return false;
        if (pri && pri !== 'all' && p.priority !== parseInt(pri)) return false;
        if (key && key !== 'all' && (!p.keyPersons || !p.keyPersons.includes(key))) return false;
        if (search && !p.title.toLowerCase().includes(search)) return false;
        return true;
    });
}

// Project/Task Counts
function getProjectTaskCounts(projectId) {
    const tasks = getTasks().filter(t => t.projectId === projectId);
    const completed = tasks.filter(t => t.completed).length;
    return { total: tasks.length, completed };
}
function getAllTaskCounts() {
    const tasks = getTasks();
    const completed = tasks.filter(t => t.completed).length;
    return { total: tasks.length, completed };
}

// Auto-move project on completion
function checkProjectAutoMove() {
    const settings = getSettings();
    if (!settings.autoMoveProject) return;
    
    const projects = getProjects();
    const tasks = getTasks();
    const columns = getColumns();
    const firstColumn = columns[0].id;
    const lastColumn = columns[columns.length - 1].id;
    
    let needsUpdate = false;
    for (const project of projects) {
        const projectTasks = tasks.filter(t => t.projectId === project.id);
        const hasIncomplete = projectTasks.some(t => !t.completed);
        const allComplete = projectTasks.length > 0 && projectTasks.every(t => t.completed);
        
        if (allComplete && project.status !== lastColumn) {
            project.status = lastColumn;
            project.completedAt = new Date().toISOString();
            needsUpdate = true;
        }
        else if (hasIncomplete && project.status === lastColumn) {
            project.status = firstColumn;
            delete project.completedAt;
            needsUpdate = true;
        }
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

// Project Sorting
function sortProjects(projects) {
    const columns = getColumns();
    const columnOrder = columns.map(c => c.id);
    
    return projects.sort((a, b) => {
        // First sort by column/status order
        const aColIndex = columnOrder.indexOf(a.status);
        const bColIndex = columnOrder.indexOf(b.status);
        if (aColIndex !== bColIndex) {
            return aColIndex - bColIndex;
        }
        
        // Within same column, sort by priority (higher first)
        if (a.priority !== b.priority) {
            return b.priority - a.priority;
        }
        
        // Then by due date (earlier first, null last)
        if (a.dueDate && b.dueDate) {
            return new Date(a.dueDate) - new Date(b.dueDate);
        }
        if (a.dueDate) return -1;
        if (b.dueDate) return 1;
        
        // Finally by title alphabetically
        return a.title.localeCompare(b.title);
    });
}