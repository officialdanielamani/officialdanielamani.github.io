const toggleButton = document.getElementById('toggleButton');
const openModalButton = document.getElementById('openModalButton');
const firstContainer = document.querySelector('.container:first-child');
const secondContainer = document.querySelector('.container:last-child');
const modal = document.getElementById('myModal');
const closeModalButton = document.getElementById('closeModal');

function toggleTableInfo() {
    var div = document.getElementById("tableinfo");
    if (div.style.display === "none") {
        div.style.display = "block";
    } else {
        div.style.display = "none";
    }
}

var ipNicknameMap = {};

// Function to add IP to the list and create a corresponding checkbox
function addIpToList() {
    var ipAddress = document.getElementById('ipAddress').value;
    var nickname = document.getElementById('nickname').value;
    //var username = document.getElementById('username').value;
    //var password = document.getElementById('password').value;
    var ipList = document.getElementById('ipList');
    var checkboxContainer = document.getElementById('checkboxContainerIP');

    // Store the IP address with its corresponding nickname
    ipNicknameMap[nickname] = ipAddress;

    // Add the nickname to the dropdown
    var option = document.createElement('option');
    option.value = nickname;
    option.text = nickname;
    ipList.appendChild(option);

    // Create a checkbox for the nickname
    var checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = nickname;
    checkbox.name = 'ipCheckboxes';
    checkbox.value = nickname;

    var label = document.createElement('label');
    label.htmlFor = nickname;
    label.appendChild(document.createTextNode(nickname));

    // Add the checkbox and label to the container
    checkboxContainer.appendChild(checkbox);
    checkboxContainer.appendChild(label);
    checkboxContainer.appendChild(document.createElement('br'));

    // Clear the input fields after adding
    document.getElementById('ipAddress').value = '';
    document.getElementById('nickname').value = '';
}

// Function to handle the Start button click
function startAction() {
    var checkboxes = document.getElementsByName('ipCheckboxes');
    checkboxes.forEach(function(checkbox) {
        if (checkbox.checked) {
            var ipAddress = ipNicknameMap[checkbox.value];
            var url = 'http://' + ipAddress + '/update?output=1000';

            // Open the URL in the background with no-cors mode
            fetch(url, { mode: 'no-cors' })
                .then(response => {
                    console.log('Request sent to ' + url);
                }).catch(error => {
                    console.error('Error making request to ' + url + ': ' + error.message);
                });
        }
    });
}

function resetAction() {
    var checkboxes = document.getElementsByName('ipCheckboxes');
    checkboxes.forEach(function(checkbox) {
        if (checkbox.checked) {
            var ipAddress = ipNicknameMap[checkbox.value];
            var url = 'http://' + ipAddress + '/update?output=3000';

            // Open the URL in the background with no-cors mode
            fetch(url, { mode: 'no-cors' })
                .then(response => {
                    console.log('Request sent to ' + url);
                }).catch(error => {
                    console.error('Error making request to ' + url + ': ' + error.message);
                });
        }
    });
}


function fetchData() {
    var ipList = document.getElementById('ipList');
    var selectedNickname = ipList.value;
    var selectedIp = ipNicknameMap[selectedNickname]; // Get the IP address using the selected nickname

    // Check if the input includes http:// or https://, if not, prepend it
    if (!selectedIp.startsWith('http://') && !selectedIp.startsWith('https://')) {
        selectedIp = 'http://' + selectedIp; // Defaulting to http if no protocol is provided
    }

    // Append the /timer endpoint to the selected IP
    var timerUrl = selectedIp + "/timer";

    fetch(timerUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.text();
        })
        .then(timerValue => {
            // Process the timer value
            var parts = timerValue.match(/(\d+)m:\s*(\d+)s:\s*(\d+)ms/);
            if (parts) {
                document.getElementById('minutes').value = parts[1];
                document.getElementById('seconds').value = parts[2];
                document.getElementById('milliseconds').value = parts[3];
            } else {
                alert('Invalid time format');
            }
        }).catch(error => {
            alert('Error fetching or parsing: ' + error.message);
        });
}

function deleteIp() {
    var checkboxes = Array.from(document.getElementsByName('ipCheckboxes'));
    var checkboxContainer = document.getElementById('checkboxContainerIP');
    var ipList = document.getElementById('ipList');

    checkboxes.forEach(function(checkbox) {
        if (checkbox.checked) {
            var nickname = checkbox.value;

            // Remove the nickname and its associated IP from the map
            if (ipNicknameMap.hasOwnProperty(nickname)) {
                delete ipNicknameMap[nickname];

                // Remove the checkbox and label from the container
                var label = checkbox.nextSibling; // Assuming label immediately follows the checkbox
                checkboxContainer.removeChild(checkbox);
                if (label && label.nodeName === 'LABEL') {
                    checkboxContainer.removeChild(label);
                }
                // Remove the line break after the label
                if (label.nextSibling && label.nextSibling.nodeName === 'BR') {
                    checkboxContainer.removeChild(label.nextSibling);
                }

                // Remove the option from the dropdown list
                for (var i = 0; i < ipList.options.length; i++) {
                    if (ipList.options[i].value == nickname) {
                        ipList.remove(i);
                        break;
                    }
                }
            }
        }
    });
}


toggleButton.addEventListener('click', () => {
  if (secondContainer.style.display === 'none') {
    secondContainer.style.display = 'block';
    firstContainer.style.width = '70%';
    toggleButton.textContent = 'Hide Submit Data';
  } else {
    secondContainer.style.display = 'none';
    firstContainer.style.width = '100%';
    toggleButton.textContent = 'Show Submit Data';
  }
});

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
    const timePoint = 10000 / totalTime;
    const overallPoint = totalPoint + timePoint;
    const repeat = parseInt(document.getElementById('repeat').value);
    
    const timestamp = new Date().toISOString(); // Get current timestamp

    if (isNaN(totalTime) || totalTime <= -1) {
        alert('Total time must be a positive value. Please calculate the time.');
        return;
    }

    if (isNaN(totalPoint) || totalPoint <= -1) {
        alert('Total point must be a positive value. Please calculate the point.');
        return;
    }
    if (isNaN(repeat) || repeat <= -1) {
        alert('Repeat must 0 and above. Please calculate back.');
        return;
    }

    const newData = {
        timestamp, // Add timestamp to the data
        name,
        group,
        totalPoint,
        totalTime,
        timePoint,
        overallPoint,
        repeat,
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
    } else if (sortType === 'highestPoint') {
        data.sort((a, b) => b.totalPoint - a.totalPoint);
    } else if (sortType === 'lowestPoint') {
        data.sort((a, b) => a.totalPoint - b.totalPoint);
    } else if (sortType === 'group') {
        data.sort((a, b) => a.group.localeCompare(b.group));
    } else if (sortType === 'name') {
        data.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortType === 'oldest') { // Sort by oldest timestamp
        data.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    } else if (sortType === 'newest') { // Sort by newest timestamp
        data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }

    dataList.innerHTML = '';

    data.forEach((item, index) => {
        const rank = index + 1;
        const itemElement = document.createElement('div');
        itemElement.classList.add('data-item');

        if(sortType === 'group'|| sortType === 'name'|| sortType === 'oldest'|| sortType === 'newest'){
        itemElement.innerHTML = `
        <table><tr><th><h2><strong>${item.name}</strong> (Group: ${item.group}) |
        Total Time: ${item.totalTime.toFixed(3)}s <br>
        Total Point: ${item.totalPoint.toFixed(3)} | Repeat: ${item.repeat}<br><h2></th>
            <th style="width: 90px;"><button class="delete-button" data-timestamp="${item.timestamp}"><i class="fa-regular fa-trash-can"></i></button></th>
            </tr>
        </table>    
        `;            
        }
        else{
        itemElement.innerHTML = `
        <table><tr><th><h2><strong>Rank No${index + 1}. ${item.name}</strong> (Group: ${item.group}) |
        Total Time: ${item.totalTime.toFixed(3)}s <br>  
        Total Point : ${item.totalPoint.toFixed(3)} | Repeat: ${item.repeat}<br><h2></th>
            <th style="width: 90px;"><button class="delete-button" data-timestamp="${item.timestamp}"><i class="fa-regular fa-trash-can"></i></button></th>
            </tr>
        </table>
        `;            
        }

        dataList.appendChild(itemElement);
    });

    dataList.addEventListener('click', function (event) {
        if (event.target.classList.contains('delete-button')) {
            const timestampToDelete = event.target.getAttribute('data-timestamp');
    
            if (timestampToDelete) {
                data = data.filter(item => item.timestamp !== timestampToDelete);
                updateDataList();
            }
        }
    });

}

