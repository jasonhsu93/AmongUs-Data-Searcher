//Fetch Kills for displaying the Kills table
async function fetchKills() {
    try {
        const response = await fetch('/kills');
        if (!response.ok) throw new Error("Failed to fetch kills");
        const kills = await response.json();

        const killsTable = document.querySelector('#killsTable tbody');
        killsTable.innerHTML = ''; // clear table

        kills.forEach(kill => {
            const row = killsTable.insertRow();
            row.innerHTML = `
                <td>${kill[0] || "N/A"}</td>
                <td>${kill[1] || "N/A"}</td>
                <td>${kill[2] || "N/A"}</td>
                <td>${kill[3] || "N/A"}</td>
            `;
        });
    } catch (error) {
        console.error("Error fetching kills:", error);
    }
}

//Join Impostors and Kills
async function fetchImpostorsAndKills() {
    event.preventDefault();
    const color = document.getElementById('impostorKillColor').value.trim();
    if (!color) {
        alert('Please enter a valid impostor color.');
        return;
    }
    try {
        const response = await fetch(`/impostors-kills/${color}`, { method: 'GET' });
        if (!response.ok) {
            throw new Error(`Failed to fetch kills for color: ${color}`);
        }
        const data = await response.json();
        const resultElem = document.getElementById('impostorKillsResult');
        let killList = '';
        data.data.forEach((kill) => {
            killList += `<p style="text-indent: 20px;"><br><strong>Killed:</strong> ${kill[0]} <br><strong>Time:</strong> ${kill[1]}</p>`;
        });
        resultElem.innerHTML = `<p><strong>Impostor Color:</strong> ${color}</p>${killList}`;
    } catch (error) {
        //console.error("Error fetching impostor kills:", error);
        document.getElementById('impostorKillsResult').textContent =
            `Error: Unable to fetch data for color "${color}" "${error}".`;
    }
}

//Nested Aggregation group by
async function fetchTopImpostors() {
    try {
        const response = await fetch('/top-impostors');
        if (!response.ok) throw new Error('Failed to fetch top impostors');
        const result = await response.json();
        displayTopImpostors(result.data);
    } catch (error) {
        console.error('Error fetching top impostors:', error);
    }
}

//DIVISION done on Player and EmergencyMeeting
async function fetchPlayersAllTasks() {
    const response = await fetch('/players-completed-all-tasks', { method: 'GET' });
    const data = await response.json();
    populateTable("playersAllTasksTable", data.data);
}

//Populate tables with two columns
function populateTable(tableId, data) {
    const tableBody = document.querySelector(`#${tableId} tbody`);
    tableBody.innerHTML = ""; 

    if (!data.length) {
        const row = document.createElement("tr");
        const cell = document.createElement("td");
        cell.colSpan = 2; 
        cell.textContent = "No data available.";
        row.appendChild(cell);
        tableBody.appendChild(row);
        return;
    }

    data.forEach((item) => {
        const row = document.createElement("tr");
        item.forEach((value) => {
            const cell = document.createElement("td");
            cell.textContent = value;
            row.appendChild(cell);
        });
        tableBody.appendChild(row);
    });
}

//Display results for nested aggregation
function displayTopImpostors(data) {
    const tableBody = document.querySelector('#topImpostorsTable tbody');
    tableBody.innerHTML = '';
    data.forEach((row) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${row[0]}</td> <!-- ImpostorColor -->
            <td>${row[1]}</td> <!-- KillCount -->
        `;
        tableBody.appendChild(tr);
    });
}

document.addEventListener('DOMContentLoaded', function() {
    fetchKills();
    document.getElementById('fetchKills').addEventListener('click', fetchKills);
    document.getElementById('impostorKillForm').addEventListener('submit', fetchImpostorsAndKills);
    document.getElementById('fetchTopImpostors').addEventListener('click', fetchTopImpostors);
    document.getElementById('playersAllTasks').addEventListener('click', fetchPlayersAllTasks);
});
