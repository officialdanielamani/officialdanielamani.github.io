// ============================================
// Kanban Board Application
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
    font: 'default'
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
function saveData(key, data) { localStorage.setItem(key, JSON.stringify(data)); }
function getProjects() { return loadData(STORAGE_KEYS.PROJECTS) || []; }
function getTasks() { return loadData(STORAGE_KEYS.TASKS) || []; }
function getCategories() { return loadData(STORAGE_KEYS.CATEGORIES) || []; }
function getKeyPersons() { return loadData(STORAGE_KEYS.KEY_PERSONS) || []; }
function getSettings() { return loadData(STORAGE_KEYS.SETTINGS) || { ...DEFAULT_SETTINGS }; }
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
        .replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>')
        .replace(/__([^_]+)__/g,'<strong>$1</strong>')
        .replace(/\*([^*]+)\*/g,'<em>$1</em>')
        .replace(/_([^_]+)_/g,'<em>$1</em>')
        .replace(/\n/g,'<br>');
}

// Toast
function showToast(message, type = '') {
    const t = document.getElementById('toast');
    t.textContent = message;
    t.className = 'toast show' + (type ? ' ' + type : '');
    setTimeout(() => { t.className = 'toast'; }, 3000);
}

// Get Category Color
function getCategoryColor(name) {
    if (!name) return null;
    const c = getCategories().find(c => c.name === name);
    return c ? c.color : null;
}

// UI Rendering
function renderKanbanBoard() {
    const projects = getProjects(), tasks = getTasks();
    Object.keys(STATUS_LABELS).forEach(status => {
        const container = document.getElementById(`cards-${status}`);
        if (container) container.innerHTML = '';
    });
    const byStatus = {};
    Object.keys(STATUS_LABELS).forEach(s => { byStatus[s] = projects.filter(p => p.status === s); });
    Object.keys(STATUS_LABELS).forEach(status => {
        const sorted = sortProjects(byStatus[status], tasks);
        const container = document.getElementById(`cards-${status}`);
        const count = document.getElementById(`count-${status}`);
        if (count) count.textContent = sorted.length;
        if (container) {
            if (sorted.length === 0) {
                container.innerHTML = '<div class="empty-state"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="9" x2="15" y2="15"/><line x1="15" y1="9" x2="9" y2="15"/></svg><p>No projects</p></div>';
            } else {
                sorted.forEach(p => container.appendChild(createProjectCard(p, tasks)));
            }
        }
    });
    setupDragAndDrop();
    checkWarnings();
    checkAutoDelete();
}

function createProjectCard(project, allTasks) {
    const tasks = sortTasksByDueDate(allTasks.filter(t => t.projectId === project.id));
    const done = tasks.filter(t => t.completed);
    const hasLate = tasks.some(t => !t.completed && isOverdue(t.dueDate));
    const isLate = hasLate || isOverdue(project.dueDate);
    const card = document.createElement('div');
    card.className = `project-card${isLate ? ' late' : ''}`;
    card.dataset.projectId = project.id;
    card.draggable = true;
    const color = getCategoryColor(project.category);
    if (color && !isLate) { card.style.borderColor = color; card.dataset.categoryColor = color; }
    const pClass = ['','low','medium','high','urgent'][project.priority] || 'low';
    card.innerHTML = `
        <div class="card-header">
            <span class="card-header-title" title="${project.title}">${project.title}</span>
            <span class="card-header-date">${formatDate(project.dueDate) || 'No date'}</span>
        </div>
        <div class="card-body">
            <div class="card-meta">
                <span class="card-progress">${done.length}/${tasks.length} Done</span>
                <span class="card-priority ${pClass}">${PRIORITY_LABELS[project.priority]}</span>
                <button class="card-info-btn" data-action="project-info" data-id="${project.id}">Info</button>
                <button class="card-collapse-btn" data-action="toggle-collapse">${tasks.length > 0 ? '▼' : ''}</button>
            </div>
            <ul class="task-list">${tasks.map(t => createTaskItem(t)).join('')}</ul>
        </div>`;
    card.querySelector('.card-header').addEventListener('click', e => { if (!e.target.closest('button')) showProjectDetail(project.id); });
    card.querySelector('[data-action="project-info"]').addEventListener('click', e => { e.stopPropagation(); showProjectDetail(project.id); });
    const cb = card.querySelector('[data-action="toggle-collapse"]');
    if (cb && tasks.length > 0) cb.addEventListener('click', e => { e.stopPropagation(); card.classList.toggle('collapsed'); cb.textContent = card.classList.contains('collapsed') ? '▶' : '▼'; });
    card.querySelectorAll('.task-checkbox').forEach(c => c.addEventListener('change', e => { e.stopPropagation(); toggleTaskCompletion(e.target.dataset.taskId); }));
    card.querySelectorAll('.task-title').forEach(t => t.addEventListener('click', e => { e.stopPropagation(); showTaskDetail(e.target.closest('.task-item').querySelector('.task-checkbox').dataset.taskId); }));
    card.querySelectorAll('.task-info-btn').forEach(b => b.addEventListener('click', e => { e.stopPropagation(); showTaskDetail(e.target.dataset.taskId); }));
    return card;
}

