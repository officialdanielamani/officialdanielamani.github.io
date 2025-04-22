// js/components/ComponentForm.js

// Ensure the global namespace exists
window.App = window.App || {};
window.App.components = window.App.components || {};

/**
 * React Component for the Add/Edit Component Modal Form.
 * Uses React and JSX syntax - must be processed by Babel.
 */
window.App.components.ComponentForm = ({
    // Props expected by this component
    componentData, // Object: The component being edited, or initial state for new
    categories, // Array: List of available category strings
    footprints, // Array: List of available footprint strings 
    currencySymbol, // String: Currency symbol for price field
    onSave, // Function: Callback when the save button is clicked, passes the component data
    onCancel, // Function: Callback when the cancel button or close icon is clicked
    isEditMode // Boolean: True if editing an existing component, false if adding new
}) => {
    // Use React hooks for local form state management
    const { useState, useEffect } = React;

    // Internal state to manage form inputs, initialized from props
    const [formData, setFormData] = useState(componentData);

    // Update internal state if the componentData prop changes (e.g., when opening the modal)
    useEffect(() => {
        setFormData(componentData);
    }, [componentData]);

    // Handle changes in form inputs
    useEffect(() => {
        setFormData({
            ...componentData,
            // Initialize with false if not present in the component data
            favorite: componentData.favorite || false,
            bookmark: componentData.bookmark || false,
            star: componentData.star || false
        });
    }, [componentData]);

    // Handle changes in form inputs
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        // For checkbox inputs, use the 'checked' property as the value
        const newValue = type === 'checkbox' ? checked : value;

        setFormData(prevData => ({
            ...prevData,
            [name]: newValue
        }));
    };

    // Handle category selection, including the "Add new..." option
    const handleCategoryChange = (e) => {
        const value = e.target.value;
        setFormData(prevData => ({
            ...prevData,
            category: value,
            // Reset custom category input if a standard category is selected
            customCategory: value === '__custom__' ? prevData.customCategory : ''
        }));
    };

    // Add this new state to track image loading status
    const [imagePreview, setImagePreview] = useState({
        url: componentData.image || '',
        loading: false,
        error: false
    });

    // Add this function to handle image URL changes
    const handleImageUrlChange = (e) => {
        const url = e.target.value;

        // Update form data
        setFormData(prevData => ({
            ...prevData,
            image: url
        }));

        // Reset preview state
        setImagePreview({
            url: url,
            loading: true,
            error: false
        });
    };

    // Add this function to handle image load events
    const handleImageLoad = () => {
        setImagePreview(prev => ({
            ...prev,
            loading: false,
            error: false
        }));
    };

    // Add this function to handle image error events
    const handleImageError = () => {
        setImagePreview(prev => ({
            ...prev,
            loading: false,
            error: true
        }));
    };

    // Handle footprint selection, including the "Custom footprint..." option
    const handleFootprintChange = (e) => {
        const value = e.target.value;
        setFormData(prevData => ({
            ...prevData,
            footprint: value,
            // Reset custom footprint input if a standard footprint is selected
            customFootprint: value === '__custom__' ? prevData.customFootprint : ''
        }));
    };

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault(); // Prevent default form submission
        onSave(formData); // Pass the current form data to the parent save handler
    };

    // --- Render ---
    // This component returns JSX, which needs to be rendered within a <script type="text/babel"> tag
    // or processed by Babel Standalone if loaded via a standard <script> tag with appropriate setup.
    // For simplicity with the current setup, this JSX will be *used* inside the main app's Babel script.
    return (
        React.createElement('div', { className: "fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-30" },
            React.createElement('div', { className: "bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col" },
                // Header
                React.createElement('div', { className: "flex justify-between items-center p-5 border-b border-gray-200 flex-shrink-0" },
                    React.createElement('h2', { className: "text-xl font-semibold text-gray-800" }, isEditMode ? 'Edit Component' : 'Add New Component'),
                    React.createElement('button', { onClick: onCancel, className: "text-gray-400 hover:text-gray-600", title: "Close" },
                        // Close Icon SVG
                        React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", className: "h-6 w-6", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor" },
                            React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M6 18L18 6M6 6l12 12" })
                        )
                    )
                ),
                // Form Body (Scrollable)
                React.createElement('form', { onSubmit: handleSubmit, className: "p-6 overflow-y-auto flex-grow" },
                    React.createElement('div', { className: "grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-4" },
                        // Name Input
                        React.createElement('div', { className: "md:col-span-1" },
                            React.createElement('label', { htmlFor: "comp-name", className: "block mb-1 text-sm font-medium text-gray-700" }, "Name ", React.createElement('span', { className: "text-red-500" }, "*")),
                            React.createElement('input', { id: "comp-name", name: "name", type: "text", className: "w-full p-2 border border-gray-300 rounded shadow-sm focus:ring-blue-500 focus:border-blue-500", value: formData.name || '', onChange: handleChange, required: true })
                        ),
                        // Category Select/Input
                        React.createElement('div', { className: "md:col-span-1" },
                            React.createElement('label', { htmlFor: "comp-category", className: "block mb-1 text-sm font-medium text-gray-700" }, "Category ", React.createElement('span', { className: "text-red-500" }, "*")),
                            React.createElement('select', { id: "comp-category", name: "category", className: "w-full p-2 border border-gray-300 rounded shadow-sm focus:ring-blue-500 focus:border-blue-500 mb-2", value: formData.category || '', onChange: handleCategoryChange, required: true },
                                React.createElement('option', { value: "" }, "-- Select category --"),
                                (categories || []).sort().map(cat => React.createElement('option', { key: cat, value: cat }, cat)),
                                React.createElement('option', { value: "__custom__" }, "Add new...")
                            ),
                            formData.category === '__custom__' && React.createElement('input', {
                                name: "customCategory", type: "text", placeholder: "New category name", className: "w-full p-2 border border-gray-300 rounded shadow-sm focus:ring-blue-500 focus:border-blue-500", value: formData.customCategory || '', onChange: handleChange, required: true
                            })
                        ),
                        // Type Input
                        React.createElement('div', { className: "md:col-span-1" },
                            React.createElement('label', { htmlFor: "comp-type", className: "block mb-1 text-sm font-medium text-gray-700" }, "Type / Model"),
                            React.createElement('input', { id: "comp-type", name: "type", type: "text", className: "w-full p-2 border border-gray-300 rounded shadow-sm focus:ring-blue-500 focus:border-blue-500", value: formData.type || '', onChange: handleChange, placeholder: "e.g., Resistor, LM7805" })
                        ),
                        // Quantity Input
                        React.createElement('div', { className: "md:col-span-1" },
                            React.createElement('label', { htmlFor: "comp-quantity", className: "block mb-1 text-sm font-medium text-gray-700" }, "Quantity"),
                            React.createElement('input', { id: "comp-quantity", name: "quantity", type: "number", min: "0", className: "w-full p-2 border border-gray-300 rounded shadow-sm focus:ring-blue-500 focus:border-blue-500", value: formData.quantity || 0, onChange: handleChange })
                        ),
                        // Price Input
                        React.createElement('div', { className: "md:col-span-1" },
                            React.createElement('label', { htmlFor: "comp-price", className: "block mb-1 text-sm font-medium text-gray-700" }, `Price (${currencySymbol || '$'})`),
                            React.createElement('input', { id: "comp-price", name: "price", type: "number", min: "0", step: "0.01", className: "w-full p-2 border border-gray-300 rounded shadow-sm focus:ring-blue-500 focus:border-blue-500", value: formData.price || 0, onChange: handleChange, placeholder: "0.00" })
                        ),
                        // Footprint Select/Input
                        React.createElement('div', { className: "md:col-span-1" },
                            React.createElement('label', { htmlFor: "comp-footprint", className: "block mb-1 text-sm font-medium text-gray-700" }, "Footprint"),
                            React.createElement('select', {
                                id: "comp-footprint",
                                name: "footprint",
                                className: "w-full p-2 border border-gray-300 rounded shadow-sm focus:ring-blue-500 focus:border-blue-500 mb-2",
                                value: formData.footprint || '',
                                onChange: handleFootprintChange
                            },
                                React.createElement('option', { value: "" }, "-- Select footprint --"),
                                React.createElement('option', { value: "__custom__" }, "Custom footprint..."),
                                (footprints || []).sort().map(fp => React.createElement('option', { key: fp, value: fp }, fp))
                            ),
                            formData.footprint === '__custom__' && React.createElement('input', {
                                name: "customFootprint",
                                type: "text",
                                placeholder: "Enter custom footprint",
                                className: "w-full p-2 border border-gray-300 rounded shadow-sm focus:ring-blue-500 focus:border-blue-500",
                                value: formData.customFootprint || '',
                                onChange: handleChange,
                                required: true
                            })
                        ),
                        // Applications Input
                        React.createElement('div', { className: "md:col-span-2" },
                            React.createElement('label', { htmlFor: "comp-applications", className: "block mb-1 text-sm font-medium text-gray-700" }, "Applications"),
                            React.createElement('input', { id: "comp-applications", name: "applications", type: "text", className: "w-full p-2 border border-gray-300 rounded shadow-sm focus:ring-blue-500 focus:border-blue-500", value: formData.applications || '', onChange: handleChange, placeholder: "e.g., Voltage regulation" })
                        ),
                        // Datasheets Textarea
                        React.createElement('div', { className: "md:col-span-2" },
                            React.createElement('label', { htmlFor: "comp-datasheets", className: "block mb-1 text-sm font-medium text-gray-700" }, "Datasheet URLs"),
                            React.createElement('textarea', { id: "comp-datasheets", name: "datasheets", className: "w-full p-2 border border-gray-300 rounded shadow-sm focus:ring-blue-500 focus:border-blue-500 font-mono text-xs", rows: "3", value: formData.datasheets || '', onChange: handleChange, placeholder: "One URL per line or comma-separated..." }),
                            React.createElement('p', { className: "text-xs text-gray-500 mt-1" }, "Enter full URLs (http:// or https://).")
                        ),
                        // Image URL Input + Preview
                        React.createElement('div', { className: "md:col-span-2" },
                            React.createElement('label', { htmlFor: "comp-image", className: "block mb-1 text-sm font-medium text-gray-700" }, "Image URL"),
                            React.createElement('div', { className: "flex flex-col md:flex-row gap-4" },
                                React.createElement('div', { className: "flex-grow" },
                                    React.createElement('input', {
                                        id: "comp-image",
                                        name: "image",
                                        type: "text",
                                        className: "w-full p-2 border border-gray-300 rounded shadow-sm focus:ring-blue-500 focus:border-blue-500 font-mono text-xs",
                                        value: formData.image || '',
                                        onChange: handleImageUrlChange,
                                        placeholder: "https://example.com/image.jpg"
                                    }),
                                    React.createElement('p', { className: "text-xs text-gray-500 mt-1" }, "Optional direct link to image.")
                                ),
                                formData.image && React.createElement('div', { className: "md:w-40 h-40 border border-gray-300 rounded flex items-center justify-center bg-gray-100" },
                                    imagePreview.loading && React.createElement('div', { className: "text-sm text-gray-500" }, "Loading..."),
                                    !imagePreview.loading && imagePreview.error && React.createElement('div', { className: "text-sm text-red-500" }, "Invalid image"),
                                    !imagePreview.loading && !imagePreview.error && formData.image && React.createElement('img', {
                                        src: formData.image,
                                        alt: "Preview",
                                        className: "max-w-full max-h-full object-contain",
                                        onLoad: handleImageLoad,
                                        onError: handleImageError
                                    })
                                )
                            )
                        ),
                        // Parameters Textarea
                        React.createElement('div', { className: "md:col-span-2" },
                            React.createElement('label', { htmlFor: "comp-parameters", className: "block mb-1 text-sm font-medium text-gray-700" }, "Additional Parameters"),
                            React.createElement('textarea', { id: "comp-parameters", name: "parameters", className: "w-full p-2 border border-gray-300 rounded shadow-sm focus:ring-blue-500 focus:border-blue-500 font-mono text-sm", rows: "5", value: formData.parameters || '', onChange: handleChange, placeholder: "One per line:\nVoltage: 5V\nTolerance: 5%" }),
                            React.createElement('p', { className: "text-xs text-gray-500 mt-1" }, "Format: \"Name: Value\".")
                        ),
                        // --- Favorite, Bookmark, Star Toggles ---
                        React.createElement('div', { className: "md:col-span-2 mt-4 border-t pt-4" },
                            React.createElement('h3', { className: "text-md font-medium mb-3 text-gray-600" }, "Mark Component As:"),
                            React.createElement('div', { className: "flex flex-wrap gap-6" },
                                // Favorite Toggle
                                React.createElement('label', {
                                    htmlFor: "comp-favorite",
                                    className: "flex items-center space-x-2 text-sm cursor-pointer"
                                },
                                    React.createElement('input', {
                                        id: "comp-favorite",
                                        name: "favorite",
                                        type: "checkbox",
                                        checked: formData.favorite || false,
                                        onChange: (e) => handleChange({
                                            target: { name: "favorite", value: e.target.checked }
                                        }),
                                        className: "h-4 w-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                                    }),
                                    React.createElement('span', { className: "text-gray-700 flex items-center" },
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
                                    )
                                ),
                                // Bookmark Toggle
                                React.createElement('label', {
                                    htmlFor: "comp-bookmark",
                                    className: "flex items-center space-x-2 text-sm cursor-pointer"
                                },
                                    React.createElement('input', {
                                        id: "comp-bookmark",
                                        name: "bookmark",
                                        type: "checkbox",
                                        checked: formData.bookmark || false,
                                        onChange: (e) => handleChange({
                                            target: { name: "bookmark", value: e.target.checked }
                                        }),
                                        className: "h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    }),
                                    React.createElement('span', { className: "text-gray-700 flex items-center" },
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
                                    )
                                ),
                                // Star Toggle
                                React.createElement('label', {
                                    htmlFor: "comp-star",
                                    className: "flex items-center space-x-2 text-sm cursor-pointer"
                                },
                                    React.createElement('input', {
                                        id: "comp-star",
                                        name: "star",
                                        type: "checkbox",
                                        checked: formData.star || false,
                                        onChange: (e) => handleChange({
                                            target: { name: "star", value: e.target.checked }
                                        }),
                                        className: "h-4 w-4 text-yellow-600 border-gray-300 rounded focus:ring-yellow-500"
                                    }),
                                    React.createElement('span', { className: "text-gray-700 flex items-center" },
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
                                    )
                                )
                            )
                        )

                    ) // End grid
                ), // End Form Body
                // Footer (Action Buttons)
                React.createElement('div', { className: "flex justify-end space-x-3 p-4 border-t border-gray-200 bg-gray-50 rounded-b-lg flex-shrink-0" },
                    React.createElement('button', { type: "button", className: "px-4 py-2 bg-gray-200 text-gray-800 rounded shadow-sm hover:bg-gray-300 transition duration-150", onClick: onCancel }, "Cancel"),
                    // Use button type="submit" to trigger the form's onSubmit
                    React.createElement('button', { type: "submit", formNoValidate: true, onClick: handleSubmit, className: "px-4 py-2 bg-blue-500 text-white rounded shadow hover:bg-blue-600 transition duration-150" }, isEditMode ? 'Save Changes' : 'Add Component')
                )
            ) // End Modal Content
        ) // End Modal Backdrop
    );
};

console.log("ComponentForm component loaded."); // For debugging
