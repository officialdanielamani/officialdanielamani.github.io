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
    if (typeof updateHeaderInfo === 'function') {
        updateHeaderInfo();
    }
}

function stopAutoSave() {
    if (autoSaveIntervalId) {
        clearInterval(autoSaveIntervalId);
        autoSaveIntervalId = null;
        console.log('Auto-save stopped');
    }
    if (typeof updateHeaderInfo === 'function') {
        updateHeaderInfo();
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
            statusEl.textContent = 'Please enter both Gist ID and Token';
            return;
        }
        
        statusEl.style.display = 'block';
        statusEl.style.background = 'var(--bg-tertiary)';
        statusEl.style.color = 'var(--text)';
        statusEl.textContent = 'Testing connection...';
        
        const result = await testSyncConnection(gistId, token, fileName);
        
        if (result.success) {
            statusEl.style.background = 'var(--success)';
            statusEl.style.color = 'white';
            statusEl.textContent = `Connected! Gist owner: ${result.owner}`;
        } else {
            statusEl.style.background = 'var(--danger)';
            statusEl.style.color = 'white';
            statusEl.textContent = `Failed: ${result.error}`;
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
        
        stopAutoSave(); // This will also update the indicator
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
            renderKanbanBoard();
            renderCategoryList();
            renderKeyPersonList();
            updateCategoryDropdowns();
            updateKeyPersonDropdowns();
            showToast('Data pulled successfully!', 'success');
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
            renderKanbanBoard();
            renderCategoryList();
            renderKeyPersonList();
            updateCategoryDropdowns();
            updateKeyPersonDropdowns();
            showToast('Data merged successfully!', 'success');
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
            renderKanbanBoard();
            renderCategoryList();
            renderKeyPersonList();
            updateCategoryDropdowns();
            updateKeyPersonDropdowns();
            showToast('Data pulled successfully!', 'success');
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
            renderKanbanBoard();
            renderCategoryList();
            renderKeyPersonList();
            updateCategoryDropdowns();
            updateKeyPersonDropdowns();
            showToast('Data merged successfully!', 'success');
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