function clearForm() {
    document.getElementById('name').value = '';
    document.getElementById('group').value = '';
    document.getElementById('totalPoint').value = '';
    document.getElementById('totalTime').value = '';
    document.getElementById('minutes').value = '';
    document.getElementById('seconds').value = '';
    document.getElementById('milliseconds').value = '';
    document.getElementById('repeat').value = '';
}

const calculateTimeButton = document.getElementById('calculateTime');
calculateTimeButton.addEventListener('click', calculateTotalTime);

function calculateTotalTime() {
    const minutes = parseInt(document.getElementById('minutes').value) || 0;
    const seconds = parseInt(document.getElementById('seconds').value) || 0;
    const milliseconds = parseInt(document.getElementById('milliseconds').value) || 0;

    // Convert the total time to seconds
    const totalTimeInSeconds = (minutes * 60) + seconds + (milliseconds / 1000);

    // Update the 'totalTime' field with the calculated time, rounded to 3 decimal places
    document.getElementById('totalTime').value = totalTimeInSeconds.toFixed(3);
}


const exportCsvBtn = document.getElementById('exportCsvBtn');

exportCsvBtn.addEventListener('click', exportToCsv);

function exportToCsv() {
    const csvData = [['Timestamp', 'Name', 'Group', 'Total Point', 'Total Time', 'Time Point', 'Overall Point','Repeat']];

    data.forEach(item => {
        csvData.push([
            item.timestamp, // Add timestamp to CSV data
            item.name,
            item.group,
            item.totalPoint.toFixed(3),
            item.totalTime.toFixed(3),
            item.timePoint.toFixed(3),
            item.overallPoint.toFixed(3),
            item.repeat
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
        if (columns.length === 8) { // Update the length to 7 to accommodate the timestamp
            const timestamp = columns[0]; // Extract timestamp
            const name = columns[1];
            const group = columns[2];
            const totalPoint = parseFloat(columns[3]);
            const totalTime = parseFloat(columns[4]);
            const timePoint = parseFloat(columns[5]);
            const overallPoint = parseFloat(columns[6]);
            const repeat = parseInt(columns[7])

            parsedData.push({
                timestamp, // Include timestamp in the parsed data
                name,
                group,
                totalPoint,
                totalTime,
                timePoint,
                overallPoint,
                repeat
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
    const jsonData = data.map(item => {
        return {
            timestamp: item.timestamp, // Add timestamp to JSON data
            name: item.name,
            group: item.group,
            totalPoint: item.totalPoint.toFixed(3),
            totalTime: item.totalTime.toFixed(3),
            timePoint: item.timePoint.toFixed(3),
            overallPoint: item.overallPoint.toFixed(3),
            repeat: item.repeat
        };
    });

    const jsonString = JSON.stringify(jsonData, null, 3); // The second argument is for formatting
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'rank.json';
    a.click();

    URL.revokeObjectURL(url);
}

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
                const importedData = JSON.parse(jsonData, (key, value) => {
                    // Parse numerical values as numbers
                    if (!isNaN(value)) {
                        return parseFloat(value);
                    }
                    return value;
                });

                if (Array.isArray(importedData)) {
                    // Check if timestamps are present, otherwise add timestamps
                    const dataWithTimestamps = importedData.map(item => {
                        return {
                            timestamp: new Date().toISOString(), // Add current timestamp
                            ...item // Include the rest of the object's properties
                        };
                    });

                    data = dataWithTimestamps;
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
                // Check if timestamps are present, otherwise add timestamps
                const dataWithTimestamps = importedData.map(item => {
                    return {
                        timestamp: new Date().toISOString(), // Add current timestamp
                        ...item // Include the rest of the object's properties
                    };
                });

                // Parse numerical values as numbers
                const dataParsed = dataWithTimestamps.map(item => {
                    for (const key in item) {
                        if (!isNaN(item[key])) {
                            item[key] = parseFloat(item[key]);
                        }
                    }
                    return item;
                });

                data = dataParsed;
                updateDataList();
            } else {
                console.error('Invalid JSON data.');
            }
        })
        .catch(error => {
            console.error('Error fetching JSON data:', error);
        });
});
