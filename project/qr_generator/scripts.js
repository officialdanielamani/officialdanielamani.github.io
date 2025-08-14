let currentQRImage = null;
let db;
let currentContentType = 'text';

// Initialize IndexedDB
function initDB() {
    const request = indexedDB.open('QRDatabase', 1);

    request.onerror = function (event) {
        console.error('Database error:', event.target.error);
    };

    request.onsuccess = function (event) {
        db = event.target.result;
        loadSavedQRs();
    };

    request.onupgradeneeded = function (event) {
        db = event.target.result;
        const objectStore = db.createObjectStore('qrcodes', { keyPath: 'id', autoIncrement: true });
        objectStore.createIndex('timestamp', 'timestamp', { unique: false });
    };
}

// Theme management
function setTheme(event, theme) {
    try {
        console.log('Setting theme to:', theme);

        document.body.setAttribute('data-theme', theme);

        // Remove active class from all theme buttons
        document.querySelectorAll('.theme-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        // Add active class to clicked button
        if (event && event.target) {
            event.target.classList.add('active');
        } else {
            // Fallback: find button by text content
            document.querySelectorAll('.theme-btn').forEach(btn => {
                if (btn.textContent.toLowerCase().trim() === theme.toLowerCase()) {
                    btn.classList.add('active');
                }
            });
        }

        localStorage.setItem('theme', theme);
        console.log('Theme set successfully');

    } catch (error) {
        console.error('Error setting theme:', error);
    }
}

// Load saved theme
function loadTheme() {
    try {
        const savedTheme = localStorage.getItem('theme') || 'light';
        console.log('Loading saved theme:', savedTheme);

        document.body.setAttribute('data-theme', savedTheme);

        // Set active button
        document.querySelectorAll('.theme-btn').forEach(btn => {
            btn.classList.remove('active');
            const btnText = btn.textContent.toLowerCase().trim();
            if (btnText === savedTheme.toLowerCase()) {
                btn.classList.add('active');
            }
        });

        console.log('Theme loaded successfully');
    } catch (error) {
        console.error('Error loading theme:', error);
        // Fallback to light theme
        document.body.setAttribute('data-theme', 'light');
    }
}

// Update size display and sync inputs
function updateSizeDisplay() {
    const sizeDisplay = document.getElementById('sizeDisplay');
    const size = document.getElementById('qrSize').value;
    if (sizeDisplay) {
        sizeDisplay.textContent = size + 'px';
    }
}

function syncSizeSlider() {
    const slider = document.getElementById('qrSize');
    const input = document.getElementById('qrSizeInput');
    if (slider && input) {
        input.value = slider.value;
        generateQR();
    }
}

function syncSizeInput() {
    const slider = document.getElementById('qrSize');
    const input = document.getElementById('qrSizeInput');
    if (slider && input) {
        let value = parseInt(input.value);

        // Clamp value to valid range
        if (value < 128) value = 128;
        if (value > 4096) value = 4096;

        input.value = value;
        slider.value = value;
        generateQR();
    }
}

function updateBorderDisplay() {
    const size = document.getElementById('borderSize').value;
    const input = document.getElementById('borderSizeInput');
    if (input) {
        input.value = size;
    }
}

function syncBorderSize() {
    const slider = document.getElementById('borderSize');
    const input = document.getElementById('borderSizeInput');
    if (slider && input) {
        let value = parseInt(input.value);

        // Clamp value to valid range
        if (value < 0) value = 0;
        if (value > 50) value = 50;

        input.value = value;
        slider.value = value;
    }
}

// Switch between content types
function switchContentType(event, type) {
    currentContentType = type;

    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    if (event && event.target) {
        event.target.classList.add('active');
    }

    // Update content panels
    document.querySelectorAll('.content-panel').forEach(panel => panel.classList.remove('active'));
    const targetPanel = document.getElementById(type === 'text' ? 'textContent' : 'vcardContent');
    if (targetPanel) {
        targetPanel.classList.add('active');
    }

    // Generate QR with current content
    generateQR();
}

// Generate vCard string
function generateVCardString() {
    const nameEl = document.getElementById('vcardName');
    const orgEl = document.getElementById('vcardOrg');
    const titleEl = document.getElementById('vcardTitle');
    const phoneEl = document.getElementById('vcardPhone');
    const emailEl = document.getElementById('vcardEmail');
    const websiteEl = document.getElementById('vcardWebsite');
    const addressEl = document.getElementById('vcardAddress');
    const notesEl = document.getElementById('vcardNotes');

    const name = nameEl ? nameEl.value.trim() : '';
    const org = orgEl ? orgEl.value.trim() : '';
    const title = titleEl ? titleEl.value.trim() : '';
    const phone = phoneEl ? phoneEl.value.trim() : '';
    const email = emailEl ? emailEl.value.trim() : '';
    const website = websiteEl ? websiteEl.value.trim() : '';
    const address = addressEl ? addressEl.value.trim() : '';
    const notes = notesEl ? notesEl.value.trim() : '';

    if (!name && !org && !phone && !email) {
        return 'BEGIN:VCARD\nVERSION:3.0\nFN:Sample Contact\nEND:VCARD';
    }

    let vcard = 'BEGIN:VCARD\nVERSION:3.0\n';

    if (name) {
        vcard += `FN:${name}\n`;
        // Split name into first and last name
        const nameParts = name.split(' ');
        const lastName = nameParts.pop() || '';
        const firstName = nameParts.join(' ') || '';
        vcard += `N:${lastName};${firstName};;;\n`;
    }

    if (org) vcard += `ORG:${org}\n`;
    if (title) vcard += `TITLE:${title}\n`;
    if (phone) vcard += `TEL:${phone}\n`;
    if (email) vcard += `EMAIL:${email}\n`;
    if (website) vcard += `URL:${website}\n`;
    if (address) {
        // Format address for vCard
        vcard += `ADR:;;${address.replace(/\n/g, ' ').replace(/,/g, ';')};;;;\n`;
    }
    if (notes) vcard += `NOTE:${notes}\n`;

    vcard += 'END:VCARD';
    return vcard;
}

// Generate vCard and update QR
function generateVCard() {
    if (currentContentType === 'vcard') {
        generateQR();
    }
}

// Get current content for QR generation
function getCurrentContent() {
    if (currentContentType === 'text') {
        const textEl = document.getElementById('qrText');
        return textEl ? (textEl.value || 'Hello World!') : 'Hello World!';
    } else {
        return generateVCardString();
    }
}

function toggleTransparent(type) {
    const checkbox = document.getElementById(`${type}Transparent`);
    const colorInput = document.getElementById(`${type}Color`);

    if (checkbox && colorInput) {
        if (checkbox.checked) {
            colorInput.disabled = true;
            colorInput.style.opacity = '0.5';
        } else {
            colorInput.disabled = false;
            colorInput.style.opacity = '1';
        }
        generateQR();
    }
}

// Get color value (returns transparent if checkbox is checked)
function getColorValue(type) {
    const checkbox = document.getElementById(`${type}Transparent`);
    const colorInput = document.getElementById(`${type}Color`);

    if (checkbox && checkbox.checked) {
        return 'transparent';
    }
    return colorInput ? colorInput.value : '#000000';
}

function handleImageUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const img = new Image();
            img.onload = function () {
                currentQRImage = img;
                showImagePreview(file.name, e.target.result);
                generateQR();
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    } else {
        currentQRImage = null;
        hideImagePreview();
        generateQR();
    }
}

