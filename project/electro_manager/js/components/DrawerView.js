// js/components/DrawerView.js

// Ensure the global namespace exists
window.App = window.App || {};
window.App.components = window.App.components || {};

/**
 * React Component for viewing and managing the contents of a drawer.
 * Displays a grid of cells with the ability to name cells and view/edit components in cells.
 */
window.App.components.DrawerView = ({
    // Props
    drawer, // Object: The drawer being viewed
    cells, // Array: Cell objects for this drawer
    components, // Array: All component objects
    location, // Object: The location this drawer belongs to
    // Callbacks
    onAddCell, // Function(newCell): Called to add/update a cell
    onEditCell, // Function(cellId, updatedCell): Called to edit a cell
    onDeleteCell, // Function(cellId): Called to delete a cell
    onEditComponent, // Function(component): Called to edit a component
    onBackToDrawers, // Function: Called when "Back to Drawers" button is clicked
}) => {
    const { useState, useEffect } = React;

    // Internal state
    const [selectedCellId, setSelectedCellId] = useState(null);
    const [editingCellId, setEditingCellId] = useState(null);
    const [editCellNickname, setEditCellNickname] = useState('');
    
    // Grid dimensions
    const rows = drawer?.grid?.rows || 3;
    const cols = drawer?.grid?.cols || 3;
    
    // Get all cells for this drawer
    const drawerCells = cells.filter(cell => cell.drawerId === drawer.id);
    
    // Create a mapping of coordinate to cell
    const cellMap = {};
    drawerCells.forEach(cell => {
        cellMap[cell.coordinate] = cell;
    });
    
    // Generate alphabetical column headers (A, B, C, ...)
    const getColLabel = (index) => {
        return String.fromCharCode(65 + index); // A=65 in ASCII
    };
    
    // Get components for a specific cell
    const getComponentsForCell = (cellId) => {
        if (!cellId) return [];
        return components.filter(comp => {
            if (!comp.storageInfo) return false;
            
            // Check for the new format (cells array)
            if (comp.storageInfo.cells && Array.isArray(comp.storageInfo.cells)) {
                return comp.storageInfo.cells.includes(cellId);
            }
            
            // Fallback to old format (single cellId)
            return comp.storageInfo.cellId === cellId;
        });
    };
    
    // Get or create cell for a coordinate
    const getOrCreateCell = (rowIndex, colIndex) => {
        const coordinate = `${getColLabel(colIndex)}${rowIndex + 1}`; // e.g., "A1", "B2"
        
        // If cell exists for this coordinate, return it
        if (cellMap[coordinate]) {
            return cellMap[coordinate];
        }
        
        // Otherwise return a placeholder object
        return {
            id: null,
            drawerId: drawer.id,
            coordinate: coordinate,
            nickname: '',
        };
    };
    
    // Handle editing a cell nickname
    const handleEditCellNickname = (cell) => {
        setEditingCellId(cell.id);
        setEditCellNickname(cell.nickname || '');
    };
    
    // Handle saving a cell nickname
    const handleSaveCellNickname = () => {
        const cellToUpdate = drawerCells.find(cell => cell.id === editingCellId);
        if (!cellToUpdate) return;
        
        const trimmedNickname = editCellNickname.trim();
        
        // Check for duplicate nicknames in this drawer
        const isDuplicate = drawerCells.some(cell => 
            cell.id !== editingCellId && 
            cell.nickname && 
            cell.nickname.toLowerCase() === trimmedNickname.toLowerCase()
        );
        
        if (isDuplicate && trimmedNickname) {
            alert(`Nickname "${trimmedNickname}" is already used in this drawer.`);
            return;
        }
        
        const updatedCell = {
            ...cellToUpdate,
            nickname: trimmedNickname
        };
        
        onEditCell(editingCellId, updatedCell);
        setEditingCellId(null);
        setEditCellNickname('');
    };
    
    // Handle clicking on a cell
    const handleCellClick = (cell) => {
        // If we're editing a cell, save before selecting a new one
        if (editingCellId && cell.id !== editingCellId) {
            handleSaveCellNickname();
        }
        
        setSelectedCellId(cell.id);
    };
    
    // Handle creating a new cell
    const handleCreateCell = (rowIndex, colIndex) => {
        const coordinate = `${getColLabel(colIndex)}${rowIndex + 1}`;
        
        // Check if a cell already exists for this coordinate
        const existingCell = drawerCells.find(cell => cell.coordinate === coordinate);
        if (existingCell) {
            setSelectedCellId(existingCell.id);
            return;
        }
        
        // Create a new cell
        const newCell = {
            id: `cell-${Date.now()}-${Math.random().toString(16).slice(2)}`,
            drawerId: drawer.id,
            coordinate: coordinate,
            nickname: ''
        };
        
        onAddCell(newCell);
        setSelectedCellId(newCell.id);
    };
    
    // Generate grid elements
    const generateGrid = () => {
        const gridElements = [];
        
        // Column headers row
        const headerRow = [
            // Empty cell for row header column
            React.createElement('div', { key: 'corner', className: "bg-gray-100 p-2 font-medium border border-gray-300 text-center" })
        ];
        
        // Add column headers (A, B, C, ...)
        for (let c = 0; c < cols; c++) {
            headerRow.push(
                React.createElement('div', { 
                    key: `col-${c}`,
                    className: "bg-gray-100 p-2 font-medium border border-gray-300 text-center"
                }, getColLabel(c))
            );
        }
        
        gridElements.push(
            React.createElement('div', { 
                key: 'header-row', 
                className: "grid-row grid-cols-header-row"
            }, headerRow)
        );
        
        // Generate rows
        for (let r = 0; r < rows; r++) {
            const rowElements = [
                // Row header (1, 2, 3, ...)
                React.createElement('div', { 
                    key: `row-${r}`,
                    className: "bg-gray-100 p-2 font-medium border border-gray-300 text-center"
                }, r + 1)
            ];
            
            // Generate cells for this row
            for (let c = 0; c < cols; c++) {
                const cell = getOrCreateCell(r, c);
                const cellComponents = cell.id ? getComponentsForCell(cell.id) : [];
                const isSelected = cell.id === selectedCellId;
                const isEditing = cell.id === editingCellId;
                
                const cellElement = React.createElement('div', {
                    key: `cell-${r}-${c}`,
                    className: `border border-gray-300 p-2 min-h-20 ${isSelected ? 'bg-blue-50 border-blue-500' : 'bg-white'} ${cell.id ? 'cursor-pointer' : 'cursor-default'} ${cellComponents.length > 0 ? 'bg-green-50' : ''}`,
                    onClick: () => cell.id ? handleCellClick(cell) : handleCreateCell(r, c)
                },
                    // Cell content
                    React.createElement('div', { className: "flex flex-col h-full" },
                        // Nickname or coordinate display
                        isEditing ? 
                            React.createElement('input', {
                                type: "text",
                                value: editCellNickname,
                                onChange: (e) => setEditCellNickname(e.target.value),
                                onBlur: handleSaveCellNickname,
                                onKeyDown: (e) => e.key === 'Enter' && handleSaveCellNickname(),
                                className: "w-full p-1 text-sm border border-gray-300 rounded",
                                autoFocus: true
                            }) : 
                            React.createElement('div', { className: "font-medium text-sm" },
                                cell.nickname || cell.coordinate,
                                !cell.id && React.createElement('span', { className: "text-gray-400 text-xs italic block" }, "Click to create")
                            ),
                        
                        // Component count
                        cellComponents.length > 0 && React.createElement('div', { className: "text-xs mt-1 text-gray-600" },
                            `${cellComponents.length} component${cellComponents.length !== 1 ? 's' : ''}`
                        )
                    )
                );
                
                rowElements.push(cellElement);
            }
            
            gridElements.push(
                React.createElement('div', { 
                    key: `row-${r}`, 
                    className: "grid-row"
                }, rowElements)
            );
        }
        
        return gridElements;
    };
    
    // Selected cell details
    const selectedCell = drawerCells.find(cell => cell.id === selectedCellId);
    const selectedCellComponents = selectedCell ? getComponentsForCell(selectedCell.id) : [];

    return React.createElement('div', { className: "space-y-4" },
        // Header with back button
        React.createElement('div', { className: "flex justify-between items-center mb-4" },
            React.createElement('h2', { className: "text-xl font-semibold text-gray-800" },
                `Drawer: ${drawer.name}`,
                drawer.description && React.createElement('span', { className: "ml-2 text-sm text-gray-500 font-normal" }, `(${drawer.description})`)
            ),
            React.createElement('button', {
                onClick: onBackToDrawers,
                className: "px-3 py-1 bg-gray-200 text-gray-700 rounded flex items-center hover:bg-gray-300"
            },
                React.createElement('svg', {
                    xmlns: "http://www.w3.org/2000/svg",
                    className: "h-4 w-4 mr-1",
                    fill: "none",
                    viewBox: "0 0 24 24",
                    stroke: "currentColor"
                },
                    React.createElement('path', {
                        strokeLinecap: "round",
                        strokeLinejoin: "round",
                        strokeWidth: 2,
                        d: "M10 19l-7-7m0 0l7-7m-7 7h18"
                    })
                ),
                "Back to Drawers"
            )
        ),
        
        // Location info
        React.createElement('div', { className: "bg-gray-50 p-3 rounded-lg border border-gray-200" },
            React.createElement('div', { className: "text-sm text-gray-600" },
                React.createElement('span', { className: "font-medium" }, "Location: "),
                location?.name || "Unknown Location"
            ),
            React.createElement('div', { className: "text-sm text-gray-600 mt-1" },
                React.createElement('span', { className: "font-medium" }, "Grid Size: "),
                `${rows} × ${cols}`
            ),
            React.createElement('div', { className: "text-sm text-gray-600 mt-1" },
                React.createElement('span', { className: "font-medium" }, "Total Components: "),
                components.filter(comp => comp.storageInfo && comp.storageInfo.drawerId === drawer.id).length
            )
        ),
        
        // Grid view
        React.createElement('div', { className: "bg-white p-4 rounded-lg shadow border border-gray-200" },
            React.createElement('h3', { className: "text-lg font-medium mb-4 text-gray-700" }, "Drawer Grid"),
            // Instructions
            React.createElement('p', { className: "text-sm text-gray-600 mb-4" },
                "Click on a cell to select it. Click on an empty coordinate to create a new cell. Cells with components are highlighted in green."
            ),
            // Grid container with custom CSS grid
            React.createElement('div', { 
                className: "grid",
                style: {
                    display: 'grid',
                    gridTemplateColumns: `auto repeat(${cols}, 1fr)`,
                    gap: '1px'
                }
            }, generateGrid())
        ),
        
        // Selected cell details
        selectedCell && React.createElement('div', { className: "bg-white p-4 rounded-lg shadow border border-gray-200" },
            // Cell header with actions
            React.createElement('div', { className: "flex justify-between items-center mb-4" },
                React.createElement('h3', { className: "text-lg font-medium text-gray-700" },
                    `Cell: ${selectedCell.nickname || selectedCell.coordinate}`
                ),
                React.createElement('div', { className: "flex space-x-2" },
                    React.createElement('button', {
                        onClick: () => handleEditCellNickname(selectedCell),
                        className: "px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                    }, "Rename Cell"),
                    React.createElement('button', {
                        onClick: () => onDeleteCell(selectedCell.id),
                        className: "px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                    }, "Delete Cell")
                )
            ),
            
            // Components in this cell
            React.createElement('h4', { className: "font-medium text-gray-600 mb-2" }, 
                `Components in ${selectedCell.nickname || selectedCell.coordinate}`
            ),
            selectedCellComponents.length === 0 ?
                React.createElement('p', { className: "text-sm text-gray-500 italic" }, "No components in this cell.") :
                React.createElement('div', { className: "space-y-2 max-h-60 overflow-y-auto" },
                    selectedCellComponents.map(comp => 
                        React.createElement('div', { 
                            key: comp.id,
                            className: "flex justify-between items-center p-2 bg-gray-50 rounded border border-gray-200"
                        },
                            React.createElement('div', null,
                                React.createElement('div', { className: "font-medium" }, comp.name),
                                React.createElement('div', { className: "text-xs text-gray-600" }, 
                                    `${comp.category} • Model/Type: ${comp.type || ""}`
                                )
                            ),
                            React.createElement('button', {
                                onClick: () => onEditComponent(comp),
                                className: "px-2 py-1 text-xs bg-indigo-500 text-white rounded hover:bg-indigo-600"
                            }, "Edit")
                        )
                    )
                )
        )
    );
};

console.log("DrawerView component loaded."); // For debugging