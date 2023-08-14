const userInputForm = document.getElementById('userInputForm');
const dataList = document.getElementById('dataList');
const sortTypeSelect = document.getElementById('sortType');

let data = [];

userInputForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const name = document.getElementById('name').value;
    const group = document.getElementById('group').value;
    const totalPoint = parseFloat(document.getElementById('totalPoint').value);
    const totalTime = parseFloat(document.getElementById('totalTime').value);
    const timePoint = 100 / totalTime;
    const overallPoint = totalPoint + timePoint;

    if (isNaN(totalTime) || totalTime <= 0) {
        alert('Total time must be a positive value. Please calculate the time.');
        return;
      }

      if (isNaN(totalPoint) || totalPoint <= 0) {
        alert('Total time must be a positive value. Please calculate the time.');
        return;
      }

    const newData = {
        name,
        group,
        totalPoint,
        totalTime,
        timePoint,
        overallPoint,
    };

    data.push(newData);
    updateDataList();
    clearForm();
});

sortTypeSelect.addEventListener('change', updateDataList);

function updateDataList() {
    
    const sortType = sortTypeSelect.value;

    if (sortType === 'highest') {
        data.sort((a, b) => b.overallPoint - a.overallPoint);
    } else if (sortType === 'lowest') {
        data.sort((a, b) => a.overallPoint - b.overallPoint);
    } else if (sortType === 'lowestTime') {
        data.sort((a, b) => a.totalTime - b.totalTime);
    } else if (sortType === 'highestTime') {
       data.sort((a, b) => b.totalTime - a.totalTime);
    }else if (sortType === 'highestPoint') {
        data.sort((a, b) => b.totalPoint - a.totalPoint);
    } else if (sortType === 'lowestPoint') {
        data.sort((a, b) => a.totalPoint - b.totalPoint);
    }


    dataList.innerHTML = '';
 
    data.forEach((item, index) => {
        const rank = index + 1;
        const itemElement = document.createElement('div');
        itemElement.classList.add('data-item');
        itemElement.innerHTML = `
            <h2><strong>Rank No${index + 1}. ${item.name}</strong> (Group: ${item.group}) |
            Total Point: ${item.totalPoint.toFixed(2)} | Total Time: ${item.totalTime.toFixed(2)}s<br><h2?
        `;
        dataList.appendChild(itemElement);
/*
        if (rank === 1) {
            firstPlace.innerHTML = `<strong>Rank ${rank}</strong><br>${item.name}<br>(Group: ${item.group})<br>Total Point: ${item.totalPoint}<br>Time: ${item.totalTime.toFixed(2)} s`;
          } else if (rank === 2) {
            secondPlace.innerHTML = `<strong>Rank ${rank}</strong><br>${item.name}<br>(Group: ${item.group})<br>Total Point: ${item.totalPoint}<br>Time: ${item.totalTime.toFixed(2)} s`;
          } else if (rank === 3) {
            thirdPlace.innerHTML = `<strong>Rank ${rank}</strong><br>${item.name}<br>(Group: ${item.group})<br>Total Point: ${item.totalPoint}<br>Time: ${item.totalTime.toFixed(2)} s`;
          }
*/
    });
}
// Time Point: ${item.timePoint.toFixed(2)} | Overall Point: ${item.overallPoint.toFixed(2)} hide from view
function clearForm() {
    document.getElementById('name').value = '';
    document.getElementById('group').value = '';
    document.getElementById('totalPoint').value = '';
    document.getElementById('totalTime').value = '';
    document.getElementById('minutes').value = '';
    document.getElementById('seconds').value = '';
    document.getElementById('milliseconds').value = '';
}

const calculateTimeButton = document.getElementById('calculateTime');
calculateTimeButton.addEventListener('click', calculateTotalTime);

