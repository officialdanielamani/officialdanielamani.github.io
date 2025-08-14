let currentQRImage = null;
let db;
let currentContentType = 'text';

// Initialize IndexedDB
function initDB() {
    const request = indexedDB.open('QRDatabase', 1);
    
    request.onerror = function(event) {
        console.error('Database error:', event.target.error);
    };
    
    request.onsuccess = function(event) {
        db = event.target.result;
        loadSavedQRs();
    };
    
    request.onupgradeneeded = function(event) {
        db = event.target.result;
        const objectStore = db.createObjectStore('qrcodes', { keyPath: 'id', autoIncrement: true });
        objectStore.createIndex('timestamp', 'timestamp', { unique: false });
    };
}

// Theme management
function setTheme(event, theme) {
    document.body.setAttribute('data-theme', theme);
    document.querySelectorAll('.theme-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    localStorage.setItem('theme', theme);
}

// Load saved theme
function loadTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.body.setAttribute('data-theme', savedTheme);
    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.textContent.toLowerCase() === savedTheme) {
            btn.classList.add('active');
        }
    });
}

// Update size display and sync inputs
function updateSizeDisplay() {
    const size = document.getElementById('qrSize').value;
    document.getElementById('sizeDisplay').textContent = size + 'px';
}

function syncSizeSlider() {
    const slider = document.getElementById('qrSize');
    const input = document.getElementById('qrSizeInput');
    input.value = slider.value;
    generateQR();
}

function syncSizeInput() {
    const slider = document.getElementById('qrSize');
    const input = document.getElementById('qrSizeInput');
    let value = parseInt(input.value);
    
    // Clamp value to valid range
    if (value < 128) value = 128;
    if (value > 4096) value = 4096;
    
    input.value = value;
    slider.value = value;
    generateQR();
}

function updateBorderDisplay() {
    const size = document.getElementById('borderSize').value;
    document.getElementById('borderSizeInput').value = size;
}

function syncBorderSize() {
    const slider = document.getElementById('borderSize');
    const input = document.getElementById('borderSizeInput');
    let value = parseInt(input.value);
    
    // Clamp value to valid range
    if (value < 0) value = 0;
    if (value > 50) value = 50;
    
    input.value = value;
    slider.value = value;
}

// Switch between content types
function switchContentType(event, type) {
    currentContentType = type;
    
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    // Update content panels
    document.querySelectorAll('.content-panel').forEach(panel => panel.classList.remove('active'));
    document.getElementById(type === 'text' ? 'textContent' : 'vcardContent').classList.add('active');
    
    // Generate QR with current content
    generateQR();
}

// Generate vCard string
function generateVCardString() {
    const name = document.getElementById('vcardName').value.trim();
    const org = document.getElementById('vcardOrg').value.trim();
    const title = document.getElementById('vcardTitle').value.trim();
    const phone = document.getElementById('vcardPhone').value.trim();
    const email = document.getElementById('vcardEmail').value.trim();
    const website = document.getElementById('vcardWebsite').value.trim();
    const address = document.getElementById('vcardAddress').value.trim();
    const notes = document.getElementById('vcardNotes').value.trim();
    
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
        return document.getElementById('qrText').value || 'Hello World!';
    } else {
        return generateVCardString();
    }
}
function toggleTransparent(type) {
    const checkbox = document.getElementById(`${type}Transparent`);
    const colorInput = document.getElementById(`${type}Color`);
    
    if (checkbox.checked) {
        colorInput.disabled = true;
        colorInput.style.opacity = '0.5';
    } else {
        colorInput.disabled = false;
        colorInput.style.opacity = '1';
    }
    generateQR();
}

// Get color value (returns transparent if checkbox is checked)
function getColorValue(type) {
    const checkbox = document.getElementById(`${type}Transparent`);
    const colorInput = document.getElementById(`${type}Color`);
    
    if (checkbox.checked) {
        return 'transparent';
    }
    return colorInput.value;
}
function handleImageUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.onload = function() {
                currentQRImage = img;
                generateQR();
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    } else {
        currentQRImage = null;
        generateQR();
    }
}

// Generate QR code for preview (fixed 300px size)
function generateQR() {
    try {
        const text = getCurrentContent();
        const fgColor = getColorValue('fg');
        const bgColor = getColorValue('bg');
        const errorLevel = document.getElementById('errorLevel').value;
        const canvas = document.getElementById('qrCanvas');

        if (!canvas) {
            console.error('Canvas element not found');
            return;
        }

        if (!text) {
            console.error('No text content to generate QR');
            return;
        }

        const qr = new QRious({
            element: canvas,
            value: text,
            size: 300, // Fixed preview size
            foreground: fgColor,
            background: bgColor,
            level: errorLevel
        });

        // Add border if specified
        addBorderToQR(canvas);

        // Add logo/image if uploaded
        if (currentQRImage) {
            addImageToQR(canvas, currentQRImage);
        }
    } catch (error) {
        console.error('Error generating QR code:', error);
        // Fallback for Safari
        setTimeout(() => {
            try {
                generateQR();
            } catch (retryError) {
                console.error('Retry failed:', retryError);
            }
        }, 100);
    }
}

