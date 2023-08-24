const toggleButton = document.getElementById('toggleButton');
const firstContainer = document.querySelector('.container:first-child');
const secondContainer = document.querySelector('.container:last-child');

toggleButton.addEventListener('click', () => {
  if (secondContainer.style.display === 'none') {
    secondContainer.style.display = 'block';
    firstContainer.style.width = '70%';
  } else {
    secondContainer.style.display = 'none';
    firstContainer.style.width = '100%';
  }
});

function clearForm() {
    document.getElementById('teamXName').value = '';
    document.getElementById('groupX').value = '';
    document.getElementById('pointXA').value = '';
    document.getElementById('pointXB').value = '';
    document.getElementById('pointXC').value = '';
    document.getElementById('timeXA').value = '';
    document.getElementById('timeXB').value = '';
    document.getElementById('timeXC').value = '';

    document.getElementById('teamYName').value = '';
    document.getElementById('groupY').value = '';
    document.getElementById('pointYA').value = '';
    document.getElementById('pointYB').value = '';
    document.getElementById('pointYC').value = '';
    document.getElementById('timeYA').value = '';
    document.getElementById('timeYB').value = '';
    document.getElementById('timeYC').value = '';
}

let teamData = [];

function validateFormInputs() {
    const teamXName = document.getElementById("teamXName");
    const teamYName = document.getElementById("teamYName");
    const groupX = document.getElementById("groupX");
    const groupY = document.getElementById("groupY");

    const inputs = document.querySelectorAll("input[type='number']"); // Get all number inputs
    let isValid = true;

    if (teamXName.value.trim() === "" || groupX.value.trim() === "") {
        isValid = false;
        teamXName.classList.add("invalid-input");
        groupX.classList.add("invalid-input");
    } else {
        teamXName.classList.remove("invalid-input");
        groupX.classList.remove("invalid-input");
    }

    if (teamYName.value.trim() === "" || groupY.value.trim() === "") {
        isValid = false;
        teamYName.classList.add("invalid-input");
        groupY.classList.add("invalid-input");
    } else {
        teamYName.classList.remove("invalid-input");
        groupY.classList.remove("invalid-input");
    }

    inputs.forEach(input => {
        if (isNaN(input.valueAsNumber) || input.value === "") {
            isValid = false;
            input.classList.add("invalid-input");
        } else {
            input.classList.remove("invalid-input");
        }
    });

    return isValid;
}