// Show image preview with remove button
function showImagePreview(fileName, imageSrc) {
    let previewContainer = document.getElementById('imagePreview');
    if (!previewContainer) {
        // Create preview container if it doesn't exist
        previewContainer = document.createElement('div');
        previewContainer.id = 'imagePreview';
        previewContainer.className = 'image-preview';
        previewContainer.innerHTML = `
            <div class="image-preview-content">
                <img id="previewImg" src="" alt="Preview" style="max-width: 60px; max-height: 60px; border-radius: 5px;">
                <div id="previewText" style="flex: 1; text-align: left; margin-left: 10px;"></div>
                <button type="button" class="btn-remove" onclick="removeImage()">✕ Remove</button>
            </div>
        `;

        // Insert after the file input wrapper
        const fileWrapper = document.querySelector('.file-input-wrapper');
        if (fileWrapper && fileWrapper.parentNode) {
            fileWrapper.parentNode.insertBefore(previewContainer, fileWrapper.nextSibling);
        }
    }

    // Update preview content
    const previewImg = document.getElementById('previewImg');
    const previewText = document.getElementById('previewText');
    const fileInputLabel = document.querySelector('.file-input-label');

    if (previewImg) previewImg.src = imageSrc;
    if (previewText) previewText.textContent = `Selected: ${fileName}`;
    if (previewContainer) previewContainer.style.display = 'block';

    // Hide the file input label
    if (fileInputLabel) {
        fileInputLabel.style.display = 'none';
    }
}

