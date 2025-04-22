// js/components/BulkEditForm.js

// Ensure the global namespace exists
window.App = window.App || {};
window.App.components = window.App.components || {};

/**
 * React Component for the Bulk Edit Modal Form.
 */
window.App.components.BulkEditForm = ({
    // Props
    categories, // Array: List of available category strings
    commonFootprints, // Array: List of common footprint strings
    selectedCount, // Number: How many components are selected
    onApply, // Function: Callback when apply button clicked, passes bulk edit data
    onCancel // Function: Callback when cancel button or close icon clicked
}) => {
    const { useState } = React;

    // Internal state for the bulk edit form fields
    const [bulkData, setBulkData] = useState({
        category: '',
        customCategory: '',
        type: '',
        quantity: '',
        quantityAction: 'set', // 'set', 'increment', 'decrement'
        price: '',
        priceAction: 'set', // 'set', 'increase', 'decrease'
        footprint: '',
        customFootprint: '',
        // Add new fields
        favorite: null, // null = no change, true/false = set value
        bookmark: null,
        star: null
    });

    // Handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setBulkData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };

    // Handle category selection, including "Add new..."
    const handleCategoryChange = (e) => {
        const value = e.target.value;
        setBulkData(prevData => ({
            ...prevData,
            category: value,
            // Reset custom category if a standard one is selected
            customCategory: value === '__custom__' ? prevData.customCategory : ''
        }));
    };

    // Handle footprint selection, including "Custom..."
    const handleFootprintChange = (e) => {
        const value = e.target.value;
        setBulkData(prevData => ({
            ...prevData,
            footprint: value,
            // Reset custom footprint if a standard one is selected
            customFootprint: value === '__custom__' ? prevData.customFootprint : ''
        }));
    };

    // Add new handler for toggle switch changes
    const handleBooleanChange = (name, value) => {
        setBulkData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };

    // Handle applying the changes
    const handleApply = () => {
        onApply(bulkData); // Pass the current bulk edit state to the parent handler
    };

    // --- Render ---
    return (
        React.createElement('div', { className: "fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-20" },
            React.createElement('div', { className: "bg-white rounded-lg shadow-xl w-full max-w-lg" },
                // Header
                React.createElement('div', { className: "p-6" },
                    React.createElement('div', { className: "flex justify-between items-center mb-4 pb-3 border-b border-gray-200" },
                        React.createElement('h2', { className: "text-xl font-semibold text-gray-800" }, `Bulk Edit ${selectedCount} Component(s)`),
                        React.createElement('button', { onClick: onCancel, className: "text-gray-400 hover:text-gray-600", title: "Close" },
                            React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", className: "h-6 w-6", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor" },
                                React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M6 18L18 6M6 6l12 12" })
                            )
                        )
                    ),
                    React.createElement('p', { className: "mb-5 text-sm text-gray-600" }, "Apply changes to selected components. Leave fields blank/unchanged to keep existing values."),
                    // Form Fields
                    React.createElement('div', { className: "space-y-4 mb-6" },
                        // Category
                        React.createElement('div', null,
                            React.createElement('label', { className: "block mb-1 text-sm font-medium text-gray-700" }, "Change Category To"),
                            React.createElement('select', { name: "category", className: "w-full p-2 border border-gray-300 rounded shadow-sm focus:ring-blue-500 focus:border-blue-500 mb-2", value: bulkData.category, onChange: handleCategoryChange },
                                React.createElement('option', { value: "" }, "-- Keep existing category --"),
                                (categories || []).sort().map(cat => React.createElement('option', { key: cat, value: cat }, cat)),
                                React.createElement('option', { value: "__custom__" }, "Add new category...")
                            ),
                            bulkData.category === '__custom__' && React.createElement('input', {
                                name: "customCategory", type: "text", placeholder: "Enter new category name", className: "w-full p-2 border border-gray-300 rounded shadow-sm focus:ring-blue-500 focus:border-blue-500", value: bulkData.customCategory || '', onChange: handleChange
                            })
                        ),
                        // Type
                        React.createElement('div', null,
                            React.createElement('label', { className: "block mb-1 text-sm font-medium text-gray-700" }, "Change Type To"),
                            React.createElement('input', { name: "type", type: "text", placeholder: "Leave blank to keep existing type", className: "w-full p-2 border border-gray-300 rounded shadow-sm focus:ring-blue-500 focus:border-blue-500", value: bulkData.type, onChange: handleChange })
                        ),
                        // Quantity Adjustment
                        React.createElement('div', null,
                            React.createElement('label', { className: "block mb-1 text-sm font-medium text-gray-700" }, "Adjust Quantity"),
                            React.createElement('div', { className: "flex space-x-2" },
                                React.createElement('select', { name: "quantityAction", className: "p-2 border border-gray-300 rounded shadow-sm focus:ring-blue-500 focus:border-blue-500", value: bulkData.quantityAction, onChange: handleChange },
                                    React.createElement('option', { value: "set" }, "Set quantity to"),
                                    React.createElement('option', { value: "increment" }, "Add quantity"),
                                    React.createElement('option', { value: "decrement" }, "Subtract quantity")
                                ),
                                React.createElement('input', { name: "quantity", type: "number", min: "0", placeholder: "Value", className: "flex-1 p-2 border border-gray-300 rounded shadow-sm focus:ring-blue-500 focus:border-blue-500", value: bulkData.quantity, onChange: handleChange })
                            ),
                            React.createElement('p', { className: "text-xs text-gray-500 mt-1" }, "Leave value blank for no quantity change.")
                        ),
                        // Price Adjustment
                        React.createElement('div', null,
                            React.createElement('label', { className: "block mb-1 text-sm font-medium text-gray-700" }, "Adjust Price"),
                            React.createElement('div', { className: "flex space-x-2" },
                                React.createElement('select', { name: "priceAction", className: "p-2 border border-gray-300 rounded shadow-sm focus:ring-blue-500 focus:border-blue-500", value: bulkData.priceAction, onChange: handleChange },
                                    React.createElement('option', { value: "set" }, "Set price to"),
                                    React.createElement('option', { value: "increase" }, "Increase price by"),
                                    React.createElement('option', { value: "decrease" }, "Decrease price by")
                                ),
                                React.createElement('input', { name: "price", type: "number", min: "0", step: "0.01", placeholder: "Value", className: "flex-1 p-2 border border-gray-300 rounded shadow-sm focus:ring-blue-500 focus:border-blue-500", value: bulkData.price, onChange: handleChange })
                            ),
                            React.createElement('p', { className: "text-xs text-gray-500 mt-1" }, "Leave value blank for no price change.")
                        ),
                        // Footprint Adjustment
                        React.createElement('div', null,
                            React.createElement('label', { className: "block mb-1 text-sm font-medium text-gray-700" }, "Change Footprint To"),
                            React.createElement('select', {
                                name: "footprint", className: "w-full p-2 border border-gray-300 rounded shadow-sm focus:ring-blue-500 focus:border-blue-500 mb-2", value: bulkData.footprint, onChange: handleFootprintChange
                            },
                                React.createElement('option', { value: "" }, "-- Keep existing footprint --"),
                                (commonFootprints || []).map(fp => React.createElement('option', { key: fp, value: fp }, fp)),
                                React.createElement('option', { value: "__custom__" }, "Custom footprint...")
                            ),
                            bulkData.footprint === '__custom__' && React.createElement('input', {
                                name: "customFootprint", type: "text", placeholder: "Enter custom footprint", className: "w-full p-2 border border-gray-300 rounded shadow-sm focus:ring-blue-500 focus:border-blue-500", value: bulkData.customFootprint || '', onChange: handleChange
                            })
                        ),

                        // --- Favorite, Bookmark, Star Options ---
                        React.createElement('div', { className: "border-t border-gray-200 pt-4 mt-4" },
                            React.createElement('h3', { className: "font-medium mb-3 text-gray-700" }, "Mark Components As:"),
                            React.createElement('div', { className: "grid grid-cols-1 md:grid-cols-3 gap-4" },
                                // Favorite Option
                                React.createElement('div', null,
                                    React.createElement('label', { className: "block mb-1 text-sm font-medium text-gray-700 flex items-center" },
                                        React.createElement('svg', {
                                            xmlns: "http://www.w3.org/2000/svg",
                                            className: "h-5 w-5 mr-1 text-red-500",
                                            viewBox: "0 0 20 20",
                                            fill: "currentColor"
                                        },
                                            React.createElement('path', {
                                                fillRule: "evenodd",
                                                d: "M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z",
                                                clipRule: "evenodd"
                                            })
                                        ),
                                        "Favorite"
                                    ),
                                    React.createElement('select', {
                                        name: "favorite",
                                        className: "w-full p-2 border border-gray-300 rounded shadow-sm focus:ring-red-500 focus:border-red-500",
                                        value: bulkData.favorite === null ? '' : bulkData.favorite.toString(),
                                        onChange: (e) => {
                                            const value = e.target.value;
                                            handleBooleanChange(
                                                "favorite",
                                                value === '' ? null : value === 'true'
                                            );
                                        }
                                    },
                                        React.createElement('option', { value: "" }, "-- No change --"),
                                        React.createElement('option', { value: "true" }, "Mark as Favorite"),
                                        React.createElement('option', { value: "false" }, "Remove Favorite mark")
                                    )
                                ),

                                // Bookmark Option
                                React.createElement('div', null,
                                    React.createElement('label', { className: "block mb-1 text-sm font-medium text-gray-700 flex items-center" },
                                        React.createElement('svg', {
                                            xmlns: "http://www.w3.org/2000/svg",
                                            className: "h-5 w-5 mr-1 text-blue-500",
                                            viewBox: "0 0 20 20",
                                            fill: "currentColor"
                                        },
                                            React.createElement('path', {
                                                d: "M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z"
                                            })
                                        ),
                                        "Bookmark"
                                    ),
                                    React.createElement('select', {
                                        name: "bookmark",
                                        className: "w-full p-2 border border-gray-300 rounded shadow-sm focus:ring-blue-500 focus:border-blue-500",
                                        value: bulkData.bookmark === null ? '' : bulkData.bookmark.toString(),
                                        onChange: (e) => {
                                            const value = e.target.value;
                                            handleBooleanChange(
                                                "bookmark",
                                                value === '' ? null : value === 'true'
                                            );
                                        }
                                    },
                                        React.createElement('option', { value: "" }, "-- No change --"),
                                        React.createElement('option', { value: "true" }, "Add Bookmark"),
                                        React.createElement('option', { value: "false" }, "Remove Bookmark")
                                    )
                                ),

                                // Star Option
                                React.createElement('div', null,
                                    React.createElement('label', { className: "block mb-1 text-sm font-medium text-gray-700 flex items-center" },
                                        React.createElement('svg', {
                                            xmlns: "http://www.w3.org/2000/svg",
                                            className: "h-5 w-5 mr-1 text-yellow-500",
                                            viewBox: "0 0 20 20",
                                            fill: "currentColor"
                                        },
                                            React.createElement('path', {
                                                d: "M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                                            })
                                        ),
                                        "Star"
                                    ),
                                    React.createElement('select', {
                                        name: "star",
                                        className: "w-full p-2 border border-gray-300 rounded shadow-sm focus:ring-yellow-500 focus:border-yellow-500",
                                        value: bulkData.star === null ? '' : bulkData.star.toString(),
                                        onChange: (e) => {
                                            const value = e.target.value;
                                            handleBooleanChange(
                                                "star",
                                                value === '' ? null : value === 'true'
                                            );
                                        }
                                    },
                                        React.createElement('option', { value: "" }, "-- No change --"),
                                        React.createElement('option', { value: "true" }, "Add Star"),
                                        React.createElement('option', { value: "false" }, "Remove Star")
                                    )
                                )
                            )
                        )

                    ), // End Form Fields
                    // Action Buttons
                    React.createElement('div', { className: "flex justify-end space-x-3 pt-4 border-t border-gray-200" },
                        React.createElement('button', { className: "px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition duration-150", onClick: onCancel }, "Cancel"),
                        React.createElement('button', { className: "px-4 py-2 bg-blue-500 text-white rounded shadow hover:bg-blue-600 transition duration-150", onClick: handleApply }, "Apply Changes")
                    )
                ) // End p-6
            ) // End Modal Content
        ) // End Modal Backdrop
    );
};

console.log("BulkEditForm component loaded."); // For debugging
