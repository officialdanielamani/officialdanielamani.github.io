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
    
    // Get boards data if available
    let boardsData = null;
    if (typeof getAllBoardsData === 'function') {
        boardsData = getAllBoardsData();
    }
    
    const data = {
        version: '1.1',
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
        columns: getColumns(),
        settings: settings
    };
    
    // Include boards data if available
    if (boardsData) {
        data.boardsData = boardsData;
    }
    
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
            
            // Handle boards data if present
            if (data.boardsData && typeof setAllBoardsData === 'function') {
                setAllBoardsData(data.boardsData);
            }
            
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
                Object.values(STORAGE_KEYS).forEach(k => { if (k !== STORAGE_KEYS.SETTINGS && k !== STORAGE_KEYS.SYNC_CONFIG && k !== STORAGE_KEYS.BOARDS && k !== STORAGE_KEYS.ACTIVE_BOARD) localStorage.removeItem(k); });
                if (data.projects) saveProjects(data.projects);
                if (data.tasks) saveTasks(data.tasks);
            }
            
            if (data.categories) {
                const ex = getCategories();
                const all = [...ex, ...data.categories.filter(c => !ex.find(x => (typeof x === 'string' ? x : x.name) === (typeof c === 'string' ? c : c.name)))].map(c => typeof c === 'string' ? { name: c, color: DEFAULT_CATEGORY_COLOR } : c);
                saveCategories(all);
            }
            if (data.keyPersons) { const ex = getKeyPersons(); saveKeyPersons([...ex, ...data.keyPersons.filter(k => !ex.includes(k))]); }
            if (data.columns) saveColumns(data.columns);
            if (data.settings) {
                const currentSettings = getSettings();
                saveSettings({ ...currentSettings, ...data.settings });
            }
            
            // Re-render boards if available
            if (typeof renderBoardTabs === 'function') {
                renderBoardTabs();
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
// Helper function to safely add event listeners
function safeAddEventListener(elementId, event, handler) {
    const element = typeof elementId === 'string' ? document.getElementById(elementId) : elementId;
    if (element) {
        element.addEventListener(event, handler);
    } else if (typeof elementId === 'string') {
        console.warn(`Element not found: ${elementId}`);
    }
}

function safeQuerySelector(selector, event, handler) {
    const element = document.querySelector(selector);
    if (element) {
        element.addEventListener(event, handler);
    } else {
        console.warn(`Element not found with selector: ${selector}`);
    }
}

function setupEventListeners() {
    // Header buttons
    document.getElementById('btnAddProject').addEventListener('click', () => openProjectModal());
    document.getElementById('btnAddTask').addEventListener('click', () => openTaskModal());
    document.getElementById('btnSettings').addEventListener('click', () => { 
        renderCategoryList(); 
        renderKeyPersonList();
        renderColumnList();
        if (typeof renderBoardListInSettings === 'function') {
            renderBoardListInSettings();
        }
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
    document.getElementById('closeStarting').addEventListener('click', () => { 
        document.getElementById('startingBanner').style.display = 'none'; 
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
        const startDate = document.getElementById('taskStartDate').value;
        const dueDate = document.getElementById('taskDueDate').value;
        
        // Validate dates
        if (startDate && dueDate && !validateDates(startDate, dueDate)) {
            showToast('Start date cannot be after due date', 'error');
            return;
        }
        
        const data = { 
            title: document.getElementById('taskTitle').value, 
            projectId: document.getElementById('taskProject').value, 
            keyPersons: getSelectedKeyPersons('taskKeyPersons'),
            startDate: startDate,
            dueDate: dueDate, 
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
    document.getElementById('warningDaysBeforeStart').addEventListener('change', e => { 
        const s = getSettings(); 
        s.warningDaysBeforeStart = parseInt(e.target.value); 
        if (s.warningDaysBeforeStart < -1) s.warningDaysBeforeStart = -1;
        saveSettings(s); 
        checkWarnings(); 
    });
    document.getElementById('warningDays').addEventListener('change', e => { 
        const s = getSettings(); 
        s.warningDays = parseInt(e.target.value); 
        if (s.warningDays < -1) s.warningDays = -1;
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
    document.getElementById('closeEditKeyPerson')?.addEventListener('click', () => {
        closeModal('editKeyPersonModal');
        editingKeyPersonIndex = null;
    });
    document.getElementById('cancelEditKeyPerson')?.addEventListener('click', () => {
        closeModal('editKeyPersonModal');
        editingKeyPersonIndex = null;
    });
    document.getElementById('saveEditKeyPerson')?.addEventListener('click', saveEditKeyPerson);
    document.querySelector('#editKeyPersonModal .modal-overlay')?.addEventListener('click', () => {
        closeModal('editKeyPersonModal');
        editingKeyPersonIndex = null;
    });
    document.getElementById('editKeyPersonName')?.addEventListener('keypress', e => {
        if (e.key === 'Enter') {
            e.preventDefault();
            saveEditKeyPerson();
        }
    });
    
    // Edit Category Modal
    document.getElementById('closeEditCategory')?.addEventListener('click', () => {
        closeModal('editCategoryModal');
        editingCategoryIndex = null;
    });
    document.getElementById('cancelEditCategory')?.addEventListener('click', () => {
        closeModal('editCategoryModal');
        editingCategoryIndex = null;
    });
    document.getElementById('saveEditCategory')?.addEventListener('click', saveEditCategory);
    document.querySelector('#editCategoryModal .modal-overlay')?.addEventListener('click', () => {
        closeModal('editCategoryModal');
        editingCategoryIndex = null;
    });
    document.getElementById('editCategoryName')?.addEventListener('keypress', e => {
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
    document.getElementById('closeEditColumn')?.addEventListener('click', () => {
        closeModal('editColumnModal');
        editingColumnIndex = null;
    });
    document.getElementById('cancelEditColumn')?.addEventListener('click', () => {
        closeModal('editColumnModal');
        editingColumnIndex = null;
    });
    document.getElementById('saveEditColumn')?.addEventListener('click', saveEditColumn);
    
    // Edit column color palette
    setupColorPalette('editColumnColorPalette');
    
    // Edit column icon picker
    setupIconPicker('editColumnIconSearch', 'editColumnIconPicker', 'editColumnIcon', 'editColumnIconPreview');
    document.getElementById('clearEditColumnIcon')?.addEventListener('click', () => {
        document.getElementById('editColumnIcon').value = '';
        document.getElementById('editColumnIconPreview').innerHTML = '';
        document.getElementById('editColumnIconPicker').style.display = 'none';
    });
    document.querySelector('#editColumnModal .modal-overlay')?.addEventListener('click', () => {
        closeModal('editColumnModal');
        editingColumnIndex = null;
    });
    document.getElementById('editColumnName')?.addEventListener('keypress', e => {
        if (e.key === 'Enter') {
            e.preventDefault();
            saveEditColumn();
        }
    });
    
    // Detail Modal
    document.getElementById('closeDetailModal')?.addEventListener('click', () => closeModal('detailModal'));
    document.getElementById('closeDetail')?.addEventListener('click', () => closeModal('detailModal'));
    document.querySelector('#detailModal .modal-overlay')?.addEventListener('click', () => closeModal('detailModal'));
    document.getElementById('addTaskFromDetail')?.addEventListener('click', () => {
        closeModal('detailModal');
        openTaskModal(null, currentDetailId); // currentDetailId is the project ID
    });
    document.getElementById('editDetail')?.addEventListener('click', () => {
        closeModal('detailModal');
        if (currentDetailType === 'project') {
            openProjectModal(currentDetailId);
        } else {
            openTaskModal(currentDetailId);
        }
    });
    
    // Confirm Modal
    document.getElementById('confirmCancel')?.addEventListener('click', () => { 
        confirmCallback = null; 
        closeModal('confirmModal'); 
    });
    document.getElementById('confirmOk')?.addEventListener('click', () => { 
        if (confirmCallback) { 
            confirmCallback(); 
            confirmCallback = null; 
        } 
        closeModal('confirmModal'); 
    });
    document.querySelector('#confirmModal .modal-overlay')?.addEventListener('click', () => { 
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
                ? '<i class="bi bi-cloud-check" style="color: #22c55e; margin-left: 8px;" title="Auto Sync ON"></i>'
                : '<i class="bi bi-cloud-slash" style="color: #fbbf24; margin-left: 8px;" title="Auto Sync OFF"></i>';
        } else {
            icon = '<i class="bi bi-device-hdd" style="color: var(--text-secondary); margin-left: 8px;" title="Offline Mode"></i>';
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
    
    // Initialize boards system
    if (typeof initializeBoards === 'function') {
        initializeBoards();
    }
    
    // Load settings
    const s = getSettings();
    
    // Apply theme and font
    applyTheme(s.theme);
    applyFont(s.font);
    
    // Set form values
    document.getElementById('docName').value = s.docName;
    document.getElementById('docAuthor').value = s.docAuthor;
    document.getElementById('docVersion').value = s.docVersion;
    document.getElementById('warningDaysBeforeStart').value = s.warningDaysBeforeStart !== undefined ? s.warningDaysBeforeStart : 3;
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