// Generate QR code at actual size for download
function generateDownloadQR() {
    const text = getCurrentContent();
    const size = parseInt(document.getElementById('qrSize').value);
    const fgColor = getColorValue('fg');
    const bgColor = getColorValue('bg');
    const errorLevel = document.getElementById('errorLevel').value;
    
    // Create a temporary canvas for download
    const tempCanvas = document.createElement('canvas');
    
    try {
        const qr = new QRious({
            element: tempCanvas,
            value: text,
            size: size, // Actual selected size
            foreground: fgColor,
            background: bgColor,
            level: errorLevel
        });

        // Add border if specified
        addBorderToQR(tempCanvas);

        // Add logo/image if uploaded
        if (currentQRImage) {
            addImageToQR(tempCanvas, currentQRImage);
        }
        
        return tempCanvas;
    } catch (error) {
        console.error('Error generating QR code for download:', error);
        return null;
    }
}

// Add border to QR code
function addBorderToQR(canvas) {
    const borderSize = parseInt(document.getElementById('borderSize').value);
    if (borderSize === 0) return;

    const borderColor = getColorValue('border');
    const ctx = canvas.getContext('2d');
    const originalSize = canvas.width;
    
    // Create a new canvas with border
    const newSize = originalSize + (borderSize * 2);
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = newSize;
    tempCanvas.height = newSize;
    const tempCtx = tempCanvas.getContext('2d');
    
    // Draw border background
    if (borderColor !== 'transparent') {
        tempCtx.fillStyle = borderColor;
        tempCtx.fillRect(0, 0, newSize, newSize);
    }
    
    // Draw original QR code in center
    tempCtx.drawImage(canvas, borderSize, borderSize);
    
    // Resize original canvas and copy back
    canvas.width = newSize;
    canvas.height = newSize;
    ctx.drawImage(tempCanvas, 0, 0);
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
    ctx.arc(x + imageSize/2, y + imageSize/2, imageSize/2, 0, Math.PI * 2);
    ctx.clip();

    // Draw white background circle
    ctx.fillStyle = 'white';
    ctx.fill();

    // Draw the image
    ctx.drawImage(image, x, y, imageSize, imageSize);
    ctx.restore();
}

// Download QR code
function downloadQR() {
    const canvas = generateDownloadQR();
    if (!canvas) {
        alert('Error generating QR code for download');
        return;
    }
    
    const format = document.getElementById('downloadFormat').value;
    const customFileName = document.getElementById('fileName').value.trim();
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
    const customFileName = document.getElementById('fileName').value.trim();
    const dataURL = canvas.toDataURL('image/png');
    
    const qrData = {
        text: text,
        contentType: currentContentType,
        image: dataURL,
        fileName: customFileName || null,
        timestamp: new Date().toISOString(),
        size: parseInt(document.getElementById('qrSize').value),
        fgColor: getColorValue('fg'),
        bgColor: getColorValue('bg'),
        borderSize: parseInt(document.getElementById('borderSize').value),
        borderColor: getColorValue('border'),
        errorLevel: document.getElementById('errorLevel').value,
        fgTransparent: document.getElementById('fgTransparent').checked,
        bgTransparent: document.getElementById('bgTransparent').checked,
        borderTransparent: document.getElementById('borderTransparent').checked
    };

    // If it's a vCard, also save the individual fields for better display
    if (currentContentType === 'vcard') {
        qrData.vcardData = {
            name: document.getElementById('vcardName').value.trim(),
            org: document.getElementById('vcardOrg').value.trim(),
            title: document.getElementById('vcardTitle').value.trim(),
            phone: document.getElementById('vcardPhone').value.trim(),
            email: document.getElementById('vcardEmail').value.trim(),
            website: document.getElementById('vcardWebsite').value.trim(),
            address: document.getElementById('vcardAddress').value.trim(),
            notes: document.getElementById('vcardNotes').value.trim()
        };
    }

    const transaction = db.transaction(['qrcodes'], 'readwrite');
    const objectStore = transaction.objectStore('qrcodes');
    const request = objectStore.add(qrData);

    request.onsuccess = function() {
        alert('QR code saved successfully!');
        loadSavedQRs();
    };

    request.onerror = function() {
        alert('Error saving QR code.');
    };
}

// Load saved QR codes
function loadSavedQRs() {
    if (!db) return;

    const transaction = db.transaction(['qrcodes'], 'readonly');
    const objectStore = transaction.objectStore('qrcodes');
    const request = objectStore.getAll();

    request.onsuccess = function() {
        const qrs = request.result;
        const grid = document.getElementById('savedGrid');
        
        if (qrs.length === 0) {
            grid.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">No saved QR codes yet.</p>';
            return;
        }

        grid.innerHTML = qrs.map(qr => {
            let preview = qr.text;
            let typeIcon = '📝';
            
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
                    <button class="btn btn-primary" onclick="downloadSavedQR(${qr.id})" style="margin-top: 5px; font-size: 0.8rem;">📥 Download</button>
                </div>
            `;
        }).join('');
    };
}

// Download saved QR code
function downloadSavedQR(id) {
    const transaction = db.transaction(['qrcodes'], 'readonly');
    const objectStore = transaction.objectStore('qrcodes');
    const request = objectStore.get(id);

    request.onsuccess = function() {
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
        const transaction = db.transaction(['qrcodes'], 'readwrite');
        const objectStore = transaction.objectStore('qrcodes');
        const request = objectStore.delete(id);

        request.onsuccess = function() {
            loadSavedQRs();
        };
    }
}

// Initialize everything
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing...');
    
    try {
        loadTheme();
        initDB();
        
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
        }, 50);
        
    } catch (error) {
        console.error('Initialization error:', error);
    }
});