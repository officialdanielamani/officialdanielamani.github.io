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
            document.getElementById('projectTaskStartDate').value = '';
            document.getElementById('projectTaskDueDate').value = '';
            const addBtn = document.getElementById('addProjectTask');
            addBtn.textContent = 'Add';
            addBtn.style.background = '';
            editingTaskIndex = null;
        }
        
        // Refresh board when closing settings modal
        if (id === 'settingsModal') {
            renderKanbanBoard();
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
function showConfirm(message, callback, title = 'Confirm', confirmText = 'OK', isHtml = false) {
    const messageEl = document.getElementById('confirmMessage');
    if (isHtml) {
        messageEl.innerHTML = message;
    } else {
        messageEl.textContent = message;
    }
    
    const modalTitle = document.querySelector('#confirmModal .modal-header h2');
    if (modalTitle) {
        modalTitle.textContent = title;
    }
    
    const confirmBtn = document.getElementById('confirmAction');
    if (confirmBtn) {
        confirmBtn.textContent = confirmText;
    }
    
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
    
    // Show/hide buttons
    const addTaskBtn = document.getElementById('addTaskFromDetail');
    const editBtn = document.getElementById('editDetail');
    
    if (type === 'project') {
        if (addTaskBtn) addTaskBtn.style.display = 'inline-flex';
    } else {
        if (addTaskBtn) addTaskBtn.style.display = 'none';
    }
    if (editBtn) editBtn.style.display = 'inline-flex';
    
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
            startDate: t.startDate,
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
                <div class="project-task-dates">
                    ${task.startDate ? '<span>Start: ' + formatDate(task.startDate) + '</span>' : ''}
                    ${task.startDate && task.dueDate ? ' | ' : ''}
                    ${task.dueDate ? '<span>Due: ' + formatDate(task.dueDate) + '</span>' : ''}
                    ${!task.startDate && !task.dueDate ? '<span style="color: var(--text-muted);">No dates</span>' : ''}
                </div>
            </div>
            <div class="project-task-actions">
                ${task.id ? '<button type="button" class="project-task-info" data-index="' + index + '">Info</button>' : ''}
                <button type="button" class="project-task-edit" data-index="${index}">Edit</button>
                <button type="button" class="project-task-delete" data-index="${index}">Delete</button>
            </div>
        </div>
    `).join('');
    
    // Add event listeners
    list.querySelectorAll('.project-task-info').forEach(btn => {
        btn.addEventListener('click', () => {
            const idx = parseInt(btn.dataset.index);
            const task = tempProjectTasks[idx];
            if (task.id) {
                showDetail('task', task.id);
            }
        });
    });
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
    const startDateInput = document.getElementById('projectTaskStartDate');
    const dueDateInput = document.getElementById('projectTaskDueDate');
    
    const title = titleInput.value.trim();
    const startDate = startDateInput.value;
    const dueDate = dueDateInput.value;
    
    if (!title) {
        showToast('Please enter a task name', 'error');
        return;
    }
    
    // Validate dates
    if (startDate && dueDate && !validateDates(startDate, dueDate)) {
        showToast('Start date cannot be after due date', 'error');
        return;
    }
    
    const taskData = {
        title: title,
        startDate: startDate || null,
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
    startDateInput.value = '';
    dueDateInput.value = '';
    
    // Reset button
    const addBtn = document.getElementById('addProjectTask');
    addBtn.textContent = 'Add';
    addBtn.style.background = '';
    
    renderProjectTasksList();
}

// Edit a temporary task
function editProjectTask(index) {
    const task = tempProjectTasks[index];
    document.getElementById('projectTaskTitle').value = task.title;
    document.getElementById('projectTaskStartDate').value = task.startDate || '';
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
        document.getElementById('projectTaskStartDate').value = '';
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

// Show project task info
function showProjectTaskInfo(index) {
    const task = tempProjectTasks[index];
    if (!task) return;
    
    document.getElementById('detailTitle').textContent = 'Task Details';
    
    // Show/hide buttons - hide Add Task and Edit for temp tasks
    const addTaskBtn = document.getElementById('addTaskFromDetail');
    const editBtn = document.getElementById('editDetail');
    if (addTaskBtn) addTaskBtn.style.display = 'none';
    if (editBtn) editBtn.style.display = 'none';
    
    let html = `<div class="detail-row"><div class="detail-label">Title:</div><div class="detail-value"><strong>${escapeHtml(task.title)}</strong></div></div>`;
    html += `<div class="detail-row"><div class="detail-label">Status:</div><div class="detail-value">Not yet saved</div></div>`;
    
    if (task.startDate) html += `<div class="detail-row"><div class="detail-label">Start Date:</div><div class="detail-value">${formatDate(task.startDate)}</div></div>`;
    if (task.dueDate) html += `<div class="detail-row"><div class="detail-label">Due Date:</div><div class="detail-value">${formatDate(task.dueDate)}</div></div>`;
    if (task.details) html += `<div class="detail-row"><div class="detail-label">Details:</div><div class="detail-value"><div class="detail-markdown">${parseMarkdown(task.details)}</div></div></div>`;
    
    document.getElementById('detailContent').innerHTML = html;
    
    // Store that we're showing temp task
    currentDetailType = 'temp-task';
    currentDetailId = index;
    
    openModal('detailModal');
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
                startDate: tempTask.startDate || '',
                dueDate: tempTask.dueDate || '',
                completed: false,
                keyPersons: [],
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
                    task.startDate = tempTask.startDate || '';
                    task.dueDate = tempTask.dueDate || '';
                }
            } else {
                // Add new task
                updatedTasks.push({
                    id: generateId(),
                    title: tempTask.title,
                    projectId: id,
                    startDate: tempTask.startDate || '',
                    dueDate: tempTask.dueDate || '',
                    completed: false,
                    keyPersons: [],
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