function calculateTotalTime() {
    const minutes = parseInt(document.getElementById('minutes').value) || 0;
    const seconds = parseInt(document.getElementById('seconds').value) || 0;
    const milliseconds = parseInt(document.getElementById('milliseconds').value) || 0;
  
    const totalTimeInSeconds = (minutes * 60) + seconds + (milliseconds / 1000);
  
    document.getElementById('totalTime').value = totalTimeInSeconds.toFixed(2);
  }

const exportCsvBtn = document.getElementById('exportCsvBtn');

exportCsvBtn.addEventListener('click', exportToCsv);

function exportToCsv() {
    const csvData = [['Name', 'Group', 'Total Point', 'Total Time', 'Time Point', 'Overall Point']];

    data.forEach(item => {
        csvData.push([
            item.name,
            item.group,
            item.totalPoint.toFixed(2),
            item.totalTime.toFixed(2),
            item.timePoint.toFixed(2),
            item.overallPoint.toFixed(2)
        ]);
    });

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'rank.csv';
    a.click();

    URL.revokeObjectURL(url);
}



// ... (Existing code)

const importCsvForm = document.getElementById('importCsvForm');

importCsvForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const csvFileInput = document.getElementById('csvFile');
    const file = csvFileInput.files[0];

    if (file) {
        const reader = new FileReader();
        reader.onload = function (event) {
            const csvText = event.target.result;
            const importedData = parseCsv(csvText);
            if (importedData) {
                data = importedData;
                updateDataList();
            } else {
                console.error('Error parsing CSV file.');
            }
        };
        reader.readAsText(file);
    }
});

function parseCsv(csvText) {
    const rows = csvText.split('\n');
    const parsedData = [];

    for (let i = 1; i < rows.length; i++) { // Skip the first row (header)
        const row = rows[i];
        const columns = row.split(',');
        if (columns.length === 6) {
            const name = columns[0];
            const group = columns[1];
            const totalPoint = parseFloat(columns[2]);
            const totalTime = parseFloat(columns[3]);
            const timePoint = parseFloat(columns[4]);
            const overallPoint = parseFloat(columns[5]);

            parsedData.push({
                name,
                group,
                totalPoint,
                totalTime,
                timePoint,
                overallPoint
            });
        } else if (row.trim() !== '') {
            return null; // Invalid CSV format
        }
    }

    return parsedData;
}

const exportJsonBtn = document.getElementById('exportJsonBtn');

exportJsonBtn.addEventListener('click', exportToJson);

function exportToJson() {
    const jsonData = JSON.stringify(data, null, 2); // The second argument is for formatting
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'rank.json';
    a.click();

    URL.revokeObjectURL(url);
}

// ... (Existing code)

const importJsonForm = document.getElementById('importJsonForm');

importJsonForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const jsonFileInput = document.getElementById('jsonFile');
    const file = jsonFileInput.files[0];

    if (file) {
        const reader = new FileReader();
        reader.onload = function (event) {
            const jsonData = event.target.result;
            try {
                const importedData = JSON.parse(jsonData);
                if (Array.isArray(importedData)) {
                    data = importedData;
                    updateDataList();
                } else {
                    console.error('Invalid JSON data.');
                }
            } catch (error) {
                console.error('Error parsing JSON file:', error);
            }
        };
        reader.readAsText(file);
    }
});

const fetchJsonForm = document.getElementById('fetchJsonForm');

fetchJsonForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const jsonUrlInput = document.getElementById('jsonUrl');
    const url = jsonUrlInput.value;

    const defaultUrl = 'https://raw.githubusercontent.com/officialdanielamani/officialdanielamani.github.io/main/project/time_score/data/ranking.json'; // Replace with your predetermined URL

    const fetchUrl = url ? url : defaultUrl;

    fetch(fetchUrl)
        .then(response => response.json())
        .then(importedData => {
            if (Array.isArray(importedData)) {
                data = importedData;
                updateDataList();
            } else {
                console.error('Invalid JSON data.');
            }
        })
        .catch(error => {
            console.error('Error fetching JSON data:', error);
        });
});
