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

let teamData = [];

function submitData() {
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
            <p style="color: forestgreen;">Winner: ${winner.teamName} (${winner.groupName}); Status: ${winner.status}; Total Points: ${winner.totalPoints.toFixed(2)}; Total Overall: ${winner.totalOverall.toFixed(2)}</p>
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
    const url = "URL_TO_YOUR_JSON_FILE"; // Replace with the actual URL of your JSON data

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
