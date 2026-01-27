// ============================================
// Kanban Board Application - Multi-Board Module
// Board Management & Switching
// ============================================

const STORAGE_KEYS_BOARDS = {
    BOARDS: 'kanban_boards',
    ACTIVE_BOARD: 'kanban_active_board'
};

const DEFAULT_BOARD = {
    id: 'default',
    name: 'Main Board',
    createdAt: new Date().toISOString()
};

// Get all boards
function getBoards() {
    const boards = loadData(STORAGE_KEYS_BOARDS.BOARDS);
    if (!boards || boards.length === 0) {
        // Initialize with default board
        const defaultBoards = [DEFAULT_BOARD];
        saveBoards(defaultBoards);
        return defaultBoards;
    }
    return boards;
}

// Save boards
function saveBoards(boards) {
    saveData(STORAGE_KEYS_BOARDS.BOARDS, boards);
}

// Get active board ID
function getActiveBoardId() {
    const activeId = localStorage.getItem(STORAGE_KEYS_BOARDS.ACTIVE_BOARD);
    if (!activeId) {
        const boards = getBoards();
        if (boards.length > 0) {
            setActiveBoardId(boards[0].id);
            return boards[0].id;
        }
        return 'default';
    }
    return activeId;
}

// Set active board ID
function setActiveBoardId(boardId) {
    localStorage.setItem(STORAGE_KEYS_BOARDS.ACTIVE_BOARD, boardId);
}

// Get board by ID
function getBoardById(boardId) {
    const boards = getBoards();
    return boards.find(b => b.id === boardId);
}

// Generate board-specific storage key
function getBoardStorageKey(baseKey, boardId) {
    if (!boardId || boardId === 'default') {
        return baseKey; // Use original keys for default board (backward compatibility)
    }
    return `${baseKey}_board_${boardId}`;
}

// Get projects for specific board
function getBoardProjects(boardId) {
    const key = getBoardStorageKey(STORAGE_KEYS.PROJECTS, boardId);
    return loadData(key) || [];
}

// Save projects for specific board
function saveBoardProjects(boardId, projects) {
    const key = getBoardStorageKey(STORAGE_KEYS.PROJECTS, boardId);
    saveData(key, projects);
}

// Get tasks for specific board
function getBoardTasks(boardId) {
    const key = getBoardStorageKey(STORAGE_KEYS.TASKS, boardId);
    return loadData(key) || [];
}

// Save tasks for specific board
function saveBoardTasks(boardId, tasks) {
    const key = getBoardStorageKey(STORAGE_KEYS.TASKS, boardId);
    saveData(key, tasks);
}

// Get columns for specific board
function getBoardColumns(boardId) {
    const key = getBoardStorageKey(STORAGE_KEYS.COLUMNS, boardId);
    const columns = loadData(key);
    if (!columns || columns.length === 0) {
        return DEFAULT_COLUMNS;
    }
    return columns;
}

// Save columns for specific board
function saveBoardColumns(boardId, columns) {
    const key = getBoardStorageKey(STORAGE_KEYS.COLUMNS, boardId);
    saveData(key, columns);
}

// Get categories for specific board (shared across boards for now, but can be per-board)
function getBoardCategories(boardId) {
    // Categories are shared across all boards
    return getCategories();
}

// Get key persons for specific board (shared across boards)
function getBoardKeyPersons(boardId) {
    // Key persons are shared across all boards
    return getKeyPersons();
}

// Create a new board
function createBoard(name) {
    const boards = getBoards();
    
    // Check for duplicate names
    if (boards.some(b => b.name.toLowerCase() === name.toLowerCase())) {
        showToast('A board with this name already exists', 'error');
        return null;
    }
    
    const newBoard = {
        id: generateId(),
        name: name.trim(),
        createdAt: new Date().toISOString()
    };
    
    boards.push(newBoard);
    saveBoards(boards);
    
    // Initialize with default columns
    saveBoardColumns(newBoard.id, [...DEFAULT_COLUMNS]);
    
    return newBoard;
}

// Rename a board
function renameBoard(boardId, newName) {
    const boards = getBoards();
    const board = boards.find(b => b.id === boardId);
    
    if (!board) {
        showToast('Board not found', 'error');
        return false;
    }
    
    // Check for duplicate names (excluding current board)
    if (boards.some(b => b.id !== boardId && b.name.toLowerCase() === newName.toLowerCase())) {
        showToast('A board with this name already exists', 'error');
        return false;
    }
    
    board.name = newName.trim();
    saveBoards(boards);
    return true;
}

// Delete a board
function deleteBoard(boardId) {
    const boards = getBoards();
    
    if (boards.length <= 1) {
        showToast('Cannot delete the last board', 'error');
        return false;
    }
    
    const boardIndex = boards.findIndex(b => b.id === boardId);
    if (boardIndex === -1) {
        showToast('Board not found', 'error');
        return false;
    }
    
    // Remove board data
    const projectsKey = getBoardStorageKey(STORAGE_KEYS.PROJECTS, boardId);
    const tasksKey = getBoardStorageKey(STORAGE_KEYS.TASKS, boardId);
    const columnsKey = getBoardStorageKey(STORAGE_KEYS.COLUMNS, boardId);
    
    localStorage.removeItem(projectsKey);
    localStorage.removeItem(tasksKey);
    localStorage.removeItem(columnsKey);
    
    // Remove from boards list
    boards.splice(boardIndex, 1);
    saveBoards(boards);
    
    // If deleted board was active, switch to first board
    if (getActiveBoardId() === boardId) {
        setActiveBoardId(boards[0].id);
    }
    
    return true;
}

// Move board to new position
function moveBoardToPosition(boardId, newIndex) {
    const boards = getBoards();
    const currentIndex = boards.findIndex(b => b.id === boardId);
    
    if (currentIndex === -1 || newIndex < 0 || newIndex >= boards.length) {
        return false;
    }
    
    const [board] = boards.splice(currentIndex, 1);
    boards.splice(newIndex, 0, board);
    saveBoards(boards);
    return true;
}

// Get board statistics
function getBoardStats(boardId) {
    const projects = getBoardProjects(boardId);
    const tasks = getBoardTasks(boardId);
    
    return {
        projectCount: projects.length,
        taskCount: tasks.length,
        completedTasks: tasks.filter(t => t.completed).length
    };
}

// Switch to a board
function switchToBoard(boardId) {
    const board = getBoardById(boardId);
    if (!board) {
        showToast('Board not found', 'error');
        return false;
    }
    
    setActiveBoardId(boardId);
    
    // Update all UI
    renderBoardTabs();
    renderKanbanBoard();
    updateHeaderInfo();
    updateCategoryDropdowns();
    updateKeyPersonCheckboxes();
    updateStatusDropdowns();
    updateProjectDropdown();
    
    return true;
}

// Render board tabs in header
function renderBoardTabs() {
    const boards = getBoards();
    const activeBoardId = getActiveBoardId();
    
    const tabsContainer = document.getElementById('boardTabs');
    
    if (!tabsContainer) {
        console.error('Board tabs container not found');
        return;
    }
    
    tabsContainer.innerHTML = '';
    
    boards.forEach((board, index) => {
        const tab = document.createElement('div');
        tab.className = `board-tab ${board.id === activeBoardId ? 'active' : ''}`;
        tab.dataset.boardId = board.id;
        
        tab.innerHTML = `
            <span class="board-tab-name">${escapeHtml(board.name)}</span>
            <button class="board-tab-menu" title="Board options">
                <i class="bi bi-three-dots-vertical"></i>
            </button>
        `;
        
        // Click to switch
        tab.querySelector('.board-tab-name').addEventListener('click', () => {
            switchToBoard(board.id);
        });
        
        // Menu button
        tab.querySelector('.board-tab-menu').addEventListener('click', (e) => {
            e.stopPropagation();
            showBoardContextMenu(board.id, e.target);
        });
        
        tabsContainer.appendChild(tab);
    });
    
    // Add new board button
    const addBtn = document.createElement('button');
    addBtn.className = 'board-tab-add';
    addBtn.title = 'Add new board';
    addBtn.innerHTML = '<i class="bi bi-plus-lg"></i>';
    addBtn.addEventListener('click', () => openNewBoardModal());
    tabsContainer.appendChild(addBtn);
}

// Show context menu for board tab
function showBoardContextMenu(boardId, target) {
    // Remove any existing menu
    const existingMenu = document.querySelector('.board-context-menu');
    if (existingMenu) existingMenu.remove();
    
    const board = getBoardById(boardId);
    const boards = getBoards();
    const canDelete = boards.length > 1;
    
    const menu = document.createElement('div');
    menu.className = 'board-context-menu';
    
    menu.innerHTML = `
        <button class="context-menu-item" data-action="rename">
            <i class="bi bi-pencil"></i> Rename
        </button>
        <button class="context-menu-item" data-action="duplicate">
            <i class="bi bi-copy"></i> Duplicate
        </button>
        <hr>
        <button class="context-menu-item danger" data-action="delete" ${!canDelete ? 'disabled' : ''}>
            <i class="bi bi-trash"></i> Delete
        </button>
    `;
    
    // Position menu
    const rect = target.getBoundingClientRect();
    menu.style.position = 'fixed';
    menu.style.top = (rect.bottom + 5) + 'px';
    menu.style.left = rect.left + 'px';
    menu.style.zIndex = '10000';
    
    document.body.appendChild(menu);
    
    // Handle menu actions
    menu.querySelectorAll('.context-menu-item').forEach(item => {
        item.addEventListener('click', () => {
            const action = item.dataset.action;
            menu.remove();
            
            switch (action) {
                case 'rename':
                    openRenameBoardModal(boardId);
                    break;
                case 'duplicate':
                    duplicateBoard(boardId);
                    break;
                case 'delete':
                    if (canDelete) {
                        openDeleteBoardModal(boardId);
                    }
                    break;
            }
        });
    });
    
    // Close on outside click
    const closeMenu = (e) => {
        if (!menu.contains(e.target)) {
            menu.remove();
            document.removeEventListener('click', closeMenu);
        }
    };
    setTimeout(() => document.addEventListener('click', closeMenu), 10);
}

// Duplicate a board
function duplicateBoard(boardId) {
    const sourceBoard = getBoardById(boardId);
    if (!sourceBoard) return;
    
    // Find a unique name
    let newName = `${sourceBoard.name} (Copy)`;
    const boards = getBoards();
    let counter = 1;
    while (boards.some(b => b.name.toLowerCase() === newName.toLowerCase())) {
        counter++;
        newName = `${sourceBoard.name} (Copy ${counter})`;
    }
    
    // Create new board
    const newBoard = createBoard(newName);
    if (!newBoard) return;
    
    // Copy data
    const sourceProjects = getBoardProjects(boardId);
    const sourceTasks = getBoardTasks(boardId);
    const sourceColumns = getBoardColumns(boardId);
    
    // Generate new IDs for projects and tasks
    const projectIdMap = {};
    const newProjects = sourceProjects.map(p => {
        const newId = generateId();
        projectIdMap[p.id] = newId;
        return { ...p, id: newId };
    });
    
    const newTasks = sourceTasks.map(t => ({
        ...t,
        id: generateId(),
        projectId: projectIdMap[t.projectId] || t.projectId
    }));
    
    saveBoardProjects(newBoard.id, newProjects);
    saveBoardTasks(newBoard.id, newTasks);
    saveBoardColumns(newBoard.id, [...sourceColumns]);
    
    showToast(`Board duplicated as "${newName}"`, 'success');
    renderBoardTabs();
}

// Open modal to create new board
function openNewBoardModal() {
    document.getElementById('newBoardName').value = '';
    openModal('newBoardModal');
    setTimeout(() => document.getElementById('newBoardName').focus(), 100);
}

// Open modal to rename board
function openRenameBoardModal(boardId) {
    const board = getBoardById(boardId);
    if (!board) return;
    
    document.getElementById('renameBoardId').value = boardId;
    document.getElementById('renameBoardName').value = board.name;
    openModal('renameBoardModal');
    setTimeout(() => {
        const input = document.getElementById('renameBoardName');
        input.focus();
        input.select();
    }, 100);
}

// Open modal to delete board (with confirmation)
function openDeleteBoardModal(boardId) {
    const board = getBoardById(boardId);
    if (!board) return;
    
    const stats = getBoardStats(boardId);
    
    document.getElementById('deleteBoardId').value = boardId;
    document.getElementById('deleteBoardName').textContent = board.name;
    document.getElementById('deleteBoardStats').innerHTML = `
        This will permanently delete:
        <ul style="margin: 10px 0 10px 20px;">
            <li><strong>${stats.projectCount}</strong> project(s)</li>
            <li><strong>${stats.taskCount}</strong> task(s)</li>
        </ul>
    `;
    document.getElementById('deleteBoardConfirmInput').value = '';
    document.getElementById('confirmDeleteBoard').disabled = true;
    
    openModal('deleteBoardModal');
}

// Setup board event listeners
function setupBoardEventListeners() {
    // Settings panel add board button
    safeAddEventListener('addBoardSettings', 'click', () => {
        const input = document.getElementById('newBoardNameSettings');
        const name = input.value.trim();
        if (!name) {
            showToast('Please enter a board name', 'error');
            return;
        }
        
        const newBoard = createBoard(name);
        if (newBoard) {
            input.value = '';
            showToast('Board created', 'success');
            renderBoardListInSettings();
            renderBoardTabs();
        }
    });
    
    document.getElementById('newBoardNameSettings')?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            document.getElementById('addBoardSettings')?.click();
        }
    });
    
    // New Board Modal
    safeAddEventListener('closeNewBoardModal', 'click', () => closeModal('newBoardModal'));
    safeAddEventListener('cancelNewBoard', 'click', () => closeModal('newBoardModal'));
    document.querySelector('#newBoardModal .modal-overlay')?.addEventListener('click', () => closeModal('newBoardModal'));
    
    safeAddEventListener('saveNewBoard', 'click', () => {
        const name = document.getElementById('newBoardName').value.trim();
        if (!name) {
            showToast('Please enter a board name', 'error');
            return;
        }
        
        const newBoard = createBoard(name);
        if (newBoard) {
            closeModal('newBoardModal');
            showToast('Board created', 'success');
            switchToBoard(newBoard.id);
        }
    });
    
    document.getElementById('newBoardName')?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            document.getElementById('saveNewBoard')?.click();
        }
    });
    
    // Rename Board Modal
    safeAddEventListener('closeRenameBoardModal', 'click', () => closeModal('renameBoardModal'));
    safeAddEventListener('cancelRenameBoard', 'click', () => closeModal('renameBoardModal'));
    document.querySelector('#renameBoardModal .modal-overlay')?.addEventListener('click', () => closeModal('renameBoardModal'));
    
    safeAddEventListener('saveRenameBoard', 'click', () => {
        const boardId = document.getElementById('renameBoardId').value;
        const newName = document.getElementById('renameBoardName').value.trim();
        
        if (!newName) {
            showToast('Please enter a board name', 'error');
            return;
        }
        
        if (renameBoard(boardId, newName)) {
            closeModal('renameBoardModal');
            showToast('Board renamed', 'success');
            renderBoardTabs();
            updateHeaderInfo();
        }
    });
    
    document.getElementById('renameBoardName')?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            document.getElementById('saveRenameBoard')?.click();
        }
    });
    
    // Delete Board Modal
    safeAddEventListener('closeDeleteBoardModal', 'click', () => closeModal('deleteBoardModal'));
    safeAddEventListener('cancelDeleteBoard', 'click', () => closeModal('deleteBoardModal'));
    document.querySelector('#deleteBoardModal .modal-overlay')?.addEventListener('click', () => closeModal('deleteBoardModal'));
    
    document.getElementById('deleteBoardConfirmInput')?.addEventListener('input', (e) => {
        const boardName = document.getElementById('deleteBoardName').textContent;
        document.getElementById('confirmDeleteBoard').disabled = e.target.value !== boardName;
    });
    
    safeAddEventListener('confirmDeleteBoard', 'click', () => {
        const boardId = document.getElementById('deleteBoardId').value;
        
        if (deleteBoard(boardId)) {
            closeModal('deleteBoardModal');
            showToast('Board deleted', 'success');
            
            // Refresh everything
            renderBoardTabs();
            renderKanbanBoard();
            updateHeaderInfo();
        }
    });
}

// Render board list in settings
function renderBoardListInSettings() {
    const list = document.getElementById('boardListSettings');
    if (!list) return;
    
    const boards = getBoards();
    const activeBoardId = getActiveBoardId();
    
    list.innerHTML = '';
    
    if (boards.length === 0) {
        list.innerHTML = '<li style="border: none; background: transparent; color: var(--text-muted); text-align: center;">No boards</li>';
        return;
    }
    
    boards.forEach((board, index) => {
        const stats = getBoardStats(board.id);
        const li = document.createElement('li');
        li.className = 'board-list-item';
        li.dataset.boardId = board.id;
        li.draggable = true;
        
        const isActive = board.id === activeBoardId;
        const canDelete = boards.length > 1;
        
        li.innerHTML = `
            <div class="board-list-drag-handle" title="Drag to reorder">
                <i class="bi bi-grip-vertical"></i>
            </div>
            <div class="board-list-info">
                <span class="board-list-name">${escapeHtml(board.name)}</span>
                ${isActive ? '<span class="board-list-active-badge">Active</span>' : ''}
                <small class="board-list-stats">${stats.projectCount} projects, ${stats.taskCount} tasks</small>
            </div>
            <div class="board-list-actions">
                <button class="btn-edit-board" data-board-id="${board.id}" title="Rename board">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="btn-switch-board" data-board-id="${board.id}" title="Switch to this board" ${isActive ? 'disabled' : ''}>
                    <i class="bi bi-arrow-right-circle"></i>
                </button>
                <button class="btn-delete-board" data-board-id="${board.id}" ${!canDelete ? 'disabled' : ''} title="${canDelete ? 'Delete board' : 'Cannot delete last board'}">
                    <i class="bi bi-trash"></i>
                </button>
            </div>
        `;
        
        list.appendChild(li);
    });
    
    // Add event listeners
    list.querySelectorAll('.btn-edit-board').forEach(btn => {
        btn.addEventListener('click', () => openRenameBoardModal(btn.dataset.boardId));
    });
    
    list.querySelectorAll('.btn-switch-board').forEach(btn => {
        btn.addEventListener('click', () => {
            switchToBoard(btn.dataset.boardId);
            closeModal('settingsModal');
        });
    });
    
    list.querySelectorAll('.btn-delete-board').forEach(btn => {
        if (!btn.disabled) {
            btn.addEventListener('click', () => openDeleteBoardModal(btn.dataset.boardId));
        }
    });
    
    // Setup drag and drop for reordering
    setupBoardListDragDrop(list);
}

// Setup drag and drop for board list in settings
function setupBoardListDragDrop(list) {
    let draggedItem = null;
    
    list.querySelectorAll('.board-list-item').forEach(item => {
        item.addEventListener('dragstart', (e) => {
            draggedItem = item;
            item.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'move';
        });
        
        item.addEventListener('dragend', () => {
            item.classList.remove('dragging');
            draggedItem = null;
        });
        
        item.addEventListener('dragover', (e) => {
            e.preventDefault();
            if (!draggedItem || draggedItem === item) return;
            
            const rect = item.getBoundingClientRect();
            const midY = rect.top + rect.height / 2;
            
            if (e.clientY < midY) {
                item.classList.add('drag-over-top');
                item.classList.remove('drag-over-bottom');
            } else {
                item.classList.add('drag-over-bottom');
                item.classList.remove('drag-over-top');
            }
        });
        
        item.addEventListener('dragleave', () => {
            item.classList.remove('drag-over-top', 'drag-over-bottom');
        });
        
        item.addEventListener('drop', (e) => {
            e.preventDefault();
            item.classList.remove('drag-over-top', 'drag-over-bottom');
            
            if (!draggedItem || draggedItem === item) return;
            
            const boards = getBoards();
            const draggedId = draggedItem.dataset.boardId;
            const targetId = item.dataset.boardId;
            
            const draggedIndex = boards.findIndex(b => b.id === draggedId);
            let targetIndex = boards.findIndex(b => b.id === targetId);
            
            // Adjust target index based on drop position
            const rect = item.getBoundingClientRect();
            if (e.clientY > rect.top + rect.height / 2) {
                targetIndex++;
            }
            
            if (draggedIndex < targetIndex) {
                targetIndex--;
            }
            
            moveBoardToPosition(draggedId, targetIndex);
            renderBoardListInSettings();
            renderBoardTabs();
        });
    });
}

// Initialize boards on page load
function initializeBoards() {
    // Ensure boards exist
    getBoards();
    
    // Render board tabs
    renderBoardTabs();
    
    // Setup event listeners
    setupBoardEventListeners();
}

// Export for sync module
function getAllBoardsData() {
    const boards = getBoards();
    const boardsData = boards.map(board => ({
        ...board,
        projects: getBoardProjects(board.id),
        tasks: getBoardTasks(board.id),
        columns: getBoardColumns(board.id)
    }));
    
    return {
        boards: boardsData,
        activeBoard: getActiveBoardId()
    };
}

// Import boards data (for sync)
function setAllBoardsData(data) {
    if (!data || !data.boards) return;
    
    // Clear existing board data
    const existingBoards = getBoards();
    existingBoards.forEach(board => {
        if (board.id !== 'default') {
            localStorage.removeItem(getBoardStorageKey(STORAGE_KEYS.PROJECTS, board.id));
            localStorage.removeItem(getBoardStorageKey(STORAGE_KEYS.TASKS, board.id));
            localStorage.removeItem(getBoardStorageKey(STORAGE_KEYS.COLUMNS, board.id));
        }
    });
    
    // Save new boards
    const boardsList = data.boards.map(b => ({
        id: b.id,
        name: b.name,
        createdAt: b.createdAt
    }));
    saveBoards(boardsList);
    
    // Save board data
    data.boards.forEach(board => {
        if (board.projects) saveBoardProjects(board.id, board.projects);
        if (board.tasks) saveBoardTasks(board.id, board.tasks);
        if (board.columns) saveBoardColumns(board.id, board.columns);
    });
    
    // Set active board
    if (data.activeBoard) {
        setActiveBoardId(data.activeBoard);
    }
}
