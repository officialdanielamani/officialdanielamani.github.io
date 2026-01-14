// ============================================
// Kanban Board Application - Core Module
// Data Management & Utilities
// ============================================

const STORAGE_KEYS = {
    PROJECTS: 'kanban_projects',
    TASKS: 'kanban_tasks',
    CATEGORIES: 'kanban_categories',
    KEY_PERSONS: 'kanban_keypersons',
    SETTINGS: 'kanban_settings'
};

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
function saveProjects(p) { saveData(STORAGE_KEYS.PROJECTS, p); }
function saveTasks(t) { saveData(STORAGE_KEYS.TASKS, t); }
function saveCategories(c) { saveData(STORAGE_KEYS.CATEGORIES, c); }
function saveKeyPersons(k) { saveData(STORAGE_KEYS.KEY_PERSONS, k); }
function saveSettings(s) { saveData(STORAGE_KEYS.SETTINGS, s); }
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
    
    const projectTasks = getTasks().filter(t => t.projectId === projectId);
    
    // If no tasks, do nothing
    if (projectTasks.length === 0) return;
    
    const allCompleted = projectTasks.every(t => t.completed);
    const hasIncomplete = projectTasks.some(t => !t.completed);
    
    let needsUpdate = false;
    
    // If all tasks are done, move to Done
    if (allCompleted && project.status !== 'done') {
        project.status = 'done';
        project.completedAt = new Date().toISOString();
        needsUpdate = true;
    }
    // If has incomplete tasks and currently in Done, move to Backlog
    else if (hasIncomplete && project.status === 'done') {
        project.status = 'backlog';
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
function migrateCategories() {
    const cats = loadData(STORAGE_KEYS.CATEGORIES);
    if (cats && cats.length > 0 && typeof cats[0] === 'string') {
        saveCategories(cats.map(n => ({ name: n, color: DEFAULT_CATEGORY_COLOR })));
    }
}
// ============================================
// Kanban Board Application - UI Module
// Rendering & Display Functions
// ============================================

let selectedCategoryColor = DEFAULT_CATEGORY_COLOR;
let confirmCallback = null;
let currentDetailType = null;
let currentDetailId = null;

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
    if (m) { m.classList.remove('active'); document.body.style.overflow = ''; }
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
    const sorted = sortProjects(projects, tasks);
    
    ['backlog', 'not-started', 'in-progress', 'testing', 'done'].forEach(status => {
        const container = document.getElementById(`cards-${status}`);
        const count = document.getElementById(`count-${status}`);
        const filtered = sorted.filter(p => p.status === status);
        
        count.textContent = filtered.length;
        container.innerHTML = '';
        
        if (filtered.length === 0) {
            container.innerHTML = '<div class="empty-state"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="9" x2="9" y2="9.01"/><line x1="15" y1="9" x2="15" y2="9.01"/><line x1="9" y1="15" x2="15" y2="15"/></svg><p>No projects</p></div>';
        } else {
            filtered.forEach(p => container.appendChild(createProjectCard(p, tasks, categories)));
        }
    });
    
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
            ${project.keyPerson ? `<div class="card-person"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>${escapeHtml(project.keyPerson)}</div>` : ''}
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
            // Check if trying to move to Done with incomplete tasks
            if (newStatus === 'done') {
                const projectTasks = tasks.filter(t => t.projectId === id);
                const hasIncompleteTasks = projectTasks.some(t => !t.completed);
                
                if (hasIncompleteTasks) {
                    showToast('Cannot move to Done - project has incomplete tasks', 'error');
                    renderKanbanBoard(); // Reset card position
                    return;
                }
            }
            
            p.status = newStatus;
            if (newStatus === 'done' && !p.completedAt) p.completedAt = new Date().toISOString();
            else if (newStatus !== 'done') delete p.completedAt;
            saveProjects(projects);
            renderKanbanBoard();
            showToast('Project moved', 'success');
        }
    });
});
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
        if (data.keyPerson) html += `<div class="detail-row"><div class="detail-label">Key Person:</div><div class="detail-value">${escapeHtml(data.keyPerson)}</div></div>`;
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
        if (data.keyPerson) html += `<div class="detail-row"><div class="detail-label">Key Person:</div><div class="detail-value">${escapeHtml(data.keyPerson)}</div></div>`;
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
    
    if (id) {
        const p = getProjects().find(x => x.id === id);
        if (!p) return;
        
        title.textContent = 'Edit Project';
        document.getElementById('projectId').value = p.id;
        document.getElementById('projectTitle').value = p.title;
        document.getElementById('projectPriority').value = p.priority;
        document.getElementById('projectStatus').value = p.status;
        document.getElementById('projectCategory').value = p.category || '';
        document.getElementById('projectKeyPerson').value = p.keyPerson || '';
        document.getElementById('projectStartDate').value = formatDateForInput(p.startDate);
        document.getElementById('projectDueDate').value = formatDateForInput(p.dueDate);
        document.getElementById('projectDetails').value = p.details || '';
        
        deleteBtn.style.display = 'inline-flex';
    } else {
        title.textContent = 'New Project';
        deleteBtn.style.display = 'none';
    }
    
    openModal('projectModal');
}

function openTaskModal(id = null, projectId = null) {
    const title = document.getElementById('taskModalTitle');
    const form = document.getElementById('taskForm');
    const deleteBtn = document.getElementById('deleteTask');
    
    document.getElementById('taskId').value = '';
    
    // Update dropdown first to populate options
    updateProjectDropdown();
    
    if (id) {
        const t = getTasks().find(x => x.id === id);
        if (!t) return;
        
        title.textContent = 'Edit Task';
        document.getElementById('taskId').value = t.id;
        document.getElementById('taskTitle').value = t.title;
        document.getElementById('taskProject').value = t.projectId;
        document.getElementById('taskKeyPerson').value = t.keyPerson || '';
        document.getElementById('taskStartDate').value = formatDateForInput(t.startDate);
        document.getElementById('taskDueDate').value = formatDateForInput(t.dueDate);
        document.getElementById('taskDetails').value = t.details || '';
        
        deleteBtn.style.display = 'inline-flex';
    } else {
        title.textContent = 'New Task';
        form.reset();
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
    projects.push({ id: generateId(), ...data, priority: parseInt(data.priority) });
    saveProjects(projects);
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
        const usageCount = projects.filter(p => p.keyPerson === k).length + tasks.filter(t => t.keyPerson === k).length;
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

function editKeyPerson(index) {
    const kps = getKeyPersons();
    if (index < 0 || index >= kps.length) return;
    
    const oldName = kps[index];
    const newName = prompt(`Edit key person name:`, oldName);
    
    if (newName && newName.trim() && newName.trim() !== oldName) {
        const trimmedName = newName.trim();
        
        // Check for duplicates
        if (kps.some((k, i) => i !== index && k === trimmedName)) {
            showToast('Key person already exists', 'error');
            return;
        }
        
        // Update the name
        kps[index] = trimmedName;
        
        // Update all projects and tasks using this key person
        const projects = getProjects();
        const tasks = getTasks();
        let updated = false;
        
        projects.forEach(p => {
            if (p.keyPerson === oldName) {
                p.keyPerson = trimmedName;
                updated = true;
            }
        });
        
        tasks.forEach(t => {
            if (t.keyPerson === oldName) {
                t.keyPerson = trimmedName;
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
    }
}

function deleteKeyPerson(index) {
    const kps = getKeyPersons();
    if (index < 0 || index >= kps.length) return;
    
    const name = kps[index];
    const projects = getProjects();
    const tasks = getTasks();
    const usageCount = projects.filter(p => p.keyPerson === name).length + tasks.filter(t => t.keyPerson === name).length;
    
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

function updateKeyPersonDropdowns() {
    const kps = getKeyPersons();
    const selects = [document.getElementById('projectKeyPerson'), document.getElementById('taskKeyPerson')];
    selects.forEach(s => {
        const current = s.value;
        s.innerHTML = '<option value="">-- None --</option>';
        kps.forEach(k => s.innerHTML += `<option value="${escapeHtml(k)}">${escapeHtml(k)}</option>`);
        s.value = current;
    });
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
    renderKanbanBoard(); renderCategoryList(); renderKeyPersonList(); updateCategoryDropdowns(); updateKeyPersonDropdowns();
    updateStorageInfo();
    showToast('All data cleared', 'success');
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
            keyPerson: document.getElementById('projectKeyPerson').value, 
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
            keyPerson: document.getElementById('taskKeyPerson').value, 
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
    document.getElementById('clearAllData').addEventListener('click', () => 
        showConfirm('Are you sure you want to delete ALL data? This cannot be undone!', clearAllData)
    );
    
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

// Update last save timestamp
function updateLastSave() {
    localStorage.setItem('kanban_lastSave', new Date().toISOString());
    updateHeaderInfo();
}

// Initialize Application
function init() {
    // Migrate old data formats
    migrateCategories();
    
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

// Start application when DOM is ready
document.addEventListener('DOMContentLoaded', init);