function createTaskItem(task) {
    const late = !task.completed && isOverdue(task.dueDate);
    const tc = `task-title${task.completed ? ' completed' : ''}${late ? ' late' : ''}`;
    const dc = `task-due-date${late ? ' late' : ''}`;
    return `<li class="task-item">
        <input type="checkbox" class="task-checkbox" data-task-id="${task.id}" ${task.completed ? 'checked' : ''}>
        <span class="${tc}">${task.title}</span>
        ${task.dueDate ? `<span class="${dc}">${formatDateShort(task.dueDate)}</span>` : ''}
        <button class="task-info-btn" data-task-id="${task.id}">Info</button>
    </li>`;
}

function checkWarnings() {
    const s = getSettings(), tasks = getTasks(), projects = getProjects();
    const warn = tasks.filter(t => {
        if (t.completed) return false;
        const p = projects.find(x => x.id === t.projectId);
        if (p && p.status === 'done') return false;
        return isDueSoon(t.dueDate, s.warningDays) || isOverdue(t.dueDate);
    });
    const banner = document.getElementById('warningBanner'), text = document.getElementById('warningText');
    if (warn.length > 0) {
        const od = warn.filter(t => isOverdue(t.dueDate)).length, soon = warn.length - od;
        let msg = '';
        if (od > 0 && soon > 0) msg = `${od} overdue task(s) and ${soon} task(s) due within ${s.warningDays} days!`;
        else if (od > 0) msg = `${od} task(s) are overdue!`;
        else msg = `${soon} task(s) due within ${s.warningDays} days!`;
        text.textContent = msg;
        banner.style.display = 'flex';
    } else banner.style.display = 'none';
}

// Drag and Drop
let draggedCard = null;
function setupDragAndDrop() {
    document.querySelectorAll('.project-card').forEach(c => { c.addEventListener('dragstart', handleDragStart); c.addEventListener('dragend', handleDragEnd); });
    document.querySelectorAll('.column-cards').forEach(c => { c.addEventListener('dragover', handleDragOver); c.addEventListener('dragleave', handleDragLeave); c.addEventListener('drop', handleDrop); });
}
function handleDragStart(e) {
    draggedCard = e.target.closest('.project-card');
    if (draggedCard) { draggedCard.classList.add('dragging'); e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', draggedCard.dataset.projectId); }
}
function handleDragEnd(e) {
    if (draggedCard) draggedCard.classList.remove('dragging');
    draggedCard = null;
    document.querySelectorAll('.kanban-column').forEach(c => c.classList.remove('drag-over', 'drag-invalid'));
}
function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    const col = e.target.closest('.kanban-column');
    if (!col || !draggedCard) return;
    const status = col.dataset.status, pid = draggedCard.dataset.projectId;
    if (status === 'done') {
        const tasks = getTasks().filter(t => t.projectId === pid);
        if (tasks.length > 0 && !tasks.every(t => t.completed)) { col.classList.add('drag-invalid'); col.classList.remove('drag-over'); return; }
    }
    col.classList.add('drag-over'); col.classList.remove('drag-invalid');
}
function handleDragLeave(e) {
    const col = e.target.closest('.kanban-column');
    if (col && !col.contains(e.relatedTarget)) col.classList.remove('drag-over', 'drag-invalid');
}
function handleDrop(e) {
    e.preventDefault();
    const col = e.target.closest('.kanban-column');
    if (!col || !draggedCard) return;
    const status = col.dataset.status, pid = draggedCard.dataset.projectId;
    if (status === 'done') {
        const tasks = getTasks().filter(t => t.projectId === pid);
        if (tasks.length > 0 && !tasks.every(t => t.completed)) { showToast('All tasks must be completed before moving to Done', 'error'); col.classList.remove('drag-over', 'drag-invalid'); return; }
    }
    const projects = getProjects(), p = projects.find(x => x.id === pid);
    if (p) {
        const old = p.status;
        p.status = status;
        if (status === 'done' && old !== 'done') p.completedAt = new Date().toISOString();
        else if (status !== 'done') p.completedAt = null;
        saveProjects(projects);
        renderKanbanBoard();
        showToast(`Project moved to ${STATUS_LABELS[status]}`, 'success');
    }
    col.classList.remove('drag-over', 'drag-invalid');
}

// CRUD Operations
function createProject(data) {
    const projects = getProjects();
    projects.push({ id: generateId(), title: data.title, priority: parseInt(data.priority), status: data.status, category: data.category || '', keyPerson: data.keyPerson || '', dueDate: data.dueDate || '', details: data.details || '', createdAt: new Date().toISOString(), completedAt: null });
    saveProjects(projects);
    renderKanbanBoard();
}
function updateProject(id, data) {
    const projects = getProjects(), i = projects.findIndex(p => p.id === id);
    if (i !== -1) {
        const old = projects[i].status;
        projects[i] = { ...projects[i], title: data.title, priority: parseInt(data.priority), status: data.status, category: data.category || '', keyPerson: data.keyPerson || '', dueDate: data.dueDate || '', details: data.details || '', updatedAt: new Date().toISOString() };
        if (data.status === 'done' && old !== 'done') projects[i].completedAt = new Date().toISOString();
        else if (data.status !== 'done') projects[i].completedAt = null;
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
    const tasks = getTasks();
    tasks.push({ id: generateId(), title: data.title, projectId: data.projectId, keyPerson: data.keyPerson || '', dueDate: data.dueDate || '', details: data.details || '', completed: false, createdAt: new Date().toISOString() });
    saveTasks(tasks);
    renderKanbanBoard();
}
function updateTask(id, data) {
    const tasks = getTasks(), i = tasks.findIndex(t => t.id === id);
    if (i !== -1) { tasks[i] = { ...tasks[i], title: data.title, projectId: data.projectId, keyPerson: data.keyPerson || '', dueDate: data.dueDate || '', details: data.details || '', updatedAt: new Date().toISOString() }; saveTasks(tasks); renderKanbanBoard(); }
}
function deleteTask(id) { saveTasks(getTasks().filter(t => t.id !== id)); renderKanbanBoard(); }
function toggleTaskCompletion(id) {
    const tasks = getTasks(), t = tasks.find(x => x.id === id);
    if (t) { t.completed = !t.completed; t.updatedAt = new Date().toISOString(); saveTasks(tasks); renderKanbanBoard(); }
}

// Category & Key Person Management
let selectedCategoryColor = DEFAULT_CATEGORY_COLOR;
function addCategory(name, color) {
    if (!name.trim()) return false;
    const cats = getCategories();
    if (cats.find(c => c.name === name.trim())) return false;
    cats.push({ name: name.trim(), color: color || DEFAULT_CATEGORY_COLOR });
    saveCategories(cats);
    renderCategoryList();
    updateCategoryDropdowns();
    return true;
}
function removeCategory(name) { saveCategories(getCategories().filter(c => c.name !== name)); renderCategoryList(); updateCategoryDropdowns(); }
function addKeyPerson(name) {
    if (!name.trim()) return false;
    const kp = getKeyPersons();
    if (kp.includes(name.trim())) return false;
    kp.push(name.trim());
    saveKeyPersons(kp);
    renderKeyPersonList();
    updateKeyPersonDropdowns();
    return true;
}
function removeKeyPerson(name) { saveKeyPersons(getKeyPersons().filter(k => k !== name)); renderKeyPersonList(); updateKeyPersonDropdowns(); }
function renderCategoryList() {
    const list = document.getElementById('categoryList'), cats = getCategories();
    list.innerHTML = cats.length === 0 ? '<li style="color:var(--text-muted);text-align:center;">No categories added</li>' : cats.map(c => `<li><div class="category-info"><span class="category-color" style="background:${c.color}"></span><span>${c.name}</span></div><button class="delete-item" data-category="${c.name}"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button></li>`).join('');
    list.querySelectorAll('.delete-item').forEach(b => b.addEventListener('click', () => removeCategory(b.dataset.category)));
}
function renderKeyPersonList() {
    const list = document.getElementById('keyPersonList'), kp = getKeyPersons();
    list.innerHTML = kp.length === 0 ? '<li style="color:var(--text-muted);text-align:center;">No key persons added</li>' : kp.map(p => `<li><span>${p}</span><button class="delete-item" data-person="${p}"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button></li>`).join('');
    list.querySelectorAll('.delete-item').forEach(b => b.addEventListener('click', () => removeKeyPerson(b.dataset.person)));
}
function updateCategoryDropdowns() {
    const cats = getCategories();
    document.querySelectorAll('#projectCategory').forEach(s => {
        const v = s.value;
        s.innerHTML = '<option value="">-- None --</option>' + cats.map(c => `<option value="${c.name}">${c.name}</option>`).join('');
        if (cats.find(c => c.name === v)) s.value = v;
    });
}
function updateKeyPersonDropdowns() {
    const kp = getKeyPersons();
    document.querySelectorAll('#projectKeyPerson, #taskKeyPerson').forEach(s => {
        const v = s.value;
        s.innerHTML = '<option value="">-- None --</option>' + kp.map(p => `<option value="${p}">${p}</option>`).join('');
        if (kp.includes(v)) s.value = v;
    });
}
function updateProjectDropdown(preSelected = null) {
    const projects = getProjects(), s = document.getElementById('taskProject'), v = preSelected || s.value;
    s.innerHTML = '<option value="">-- Select Project --</option>' + projects.map(p => `<option value="${p.id}">${p.title}</option>`).join('');
    if (projects.find(p => p.id === v)) s.value = v;
}

// Modal Management
function openModal(id) { document.getElementById(id).classList.add('active'); }
function closeModal(id) { document.getElementById(id).classList.remove('active'); }
let currentEditingProjectId = null;
function openProjectModal(projectId = null) {
    document.getElementById('projectForm').reset();
    updateCategoryDropdowns();
    updateKeyPersonDropdowns();
    currentEditingProjectId = projectId;
    const del = document.getElementById('deleteProject'), add = document.getElementById('addTaskFromProject');
    if (projectId) {
        const p = getProjects().find(x => x.id === projectId);
        if (p) {
            document.getElementById('projectModalTitle').textContent = 'Edit Project';
            del.style.display = 'block'; add.style.display = 'block';
            document.getElementById('projectId').value = p.id;
            document.getElementById('projectTitle').value = p.title;
            document.getElementById('projectPriority').value = p.priority;
            document.getElementById('projectStatus').value = p.status;
            document.getElementById('projectCategory').value = p.category;
            document.getElementById('projectKeyPerson').value = p.keyPerson;
            document.getElementById('projectDueDate').value = formatDateForInput(p.dueDate);
            document.getElementById('projectDetails').value = p.details;
        }
    } else {
        document.getElementById('projectModalTitle').textContent = 'New Project';
        del.style.display = 'none'; add.style.display = 'none';
        document.getElementById('projectId').value = '';
    }
    openModal('projectModal');
}
function openTaskModal(taskId = null, preProjectId = null) {
    document.getElementById('taskForm').reset();
    updateProjectDropdown(preProjectId);
    updateKeyPersonDropdowns();
    const del = document.getElementById('deleteTask');
    if (taskId) {
        const t = getTasks().find(x => x.id === taskId);
        if (t) {
            document.getElementById('taskModalTitle').textContent = 'Edit Task';
            del.style.display = 'block';
            document.getElementById('taskId').value = t.id;
            document.getElementById('taskTitle').value = t.title;
            document.getElementById('taskProject').value = t.projectId;
            document.getElementById('taskKeyPerson').value = t.keyPerson;
            document.getElementById('taskDueDate').value = formatDateForInput(t.dueDate);
            document.getElementById('taskDetails').value = t.details;
        }
    } else {
        document.getElementById('taskModalTitle').textContent = 'New Task';
        del.style.display = 'none';
        document.getElementById('taskId').value = '';
        if (preProjectId) document.getElementById('taskProject').value = preProjectId;
    }
    openModal('taskModal');
}

function showProjectDetail(projectId) {
    const p = getProjects().find(x => x.id === projectId);
    if (!p) return;
    const tasks = getTasks().filter(t => t.projectId === projectId), color = getCategoryColor(p.category);
    document.getElementById('detailContent').innerHTML = `
        <div class="detail-row"><span class="detail-label">ID</span><span class="detail-value">${p.id}</span></div>
        <div class="detail-row"><span class="detail-label">Title</span><span class="detail-value">${p.title}</span></div>
        <div class="detail-row"><span class="detail-label">Status</span><span class="detail-value">${STATUS_LABELS[p.status]}</span></div>
        <div class="detail-row"><span class="detail-label">Priority</span><span class="detail-value">${PRIORITY_LABELS[p.priority]}</span></div>
        <div class="detail-row"><span class="detail-label">Category</span><span class="detail-value">${p.category ? `<span style="display:inline-flex;align-items:center;gap:6px;"><span style="width:12px;height:12px;border-radius:3px;background:${color || DEFAULT_CATEGORY_COLOR}"></span>${p.category}</span>` : '-'}</span></div>
        <div class="detail-row"><span class="detail-label">Key Person</span><span class="detail-value">${p.keyPerson || '-'}</span></div>
        <div class="detail-row"><span class="detail-label">Due Date</span><span class="detail-value">${formatDate(p.dueDate) || '-'}</span></div>
        <div class="detail-row"><span class="detail-label">Tasks</span><span class="detail-value">${tasks.filter(t => t.completed).length}/${tasks.length} completed</span></div>
        ${p.details ? `<div class="detail-row" style="flex-direction:column;"><span class="detail-label">Details</span><div class="detail-markdown">${parseMarkdown(p.details)}</div></div>` : ''}`;
    document.getElementById('detailTitle').textContent = 'Project Details';
    document.getElementById('editDetail').onclick = () => { closeModal('detailModal'); openProjectModal(projectId); };
    openModal('detailModal');
}
function showTaskDetail(taskId) {
    const t = getTasks().find(x => x.id === taskId);
    if (!t) return;
    const p = getProjects().find(x => x.id === t.projectId);
    document.getElementById('detailContent').innerHTML = `
        <div class="detail-row"><span class="detail-label">ID</span><span class="detail-value">${t.id}</span></div>
        <div class="detail-row"><span class="detail-label">Title</span><span class="detail-value">${t.title}</span></div>
        <div class="detail-row"><span class="detail-label">Project</span><span class="detail-value">${p ? p.title : 'Unknown'}</span></div>
        <div class="detail-row"><span class="detail-label">Status</span><span class="detail-value">${t.completed ? 'Completed' : 'Pending'}</span></div>
        <div class="detail-row"><span class="detail-label">Key Person</span><span class="detail-value">${t.keyPerson || '-'}</span></div>
        <div class="detail-row"><span class="detail-label">Due Date</span><span class="detail-value">${formatDate(t.dueDate) || '-'}</span></div>
        ${t.details ? `<div class="detail-row" style="flex-direction:column;"><span class="detail-label">Details</span><div class="detail-markdown">${parseMarkdown(t.details)}</div></div>` : ''}`;
    document.getElementById('detailTitle').textContent = 'Task Details';
    document.getElementById('editDetail').onclick = () => { closeModal('detailModal'); openTaskModal(taskId); };
    openModal('detailModal');
}

// Confirm Dialog
let confirmCallback = null;
function showConfirm(message, callback) {
    document.getElementById('confirmMessage').textContent = message;
    confirmCallback = callback;
    openModal('confirmModal');
}

// Settings
function applyTheme(theme) {
    document.body.dataset.theme = theme;
    const s = getSettings(); s.theme = theme; saveSettings(s);
    document.querySelectorAll('.theme-btn').forEach(b => b.classList.toggle('active', b.dataset.theme === theme));
}
function applyFont(font) {
    document.body.dataset.font = font;
    const s = getSettings(); s.font = font; saveSettings(s);
    document.querySelectorAll('.font-btn').forEach(b => b.classList.toggle('active', b.dataset.font === font));
}
function exportData() {
    const data = { projects: getProjects(), tasks: getTasks(), categories: getCategories(), keyPersons: getKeyPersons(), settings: getSettings(), exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob), a = document.createElement('a');
    a.href = url; a.download = `kanban-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
    showToast('Data exported successfully', 'success');
}
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
            renderKanbanBoard(); renderCategoryList(); renderKeyPersonList(); updateCategoryDropdowns(); updateKeyPersonDropdowns();
            showToast('Data imported successfully', 'success');
        } catch (err) { showToast('Error importing data', 'error'); console.error(err); }
    };
    reader.readAsText(file);
}
function clearAllData() {
    Object.values(STORAGE_KEYS).forEach(k => { if (k !== STORAGE_KEYS.SETTINGS) localStorage.removeItem(k); });
    renderKanbanBoard(); renderCategoryList(); renderKeyPersonList(); updateCategoryDropdowns(); updateKeyPersonDropdowns();
    showToast('All data cleared', 'success');
}

// Event Listeners
function setupEventListeners() {
    document.getElementById('btnAddProject').addEventListener('click', () => openProjectModal());
    document.getElementById('btnAddTask').addEventListener('click', () => openTaskModal());
    document.getElementById('btnSettings').addEventListener('click', () => { renderCategoryList(); renderKeyPersonList(); openModal('settingsModal'); });
    document.getElementById('closeWarning').addEventListener('click', () => { document.getElementById('warningBanner').style.display = 'none'; });
    
    // Project Modal
    document.getElementById('closeProjectModal').addEventListener('click', () => closeModal('projectModal'));
    document.getElementById('cancelProject').addEventListener('click', () => closeModal('projectModal'));
    document.querySelector('#projectModal .modal-overlay').addEventListener('click', () => closeModal('projectModal'));
    document.getElementById('addTaskFromProject').addEventListener('click', () => { const pid = document.getElementById('projectId').value; closeModal('projectModal'); openTaskModal(null, pid); });
    document.getElementById('saveProject').addEventListener('click', () => {
        const form = document.getElementById('projectForm');
        if (!form.checkValidity()) { form.reportValidity(); return; }
        const id = document.getElementById('projectId').value;
        const data = { title: document.getElementById('projectTitle').value, priority: document.getElementById('projectPriority').value, status: document.getElementById('projectStatus').value, category: document.getElementById('projectCategory').value, keyPerson: document.getElementById('projectKeyPerson').value, dueDate: document.getElementById('projectDueDate').value, details: document.getElementById('projectDetails').value };
        if (id) { updateProject(id, data); showToast('Project updated', 'success'); }
        else { createProject(data); showToast('Project created', 'success'); }
        closeModal('projectModal');
    });
    document.getElementById('deleteProject').addEventListener('click', () => {
        const id = document.getElementById('projectId').value, p = getProjects().find(x => x.id === id), tc = getTasks().filter(t => t.projectId === id).length;
        showConfirm(`Delete project "${p.title}"? This will also delete ${tc} associated task(s).`, () => { deleteProject(id); closeModal('projectModal'); showToast('Project deleted', 'success'); });
    });
    
    // Task Modal
    document.getElementById('closeTaskModal').addEventListener('click', () => closeModal('taskModal'));
    document.getElementById('cancelTask').addEventListener('click', () => closeModal('taskModal'));
    document.querySelector('#taskModal .modal-overlay').addEventListener('click', () => closeModal('taskModal'));
    document.getElementById('saveTask').addEventListener('click', () => {
        const form = document.getElementById('taskForm');
        if (!form.checkValidity()) { form.reportValidity(); return; }
        const id = document.getElementById('taskId').value;
        const data = { title: document.getElementById('taskTitle').value, projectId: document.getElementById('taskProject').value, keyPerson: document.getElementById('taskKeyPerson').value, dueDate: document.getElementById('taskDueDate').value, details: document.getElementById('taskDetails').value };
        if (id) { updateTask(id, data); showToast('Task updated', 'success'); }
        else { createTask(data); showToast('Task created', 'success'); }
        closeModal('taskModal');
    });
    document.getElementById('deleteTask').addEventListener('click', () => {
        const id = document.getElementById('taskId').value, t = getTasks().find(x => x.id === id);
        showConfirm(`Delete task "${t.title}"?`, () => { deleteTask(id); closeModal('taskModal'); showToast('Task deleted', 'success'); });
    });
    
    // Settings Modal
    document.getElementById('closeSettingsModal').addEventListener('click', () => closeModal('settingsModal'));
    document.getElementById('closeSettings').addEventListener('click', () => closeModal('settingsModal'));
    document.querySelector('#settingsModal .modal-overlay').addEventListener('click', () => closeModal('settingsModal'));
    document.querySelectorAll('.settings-tab').forEach(t => t.addEventListener('click', () => {
        document.querySelectorAll('.settings-tab').forEach(x => x.classList.remove('active'));
        document.querySelectorAll('.settings-panel').forEach(x => x.classList.remove('active'));
        t.classList.add('active');
        document.getElementById(`panel-${t.dataset.tab}`).classList.add('active');
    }));
    document.getElementById('warningDays').addEventListener('change', e => { const s = getSettings(); s.warningDays = parseInt(e.target.value) || 3; saveSettings(s); checkWarnings(); });
    document.getElementById('autoDeleteDays').addEventListener('change', e => { const s = getSettings(); s.autoDeleteDays = parseInt(e.target.value) || 0; saveSettings(s); });
    document.querySelectorAll('.theme-btn').forEach(b => b.addEventListener('click', () => applyTheme(b.dataset.theme)));
    document.querySelectorAll('.font-btn').forEach(b => b.addEventListener('click', () => applyFont(b.dataset.font)));
    document.querySelectorAll('#categoryColorPalette .color-swatch').forEach(s => s.addEventListener('click', () => {
        document.querySelectorAll('#categoryColorPalette .color-swatch').forEach(x => x.classList.remove('active'));
        s.classList.add('active');
        selectedCategoryColor = s.dataset.color;
    }));
    document.getElementById('addCategory').addEventListener('click', () => { const i = document.getElementById('newCategory'); if (addCategory(i.value, selectedCategoryColor)) { i.value = ''; showToast('Category added', 'success'); } });
    document.getElementById('newCategory').addEventListener('keypress', e => { if (e.key === 'Enter') { e.preventDefault(); const i = document.getElementById('newCategory'); if (addCategory(i.value, selectedCategoryColor)) { i.value = ''; showToast('Category added', 'success'); } } });
    document.getElementById('addKeyPerson').addEventListener('click', () => { const i = document.getElementById('newKeyPerson'); if (addKeyPerson(i.value)) { i.value = ''; showToast('Key person added', 'success'); } });
    document.getElementById('newKeyPerson').addEventListener('keypress', e => { if (e.key === 'Enter') { e.preventDefault(); const i = document.getElementById('newKeyPerson'); if (addKeyPerson(i.value)) { i.value = ''; showToast('Key person added', 'success'); } } });
    document.getElementById('exportData').addEventListener('click', exportData);
    document.getElementById('importData').addEventListener('click', () => document.getElementById('importFile').click());
    document.getElementById('importFile').addEventListener('change', e => { if (e.target.files.length > 0) { importData(e.target.files[0]); e.target.value = ''; } });
    document.getElementById('clearAllData').addEventListener('click', () => showConfirm('Are you sure you want to delete ALL data? This cannot be undone!', clearAllData));
    
    // Detail Modal
    document.getElementById('closeDetailModal').addEventListener('click', () => closeModal('detailModal'));
    document.getElementById('closeDetail').addEventListener('click', () => closeModal('detailModal'));
    document.querySelector('#detailModal .modal-overlay').addEventListener('click', () => closeModal('detailModal'));
    
    // Confirm Modal
    document.getElementById('confirmCancel').addEventListener('click', () => { confirmCallback = null; closeModal('confirmModal'); });
    document.getElementById('confirmOk').addEventListener('click', () => { if (confirmCallback) { confirmCallback(); confirmCallback = null; } closeModal('confirmModal'); });
    document.querySelector('#confirmModal .modal-overlay').addEventListener('click', () => { confirmCallback = null; closeModal('confirmModal'); });
}

// Migration
function migrateCategories() {
    const cats = loadData(STORAGE_KEYS.CATEGORIES);
    if (cats && cats.length > 0 && typeof cats[0] === 'string') {
        saveCategories(cats.map(n => ({ name: n, color: DEFAULT_CATEGORY_COLOR })));
    }
}

// Init
function init() {
    migrateCategories();
    const s = getSettings();
    applyTheme(s.theme);
    applyFont(s.font);
    document.getElementById('warningDays').value = s.warningDays;
    document.getElementById('autoDeleteDays').value = s.autoDeleteDays || 0;
    setupEventListeners();
    renderKanbanBoard();
    updateCategoryDropdowns();
    updateKeyPersonDropdowns();
}

document.addEventListener('DOMContentLoaded', init);
