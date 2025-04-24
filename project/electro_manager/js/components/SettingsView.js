// Ensure the global namespace exists
window.App = window.App || {};
window.App.components = window.App.components || {};

/**
 * React Component for the Settings Page View.
 * Provides access to import/export, category management, low stock config, and display settings.
 */
window.App.components.SettingsView = ({
    // Props
    categories, // Array: List of category strings
    lowStockConfig, // Object: Low stock thresholds { category: threshold }
    currencySymbol, // String: Currency symbol
    showTotalValue, // Boolean: Whether to show total value in summary
    footprints, // Array: List of footprint strings
    jsonData, // String: Text content for import/export text area
    importError, // String: Error or success message after import
    exportMessage, // String: Message after export/save attempt
    localStorageStatus, // Object: Status of localStorage items { key: boolean }
    locations,
    components,
    // Callbacks
    onExportComponents, // Function: Called when Export Components button is clicked
    onExportConfig, // Function: Called when Export Config button is clicked
    onImportComponentsFile, // Function(event): Called when component file is selected for import
    onImportConfigFile, // Function(event): Called when config file is selected for import
    onDownloadJson, // Function: Called when Download JSON button is clicked
    onCopyJson, // Function: Called when Copy JSON button is clicked
    onClearJsonArea, // Function: Called when Clear Area button is clicked
    onChangeCurrency, // Function(event): Called when currency input changes
    onChangeShowTotalValue, // Function(event): Called when show total value checkbox changes
    onAddLowStock, // Function(category, threshold): Called to add/update low stock threshold
    onRemoveLowStock, // Function(category): Called to remove low stock threshold
    onEditCategory, // Function(oldName, newName): Called to rename a category
    onDeleteCategory, // Function(category): Called to delete a category
    onAddDefaultCategory, // Function: Called to add a "Default" category
    onSaveComponentsLS, // Function: Called to force save components to localStorage
    onSaveConfigLS, // Function: Called to force save config to localStorage
    onClearLS, // Function: Called to clear all localStorage
    onAddFootprint, // Function(newFootprint): Called to add a new footprint
    onEditFootprint, // Function(oldFootprint, newFootprint): Called to rename a footprint
    onDeleteFootprint, // Function(footprint): Called to delete a footprint
    onExportLocations, // Function: Called when Export Locations button is clicked
    onImportLocationsFile, // Function(event): Called when locations file is selected for import
    onRestoreDefaultFootprints, // Function: Called to restore default footprints
}) => {
    const { useState } = React;
    const { FootprintManager } = window.App.components;

    // Internal state for settings form controls
    const [editingCategory, setEditingCategory] = useState(null); // Category being edited
    const [newCategoryName, setNewCategoryName] = useState(''); // New name for edited category
    const [newLowStockCategory, setNewLowStockCategory] = useState(''); // Category for new low stock threshold
    const [newLowStockThreshold, setNewLowStockThreshold] = useState(5); // Threshold value

    // --- Event Handlers ---

    // Handle low stock threshold submission
    const handleAddLowStock = () => {
        if (!newLowStockCategory || newLowStockThreshold < 1) {
            alert("Please select a category and enter a threshold greater than 0.");
            return;
        }
        onAddLowStock(newLowStockCategory, newLowStockThreshold);
        // Reset the form
        setNewLowStockThreshold(5);
    };

    // Start editing category
    const handleStartEditCategory = (category) => {
        setEditingCategory(category);
        setNewCategoryName(category);
    };

    // Save edited category name
    const handleSaveCategory = () => {
        const trimmedNewName = newCategoryName.trim();
        // Validate
        if (!trimmedNewName) {
            alert("Category name cannot be empty.");
            return;
        }

        if (trimmedNewName === editingCategory) {
            // No change, just cancel
            setEditingCategory(null);
            setNewCategoryName('');
            return;
        }

        if (categories.includes(trimmedNewName)) {
            alert(`Category "${trimmedNewName}" already exists.`);
            return;
        }

        // Call parent handler and reset state
        onEditCategory(editingCategory, trimmedNewName);
        setEditingCategory(null);
        setNewCategoryName('');
    };

    // Cancel category editing
    const handleCancelCategoryEdit = () => {
        setEditingCategory(null);
        setNewCategoryName('');
    };

    // Handle low stock category selection, also update threshold if already configured
    const handleLowStockCategoryChange = (e) => {
        const category = e.target.value;
        setNewLowStockCategory(category);
        // If there's already a threshold for this category, load it
        if (category && lowStockConfig && lowStockConfig[category]) {
            setNewLowStockThreshold(lowStockConfig[category]);
        } else {
            // Otherwise reset to default
            setNewLowStockThreshold(5);
        }
    };

    // --- Render ---
    return (
        React.createElement('div', { className: "space-y-8" },

            // --- Systen Info Section ---
            React.createElement('div', { className: "bg-white p-6 rounded-lg shadow border border-gray-200" },
                React.createElement('h2', { className: "text-xl font-semibold mb-4 text-gray-700 border-b pb-2" }, "System Information"),

                // Version information
                React.createElement('div', { className: "mb-4" },
                    React.createElement('h3', { className: "text-lg font-medium mb-2 text-gray-700" }, "Electro Manager"),
                    React.createElement('div', { className: "flex items-center mb-3" },
                        React.createElement('span', { className: "text-md font-semibold text-blue-600" }, "Version 0.1.5beta"),
                        React.createElement('span', { className: "ml-2 px-2 py-1 bg-green-100 text-white-800 text-xs rounded-full" }, "Latest Update")
                    ),

                    // Update date
                    //React.createElement('div', { className: "text-sm text-gray-600 mb-3" }, 
                    "Updated: 24April 2025"
                    // )
                ),

                // Changes in this version 
                React.createElement('div', { className: "mb-4" },
                    React.createElement('h4', { className: "font-medium mb-2 text-gray-700" }, "Changes in this version:"),
                    React.createElement('ul', { className: "list-disc list-inside text-sm text-gray-700 space-y-1 ml-2" },
                        React.createElement('li', null, "Add function to assign component Location and Drawers"),
                        React.createElement('li', null, "Import and Export the location and drawers data"),
                        React.createElement('li', null, "Fixed error on save data for drawers and cells"),
                        React.createElement('li', null, "Added ability to mark cells as unavailable in drawers"),
                        React.createElement('li', null, "Added function to clear all components from a cell at once"),
                        React.createElement('li', null, "Added view of drawer list for specific locations")
                    )
                ),

                // System Statistics Not In use
                /*
                React.createElement('div', { className: "mt-6" },
                    React.createElement('h4', { className: "font-medium mb-2 text-gray-700" }, "System Statistics"),
                    React.createElement('div', { className: "grid grid-cols-2 gap-3 mt-2" },
                        React.createElement('div', { className: "bg-gray-50 p-3 rounded border border-gray-200" },
                            React.createElement('div', { className: "text-xs text-gray-500" }, "Total Components"),
                            React.createElement('div', { className: "text-lg font-semibold text-gray-800" }, 
                                components ? components.length : "0"
                            )
                        ),
                        React.createElement('div', { className: "bg-gray-50 p-3 rounded border border-gray-200" },
                            React.createElement('div', { className: "text-xs text-gray-500" }, "Categories"),
                            React.createElement('div', { className: "text-lg font-semibold text-gray-800" }, 
                                categories ? categories.length : "0"
                            )
                        ),
                        React.createElement('div', { className: "bg-gray-50 p-3 rounded border border-gray-200" },
                            React.createElement('div', { className: "text-xs text-gray-500" }, "Locations"),
                            React.createElement('div', { className: "text-lg font-semibold text-gray-800" }, 
                                locations ? locations.length : "0"
                            )
                        ),
                        React.createElement('div', { className: "bg-gray-50 p-3 rounded border border-gray-200" },
                            React.createElement('div', { className: "text-xs text-gray-500" }, "Drawers"),
                            React.createElement('div', { className: "text-lg font-semibold text-gray-800" }, 
                                drawers ? drawers.length : "0"
                            )
                        )
                    )
                ),*/
                React.createElement('div', { className: "mb-4 pt-4 border-t border-gray-200 text-sm text-gray-600" },
                    React.createElement('h4', { className: "font-medium mb-2 text-gray-700" }, "Info:"),
                    React.createElement('ul', { className: "list-disc list-inside text-sm text-red-700 space-y-1 ml-2" },
                        React.createElement('li', null, "All data is store on your browser session, not save in cloud or 3rd party"),
                        React.createElement('li', null, "Clear data, change browser profile or incognito will effect your file"),
                        React.createElement('li', null, "Please export the JSON data of Component and Location for your own backup"),
                        React.createElement('li', null, "This software is BETA development, don't use for mission critical application"),
                        React.createElement('li', null, "We don't held responsibilities for any data loss, harm or damage while and if using this application"),
                    ),
                ),
                // Credits & Info
                React.createElement('div', { className: "mt-6 pt-4 border-t border-gray-200 text-sm text-gray-600" },
                    React.createElement('p', null, "Electro Manager an Electronics Inventory System by DANP-EDNA"),
                    React.createElement('p', { className: "mt-1" }, "Built with React and TailwindCSS"),
                ),
            ),
            //-- End of System Info
            // --- Import/Export Section ---
            React.createElement('div', { className: "bg-white p-6 rounded-lg shadow border border-gray-200" },
                React.createElement('h2', { className: "text-xl font-semibold mb-4 text-gray-700 border-b pb-2" }, "Import / Export Data"),
                // Messages (Error, Success, Info)
                importError && React.createElement('div', {
                    className: `p-3 rounded mb-4 text-sm ${importError.includes('success') || importError.includes('finished') ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'}`
                }, importError),
                exportMessage && !importError && React.createElement('div', {
                    className: "p-3 bg-blue-100 text-blue-800 rounded mb-4 text-sm border border-blue-200"
                }, exportMessage),
                // Components & Config Export/Import Buttons
                React.createElement('p', { className: "text-xs text-gray-500 mt-2" }, "Plese save the JSON file for backup as you may accidently clear all data"),
                React.createElement('div', { className: "grid grid-cols-1 md:grid-cols-2 gap-6 mb-6" },
                    // Components Data Section
                    React.createElement('div', null,
                        React.createElement('h4', { className: "font-medium mb-2 text-gray-600" }, "Components Data"),
                        React.createElement('div', { className: "flex flex-wrap gap-2" },
                            React.createElement('button', {
                                onClick: onExportComponents,
                                className: "px-4 py-2 bg-blue-500 text-white text-sm rounded shadow hover:bg-blue-600 transition duration-150"
                            }, "Export Components"),
                            React.createElement('input', {
                                type: "file",
                                id: "import-components-file",
                                accept: ".json",
                                onChange: onImportComponentsFile,
                                className: "hidden"
                            }),
                            React.createElement('label', {
                                htmlFor: "import-components-file",
                                className: "cursor-pointer px-4 py-2 bg-green-500 text-white text-sm rounded shadow hover:bg-green-600 transition duration-150"
                            }, "Import Components")
                        ),
                        React.createElement('p', { className: "text-xs text-gray-500 mt-2" }, "Import replaces components. Export generates JSON below.")
                    ),
                    // Configuration Section
                    React.createElement('div', null,
                        React.createElement('h4', { className: "font-medium mb-2 text-gray-600" }, "Configuration"),
                        React.createElement('div', { className: "flex flex-wrap gap-2" },
                            React.createElement('button', {
                                onClick: onExportConfig,
                                className: "px-4 py-2 bg-indigo-500 text-white text-sm rounded shadow hover:bg-indigo-600 transition duration-150"
                            }, "Export Config"),
                            React.createElement('input', {
                                type: "file",
                                id: "import-config-file",
                                accept: ".json",
                                onChange: onImportConfigFile,
                                className: "hidden"
                            }),
                            React.createElement('label', {
                                htmlFor: "import-config-file",
                                className: "cursor-pointer px-4 py-2 bg-purple-500 text-white text-sm rounded shadow hover:bg-purple-600 transition duration-150"
                            }, "Import Config")
                        ),
                        React.createElement('p', { className: "text-xs text-gray-500 mt-2" }, "Includes categories, settings. Import merges/overwrites.")
                    )
                ),

                //Import/Export Location & Drawers
                React.createElement('div', null,
                    React.createElement('h4', { className: "font-medium mb-2 text-gray-600" }, "Locations & Drawers"),
                    React.createElement('div', { className: "flex flex-wrap gap-2" },
                        React.createElement('button', {
                            onClick: onExportLocations,
                            className: "px-4 py-2 bg-yellow-500 text-white text-sm rounded shadow hover:bg-yellow-600 transition duration-150"
                        }, "Export Locations & Drawers"),
                        React.createElement('input', {
                            type: "file",
                            id: "import-locations-file",
                            accept: ".json",
                            onChange: onImportLocationsFile,
                            className: "hidden"
                        }),
                        React.createElement('label', {
                            htmlFor: "import-locations-file",
                            className: "cursor-pointer px-4 py-2 bg-amber-500 text-white text-sm rounded shadow hover:bg-amber-600 transition duration-150"
                        }, "Import Locations & Drawers")
                    ),
                    React.createElement('p', { className: "text-xs text-gray-500 mt-2" }, "Export/import locations, drawers and cells.")
                ),

                // Add Force Save Buttons here
                React.createElement('div', { className: "border-t pt-4 mb-4" },
                    React.createElement('h4', { className: "font-medium mb-2 text-gray-600" }, "Local Storage"),
                    React.createElement('p', { className: "text-xs text-red-500 mt-2" }, "Warn: The data is stored on browser session, if you clear browser data or incognito mode, this will wipe the data."),
                    React.createElement('div', { className: "flex flex-wrap gap-3" },
                        React.createElement('button', {
                            onClick: onSaveComponentsLS,
                            className: "px-4 py-2 bg-blue-500 text-white text-sm rounded shadow hover:bg-blue-600 transition duration-150"
                        }, "Force Save Components"),
                        React.createElement('button', {
                            onClick: onSaveConfigLS,
                            className: "px-4 py-2 bg-indigo-500 text-white text-sm rounded shadow hover:bg-indigo-600 transition duration-150"
                        }, "Force Save Configuration")
                    ),
                    React.createElement('p', { className: "text-xs text-gray-500 mt-2" }, "Data is auto-saved. Use buttons above to force save.")
                ),


                // JSON Text Area (conditional)
                jsonData && React.createElement('div', { className: "mt-4 border-t pt-4" },
                    React.createElement('label', {
                        htmlFor: "json-data-area",
                        className: "block mb-1 text-sm font-medium text-gray-700"
                    }, "Generated JSON Data:"),
                    React.createElement('textarea', {
                        id: "json-data-area",
                        readOnly: true,
                        className: "w-full p-2 border border-gray-300 rounded h-40 font-mono text-xs bg-gray-50",
                        value: jsonData
                    }),
                    React.createElement('div', { className: "flex flex-wrap gap-2 mt-2" },
                        React.createElement('button', {
                            onClick: onDownloadJson,
                            className: "px-4 py-2 bg-teal-500 text-white text-sm rounded shadow hover:bg-teal-600 transition duration-150"
                        }, "Download JSON"),
                        React.createElement('button', {
                            onClick: onCopyJson,
                            className: "px-4 py-2 bg-gray-500 text-white text-sm rounded shadow hover:bg-gray-600 transition duration-150"
                        }, "Copy JSON"),
                        React.createElement('button', {
                            onClick: onClearJsonArea,
                            className: "px-4 py-2 bg-yellow-500 text-white text-sm rounded shadow hover:bg-yellow-600 transition duration-150"
                        }, "Clear Area")
                    )
                )
            ), // End Import/Export Section

            // --- Category Management Section ---
            React.createElement('div', { className: "bg-white p-6 rounded-lg shadow border border-gray-200" },
                React.createElement('h2', { className: "text-xl font-semibold mb-4 text-gray-700 border-b pb-2" }, "Category Management"),
                React.createElement('p', { className: "mb-4 text-sm text-gray-600" },
                    `Edit or delete categories. Deleting moves components to "${categories.includes('Default') ? 'Default' : 'Uncategorized'}".`
                ),
                React.createElement('div', { className: "overflow-x-auto" },
                    React.createElement('table', { className: "min-w-full divide-y divide-gray-200" },
                        React.createElement('thead', { className: "bg-gray-50" },
                            React.createElement('tr', null,
                                React.createElement('th', { className: "py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" }, "Category Name"),
                                React.createElement('th', { className: "py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider" }, "Component Count"),
                                React.createElement('th', { className: "py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider" }, "Actions")
                            )
                        ),
                        React.createElement('tbody', { className: "bg-white divide-y divide-gray-200" },
                            categories.length === 0 ?
                                React.createElement('tr', null,
                                    React.createElement('td', { colSpan: "3", className: "py-4 px-4 text-center text-gray-500 italic" }, "No categories defined.")
                                ) :
                                categories.sort().map(category =>
                                    React.createElement('tr', { key: category },
                                        // Category Name (editable)
                                        React.createElement('td', { className: "py-2 px-4 whitespace-nowrap" },
                                            editingCategory === category ?
                                                React.createElement('input', {
                                                    type: "text",
                                                    value: newCategoryName,
                                                    onChange: (e) => setNewCategoryName(e.target.value),
                                                    className: "w-full p-1 border border-blue-300 rounded shadow-sm focus:ring-blue-500 focus:border-blue-500",
                                                    autoFocus: true,
                                                    onKeyDown: (e) => e.key === 'Enter' && handleSaveCategory()
                                                }) :
                                                React.createElement('span', { className: "text-sm text-gray-900" }, category)
                                        ),
                                        // Component Count
                                        React.createElement('td', { className: "py-2 px-4 text-center text-sm text-gray-500" },
                                            categories.length > 0 ? categories.filter(cat => cat === category).length : 0
                                        ),
                                        // Actions
                                        React.createElement('td', { className: "py-2 px-4 text-center whitespace-nowrap" },
                                            editingCategory === category ?
                                                // Edit Mode Actions
                                                React.createElement('div', { className: "flex justify-center space-x-2" },
                                                    React.createElement('button', {
                                                        onClick: handleSaveCategory,
                                                        className: "px-2 py-1 bg-green-500 text-white text-xs rounded shadow hover:bg-green-600",
                                                        title: "Save"
                                                    }, "Save"),
                                                    React.createElement('button', {
                                                        onClick: handleCancelCategoryEdit,
                                                        className: "px-2 py-1 bg-gray-300 text-gray-700 text-xs rounded shadow hover:bg-gray-400",
                                                        title: "Cancel"
                                                    }, "Cancel")
                                                ) :
                                                // Normal Mode Actions
                                                React.createElement('div', { className: "flex justify-center space-x-2" },
                                                    React.createElement('button', {
                                                        onClick: () => handleStartEditCategory(category),
                                                        className: "px-2 py-1 bg-blue-500 text-white text-xs rounded shadow hover:bg-blue-600",
                                                        title: "Edit"
                                                    }, "Edit"),
                                                    React.createElement('button', {
                                                        onClick: () => onDeleteCategory(category),
                                                        className: "px-2 py-1 bg-red-500 text-white text-xs rounded shadow hover:bg-red-600",
                                                        title: "Delete",
                                                        disabled: category === 'Default' && categories.some(c => c === 'Default')
                                                    }, "Delete")
                                                )
                                        )
                                    )
                                )
                        )
                    )
                ),
                React.createElement('div', { className: "mt-4" },
                    React.createElement('button', {
                        onClick: onAddDefaultCategory,
                        className: "px-4 py-2 bg-gray-500 text-white text-sm rounded shadow hover:bg-gray-600 transition duration-150",
                        disabled: categories.includes('Default')
                    }, 'Ensure "Default" Category Exists')
                )
            ), // End Category Management Section

            // --- Footprint Management Section ---
            React.createElement('div', { className: "bg-white p-6 rounded-lg shadow border border-gray-200" },
                React.createElement('h2', { className: "text-xl font-semibold mb-4 text-gray-700 border-b pb-2" }, "Footprint Management"),
                React.createElement('p', { className: "mb-4 text-sm text-gray-600" },
                    "Manage the list of footprints available for components. These will appear in the dropdown when adding or editing components."
                ),
                React.createElement(FootprintManager, {
                    footprints,
                    onAddFootprint,
                    onEditFootprint,
                    onDeleteFootprint,
                    onRestoreDefaults: onRestoreDefaultFootprints
                })
            ), // End Footprint Management Section

            // --- Low Stock Configuration Section ---
            React.createElement('div', { className: "bg-white p-6 rounded-lg shadow border border-gray-200" },
                React.createElement('h2', { className: "text-xl font-semibold mb-4 text-gray-700 border-b pb-2" }, "Low Stock Thresholds"),
                React.createElement('p', { className: "mb-4 text-sm text-gray-600" }, "Set quantity thresholds for categories to highlight low stock items."),
                React.createElement('div', { className: "grid grid-cols-1 md:grid-cols-2 gap-8" },
                    // Set Threshold Section
                    React.createElement('div', null,
                        React.createElement('h4', { className: "font-medium mb-3 text-gray-600" }, "Set Threshold"),
                        React.createElement('div', { className: "space-y-3" },
                            // Category Dropdown
                            React.createElement('div', null,
                                React.createElement('label', {
                                    htmlFor: "low-stock-category",
                                    className: "block mb-1 text-sm font-medium text-gray-700"
                                }, "Category"),
                                React.createElement('select', {
                                    id: "low-stock-category",
                                    className: "w-full p-2 border border-gray-300 rounded shadow-sm focus:ring-blue-500 focus:border-blue-500",
                                    value: newLowStockCategory,
                                    onChange: handleLowStockCategoryChange
                                },
                                    React.createElement('option', { value: "" }, "-- Select category --"),
                                    categories.sort().map(category => React.createElement('option', { key: category, value: category },
                                        `${category} ${lowStockConfig[category] ? `(Current: ${lowStockConfig[category]})` : ''}`
                                    ))
                                )
                            ),
                            // Threshold Input
                            React.createElement('div', null,
                                React.createElement('label', {
                                    htmlFor: "low-stock-threshold",
                                    className: "block mb-1 text-sm font-medium text-gray-700"
                                }, "Threshold Quantity"),
                                React.createElement('input', {
                                    id: "low-stock-threshold",
                                    type: "number",
                                    min: "1",
                                    className: "w-full p-2 border border-gray-300 rounded shadow-sm focus:ring-blue-500 focus:border-blue-500",
                                    value: newLowStockThreshold,
                                    onChange: (e) => setNewLowStockThreshold(Math.max(1, parseInt(e.target.value, 10) || 1)),
                                    placeholder: "e.g., 5"
                                })
                            ),
                            // Add/Update Button
                            React.createElement('div', null,
                                React.createElement('button', {
                                    onClick: handleAddLowStock,
                                    disabled: !newLowStockCategory,
                                    className: `w-full px-4 py-2 rounded shadow transition duration-150 ${!newLowStockCategory ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-600'}`
                                }, lowStockConfig[newLowStockCategory] ? 'Update Threshold' : 'Add Threshold')
                            )
                        )
                    ),
                    // Current Thresholds Section
                    React.createElement('div', null,
                        React.createElement('h4', { className: "font-medium mb-3 text-gray-600" }, "Current Thresholds"),
                        Object.keys(lowStockConfig).length === 0 ?
                            React.createElement('p', { className: "text-gray-500 italic text-sm" }, "No thresholds configured.") :
                            React.createElement('div', { className: "border rounded max-h-60 overflow-y-auto" },
                                React.createElement('table', { className: "min-w-full divide-y divide-gray-200" },
                                    React.createElement('thead', { className: "bg-gray-50 sticky top-0" },
                                        React.createElement('tr', null,
                                            React.createElement('th', { className: "py-2 px-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" }, "Category"),
                                            React.createElement('th', { className: "py-2 px-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider" }, "Threshold"),
                                            React.createElement('th', { className: "py-2 px-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider" }, "Action")
                                        )
                                    ),
                                    React.createElement('tbody', { className: "bg-white divide-y divide-gray-200" },
                                        Object.entries(lowStockConfig).sort(([catA], [catB]) => catA.localeCompare(catB)).map(([category, threshold]) =>
                                            React.createElement('tr', { key: category },
                                                React.createElement('td', { className: "py-2 px-3 text-sm text-gray-800" }, category),
                                                React.createElement('td', { className: "py-2 px-3 text-center text-sm text-gray-800" }, threshold),
                                                React.createElement('td', { className: "py-2 px-3 text-center" },
                                                    React.createElement('button', {
                                                        onClick: () => onRemoveLowStock(category),
                                                        className: "text-red-600 hover:text-red-800 text-xs",
                                                        title: "Remove threshold"
                                                    }, "Remove")
                                                )
                                            )
                                        )
                                    )
                                )
                            )
                    )
                )
            ),

            // --- Display Settings Section ---
            React.createElement('div', { className: "bg-white p-6 rounded-lg shadow border border-gray-200" },
                React.createElement('h2', { className: "text-xl font-semibold mb-4 text-gray-700 border-b pb-2" }, "Display Settings"),
                React.createElement('div', { className: "grid grid-cols-1 md:grid-cols-2 gap-6" },
                    // Currency Symbol Input
                    React.createElement('div', null,
                        React.createElement('label', {
                            htmlFor: "currency-symbol",
                            className: "block mb-1 text-sm font-medium text-gray-700"
                        }, "Currency Symbol"),
                        React.createElement('input', {
                            id: "currency-symbol",
                            type: "text",
                            value: currencySymbol,
                            onChange: onChangeCurrency,
                            className: "w-full md:w-1/2 p-2 border border-gray-300 rounded shadow-sm focus:ring-blue-500 focus:border-blue-500",
                            placeholder: "e.g., $, €, MYR, SDG"
                        }),
                        React.createElement('p', { className: "text-xs text-gray-500 mt-1" }, "Symbol used for displaying prices.")
                    ),
                    // Show Total Value Toggle
                    React.createElement('div', null,
                        React.createElement('label', {
                            htmlFor: "show-total-value",
                            className: "flex items-center space-x-2 text-sm font-medium text-gray-700 cursor-pointer"
                        },
                            React.createElement('input', {
                                id: "show-total-value",
                                type: "checkbox",
                                checked: showTotalValue,
                                onChange: onChangeShowTotalValue,
                                className: "h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            }),
                            React.createElement('span', null, "Show Total Inventory Value in Summary")
                        ),
                        React.createElement('p', { className: "text-xs text-gray-500 mt-1" }, "Calculates and displays the sum of (price * quantity) for all components.")
                    )
                )
            ), // End Display Settings Section

            // --- Local Storage Management Section ---
            React.createElement('div', { className: "bg-white p-6 rounded-lg shadow border border-gray-200" },
                React.createElement('h2', { className: "text-xl font-semibold mb-4 text-gray-700 border-b pb-2" }, "Local Storage Management"),
                // Storage Status Display
                React.createElement('div', { className: "bg-gray-50 p-4 rounded border border-gray-200 mb-4" },
                    React.createElement('h4', { className: "font-medium mb-2 text-gray-600" }, "Current Storage Status"),
                    React.createElement('ul', { className: "list-disc list-inside text-sm text-gray-700 space-y-1" },
                        React.createElement('li', null, "Components: ",
                            React.createElement('span', {
                                className: `font-semibold ${localStorageStatus.components ? 'text-green-600' : 'text-red-600'}`
                            }, localStorageStatus.components ? 'Yes' : 'No')
                        ),
                        React.createElement('li', null, "Categories: ",
                            React.createElement('span', {
                                className: `font-semibold ${localStorageStatus.categories ? 'text-green-600' : 'text-red-600'}`
                            }, localStorageStatus.categories ? 'Yes' : 'No')
                        ),
                        React.createElement('li', null, "View Mode: ",
                            React.createElement('span', {
                                className: `font-semibold ${localStorageStatus.viewMode ? 'text-green-600' : 'text-red-600'}`
                            }, localStorageStatus.viewMode ? 'Yes' : 'No')
                        ),
                        React.createElement('li', null, "Low Stock Config: ",
                            React.createElement('span', {
                                className: `font-semibold ${localStorageStatus.lowStockConfig ? 'text-green-600' : 'text-red-600'}`
                            }, localStorageStatus.lowStockConfig ? 'Yes' : 'No')
                        ),
                        React.createElement('li', null, "Currency Symbol: ",
                            React.createElement('span', {
                                className: `font-semibold ${localStorageStatus.currencySymbol ? 'text-green-600' : 'text-red-600'}`
                            }, localStorageStatus.currencySymbol ? 'Yes' : 'No')
                        ),
                        React.createElement('li', null, "Show Total Value: ",
                            React.createElement('span', {
                                className: `font-semibold ${localStorageStatus.showTotalValue ? 'text-green-600' : 'text-red-600'}`
                            }, localStorageStatus.showTotalValue ? 'Yes' : 'No')
                        )
                    )
                ),
                React.createElement('p', { className: "mb-4 text-sm text-gray-600" }, "Data is auto-saved. Use buttons below to force save or clear all data."),
                // Force Save Buttons
                React.createElement('div', { className: "flex flex-wrap gap-3 mb-4" },
                    React.createElement('button', {
                        onClick: onSaveComponentsLS,
                        className: "px-4 py-2 bg-blue-500 text-white text-sm rounded shadow hover:bg-blue-600 transition duration-150"
                    }, "Force Save Components"),
                    React.createElement('button', {
                        onClick: onSaveConfigLS,
                        className: "px-4 py-2 bg-indigo-500 text-white text-sm rounded shadow hover:bg-indigo-600 transition duration-150"
                    }, "Force Save Configuration")
                ),

                // Danger Zone
                React.createElement('div', { className: "mt-4 border-t pt-4" },
                    React.createElement('h4', { className: "font-medium mb-2 text-red-700" }, "Danger Zone"),
                    React.createElement('button', {
                        onClick: onClearLS,
                        className: "px-4 py-2 bg-red-600 text-white text-sm rounded shadow hover:bg-red-700 transition duration-150"
                    }, "Clear All Local Storage Data"),
                    React.createElement('p', { className: "text-xs text-red-600 mt-1" }, "Warning: Deletes all components, categories, and settings. There is no way back")
                )
            )
        )
    );
}
console.log("SettingsView component loaded.");