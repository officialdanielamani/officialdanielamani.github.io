const openModalButton = document.getElementById('openModalButton');
const modal = document.getElementById('myModal');
const closeModalButton = document.getElementById('closeModal');


openModalButton.addEventListener('click', () => {
  modal.style.display = 'flex';
});

closeModalButton.addEventListener('click', () => {
  modal.style.display = 'none';
});

window.addEventListener('click', (event) => {
  if (event.target === modal) {
    modal.style.display = 'none';
  }
});

function extractElementsByClassAndId(doc, classesToKeep, idsToKeep, extractValueOnly) {
    const extractedElements = [];
    const elements = doc.querySelectorAll('*');
    elements.forEach(element => {
        if ((classesToKeep.length === 0 || classesToKeep.some(targetClass => element.classList.contains(targetClass))) ||
            (idsToKeep.length === 0 || idsToKeep.includes(element.id))) {
            if (extractValueOnly) {
                extractedElements.push(element.textContent);
            } else {
                extractedElements.push(element.outerHTML);
            }
        }
    });
    return extractedElements;
}

function extractElementsById(doc, idsToKeep, extractValueOnly) {
    const extractedElements = [];
    idsToKeep.forEach(targetId => {
        const elementsWithId = Array.from(doc.querySelectorAll(`[id="${targetId}"]`));
        elementsWithId.forEach(element => {
            if (extractValueOnly) {
                extractedElements.push(element.textContent);
            } else {
                extractedElements.push(element.outerHTML);
            }
        });
    });
    return extractedElements;
}

function extractElementsByClass(doc, classesToKeep, extractValueOnly) {
    const extractedElements = [];
    const elements = doc.querySelectorAll('*');
    elements.forEach(element => {
        if (classesToKeep.some(targetClass => element.classList.contains(targetClass))) {
            if (extractValueOnly) {
                extractedElements.push(element.textContent);
            } else {
                extractedElements.push(element.outerHTML);
            }
        }
    });
    return extractedElements;
}

function extractTextOnly() {
    const htmlInput = document.getElementById('htmlInput').value;
    const keepLineBreaks = document.getElementById('keepLineBreaks').checked;
    const keepIndent = document.getElementById('keepIndent').checked;
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlInput, 'text/html');
    let textOnly = doc.body.textContent;

    if (!keepLineBreaks) {
        // Remove line breaks
        textOnly = textOnly.replace(/\n/g, '');
    }

    if (!keepIndent) {
        // Remove leading spaces and tabs
        textOnly = textOnly.replace(/^\s+/gm, '');
    }


    const textContent = Array.from(doc.body.childNodes).map(node => node.textContent).join('\n');

    // Update the output text area
    const outputTextArea = document.getElementById('output');
    outputTextArea.value = textContent;

    // Calculate and update character and word counts
    updateCounts(outputTextArea, 'outputCounts', 'outputWordCount');

    document.getElementById('output').value = textOnly;

}

let originalOutputValue = '';

function extractElements() {
    const htmlInput = document.getElementById('htmlInput').value;
    const classToKeep = document.getElementById('classToKeep').value;
    const idToKeep = document.getElementById('idToKeep').value;
    const extractValueOnly = document.getElementById('extractValueOnly').checked;
    const tagsToKeep = document.getElementById('tagsToKeep').value.split(',').map(tag => tag.trim()).filter(Boolean);
    const keepLineBreaks = document.getElementById('keepLineBreaks').checked;
    const keepIndent = document.getElementById('keepIndent').checked;
  
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlInput, 'text/html');
  
    const classesToKeep = classToKeep.split(',').map(className => className.trim()).filter(Boolean); // Remove empty strings
    const idsToKeep = idToKeep.split(',').map(id => id.trim()).filter(Boolean); // Remove empty strings
  
    let extractedElements = [];
  
    if (classesToKeep.length > 0 && idsToKeep.length > 0) {
      // Extract elements by both Class and ID in order of appearance
      extractedElements = extractElementsByClassAndId(doc, classesToKeep, idsToKeep, extractValueOnly);
    } else if (classesToKeep.length > 0) {
      // Extract elements by Class in order of appearance
      extractedElements = extractElementsByClass(doc, classesToKeep, extractValueOnly);
    } else if (idsToKeep.length > 0) {
      // Extract elements by ID in order of appearance
      extractedElements = extractElementsById(doc, idsToKeep, extractValueOnly);
    } else if (tagsToKeep.length > 0) {
      // Extract elements by HTML tags in order of appearance
      const elementsByTags = Array.from(doc.querySelectorAll(tagsToKeep.join(',')));
      elementsByTags.forEach(element => {
        if (extractValueOnly) {
          extractedElements.push(element.textContent);
        } else {
          extractedElements.push(element.outerHTML);
        }
      });
    }
  
    let extractedHTML = extractedElements.join('\n');
  
    if (!keepLineBreaks) {
      // Remove line breaks
      extractedHTML = extractedHTML.replace(/\n/g, '');
    }
  
    if (!keepIndent) {
      // Remove leading spaces and tabs
      extractedHTML = extractedHTML.replace(/^\s+/gm, '');
    }
  
    // Check if all input fields are blank, and if so, use passthrough
    if (classesToKeep.length === 0 && idsToKeep.length === 0 && tagsToKeep.length === 0) {
      extractedHTML = htmlInput;
    }
  
    // Update the output text area
    const outputTextArea = document.getElementById('output');
    outputTextArea.value = extractedHTML;
  
    // Calculate and update character and word counts
    updateCounts(outputTextArea, 'outputCounts', 'outputWordCount');
    originalOutputValue = extractedHTML;
  }
  