// Hide image preview
function hideImagePreview() {
    const previewContainer = document.getElementById('imagePreview');
    const fileInputLabel = document.querySelector('.file-input-label');

    if (previewContainer) {
        previewContainer.style.display = 'none';
    }

    // Show the file input label again
    if (fileInputLabel) {
        fileInputLabel.style.display = 'block';
    }
}

// Remove image function
function removeImage() {
    // Clear the file input
    const fileInput = document.getElementById('qrImage');
    if (fileInput) {
        fileInput.value = '';
    }

    // Clear the current image
    currentQRImage = null;

    // Hide preview
    hideImagePreview();

    // Regenerate QR without image
    generateQR();
}

// ===== UNIFIED TEXT SECTION FUNCTIONS (Header & Footer) =====

// Unified Text Section Functions
function toggleTextSection(section) {
    const checkbox = document.getElementById(`${section}Enabled`);
    const options = document.getElementById(`${section}Options`);

    if (checkbox && options) {
        options.style.display = checkbox.checked ? 'block' : 'none';
        generateQR();
    }
}

function syncTextSectionSize(section) {
    const slider = document.getElementById(`${section}Size`);
    const input = document.getElementById(`${section}SizeInput`);
    if (slider && input) {
        input.value = slider.value;
    }
}

function syncTextSectionSizeSlider(section) {
    const slider = document.getElementById(`${section}Size`);
    const input = document.getElementById(`${section}SizeInput`);
    if (slider && input) {
        let value = parseInt(input.value);
        if (value < 12) value = 12;
        if (value > 48) value = 48;
        input.value = value;
        slider.value = value;
    }
}

function toggleTextSectionTransparent(section, type) {
    const checkbox = document.getElementById(`${section}${type === 'text' ? 'Text' : 'Bg'}Transparent`);
    const colorInput = document.getElementById(`${section}${type === 'text' ? 'Text' : 'Bg'}Color`);

    if (checkbox && colorInput) {
        if (checkbox.checked) {
            colorInput.disabled = true;
            colorInput.style.opacity = '0.5';
        } else {
            colorInput.disabled = false;
            colorInput.style.opacity = '1';
        }
        generateQR();
    }
}

function getTextSectionColorValue(section, type) {
    const checkbox = document.getElementById(`${section}${type === 'text' ? 'Text' : 'Bg'}Transparent`);
    const colorInput = document.getElementById(`${section}${type === 'text' ? 'Text' : 'Bg'}Color`);

    if (checkbox && checkbox.checked) {
        return 'transparent';
    }
    
    const defaultColors = {
        footer: { text: '#ffffff', bg: '#000000' },
        header: { text: '#000000', bg: '#ffffff' }
    };
    
    return colorInput ? colorInput.value : defaultColors[section][type];
}

