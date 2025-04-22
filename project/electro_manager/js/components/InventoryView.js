// js/components/InventoryView.js

// Ensure the global namespace exists
window.App = window.App || {};
window.App.components = window.App.components || {};
window.App.utils = window.App.utils || {}; // Ensure utils namespace exists

/**
 * React Component for the Inventory Page View.
 * Displays filters, summary, bulk actions, and the component list (table or cards).
 */
window.App.components.InventoryView = ({
    // Props
    components, // Array: All component objects
    categories, // Array: List of category strings
    viewMode, // String: 'table' or 'card'
    selectedCategory, // String: Currently selected category filter
    searchTerm, // String: Current search term
    lowStockConfig, // Object: Low stock thresholds { category: threshold }
    currencySymbol, // String: Currency symbol
    showTotalValue, // Boolean: Whether to show total value in summary
    selectedComponents, // Array: IDs of selected components for bulk actions
    // Callbacks
    onAddComponent, // Function: Called when 'Add Component' button clicked
    onEditComponent, // Function(component): Called to edit a specific component
    onDeleteComponent, // Function(id): Called to delete a specific component
    onUpdateQuantity, // Function(id, delta): Called to change quantity (+1 or -1)
    onToggleSelect, // Function(id): Called when a component checkbox is toggled
    onToggleSelectAll, // Function: Called when the select-all checkbox is toggled
    onBulkEdit, // Function: Called when 'Edit Selected' button clicked
    onBulkDelete, // Function: Called when 'Delete Selected' button clicked
    onChangeViewMode, // Function(mode): Called to change view mode ('table'/'card')
    onChangeCategoryFilter, // Function(category): Called when category filter changes
    onChangeSearchTerm, // Function(term): Called when search input changes
    onToggleFavorite, // Function(id, property): Called when favorite/bookmark/star is toggled
}) => {
    const { helpers } = window.App.utils; // Get helper functions

    // --- Filtering Logic ---
    // Filter components based on search term and selected category
    const filteredComponents = components.filter(component => {
        const matchesCategory = selectedCategory === 'all' || component.category === selectedCategory;
        const lowerSearchTerm = searchTerm.toLowerCase();
        // Check against name, type, category, and applications
        const matchesSearch = !searchTerm ||
            (component.name && component.name.toLowerCase().includes(lowerSearchTerm)) ||
            (component.type && component.type.toLowerCase().includes(lowerSearchTerm)) ||
            (component.category && component.category.toLowerCase().includes(lowerSearchTerm)) ||
            (component.applications && component.applications.toLowerCase().includes(lowerSearchTerm));

        return matchesCategory && matchesSearch;
    });

    // --- Calculations (using helpers) ---
    const totalComponents = components.length;
    const totalItems = components.reduce((sum, comp) => sum + (Number(comp.quantity) || 0), 0);
    const totalValue = helpers.calculateTotalInventoryValue(components);
    const lowStockCount = components.filter(comp => helpers.isLowStock(comp, lowStockConfig)).length;
    const categoryCounts = helpers.calculateCategoryCounts(components);

    // --- Event Handlers ---
    const handleCategoryChange = (e) => onChangeCategoryFilter(e.target.value);
    const handleSearchChange = (e) => onChangeSearchTerm(e.target.value);
    const handleViewChange = (mode) => onChangeViewMode(mode);

    // --- Render Functions for Table and Card Views ---

    // Renders a single row in the table view
    const renderTableRow = (component) => {
        const isSelected = selectedComponents.includes(component.id);
        const lowStock = helpers.isLowStock(component, lowStockConfig);
        const formattedPrice = helpers.formatCurrency(component.price, currencySymbol);
        const datasheetLinks = helpers.formatDatasheets(component.datasheets);

        return React.createElement('tr', {
            key: component.id,
            className: `hover:bg-gray-50 ${isSelected ? 'bg-blue-50' : ''} ${lowStock ? 'bg-red-50 hover:bg-red-100' : ''}`
        },
            // Checkbox
            React.createElement('td', { className: "px-3 py-2 text-center" },
                React.createElement('input', { type: "checkbox", className: "h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500", checked: isSelected, onChange: () => onToggleSelect(component.id) })
            ),
            // Component Name/Category/Datasheet
            React.createElement('td', { className: "px-4 py-2 whitespace-nowrap" },
                React.createElement('div', { className: "font-medium text-gray-900" }, component.name),
                React.createElement('div', { className: "text-sm text-gray-500" }, component.category),
                React.createElement('div', { className: "mt-1" },
                    datasheetLinks.map((url, index) =>
                        React.createElement('a', { key: index, href: url, target: "_blank", rel: "noopener noreferrer", className: "text-xs text-blue-500 hover:text-blue-700 hover:underline mr-2" }, `Datasheet ${datasheetLinks.length > 1 ? index + 1 : ''}`)
                    )
                )
            ),
            // Type
            React.createElement('td', { className: "px-4 py-2 whitespace-nowrap text-sm text-gray-700" }, component.type),
            React.createElement('td', { className: "px-2 py-2 whitespace-nowrap" },
                React.createElement('div', { className: "flex items-center space-x-1" },
                    // Favorite Icon/Button
                    React.createElement('button', {
                        onClick: () => onToggleFavorite(component.id, 'favorite'),
                        className: `p-1 rounded-full ${component.favorite ? 'text-red-500 hover:text-red-600' : 'text-gray-300 hover:text-red-500'}`,
                        title: component.favorite ? "Remove from favorites" : "Add to favorites"
                    },
                        React.createElement('svg', {
                            xmlns: "http://www.w3.org/2000/svg",
                            className: "h-5 w-5",
                            viewBox: "0 0 20 20",
                            fill: "currentColor"
                        },
                            React.createElement('path', {
                                fillRule: "evenodd",
                                d: "M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z",
                                clipRule: "evenodd"
                            })
                        )
                    ),

                    // Bookmark Icon/Button
                    React.createElement('button', {
                        onClick: () => onToggleFavorite(component.id, 'bookmark'),
                        className: `p-1 rounded-full ${component.bookmark ? 'text-blue-500 hover:text-blue-600' : 'text-gray-300 hover:text-blue-500'}`,
                        title: component.bookmark ? "Remove bookmark" : "Add bookmark"
                    },
                        React.createElement('svg', {
                            xmlns: "http://www.w3.org/2000/svg",
                            className: "h-5 w-5",
                            viewBox: "0 0 20 20",
                            fill: "currentColor"
                        },
                            React.createElement('path', {
                                d: "M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z"
                            })
                        )
                    ),

                    // Star Icon/Button
                    React.createElement('button', {
                        onClick: () => onToggleFavorite(component.id, 'star'),
                        className: `p-1 rounded-full ${component.star ? 'text-yellow-500 hover:text-yellow-600' : 'text-gray-300 hover:text-yellow-500'}`,
                        title: component.star ? "Remove star" : "Add star"
                    },
                        React.createElement('svg', {
                            xmlns: "http://www.w3.org/2000/svg",
                            className: "h-5 w-5",
                            viewBox: "0 0 20 20",
                            fill: "currentColor"
                        },
                            React.createElement('path', {
                                d: "M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                            })
                        )
                    )
                )
            ),
            // Footprint
            React.createElement('td', { className: "px-4 py-2 whitespace-nowrap text-sm text-gray-700" }, component.footprint || '-'),
            // Quantity
            React.createElement('td', { className: "px-4 py-2 whitespace-nowrap text-center" },
                React.createElement('div', { className: "flex items-center justify-center space-x-1" },
                    React.createElement('button', { onClick: () => onUpdateQuantity(component.id, -1), className: "text-red-500 hover:text-red-700 p-1", title: "Decrease Quantity" }, "-"),
                    React.createElement('span', { className: `text-sm font-semibold ${lowStock ? 'text-red-600' : 'text-gray-900'}` }, component.quantity || 0),
                    React.createElement('button', { onClick: () => onUpdateQuantity(component.id, 1), className: "text-green-500 hover:text-green-700 p-1", title: "Increase Quantity" }, "+")
                ),
                lowStock && React.createElement('div', { className: "text-xs text-red-500 mt-1" }, "Low Stock")
            ),
            // Price
            React.createElement('td', { className: "px-4 py-2 whitespace-nowrap text-sm text-gray-800 text-right" }, formattedPrice),
            // Applications
            React.createElement('td', { className: "px-4 py-2 max-w-xs text-sm text-gray-700 truncate", title: component.applications }, component.applications),
            // Actions
            React.createElement('td', { className: "px-4 py-2 whitespace-nowrap text-center text-sm font-medium" },
                React.createElement('button', { onClick: () => onEditComponent(component), className: "text-indigo-600 hover:text-indigo-900 mr-3", title: "Edit Component" }, "Edit"),
                React.createElement('button', { onClick: () => onDeleteComponent(component.id), className: "text-red-600 hover:text-red-900", title: "Delete Component" }, "Delete")
            )
        );
    };

    // Renders a single card in the card view
    const renderCard = (component) => {
        const isSelected = selectedComponents.includes(component.id);
        const lowStock = helpers.isLowStock(component, lowStockConfig);
        const formattedPrice = helpers.formatCurrency(component.price, currencySymbol);
        const datasheetLinks = helpers.formatDatasheets(component.datasheets);
        const imageUrl = component.image || `https://placehold.co/200x150/e2e8f0/94a3b8?text=No+Image`; // Placeholder

        return React.createElement('div', {
            key: component.id,
            className: `relative bg-white rounded-lg shadow border border-gray-200 hover:shadow-md transition-shadow duration-150 ${isSelected ? 'ring-2 ring-offset-1 ring-blue-500' : ''} ${lowStock ? 'border-l-4 border-red-400' : ''}`
        },
            // Select Checkbox
            React.createElement('div', { className: "absolute top-2 left-2 z-10" },
                React.createElement('input', { type: "checkbox", checked: isSelected, onChange: () => onToggleSelect(component.id), className: "h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 bg-white bg-opacity-75", title: "Select component" })
            ),
            // Image Area
            React.createElement('div', { className: "relative h-40 bg-gray-100 rounded-t-lg flex items-center justify-center overflow-hidden" },
                React.createElement('img', {
                    src: component.image || '', // Use component image if available
                    alt: component.name || 'Component Image',
                    className: "w-full h-full object-contain p-2",
                    // Fallback placeholder if image fails to load
                    onError: (e) => { e.target.onerror = null; e.target.src = `https://placehold.co/200x150/e2e8f0/94a3b8?text=No+Image`; }
                }),
                lowStock && React.createElement('span', { className: "absolute bottom-1 right-1 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded" }, "LOW")
            ),
            // Card Content
            React.createElement('div', { className: "p-4" },
                // Name & Type
                React.createElement('div', { className: "flex justify-between items-start mb-2" },
                    React.createElement('h3', { className: "font-bold text-lg text-gray-800 truncate mr-2", title: component.name }, component.name),
                    component.type && React.createElement('span', { className: "flex-shrink-0 bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full" }, component.type)
                ),
                // Footprint
                React.createElement('div', { className: "text-sm text-gray-600 mb-1 flex justify-between" },
                    React.createElement('span', { className: "font-medium" }, "Footprint:"),
                    component.footprint ?
                        React.createElement('span', { className: "bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded" }, component.footprint)
                        : React.createElement('span', { className: "text-gray-400" }, "-")
                ),
                // Category
                React.createElement('div', { className: "text-sm text-gray-500 mb-1" }, component.category),
                // Price
                React.createElement('div', { className: "text-md font-semibold text-green-700 mb-3" }, formattedPrice),
                // Quantity Controls
                React.createElement('div', { className: "flex items-center justify-center space-x-2 mb-3 border-t border-b py-2 border-gray-100" },
                    React.createElement('button', { onClick: () => onUpdateQuantity(component.id, -1), className: "text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100", title: "Decrease Quantity" }, React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", className: "h-5 w-5", viewBox: "0 0 20 20", fill: "currentColor" }, React.createElement('path', { fillRule: "evenodd", d: "M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z", clipRule: "evenodd" }))),
                    React.createElement('span', { className: `text-lg font-semibold ${lowStock ? 'text-red-600' : 'text-gray-900'}` }, component.quantity || 0),
                    React.createElement('button', { onClick: () => onUpdateQuantity(component.id, 1), className: "text-green-500 hover:text-green-700 p-1 rounded-full hover:bg-green-100", title: "Increase Quantity" }, React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", className: "h-5 w-5", viewBox: "0 0 20 20", fill: "currentColor" }, React.createElement('path', { fillRule: "evenodd", d: "M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z", clipRule: "evenodd" })))
                ),
                // Applications
                component.applications && React.createElement('p', { className: "text-sm text-gray-600 mb-2 truncate", title: component.applications }, React.createElement('span', { className: "font-medium" }, "Uses: "), component.applications),
                // Datasheets
                React.createElement('div', { className: "mb-3" },
                    datasheetLinks.map((url, index) =>
                        React.createElement('a', { key: index, href: url, target: "_blank", rel: "noopener noreferrer", className: "text-sm text-blue-500 hover:text-blue-700 hover:underline mr-2 inline-block" }, `Datasheet ${datasheetLinks.length > 1 ? index + 1 : ''}`)
                    )
                ),
                // Action Buttons
                React.createElement('div', { className: "flex justify-end space-x-2 border-t border-gray-100 pt-3" },
                    React.createElement('button', { onClick: () => onEditComponent(component), className: "px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-medium rounded hover:bg-indigo-200 transition duration-150", title: "Edit Component" }, "Edit"),
                    React.createElement('button', { onClick: () => onDeleteComponent(component.id), className: "px-3 py-1 bg-red-100 text-red-700 text-xs font-medium rounded hover:bg-red-200 transition duration-150", title: "Delete Component" }, "Delete")
                )
            )
        );
    };

    // --- Main Render ---
    return (
        React.createElement('div', null,
            // --- Control buttons and Filters Row ---
            React.createElement('div', { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 items-end" },
                // Add Component Button
                React.createElement('div', { className: "lg:col-span-1" },
                    React.createElement('button', { onClick: onAddComponent, className: "w-full px-4 py-2 bg-green-500 text-white rounded shadow hover:bg-green-600 transition duration-150 ease-in-out" }, "+ Add Component")
                ),
                // Category Filter
                React.createElement('div', { className: "lg:col-span-1" },
                    React.createElement('label', { htmlFor: "category-filter", className: "block mb-1 text-sm font-medium text-gray-700" }, "Filter by Category"),
                    React.createElement('select', { id: "category-filter", className: "w-full p-2 border border-gray-300 rounded shadow-sm focus:ring-blue-500 focus:border-blue-500", value: selectedCategory, onChange: handleCategoryChange },
                        React.createElement('option', { value: "all" }, "All Categories"),
                        (categories || []).sort().map(category => React.createElement('option', { key: category, value: category }, category))
                    )
                ),
                // Search Input
                React.createElement('div', { className: "lg:col-span-1" },
                    React.createElement('label', { htmlFor: "search-input", className: "block mb-1 text-sm font-medium text-gray-700" }, "Search"),
                    React.createElement('input', { id: "search-input", type: "text", placeholder: "Name, type, category...", className: "w-full p-2 border border-gray-300 rounded shadow-sm focus:ring-blue-500 focus:border-blue-500", value: searchTerm, onChange: handleSearchChange })
                ),
                // View Mode Toggle
                React.createElement('div', { className: "lg:col-span-1" },
                    React.createElement('label', { className: "block mb-1 text-sm font-medium text-gray-700" }, "View Mode"),
                    React.createElement('div', { className: "flex rounded shadow-sm border border-gray-300" },
                        React.createElement('button', { title: "Table View", className: `flex-1 p-2 text-sm rounded-l ${viewMode === 'table' ? 'bg-blue-500 text-white' : 'bg-white hover:bg-gray-100 text-gray-700'}`, onClick: () => handleViewChange('table') },
                            React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", className: "h-5 w-5 inline mr-1", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor" }, React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M3 10h18M3 14h18M4 6h16M4 18h16" })), " Table"
                        ),
                        React.createElement('button', { title: "Card View", className: `flex-1 p-2 text-sm rounded-r ${viewMode === 'card' ? 'bg-blue-500 text-white' : 'bg-white hover:bg-gray-100 text-gray-700'}`, onClick: () => handleViewChange('card') },
                            React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", className: "h-5 w-5 inline mr-1", viewBox: "0 0 20 20", fill: "currentColor" }, React.createElement('path', { d: "M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" })), " Cards"
                        )
                    )
                )
            ), // End Filters Row

            // --- Inventory Summary Stats ---
            React.createElement('div', { className: "bg-gray-50 p-4 rounded-lg shadow border border-gray-200 mb-6" },
                React.createElement('h2', { className: "text-lg font-semibold mb-3 text-gray-700" }, "Inventory Summary"),
                React.createElement('div', { className: "grid grid-cols-2 md:grid-cols-5 gap-4 text-center mb-4" }, // 5 cols for potential total value
                    // Total Components Stat
                    React.createElement('div', { className: "p-3 bg-white rounded-lg border" },
                        React.createElement('h3', { className: "text-sm font-medium text-gray-500" }, "Components"),
                        React.createElement('p', { className: "text-2xl font-semibold text-blue-600" }, totalComponents)
                    ),
                    // Total Items Stat
                    React.createElement('div', { className: "p-3 bg-white rounded-lg border" },
                        React.createElement('h3', { className: "text-sm font-medium text-gray-500" }, "Total Items"),
                        React.createElement('p', { className: "text-2xl font-semibold text-green-600" }, totalItems)
                    ),
                    // Total Value Stat (Conditional)
                    showTotalValue && React.createElement('div', { className: "p-3 bg-white rounded-lg border" },
                        React.createElement('h3', { className: "text-sm font-medium text-gray-500" }, "Total Value"),
                        React.createElement('p', { className: "text-2xl font-semibold text-purple-600" }, helpers.formatCurrency(totalValue, currencySymbol))
                    ),
                    // Categories Stat
                    React.createElement('div', { className: "p-3 bg-white rounded-lg border" },
                        React.createElement('h3', { className: "text-sm font-medium text-gray-500" }, "Categories"),
                        React.createElement('p', { className: "text-2xl font-semibold text-indigo-600" }, (categories || []).length)
                    ),
                    // Low Stock Stat
                    React.createElement('div', { className: "p-3 bg-white rounded-lg border" },
                        React.createElement('h3', { className: "text-sm font-medium text-gray-500" }, "Low Stock"),
                        React.createElement('p', { className: `text-2xl font-semibold ${lowStockCount > 0 ? 'text-red-600' : 'text-gray-600'}` }, lowStockCount)
                    )
                ),
                // Category Counts Section
                totalComponents > 0 && React.createElement('div', { className: "border-t border-gray-200 pt-3 mt-3" },
                    React.createElement('h3', { className: "text-md font-semibold text-gray-600 mb-2" }, "Item Counts by Category"),
                    React.createElement('div', { className: "flex flex-wrap gap-3" },
                        categoryCounts.length > 0 ? categoryCounts.map(([category, count]) =>
                            React.createElement('div', { key: category, className: "bg-white border border-gray-200 rounded-md px-3 py-1 shadow-sm" },
                                React.createElement('span', { className: "text-sm font-medium text-gray-700" }, category, ":"),
                                React.createElement('span', { className: "text-sm font-semibold text-blue-700 ml-1" }, count)
                            )
                        ) : React.createElement('p', { className: "text-sm text-gray-500 italic" }, "No items with categories found.")
                    )
                )
            ), // End Summary Stats

            // --- Bulk Action Bar (Conditional) ---
            selectedComponents.length > 0 && React.createElement('div', { className: "bg-blue-50 border border-blue-200 p-3 rounded shadow-sm mb-4 flex flex-wrap justify-between items-center gap-2" },
                // Select All Checkbox & Count
                React.createElement('div', { className: "flex items-center" },
                    React.createElement('input', {
                        type: "checkbox", id: "select-all-filtered-bulk",
                        className: "h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mr-2",
                        checked: selectedComponents.length === filteredComponents.length && filteredComponents.length > 0,
                        onChange: onToggleSelectAll,
                        title: selectedComponents.length === filteredComponents.length ? "Deselect All Visible" : "Select All Visible",
                        disabled: filteredComponents.length === 0
                    }),
                    React.createElement('label', { htmlFor: "select-all-filtered-bulk", className: "text-sm text-blue-800" }, ` ${selectedComponents.length} component(s) selected `)
                ),
                // Bulk Action Buttons
                React.createElement('div', { className: "flex gap-2" },
                    React.createElement('button', { onClick: onBulkEdit, className: "px-3 py-1 bg-blue-500 text-white text-sm rounded shadow hover:bg-blue-600 transition duration-150" }, "Edit Selected"),
                    React.createElement('button', { onClick: onBulkDelete, className: "px-3 py-1 bg-red-500 text-white text-sm rounded shadow hover:bg-red-600 transition duration-150" }, "Delete Selected")
                )
            ), // End Bulk Action Bar

            // --- Components List (Table or Cards) ---
            viewMode === 'table' ? (
                // Table View
                React.createElement('div', { className: "overflow-x-auto w-full bg-white rounded-lg shadow mb-6 border border-gray-200" },
                    React.createElement('div', { className: "min-w-full" }, // Ensure minimum width fits content
                        React.createElement('table', { className: "w-full divide-y divide-gray-200" },
                            React.createElement('thead', { className: "bg-gray-50" },
                                React.createElement('tr', null,
                                    // Select All Header Checkbox
                                    React.createElement('th', { className: "w-10 px-3 py-3 text-center" },
                                        React.createElement('input', {
                                            type: "checkbox", className: "h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500",
                                            checked: selectedComponents.length === filteredComponents.length && filteredComponents.length > 0,
                                            onChange: onToggleSelectAll,
                                            disabled: filteredComponents.length === 0,
                                            title: selectedComponents.length === filteredComponents.length ? "Deselect All Visible" : "Select All Visible"
                                        })
                                    ),

                                    // Other Headers
                                    React.createElement('th', { className: "px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" }, "Component"),
                                    React.createElement('th', { className: "px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" }, "Type"),
                                    React.createElement('th', { className: "px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider" }, "Marks"),
                                    React.createElement('th', { className: "px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" }, "Footprint"),
                                    React.createElement('th', { className: "px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider" }, "Quantity"),
                                    React.createElement('th', { className: "px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider" }, "Price"),
                                    React.createElement('th', { className: "px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" }, "Applications"),
                                    React.createElement('th', { className: "px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider" }, "Actions")
                                )
                            ),
                            React.createElement('tbody', { className: "bg-white divide-y divide-gray-200" },
                                filteredComponents.length > 0 ? filteredComponents.map(renderTableRow) : null,
                                // Empty/No Match Messages
                                filteredComponents.length === 0 && totalComponents > 0 && React.createElement('tr', null, React.createElement('td', { colSpan: "8", className: "px-4 py-8 text-center text-gray-500 italic" }, " No components match filters. ")),
                                totalComponents === 0 && React.createElement('tr', null, React.createElement('td', { colSpan: "8", className: "px-4 py-8 text-center text-gray-500" }, " Inventory empty. Add components. "))
                            )
                        )
                    )
                )
            ) : (
                // Card View
                React.createElement('div', null,
                    React.createElement('div', { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mb-6" },
                        filteredComponents.length > 0 ? filteredComponents.map(renderCard) : null,
                        // Empty/No Match Messages
                        filteredComponents.length === 0 && totalComponents > 0 && React.createElement('div', { className: "col-span-full p-8 text-center text-gray-500 bg-white rounded shadow italic" }, " No components match filters. "),
                        totalComponents === 0 && React.createElement('div', { className: "col-span-full p-8 text-center text-gray-500 bg-white rounded shadow" }, " Inventory empty. Add components. ")
                    )
                )
            ) // End Conditional View Rendering
        ) // End Main Inventory View Div
    );
};

console.log("InventoryView component loaded."); // For debugging