function submitData() {

    if (!validateFormInputs()) {
        alert("Please fill in all fields with valid data.");
        return;
    }

    const teamX = {
        teamName: document.getElementById("teamXName").value,
        groupName: document.getElementById("groupX").value,
        statusTeam: document.getElementById("passTeamX").checked,
        points: [
            parseInt(document.getElementById("pointXA").value),
            parseInt(document.getElementById("pointXB").value),
            parseInt(document.getElementById("pointXC").value)
        ],
        times: [
            parseInt(document.getElementById("timeXA").value),
            parseInt(document.getElementById("timeXB").value),
            parseInt(document.getElementById("timeXC").value)            
        ]
    };

    const teamY = {
        teamName: document.getElementById("teamYName").value,
        groupName: document.getElementById("groupY").value,
        statusTeam: document.getElementById("passTeamX").checked,
        points: [
            parseInt(document.getElementById("pointYA").value),
            parseInt(document.getElementById("pointYB").value),
            parseInt(document.getElementById("pointYC").value)
        ],
        times: [
            parseInt(document.getElementById("timeYA").value),
            parseInt(document.getElementById("timeYB").value),
            parseInt(document.getElementById("timeYC").value)            
        ]        
    };

    teamX.status = document.getElementById("passTeamX").checked ? "Qualified" : "Disqualified";
    teamY.status = document.getElementById("passTeamY").checked ? "Qualified" : "Disqualified";
    
    teamX.totalPoints = calculateTotalPoints(teamX.points);
    teamY.totalPoints = calculateTotalPoints(teamY.points);

    teamX.totalTimes = calculateTotalTimes(teamX.times);
    teamY.totalTimes = calculateTotalTimes(teamY.times);

    teamX.overallPoint = calculateOverallPoint(teamX.totalTimes, teamX.totalPoints);
    teamY.overallPoint = calculateOverallPoint(teamY.totalTimes, teamY.totalPoints);

    teamX.totalOverall = calculateTotalOverall(teamX.totalPoints, teamX.overallPoint);
    teamY.totalOverall = calculateTotalOverall(teamY.totalPoints, teamY.overallPoint);

    if(teamX.totalTimes<=0 || teamY.totalTimes<=0){
        alert("Please total time are not valid (cannot equal 0).");
        return;
    }

    if(teamX.statusTeam == "Disqualified"){
        teamX.totalOverall = 0 ;
    }

    if(teamY.statusTeam == "Disqualified"){
        teamY.totalOverall = 0 ;
    }
    const timestamp = new Date().getTime();

    const winner = teamX.totalOverall > teamY.totalOverall ? teamX : teamY;
    const loser = teamX.totalOverall > teamY.totalOverall ? teamY : teamX;

    teamData.push({ team: winner, totalPoints: winner.totalPoints, overallPoint: winner.overallPoint, totalOverall: winner.totalOverall, teamStatus: winner.status, timestamp: timestamp});
    teamData.push({ team: loser, totalPoints: loser.totalPoints, overallPoint: loser.overallPoint, totalOverall: loser.totalOverall, teamStatus: loser.status, timestamp: timestamp });

    displayRanking();
    clearForm();
}

function calculateTotalOverall(totalPoints, overallPoint) {
    return totalPoints + overallPoint;
}

function calculateTotalTimes(times) {
    return times.reduce((total, time) => total + time, 0);
}

function calculateTotalPoints(points) {
    return points.reduce((total, point) => total + point, 0);
}

function calculateOverallPoint(totalTimes, totalPoints) {
    return totalPoints + (1000/ totalTimes );
}


function displayRanking() {
    const sortingSelect = document.getElementById("sortingSelect");
    const selectedValue = sortingSelect.value;
    sortFilter = selectedValue ; 
    
    const rankingDisplay = document.getElementById("rankingDisplay");
    rankingDisplay.innerHTML = ""; // Clear previous data

    // Sort the teamData array based on timestamp and sorting order
    const sortedData = teamData.slice().sort((a, b) => {
        if (sortFilter === "newest") {
            return b.timestamp - a.timestamp; // Newest first
        } else {
            return a.timestamp - b.timestamp; // Oldest first
        }
    });

    for (let i = 0; i < sortedData.length; i += 2) {
        const entryDiv = document.createElement("div");
        entryDiv.classList.add("entry");

        const winner = sortedData[i].team;
        const loser = sortedData[i + 1].team;

        if(loser.status==='Disqualified' && winner.status==='Disqualified'){
            entryDiv.innerHTML = `
            <h2>${winner.teamName} vs ${loser.teamName}</h2>
            <p style="color:red;">${winner.teamName} and ${loser.teamName} are disqualified</p>
            
        `;
        }
        else if(loser.status==='Disqualified'){
            entryDiv.innerHTML = `
            <h2>${winner.teamName} vs ${loser.teamName}</h2>
            <p style="color: forestgreen;">Winner: ${winner.teamName} (${winner.groupName}); Status: ${winner.status}; Total Points: ${winner.totalPoints.toFixed(2)}; Total Overall: ${winner.totalOverall.toFixed(2)}</p>
            <p style="color:red;">Lost: ${loser.teamName} (${loser.groupName}); Status: ${loser.status}; Total Points: ${loser.totalPoints.toFixed(2)}; Total Overall: ${loser.totalOverall.toFixed(2)}</p>
        `;
        }
        else{
            entryDiv.innerHTML = `
            <h2>${winner.teamName} vs ${loser.teamName}</h2>
            <p style="color: forestgreen;">Winner: ${winner.teamName} (${winner.groupName}); Status: ${winner.status}; Total Points: ${winner.totalPoints.toFixed(2)}; Total Overall:</p>
            <p>Lost: ${loser.teamName} (${loser.groupName}); Status: ${loser.status}; Total Points: ${loser.totalPoints.toFixed(2)}; Total Overall: ${loser.totalOverall.toFixed(2)}</p>
        `;
        }

        rankingDisplay.appendChild(entryDiv);
    }
}


function importJSON() {
    const fileInput = document.getElementById("importFileJSON");
    const file = fileInput.files[0];

    if (file) {
        importFromJSON(file);
    }
}

function importFromJSON(file) {
    const reader = new FileReader();

    reader.onload = function(event) {
        const contents = event.target.result;
        const importedData = JSON.parse(contents);

        if (Array.isArray(importedData)) {
            teamData = importedData;
            displayRanking();
        } else {
            console.error("Imported data is not in the expected format.");
        }
    };

    reader.readAsText(file);
    displayRanking();
}

function exportToJSON() {
    // Create a copy of the teamData array to ensure the original data is not modified
    const dataToExport = JSON.parse(JSON.stringify(teamData));

    const jsonData = JSON.stringify(dataToExport, null, 2);

    const blob = new Blob([jsonData], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "team_data.json");
    link.click();
}

function fetchJSONData() {
    const url = "https://raw.githubusercontent.com/officialdanielamani/officialdanielamani.github.io/main/project/sumo_score/data/team_data.json"; // Replace with the actual URL of your JSON data

    fetch(url)
        .then(response => response.json())
        .then(data => {
            // Assuming data is an array of objects similar to your teamData structure
            teamData = data; // Update the teamData with fetched data
            displayRanking(); // Display the fetched data
        })
        .catch(error => {
            console.error("Error fetching JSON data:", error);
        });
}

/*
function exportToCSV() {
    let csvContent = "data:text/csv;charset=utf-8,";

    // Add CSV header
    csvContent += "Timestamp,Team,Group,Point A,PointB,Point C,Total Points,Time A,Time B,Time C,Overall Points,Status\n";

    // Iterate through teamData and add CSV rows
    teamData.forEach(entry => {
        csvContent += `${entry.timestamp},${entry.team.teamName},${entry.team.groupName},${entry.team.points[0]},${entry.team.points[1]},${entry.team.points[2]},${entry.team.totalPoints},${entry.team.times[0]},${entry.team.times[1]},${entry.team.times[2]},${entry.team.overallPoint},${entry.team.statusTeam}\n`;
    });

    // Create a Blob and download the CSV file
    const encodedURI = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedURI);
    link.setAttribute("download", "teamData.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function importFromCSV() {
    const fileInput = document.getElementById("csvFileInput");

    if (fileInput.files.length === 0) {
        alert("Please select a CSV file.");
        return;
    }

    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = function(event) {
        const csvData = event.target.result;
        const rows = csvData.split("\n");

        teamData = [];

        for (let i = 1; i < rows.length; i++) {
            const columns = rows[i].split(",");
            if (columns.length !== 12) {
                continue; // Skip rows with incorrect column count
            }

            const entry = {
                timestamp: parseInt(columns[0]),
                team: {
                    teamName: columns[1],
                    groupName: columns[2],
                    points: [parseInt(columns[3]), parseInt(columns[4]), parseInt(columns[5])],
                    totalPoints: parseFloat(columns[6]),
                    times: [parseInt(columns[7]), parseInt(columns[8]), parseInt(columns[9])],
                    overallPoint: parseFloat(columns[10]),
                    statusTeam: columns[11]
                }
            };
            teamData.push(entry);
        }

        displayRanking();
    };

    reader.readAsText(file);
}
*/