// Backward compatibility aliases (so existing code still works)
function toggleFooter() { toggleTextSection('footer'); }
function toggleHeader() { toggleTextSection('header'); }
function syncFooterSize() { syncTextSectionSize('footer'); }
function syncHeaderSize() { syncTextSectionSize('header'); }
function syncFooterSizeSlider() { syncTextSectionSizeSlider('footer'); }
function syncHeaderSizeSlider() { syncTextSectionSizeSlider('header'); }
function toggleFooterTransparent(type) { toggleTextSectionTransparent('footer', type); }
function toggleHeaderTransparent(type) { toggleTextSectionTransparent('header', type); }
function getFooterColorValue(type) { return getTextSectionColorValue('footer', type); }
function getHeaderColorValue(type) { return getTextSectionColorValue('header', type); }

// ===== MODULAR QR GENERATION FUNCTIONS =====

// Get QR configuration
function getQRConfig() {
    return {
        text: getCurrentContent(),
        fgColor: getColorValue('fg'),
        bgColor: getColorValue('bg'),
        errorLevel: document.getElementById('errorLevel')?.value || 'M',
        borderSize: parseInt(document.getElementById('borderSize')?.value || 0),
        borderColor: getColorValue('border'),
        footerEnabled: document.getElementById('footerEnabled')?.checked || false,
        footerText: document.getElementById('footerText')?.value || 'example.com',
        footerFont: document.getElementById('footerFont')?.value || 'Arial',
        footerSize: parseInt(document.getElementById('footerSize')?.value || 16),
        footerTextColor: getTextSectionColorValue('footer', 'text'),
        footerBgColor: getTextSectionColorValue('footer', 'bg'),
        headerEnabled: document.getElementById('headerEnabled')?.checked || false,
        headerText: document.getElementById('headerText')?.value || 'My QR Code',
        headerFont: document.getElementById('headerFont')?.value || 'Arial',
        headerSize: parseInt(document.getElementById('headerSize')?.value || 16),
        headerTextColor: getTextSectionColorValue('header', 'text'),
        headerBgColor: getTextSectionColorValue('header', 'bg'),
        hasImage: !!currentQRImage
    };
}

// Calculate canvas dimensions
function calculateCanvasDimensions(qrSize, config) {
    const { borderSize, footerEnabled, headerEnabled } = config;
    
    // Calculate header and footer heights based on QR size (proportional)
    const footerHeight = footerEnabled ? Math.floor(qrSize * 0.15) : 0;
    const headerHeight = headerEnabled ? Math.floor(qrSize * 0.15) : 0;
    
    // Width: QR size + left border + right border
    const width = qrSize + (borderSize * 2);
    
    // Height: header + QR size + footer + borders
    // Borders: top + (middle if header) + (middle if footer) + bottom
    let borderCount = 2; // Always have top and bottom
    if (headerEnabled) borderCount += 1; // Add middle border after header
    if (footerEnabled) borderCount += 1; // Add middle border before footer
    
    const height = headerHeight + qrSize + footerHeight + (borderSize * borderCount);
    
    return { width, height, headerHeight, footerHeight };
}

// Create base QR code
function createBaseQR(size, config) {
    const tempCanvas = document.createElement('canvas');
    
    const qr = new QRious({
        element: tempCanvas,
        value: config.text,
        size: size,
        foreground: config.fgColor,
        background: config.bgColor,
        level: config.errorLevel
    });

    // Add image if present
    if (config.hasImage && currentQRImage) {
        addImageToQR(tempCanvas, currentQRImage);
    }
    
    return tempCanvas;
}

// Draw background and borders
function drawBackground(ctx, dimensions, config) {
    const { width, height } = dimensions;
    const { borderSize, borderColor, bgColor } = config;
    
    // Clear canvas first for transparency support
    ctx.clearRect(0, 0, width, height);
    
    // Only fill with border color if border is enabled and not transparent
    if (borderSize > 0 && borderColor !== 'transparent') {
        ctx.fillStyle = borderColor;
        ctx.fillRect(0, 0, width, height);
    }
    // If no border but QR background is set and not transparent, fill QR area only
    else if (borderSize === 0 && bgColor !== 'transparent') {
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, width, height);
    }
}

// Draw header
function drawHeader(ctx, dimensions, config, isPreview = false) {
    if (!config.headerEnabled) return;
    
    const { width, headerHeight } = dimensions;
    const { borderSize, headerText, headerFont, headerSize, headerTextColor, headerBgColor } = config;
    
    const headerY = borderSize; // Header starts after top border
    const headerWidth = width - (borderSize * 2); // Exclude left and right borders
    
    // Draw header background if not transparent
    if (headerBgColor !== 'transparent') {
        ctx.fillStyle = headerBgColor;
        ctx.fillRect(borderSize, headerY, headerWidth, headerHeight);
    }
    
    // Draw header text if not transparent
    if (headerTextColor !== 'transparent') {
        // Use actual font size with scaling for download vs preview
        let fontSize;
        if (isPreview) {
            // For preview, use the selected size directly (since preview QR is ~260px)
            fontSize = headerSize;
        } else {
            // For download, scale the font size proportionally
            const scaleFactor = (width - (borderSize * 2)) / 260; // Scale based on content width vs preview
            fontSize = Math.floor(headerSize * scaleFactor);
        }
        
        ctx.fillStyle = headerTextColor;
        ctx.font = `${fontSize}px ${headerFont}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        const textX = width / 2;
        const textY = headerY + headerHeight / 2;
        ctx.fillText(headerText, textX, textY);
    }
}

// Draw footer
function drawFooter(ctx, qrSize, dimensions, config, isPreview = false, qrY = 0) {
    if (!config.footerEnabled) return;
    
    const { width, footerHeight } = dimensions;
    const { borderSize, footerText, footerFont, footerSize, footerTextColor, footerBgColor } = config;
    
    const footerY = qrY + qrSize + borderSize; // After QR + middle border
    const footerWidth = width - (borderSize * 2); // Exclude left and right borders
    
    // Draw footer background if not transparent
    if (footerBgColor !== 'transparent') {
        ctx.fillStyle = footerBgColor;
        ctx.fillRect(borderSize, footerY, footerWidth, footerHeight);
    }
    
    // Draw footer text if not transparent
    if (footerTextColor !== 'transparent') {
        // Use actual font size with scaling for download vs preview
        let fontSize;
        if (isPreview) {
            // For preview, use the selected size directly (since preview QR is ~260px)
            fontSize = footerSize;
        } else {
            // For download, scale the font size proportionally
            const scaleFactor = qrSize / 260; // Scale based on QR size vs preview size
            fontSize = Math.floor(footerSize * scaleFactor);
        }
        
        ctx.fillStyle = footerTextColor;
        ctx.font = `${fontSize}px ${footerFont}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        const textX = width / 2;
        const textY = footerY + footerHeight / 2;
        ctx.fillText(footerText, textX, textY);
    }
}

// Main QR generation function (unified for both preview and download)
function generateQRCanvas(targetSize, isPreview = false) {
    const config = getQRConfig();
    const dimensions = calculateCanvasDimensions(targetSize, config);
    
    // Create target canvas
    const canvas = document.createElement('canvas');
    canvas.width = dimensions.width;
    canvas.height = dimensions.height;
    const ctx = canvas.getContext('2d');
    
    // Draw background and borders
    drawBackground(ctx, dimensions, config);
    
    // Draw header
    drawHeader(ctx, dimensions, config, isPreview);
    
    // Create and draw base QR
    const qrCanvas = createBaseQR(targetSize, config);
    
    // Calculate QR position (after header and borders)
    const qrX = config.borderSize; // Left border
    let qrY = config.borderSize; // Start with top border
    if (config.headerEnabled) {
        qrY += dimensions.headerHeight + config.borderSize; // Add header height + middle border
    }
    
    // If QR background is transparent but we have borders, we need to clear the QR area first
    if (config.bgColor === 'transparent' && config.borderSize > 0 && config.borderColor !== 'transparent') {
        ctx.clearRect(qrX, qrY, targetSize, targetSize);
    }
    
    ctx.drawImage(qrCanvas, qrX, qrY);
    
    // Draw footer
    drawFooter(ctx, targetSize, dimensions, config, isPreview, qrY);
    
    return canvas;
}

// Generate QR code for preview
function generateQR() {
    try {
        const canvas = document.getElementById('qrCanvas');
        if (!canvas) {
            console.error('Canvas element not found');
            return;
        }

        const config = getQRConfig();
        if (!config.text) {
            console.error('No text content to generate QR');
            return;
        }

        // Generate QR at preview size (260px for QR content)
        const previewQR = generateQRCanvas(260, true);
        
        // Copy to preview canvas
        canvas.width = previewQR.width;
        canvas.height = previewQR.height;
        canvas.style.width = Math.min(previewQR.width, 300) + 'px';
        canvas.style.height = 'auto';
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(previewQR, 0, 0);
        
    } catch (error) {
        console.error('Error generating QR code:', error);
        setTimeout(() => {
            try {
                generateQR();
            } catch (retryError) {
                console.error('Retry failed:', retryError);
            }
        }, 100);
    }
}

// Generate QR code for download
function generateDownloadQR() {
    try {
        const sizeEl = document.getElementById('qrSize');
        const qrSize = sizeEl ? parseInt(sizeEl.value) : 1080;
        
        // Generate QR at full download size
        return generateQRCanvas(qrSize, false);
        
    } catch (error) {
        console.error('Error generating QR code for download:', error);
        return null;
    }
}

// Add image overlay to QR code
function addImageToQR(canvas, image) {
    const ctx = canvas.getContext('2d');
    const size = canvas.width;
    const imageSize = Math.floor(size * 0.2); // 20% of QR size
    const x = (size - imageSize) / 2;
    const y = (size - imageSize) / 2;

    // Create circular clipping path
    ctx.save();
    ctx.beginPath();
    ctx.arc(x + imageSize / 2, y + imageSize / 2, imageSize / 2, 0, Math.PI * 2);
    ctx.clip();

    // Draw white background circle
    ctx.fillStyle = 'white';
    ctx.fill();

    // Draw the image
    ctx.drawImage(image, x, y, imageSize, imageSize);
    ctx.restore();
}

function downloadQR() {
    const canvas = generateDownloadQR();
    if (!canvas) {
        alert('Error generating QR code for download');
        return;
    }

    const formatEl = document.getElementById('downloadFormat');
    const format = formatEl ? formatEl.value : 'png';
    const fileNameEl = document.getElementById('fileName');
    const customFileName = fileNameEl ? fileNameEl.value.trim() : '';
    const link = document.createElement('a');

    // Generate filename
    let fileName = customFileName || 'qrcode';
    // Remove any existing extensions
    fileName = fileName.replace(/\.(png|jpg|jpeg)$/i, '');
    // Add appropriate extension
    fileName += `.${format}`;

    if (format === 'jpg') {
        link.download = fileName;
        link.href = canvas.toDataURL('image/jpeg', 0.9);
    } else {
        link.download = fileName;
        link.href = canvas.toDataURL('image/png');
    }

    link.click();
}

// Save QR to IndexedDB
function saveQR() {
    const canvas = generateDownloadQR();
    if (!canvas) {
        alert('Error generating QR code for saving');
        return;
    }

    const text = getCurrentContent();
    const fileNameEl = document.getElementById('fileName');
    const customFileName = fileNameEl ? fileNameEl.value.trim() : '';
    const dataURL = canvas.toDataURL('image/png');

    const qrData = {
        text: text,
        contentType: currentContentType,
        image: dataURL,
        fileName: customFileName || null,
        timestamp: new Date().toISOString(),
        size: parseInt(document.getElementById('qrSize')?.value || 1080),
        fgColor: getColorValue('fg'),
        bgColor: getColorValue('bg'),
        borderSize: parseInt(document.getElementById('borderSize')?.value || 0),
        borderColor: getColorValue('border'),
        errorLevel: document.getElementById('errorLevel')?.value || 'M',
        fgTransparent: document.getElementById('fgTransparent')?.checked || false,
        bgTransparent: document.getElementById('bgTransparent')?.checked || false,
        borderTransparent: document.getElementById('borderTransparent')?.checked || false,
        footerEnabled: document.getElementById('footerEnabled')?.checked || false,
        footerText: document.getElementById('footerText')?.value || '',
        footerFont: document.getElementById('footerFont')?.value || 'Arial',
        footerSize: parseInt(document.getElementById('footerSize')?.value || 16),
        footerTextColor: document.getElementById('footerTextColor')?.value || '#ffffff',
        footerBgColor: document.getElementById('footerBgColor')?.value || '#000000',
        footerTextTransparent: document.getElementById('footerTextTransparent')?.checked || false,
        footerBgTransparent: document.getElementById('footerBgTransparent')?.checked || false,
        headerEnabled: document.getElementById('headerEnabled')?.checked || false,
        headerText: document.getElementById('headerText')?.value || '',
        headerFont: document.getElementById('headerFont')?.value || 'Arial',
        headerSize: parseInt(document.getElementById('headerSize')?.value || 16),
        headerTextColor: document.getElementById('headerTextColor')?.value || '#000000',
        headerBgColor: document.getElementById('headerBgColor')?.value || '#ffffff',
        headerTextTransparent: document.getElementById('headerTextTransparent')?.checked || false,
        headerBgTransparent: document.getElementById('headerBgTransparent')?.checked || false,
    };

    // If it's a vCard, also save the individual fields for better display
    if (currentContentType === 'vcard') {
        qrData.vcardData = {
            name: document.getElementById('vcardName')?.value.trim() || '',
            org: document.getElementById('vcardOrg')?.value.trim() || '',
            title: document.getElementById('vcardTitle')?.value.trim() || '',
            phone: document.getElementById('vcardPhone')?.value.trim() || '',
            email: document.getElementById('vcardEmail')?.value.trim() || '',
            website: document.getElementById('vcardWebsite')?.value.trim() || '',
            address: document.getElementById('vcardAddress')?.value.trim() || '',
            notes: document.getElementById('vcardNotes')?.value.trim() || ''
        };
    }

    if (!db) {
        alert('Database not initialized. Please refresh the page.');
        return;
    }

    const transaction = db.transaction(['qrcodes'], 'readwrite');
    const objectStore = transaction.objectStore('qrcodes');
    const request = objectStore.add(qrData);

    request.onsuccess = function () {
        alert('QR code saved successfully!');
        loadSavedQRs();
    };

    request.onerror = function () {
        alert('Error saving QR code.');
    };
}

// Load saved QR codes
function loadSavedQRs() {
    if (!db) return;

    const transaction = db.transaction(['qrcodes'], 'readonly');
    const objectStore = transaction.objectStore('qrcodes');
    const request = objectStore.getAll();

    request.onsuccess = function () {
        const qrs = request.result;
        const grid = document.getElementById('savedGrid');

        if (!grid) return;

        if (qrs.length === 0) {
            grid.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">No saved QR codes yet.</p>';
            return;
        }

        grid.innerHTML = qrs.map(qr => {
            let preview = qr.text;
            let typeIcon = '📄';

            // Better preview for vCard
            if (qr.contentType === 'vcard' && qr.vcardData) {
                typeIcon = '👤';
                const vcard = qr.vcardData;
                preview = `${vcard.name || 'Contact'}`;
                if (vcard.org) preview += ` (${vcard.org})`;
                if (vcard.email) preview += ` • ${vcard.email}`;
                if (vcard.phone) preview += ` • ${vcard.phone}`;
            } else if (qr.text.length > 50) {
                preview = qr.text.substring(0, 50) + '...';
            }

            return `
                <div class="saved-item">
                    <img src="${qr.image}" alt="QR Code">
                    <div class="text-preview">${typeIcon} ${preview}</div>
                    ${qr.fileName ? `<div style="font-size: 0.8rem; color: var(--accent); margin-bottom: 5px; font-weight: bold;">${qr.fileName}</div>` : ''}
                    <div style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 10px;">
                        ${new Date(qr.timestamp).toLocaleDateString()}<br>
                        Size: ${qr.size}px | Level: ${qr.errorLevel || 'M'}
                    </div>
                    <button class="btn delete-btn" onclick="deleteQR(${qr.id})">🗑️ Delete</button>
                    <button class="btn btn-primary" onclick="downloadSavedQR(${qr.id})" style="margin-top: 5px; font-size: 0.8rem;">💾 Download</button>
                </div>
            `;
        }).join('');
    };
}

// Download saved QR code
function downloadSavedQR(id) {
    if (!db) return;

    const transaction = db.transaction(['qrcodes'], 'readonly');
    const objectStore = transaction.objectStore('qrcodes');
    const request = objectStore.get(id);

    request.onsuccess = function () {
        const qr = request.result;
        if (qr) {
            const link = document.createElement('a');

            // Use saved filename or generate default
            let fileName = qr.fileName || `qrcode_${qr.id}`;
            // Remove any existing extensions
            fileName = fileName.replace(/\.(png|jpg|jpeg)$/i, '');
            // Add PNG extension (saved QRs are always PNG)
            fileName += '.png';

            link.download = fileName;
            link.href = qr.image;
            link.click();
        }
    };
}

// Delete QR code
function deleteQR(id) {
    if (confirm('Are you sure you want to delete this QR code?')) {
        if (!db) return;

        const transaction = db.transaction(['qrcodes'], 'readwrite');
        const objectStore = transaction.objectStore('qrcodes');
        const request = objectStore.delete(id);

        request.onsuccess = function () {
            loadSavedQRs();
        };
    }
}

// Initialize everything
document.addEventListener('DOMContentLoaded', function () {
    console.log('DOM loaded, initializing...');

    try {
        loadTheme();
        initDB();

        // Add mobile-friendly event listeners for theme buttons
        document.querySelectorAll('.theme-btn').forEach(btn => {
            // Add both click and touchend for better mobile support
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                const theme = this.textContent.toLowerCase().trim();
                setTheme(e, theme);
            });

            btn.addEventListener('touchend', function (e) {
                e.preventDefault();
                const theme = this.textContent.toLowerCase().trim();
                setTheme(e, theme);
            });
        });

        // Add mobile-friendly event listeners for content type tabs
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                const isTextTab = this.textContent.includes('Text');
                const type = isTextTab ? 'text' : 'vcard';
                switchContentType(e, type);
            });

            btn.addEventListener('touchend', function (e) {
                e.preventDefault();
                const isTextTab = this.textContent.includes('Text');
                const type = isTextTab ? 'text' : 'vcard';
                switchContentType(e, type);
            });
        });

        // Ensure elements exist before generating QR
        setTimeout(() => {
            const canvas = document.getElementById('qrCanvas');
            const textInput = document.getElementById('qrText');

            if (canvas && textInput) {
                console.log('Elements found, generating initial QR');
                generateQR();
            } else {
                console.error('Required elements not found:', { canvas: !!canvas, textInput: !!textInput });
            }
        }, 100);

        // Initialize text section transparent states on page load
        setTimeout(() => {
            const sections = ['footer', 'header'];
            const types = ['Text', 'Bg'];
            
            sections.forEach(section => {
                types.forEach(type => {
                    const checkbox = document.getElementById(`${section}${type}Transparent`);
                    const colorInput = document.getElementById(`${section}${type}Color`);
                    if (checkbox && colorInput && checkbox.checked) {
                        colorInput.disabled = true;
                        colorInput.style.opacity = '0.5';
                    }
                });
            });
        }, 200);

    } catch (error) {
        console.error('Initialization error:', error);
    }
});