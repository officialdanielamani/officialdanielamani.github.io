// js/components/LocationPage.js

// Ensure the global namespace exists
window.App = window.App || {};
window.App.components = window.App.components || {};

/**
 * React Component for the Location Management Page.
 */
window.App.components.LocationPage = ({
    // Props
    locations, // Array: List of location objects
    components, // Array: All component objects
    // Callbacks
    onAddLocation, // Function(newLocation): Called to add a new location
    onEditLocation, // Function(locationId, updatedLocation): Called to edit a location
    onDeleteLocation, // Function(locationId): Called to delete a location
    onEditComponent, // Function: Pass-through to edit component
}) => {
    const { useState } = React;
    const { LocationManager } = window.App.components;

    return React.createElement('div', { className: "space-y-6" },
        React.createElement('h2', { className: "text-xl font-semibold mb-4 text-gray-700" }, "Location Management"),
        React.createElement('p', { className: "mb-4 text-sm text-gray-600" },
            "Manage physical storage locations for your components."
        ),
        React.createElement(LocationManager, {
            locations,
            components,
            onAddLocation,
            onEditLocation,
            onDeleteLocation,
            onEditComponent,
        })
    );
};

console.log("LocationPage component loaded."); // For debugging