const rankingForm = document.getElementById('rankingForm');
const rankingList = document.getElementById('rankingList');
const firstPlace = document.getElementById('firstPlace');
const secondPlace = document.getElementById('secondPlace');
const thirdPlace = document.getElementById('thirdPlace');
const exportExcelButton = document.getElementById('exportExcel');
const loadScoresButton = document.getElementById('loadScores');
const csvFileInput = document.getElementById('csvFileInput');
const calculateTimeButton = document.getElementById('calculateTime');

window.addEventListener('beforeunload', (e) => {
  e.preventDefault();
  e.returnValue = ''; // Required for Chrome and legacy browsers
  const confirmationMessage = 'You have unsaved changes. Are you sure you want to leave?';
  e.returnValue = confirmationMessage; // For modern browsers
  return confirmationMessage; // For legacy browsers
});

let rankingData = [];
calculateTimeButton.addEventListener('click', calculateTotalTime);

rankingForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const name = document.getElementById('name').value;
  const group = document.getElementById('group').value;
  const timeInSeconds = parseFloat(document.getElementById('time').value);

  if (isNaN(timeInSeconds) || timeInSeconds <= 0) {
    alert('Total time must be a positive value. Please calculate the time.');
    return;
  }

  rankingData.push({ name, group, time: timeInSeconds });
  rankingData.sort((a, b) => a.time - b.time);

  displayRanking();
  rankingForm.reset();
  document.getElementById('time').value = '';
  document.getElementById('minutes').value = '';
  document.getElementById('seconds').value = '';
  document.getElementById('milliseconds').value = '';
  document.getElementById('name').value = ' '; // Clear name field
  document.getElementById('group').value = ' '; // Clear group field
});

function calculateTotalTime() {
  const minutes = parseInt(document.getElementById('minutes').value) || 0;
  const seconds = parseInt(document.getElementById('seconds').value) || 0;
  const milliseconds = parseInt(document.getElementById('milliseconds').value) || 0;

  const totalTimeInSeconds = (minutes * 60) + seconds + (milliseconds / 1000);

  document.getElementById('time').value = totalTimeInSeconds.toFixed(2);
}


function displayRanking() {
  rankingList.innerHTML = '';
  firstPlace.innerHTML = '';
  secondPlace.innerHTML = '';
  thirdPlace.innerHTML = '';

  rankingData.forEach((entry, index) => {
    const rank = index + 1;
    const listItem = document.createElement('div');
    listItem.className = 'ranking-entry';
    listItem.innerHTML = `<strong>Rank ${rank}</strong>: ${entry.name}, Group: ${entry.group}, Time: ${entry.time.toFixed(2)} seconds`;
    rankingList.appendChild(listItem);

    if (rank === 1) {
      firstPlace.innerHTML = `<strong>Rank ${rank}</strong><br>${entry.name}<br> Group: ${entry.group} <br> Time: ${entry.time.toFixed(2)} seconds`;
    } else if (rank === 2) {
      secondPlace.innerHTML = `<strong>Rank ${rank}</strong><br>${entry.name}<br> Group: ${entry.group} <br> Time: ${entry.time.toFixed(2)} seconds`;
    } else if (rank === 3) {
      thirdPlace.innerHTML = `<strong>Rank ${rank}</strong><br>${entry.name}<br> Group: ${entry.group} <br> Time: ${entry.time.toFixed(2)} seconds`;
    }
  });
}

const fileInput = document.getElementById('fileInput');
const loadCSVButton = document.getElementById('loadCSV');
const loadJSONButton = document.getElementById('loadJSON');
const exportJSONButton = document.getElementById('exportJSON');
const exportCSVButton = document.getElementById('exportCSV');


loadCSVButton.addEventListener('click', () => {
  fileInput.accept = '.csv';
  fileInput.click();
});

loadJSONButton.addEventListener('click', () => {
  fileInput.accept = '.json';
  fileInput.click();
});

fileInput.addEventListener('change', handleFileSelect);

function handleFileSelect(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (event) {
      const content = event.target.result;
      if (file.type === 'application/json') {
        try {
          const jsonData = JSON.parse(content);
          if (Array.isArray(jsonData)) {
            rankingData = jsonData;
            displayRanking();
          } else {
            alert('JSON data is not in expected format (Array).');
          }
        } catch (error) {
          alert('Error parsing JSON data:\n' + error);
          console.error('JSON Parse Error:', error);
        }
      } else if (file.type === 'text/csv') {
        rankingData = parseCSV(content);
        displayRanking();
      } else {
        alert('Unsupported file type.');
      }
    };
    reader.readAsText(file);
  }
}

function parseCSV(content) {
  const rows = content.split('\n');
  const data = [];

  for (let i = 1; i < rows.length; i++) {
    const [name, group, time] = rows[i].split(',');
    if (name && group && time) {
      data.push({ name, group, time: parseFloat(time) });
    }
  }
  return data;
}

exportCSVButton.addEventListener('click', exportToCSV); 
exportJSONButton.addEventListener('click', exportToJSON);
  
function exportToCSV() {
  let csv = 'Name,Group,Time (seconds)\n';

  rankingData.forEach(entry => {
    csv += `${entry.name},${entry.group},${entry.time.toFixed(2)}\n`;
  });

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', 'ranking.csv');
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function exportToJSON() {
  const jsonData = JSON.stringify(rankingData, null, 2);
  const blob = new Blob([jsonData], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', 'ranking.json');
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

const jsonURLInput = document.getElementById('jsonURL');
const fetchJSONButton = document.getElementById('fetchJSON');
fetchJSONButton.addEventListener('click', fetchJSON);

function fetchJSON() {
  const userJSONURL = jsonURLInput.value.trim(); // Get user input URL and remove leading/trailing spaces
  const placeholderURL = 'https://raw.githubusercontent.com/officialdanielamani/officialdanielamani.github.io/main/project/time_score/data/ranking.json'; // Replace with your actual placeholder URL

  const fetchURL = userJSONURL || placeholderURL; // Use user input URL or placeholder if none provided

  fetch(fetchURL)
  .then(response => {
    if (!response.ok) {
      throw new Error(`Network response was not ok (${response.status} ${response.statusText})`);
    }
    return response.json();
  })
  .then(data => {
    if (Array.isArray(data)) {
      rankingData = data;
      displayRanking();
    } else {
      throw new Error('Invalid JSON data format');
    }
  })
  .catch(error => {
    const errorMessage = error.message || 'An unexpected error occurred while fetching JSON data.';
    alert(`Error: ${errorMessage}`);
    console.error('Fetch Error:', error);
  });
}

const enableRefreshCheckbox = document.getElementById('enableRefresh'); 

fetchJSONButton.addEventListener('click', fetchJSON);

let refreshIntervalId = null;

enableRefreshCheckbox.addEventListener('change', () => {
  if (enableRefreshCheckbox.checked) {
    // Enable refresh background
    refreshIntervalId = setInterval(fetchJSON, 60000); // Call fetchJSON every 5 minutes
  } else {
    // Disable refresh background
    clearInterval(refreshIntervalId); // Clear the interval
    refreshIntervalId = null; // Reset interval ID
  }
});


const toggleRankingSelect = document.getElementById('toggleRanking');

toggleRankingSelect.addEventListener('change', toggleRanking);


function toggleRanking() {
  const sortBy = toggleRankingSelect.value;

  rankingData.sort((a, b) => (sortBy === 'lowest' ? a.time - b.time : b.time - a.time));

  displayRanking();
}