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
    COLUMNS: 'kanban_columns'
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
    { id: 'backlog', name: 'Backlog' },
    { id: 'not-started', name: 'Not Started' },
    { id: 'in-progress', name: 'In Progress' },
    { id: 'testing', name: 'Testing' },
    { id: 'done', name: 'Done' }
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
        
        colDiv.innerHTML = `
            <div class="column-header">
                <h2>${escapeHtml(column.name)}</h2>
                <span class="column-count">${filtered.length}</span>
            </div>
            <div class="column-cards" id="cards-${column.id}"></div>
        `;
        
        board.appendChild(colDiv);
        
        const container = colDiv.querySelector('.column-cards');
        
        if (filtered.length === 0) {
            container.innerHTML = '<div class="empty-state"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="9" x2="9" y2="9.01"/><line x1="15" y1="9" x2="15" y2="9.01"/><line x1="9" y1="15" x2="15" y2="15"/></svg><p>No projects</p></div>';
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
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="6 9 12 15 18 9"></polyline>
                            </svg>
                        </button>
                    ` : ''}
                </div>
            </div>
            ${project.keyPersons && project.keyPersons.length > 0 ? `<div class="card-person"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>${project.keyPersons.map(k => escapeHtml(k)).join(', ')}</div>` : ''}
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
                <button class="btn-edit-category" data-index="${index}" title="Edit color">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                </button>
                <button class="delete-item" data-index="${index}" ${!canDelete ? 'disabled title="Cannot delete - in use by projects"' : 'title="Delete category"'}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"></path>
                    </svg>
                </button>
            </div>
        `;
        list.appendChild(li);
    });
    
    // Add event listeners for edit buttons
    document.querySelectorAll('.btn-edit-category').forEach(btn => {
        btn.addEventListener('click', () => {
            const index = parseInt(btn.dataset.index);
            editCategoryColor(index);
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

function editCategoryColor(index) {
    const cats = getCategories();
    if (index < 0 || index >= cats.length) return;
    
    const cat = cats[index];
    
    // Create a temporary color picker modal
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-overlay"></div>
        <div class="modal-content modal-small">
            <div class="modal-header">
                <h2>Edit Category Color</h2>
                <button class="btn-close" id="closeColorPicker">&times;</button>
            </div>
            <div class="modal-body">
                <p style="margin-bottom: 16px;">Select a color for <strong>${escapeHtml(cat.name)}</strong>:</p>
                <div class="color-palette" id="editCategoryColorPalette">
                    <button type="button" class="color-swatch ${cat.color === '#6b7280' ? 'active' : ''}" data-color="#6b7280" style="background:#6b7280" title="Gray"></button>
                    <button type="button" class="color-swatch ${cat.color === '#ef4444' ? 'active' : ''}" data-color="#ef4444" style="background:#ef4444" title="Red"></button>
                    <button type="button" class="color-swatch ${cat.color === '#f97316' ? 'active' : ''}" data-color="#f97316" style="background:#f97316" title="Orange"></button>
                    <button type="button" class="color-swatch ${cat.color === '#eab308' ? 'active' : ''}" data-color="#eab308" style="background:#eab308" title="Yellow"></button>
                    <button type="button" class="color-swatch ${cat.color === '#84cc16' ? 'active' : ''}" data-color="#84cc16" style="background:#84cc16" title="Lime"></button>
                    <button type="button" class="color-swatch ${cat.color === '#22c55e' ? 'active' : ''}" data-color="#22c55e" style="background:#22c55e" title="Green"></button>
                    <button type="button" class="color-swatch ${cat.color === '#14b8a6' ? 'active' : ''}" data-color="#14b8a6" style="background:#14b8a6" title="Teal"></button>
                    <button type="button" class="color-swatch ${cat.color === '#06b6d4' ? 'active' : ''}" data-color="#06b6d4" style="background:#06b6d4" title="Cyan"></button>
                    <button type="button" class="color-swatch ${cat.color === '#3b82f6' ? 'active' : ''}" data-color="#3b82f6" style="background:#3b82f6" title="Blue"></button>
                    <button type="button" class="color-swatch ${cat.color === '#6366f1' ? 'active' : ''}" data-color="#6366f1" style="background:#6366f1" title="Indigo"></button>
                    <button type="button" class="color-swatch ${cat.color === '#8b5cf6' ? 'active' : ''}" data-color="#8b5cf6" style="background:#8b5cf6" title="Purple"></button>
                    <button type="button" class="color-swatch ${cat.color === '#ec4899' ? 'active' : ''}" data-color="#ec4899" style="background:#ec4899" title="Pink"></button>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" id="cancelColorPicker">Cancel</button>
                <button class="btn btn-primary" id="saveColorPicker">Save</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
    
    let selectedColor = cat.color;
    
    // Color swatch click handlers
    modal.querySelectorAll('.color-swatch').forEach(swatch => {
        swatch.addEventListener('click', () => {
            modal.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
            swatch.classList.add('active');
            selectedColor = swatch.dataset.color;
        });
    });
    
    // Close handlers
    const closeColorPicker = () => {
        document.body.removeChild(modal);
        document.body.style.overflow = '';
    };
    
    modal.querySelector('#closeColorPicker').addEventListener('click', closeColorPicker);
    modal.querySelector('#cancelColorPicker').addEventListener('click', closeColorPicker);
    modal.querySelector('.modal-overlay').addEventListener('click', closeColorPicker);
    
    // Save handler
    modal.querySelector('#saveColorPicker').addEventListener('click', () => {
        if (selectedColor !== cat.color) {
            cats[index].color = selectedColor;
            saveCategories(cats);
            renderCategoryList();
            renderKanbanBoard(); // Refresh to show new colors
            showToast('Category color updated', 'success');
        }
        closeColorPicker();
    });
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
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                </button>
                <button class="delete-item" data-index="${index}" ${!canDelete ? 'disabled title="Cannot delete - in use"' : 'title="Delete key person"'}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"></path>
                    </svg>
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
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
                Edit
            `;
        } else {
            // Show editor
            textarea.style.display = 'block';
            preview.style.display = 'none';
            toggleBtn.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                </svg>
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
function importData(file) {
    const reader = new FileReader();
    reader.onload = e => {
        try {
            const data = JSON.parse(e.target.result);
            if (data.projects) { const ex = getProjects(); saveProjects([...ex, ...data.projects.filter(p => !ex.find(x => x.id === p.id))]); }
            if (data.tasks) { const ex = getTasks(); saveTasks([...ex, ...data.tasks.filter(t => !ex.find(x => x.id === t.id))]); }
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
            showToast('Data imported successfully', 'success');
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
    document.getElementById('btnInfo').addEventListener('click', () => {
        // Empty link - no action (placeholder for future info page)
    });
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
    
    // Footer links
    document.getElementById('backToHome').addEventListener('click', (e) => {
        e.preventDefault();
        // Empty link - no action
    });
    document.getElementById('showDocumentation').addEventListener('click', (e) => {
        e.preventDefault();
        // Empty link - no action
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
    document.getElementById('importData').addEventListener('click', () => document.getElementById('importFile').click());
    document.getElementById('importFile').addEventListener('change', e => { 
        if (e.target.files.length > 0) { 
            importData(e.target.files[0]); 
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
        
        if (isGitHubConfigured && syncCfg.lastSync) {
            // Show Last Sync with GitHub sync timestamp
            const lastSyncText = new Date(syncCfg.lastSync).toLocaleString('en-GB', { 
                day: '2-digit', 
                month: '2-digit', 
                year: 'numeric', 
                hour: '2-digit', 
                minute: '2-digit' 
            });
            headerInfo.textContent = `${settings.docName} | v${settings.docVersion} | Last Sync: ${lastSyncText}`;
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
            headerInfo.textContent = `${settings.docName} | v${settings.docVersion} | Last Save: ${lastSaveText}`;
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
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="4" y1="8" x2="20" y2="8"/><line x1="4" y1="16" x2="20" y2="16"/>
                        </svg>
                    </div>
                ` : '<div style="width: 20px;"></div>'}
                <span class="column-name">${escapeHtml(col.name)}</span>
                ${isFirst ? '<span class="column-badge">First (Backlog)</span>' : ''}
                ${isLast ? '<span class="column-badge">Last (Done)</span>' : ''}
                ${usageCount > 0 ? `<small style="color: var(--text-muted); margin-left: 8px;">(${usageCount} project${usageCount > 1 ? 's' : ''})</small>` : ''}
            </div>
            <div class="column-actions">
                <button class="btn-edit-column" data-index="${index}" title="Edit name">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                </button>
                <button class="btn-delete-column" data-index="${index}" ${!canDelete ? 'disabled' : ''} title="${!canDelete ? (isFirst || isLast ? 'Cannot delete first or last column' : columns.length <= 2 ? 'Need at least 2 columns' : 'Column in use') : 'Delete'}">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"></path>
                    </svg>
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
                    
                    items.forEach(item => {
                        const idx = parseInt(item.dataset.index);
                        newOrder.push(columns[idx]);
                    });
                    
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
    const name = input.value.trim();
    
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
    
    columns.push({ id, name });
    saveColumns(columns);
    renderColumnList();
    updateStatusDropdowns();
    renderKanbanBoard();
    input.value = '';
    showToast('Column added', 'success');
}

function editColumn(index) {
    const columns = getColumns();
    if (index < 0 || index >= columns.length) return;
    
    editingColumnIndex = index;
    document.getElementById('editColumnName').value = columns[index].name;
    openModal('editColumnModal');
    setTimeout(() => document.getElementById('editColumnName').focus(), 100);
}

function saveEditColumn() {
    const columns = getColumns();
    if (editingColumnIndex === null || editingColumnIndex < 0 || editingColumnIndex >= columns.length) return;
    
    const newName = document.getElementById('editColumnName').value.trim();
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

const SYNC_STORAGE_KEY = 'kanban_sync_config';
let autoSaveIntervalId = null;
let lastSyncedDataHash = null;

// Simple hash function for data comparison
function hashData(data) {
    const str = JSON.stringify(data);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString(36);
}

function getSyncConfig() {
    try { return JSON.parse(localStorage.getItem(SYNC_STORAGE_KEY)) || {}; } 
    catch(e) { return {}; }
}

function saveSyncConfig(config) {
    localStorage.setItem(SYNC_STORAGE_KEY, JSON.stringify(config));
}

function getAllKanbanData() {
    return {
        projects: getProjects(),
        tasks: getTasks(),
        categories: getCategories(),
        keyPersons: getKeyPersons(),
        settings: getSettings(),
        columns: getColumns(),
        syncTimestamp: new Date().toISOString()
    };
}

function setAllKanbanData(data) {
    if (data.projects) saveProjects(data.projects);
    if (data.tasks) saveTasks(data.tasks);
    if (data.categories) saveCategories(data.categories);
    if (data.keyPersons) saveKeyPersons(data.keyPersons);
    if (data.settings) saveSettings(data.settings);
    if (data.columns) saveColumns(data.columns);
}

async function gistRequest(method, gistId, token, content = null) {
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
        options.body = JSON.stringify({
            files: {
                'kanban-sync.json': {
                    content: JSON.stringify(content, null, 2)
                }
            }
        });
    }
    
    const response = await fetch(url, options);
    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || `HTTP ${response.status}`);
    }
    return response.json();
}

async function testSyncConnection(gistId, token) {
    try {
        const gist = await gistRequest('GET', gistId, token);
        if (!gist.files['kanban-sync.json']) {
            throw new Error('Gist must contain a file named "kanban-sync.json"');
        }
        return { success: true, owner: gist.owner?.login || 'unknown' };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

async function pushToGist(gistId, token) {
    const data = getAllKanbanData();
    await gistRequest('PATCH', gistId, token, data);
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
        
        await pushToGist(cfg.gistId, cfg.token);
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

async function pullFromGist(gistId, token) {
    const gist = await gistRequest('GET', gistId, token);
    const file = gist.files['kanban-sync.json'];
    if (!file || !file.content) {
        throw new Error('No sync data found in Gist');
    }
    const data = JSON.parse(file.content);
    if (!data.projects && !data.tasks) {
        throw new Error('Invalid sync data format');
    }
    setAllKanbanData(data);
    const config = getSyncConfig();
    config.lastSync = new Date().toISOString();
    config.lastAction = 'pull';
    saveSyncConfig(config);
    return data.syncTimestamp;
}

function initSyncUI() {
    const config = getSyncConfig();
    const gistIdInput = document.getElementById('syncGistId');
    const tokenInput = document.getElementById('syncGistToken');
    const autoSaveSelect = document.getElementById('autoSaveInterval');
    const actionsSection = document.getElementById('syncActionsSection');
    
    if (gistIdInput && config.gistId) gistIdInput.value = config.gistId;
    if (tokenInput && config.token) tokenInput.value = config.token;
    if (autoSaveSelect && config.autoSaveInterval !== undefined) {
        autoSaveSelect.value = config.autoSaveInterval || 0;
    }
    
    if (config.gistId && config.token) {
        actionsSection.style.display = 'block';
    }
    
    // Update sync display
    updateLastSyncDisplay();
    
    // Test Connection
    document.getElementById('testSyncConnection')?.addEventListener('click', async () => {
        const gistId = gistIdInput.value.trim();
        const token = tokenInput.value.trim();
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
        
        const result = await testSyncConnection(gistId, token);
        
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
        const autoSaveInterval = parseInt(autoSaveSelect.value);
        
        if (!gistId || !token) {
            showToast('Please enter both Gist ID and Token', 'error');
            return;
        }
        
        saveSyncConfig({ ...config, gistId, token, autoSaveInterval });
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
    document.getElementById('syncPush')?.addEventListener('click', async () => {
        const cfg = getSyncConfig();
        if (!cfg.gistId || !cfg.token) {
            showToast('Please configure sync settings first', 'error');
            return;
        }
        
        try {
            showToast('Pushing data...', 'info');
            await pushToGist(cfg.gistId, cfg.token);
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
    
    // Pull
    document.getElementById('syncPull')?.addEventListener('click', async () => {
        const cfg = getSyncConfig();
        if (!cfg.gistId || !cfg.token) {
            showToast('Please configure sync settings first', 'error');
            return;
        }
        
        if (!confirm('This will overwrite your local data with cloud data. Continue?')) {
            return;
        }
        
        try {
            showToast('Pulling data...', 'info');
            await pullFromGist(cfg.gistId, cfg.token);
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
    
    // Clear Sync Settings
    document.getElementById('clearSyncSettings')?.addEventListener('click', () => {
        if (confirm('Remove sync credentials from this device?')) {
            localStorage.removeItem(SYNC_STORAGE_KEY);
            gistIdInput.value = '';
            tokenInput.value = '';
            actionsSection.style.display = 'none';
            lastSyncEl.textContent = 'Last sync: Never';
            document.getElementById('syncStatus').style.display = 'none';
            showToast('Sync settings cleared', 'success');
        }
    });
}

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