function copyToClipboard() {
    const outputTextArea = document.getElementById('output');
    outputTextArea.select();
    document.execCommand('copy');
    alert('Copied to clipboard!');
}

function makeEditable(textArea) {
    textArea.removeAttribute('readonly');
    textArea.focus();
    textArea.select();
    textArea.addEventListener('blur', function() {
        textArea.setAttribute('readonly', 'true');
    });
}

function updateCounts(textArea, countsId, wordCountId) {
    const countsElement = document.getElementById(countsId);
    const wordCountElement = document.getElementById(wordCountId);

    const text = textArea.value;
    const characterCount = text.length;

    // Split text by spaces, tabs, and new lines and count words
    const words = text.match(/\S+/g) || [];
    const wordCount = words.length;

    countsElement.textContent = `${characterCount} characters`;
    wordCountElement.textContent = `${wordCount} words`;
}

function formatOutput() {
    const formatCheckbox = document.getElementById('formatOutput');
    const outputTextArea = document.getElementById('output');
  
    if (formatCheckbox.checked) {
      const formattedOutput = format(outputTextArea.value);
      outputTextArea.value = formattedOutput;
    } else {
      // If unchecked, restore the original output value
      outputTextArea.value = originalOutputValue;
    }
  
    // Recheck the word and character counts
    updateCounts(outputTextArea, 'outputCounts', 'outputWordCount');
  }

  function format(html) {
    var spaces = '    '; // Four spaces for each level of indentation
    var result = '';
    var indent = '';
  
    html.split(/>\s*</).forEach(function (element) {
      if (element.match(/^\/\w/)) {
        indent = indent.substring(spaces.length);
      }
  
      result += indent + '<' + element + '>\r\n';
  
      if (element.match(/^<?\w[^>]*[^\/]$/) && !element.startsWith("input")) {
        indent += spaces;
      }
    });
  
    return result.substring(1, result.length - 3);
  }
  function sendToInput() {
    const outputTextArea = document.getElementById('output');
    const inputTextArea = document.getElementById('htmlInput');
    
    // Set the input text area value to the current output text
    inputTextArea.value = outputTextArea.value;
    
    // Trigger the input text area change event (if needed)
    inputTextArea.dispatchEvent(new Event('change'));
    
    // Optionally, you can clear the output text area
    outputTextArea.value = '';
    
    // Update character and word counts for both input and output
    updateCounts(inputTextArea, 'inputCounts', 'inputWordCount');
    updateCounts(outputTextArea, 'outputCounts', 'outputWordCount');
  }

  function saveAsHtml() {
    const outputTextArea = document.getElementById('output');
    const outputHtml = outputTextArea.value;
    
    const blob = new Blob([outputHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = 'output.html';
    
    document.body.appendChild(a);
    a.click();
    
    URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }

  function saveAsTxt() {
    const outputTextArea = document.getElementById('output');
    const outputTxt = outputTextArea.value;
    
    const blob = new Blob([outputTxt], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = 'output.txt';
    
    document.body.appendChild(a);
    a.click();
    
    URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }