        // Check user's preference from localStorage or prefers-color-scheme
        let isDarkMode = localStorage.getItem('darkMode');
        if (isDarkMode === null) {
            isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
        } else {
            isDarkMode = isDarkMode === 'true';
        }

        // Set initial mode
        setMode(isDarkMode);

        // Toggle mode and save preference to localStorage
        const toggleModeButton = document.getElementById('toggleModeButton');
        toggleModeButton.textContent = isDarkMode ? 'Switch to Light Mode ☀️' : 'Switch to Dark Mode 🌑';
        toggleModeButton.addEventListener('click', function () {
            isDarkMode = !isDarkMode;
            setMode(isDarkMode);
            toggleModeButton.textContent = isDarkMode ? 'Switch to Light Mode ☀️' : 'Switch to Dark Mode 🌑';
            localStorage.setItem('darkMode', isDarkMode);
        });

        function setMode(isDarkMode) {
            document.body.classList.toggle('dark-mode', isDarkMode);

            // Change table header background color based on mode
            const headers = document.querySelectorAll('#dataTable th');
            headers.forEach(header => {
                if (isDarkMode) {
                    header.classList.add('dark-mode');
                } else {
                    header.classList.remove('dark-mode');
                }
            });
        }