/*
 * These functions below are for various webpage functionalities. 
 * Each function serves to process data on the frontend:
 *      - Before sending requests to the backend.
 *      - After receiving responses from the backend.
 * 
 * To tailor them to your specific needs,
 * adjust or expand these functions to match both your 
 *   backend endpoints 
 * and 
 *   HTML structure.
 * 
 */


// This function checks the database connection and updates its status on the frontend.
async function checkDbConnection() {
    const statusElem = document.getElementById('dbStatus');
    const loadingGifElem = document.getElementById('loadingGif');

    const response = await fetch('/check-db-connection', {
        method: "GET"
    });

    // hide loading GIF once the response is received.
    loadingGifElem.style.display = 'none';
    statusElem.style.display = 'inline';

    response.text()
        .then((text) => {
            statusElem.textContent = text;
        })
        .catch((error) => {
            statusElem.textContent = 'connection timed out'; 
        });
}

//HELPER FUNCTIONS

//Fetch players, used for displaying the Player Table
async function fetchPlayers() {
    try {
        const response = await fetch('/players');
        if (!response.ok) throw new Error("Failed to fetch players");
        const players = await response.json();

        const playerTable = document.querySelector('#playerTable tbody');
        playerTable.innerHTML = '';

        players.forEach(player => {
            const row = playerTable.insertRow();
            row.innerHTML = `
                <td>${player[0] || "N/A"}</td> <!-- Color -->
                <td>${player[1] || "N/A"}</td> <!-- PlayerName -->
                <td>${player[2] || "N/A"}</td> <!-- Role -->
            `;
        });
    } catch (error) {
        console.error("Error fetching players:", error);
    }
}

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

//Dropdown menu for UPDATE Player
async function populatePlayerDropdown() {
    try {
        const response = await fetch('/players');
        if (!response.ok) throw new Error("Failed to fetch players");
        const players = await response.json();

        const playerDropdown = document.getElementById('updatePlayerColor');
        playerDropdown.innerHTML = '';

        players.forEach(player => {
            const option = document.createElement('option');
            option.value = player[0];
            option.textContent = `${player[0]} - ${player[1]}`;
            playerDropdown.appendChild(option);
        });
    } catch (error) {
        console.error("Error populating player dropdown:", error);
    }
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

//Display results in the table
function displayChatResults(results) {
    const tableBody = document.querySelector("#selectChatTable tbody");
    console.log("hi");
    results.forEach((row) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${row[0]}</td> <!-- ChatID -->
            <td>${row[1]}</td> <!-- Message -->
            <td>${row[2]}</td> <!-- Timestamp -->
            <td>${row[3]}</td> <!-- Player Color -->
        `;

        tableBody.appendChild(tr);
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

//QUERY FUNCTIONS

//Insert on Chat
async function insertChat(event) {
    event.preventDefault();
    console.log("INSERTING CHAT!!!!!!!!!");
    // get values input
    const chatID = document.getElementById('chatIDM').value.trim();
    const message = document.getElementById('message').value.trim();
    const playerColor = document.getElementById('playerColorChat').value.trim();

    // send data to the backend
    try {
        console.log("trying to post");
        const response = await fetch('/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chatID, message, playerColor }),
        });

        const result = await response.json();
        console.log("result: " + result);
        // display result message
        document.getElementById('insertChatResult').textContent = result.message || 'Chat ID taken or Color does not exist!';
    } catch (error) {
        console.error('Error inserting chat message:', error);
        document.getElementById('insertChatResult').textContent = 'An error occurred while inserting the message.';
    }
}

//Insert Player
async function insertPlayer(event) {
    event.preventDefault();
    const color = document.getElementById('playerColor').value;
    const playerName = document.getElementById('playerName').value;
    const role = document.getElementById('playerRole').value;

    const response = await fetch('/players', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ color, playerName, role })
    });

    const result = await response.json();
    document.getElementById('insertPlayerResult').textContent = result.message || 'Could not insert player. Check your fields';
    fetchPlayers();
}

//Update on Player
async function updatePlayer(event) {
    event.preventDefault();

    const color = document.getElementById('updatePlayerColor').value;
    const newPlayerName = document.getElementById('updatePlayerName').value || null;
    const newRole = document.getElementById('updatePlayerRole').value || null;

    const response = await fetch('/players/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ color, newPlayerName, newRole })
    });

    const result = await response.json();
    const resultDiv = document.getElementById('updatePlayerResult');
    if (result.success) {
        resultDiv.textContent = 'Player updated successfully!';
        populatePlayerDropdown();
        fetchPlayers();
    } else {
        resultDiv.textContent = `Error updating player: ${result.error}`;
    }
}

//Delete Player
async function deletePlayer(event) {
    event.preventDefault();
    const color = document.getElementById('deletePlayerColor').value;

    const response = await fetch(`/players/${color}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
    });

    const result = await response.json();
    document.getElementById('deletePlayerResult').textContent = result.message || 'Player deleted successfully!';
    fetchPlayers();
}

//Selection on Chat
async function selectChat(event) {
    event.preventDefault();

    let chatID = document.getElementById("chatID").value;
    const chatIDLogic = document.getElementById("chatIDLogic").checked; //true for or, false for and
    const messageContent = document.getElementById("messageContent").value;
    const messageLogic = document.getElementById("messageLogic").checked;
    const timestamp = document.getElementById("timestamp").value;
    const timestampLogic = document.getElementById("timestampLogic").checked;
    const color = document.getElementById("color").value;
    const colorLogic = document.getElementById("colorLogic").checked;

    const filters = {};
    const logic = {};

    if (chatID !== "") {
        filters.ChatID = parseInt(chatID, 10);
        logic.ChatID = chatIDLogic ? "OR" : "AND";
    }
    if (messageContent !== "")  {
        filters.Message = messageContent;
        logic.Message = messageLogic ? "OR" : "AND";
    }
    if (timestamp !== "") {
        filters.Timestamp = timestamp;
        logic.Timestamp = timestampLogic ? "OR" : "AND";
    }
    if (color !== "") {
        filters.Color = color;
        logic.Color = colorLogic ? "OR" : "AND";
    }

    const resultMessage = document.getElementById("selectChatResultMessage");
    const tableBody = document.querySelector("#selectChatTable tbody");

    try {
        resultMessage.textContent = "Executing query...";
        tableBody.innerHTML = ""; 

        const response = await fetch('/select-chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({filters, logic}),
        });

        const results = await response.json();

        if (results && Array.isArray(results) && results.length > 0) {
            displayChatResults(results);
            resultMessage.textContent = "Query executed successfully.";
        } else {
            resultMessage.textContent = "No results found.";
        }
    } catch (error) {
        console.error("Frontend Error:", error);
        resultMessage.textContent = `An error occurred: ${error.message}`;
    }
}

//Projection on Task
async function fetchTasksWithProjection(event) {
    event.preventDefault();

    const selectedAttributes = Array.from(document.querySelectorAll('input[name="attributes"]:checked'))
        .map(checkbox => checkbox.value);

    if (selectedAttributes.length === 0) {
        alert('Please select at least one attribute to display!');
        return;
    }

    try {
        const response = await fetch('/tasks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ attributes: selectedAttributes })
        });
        if (!response.ok) throw new Error("Failed to fetch tasks");
        const tasks = await response.json();

        const taskTable = document.getElementById('taskTable');
        const tableHeader = document.getElementById('taskTableHeader');
        const tableBody = taskTable.querySelector('tbody');
        tableHeader.innerHTML = '';
        tableBody.innerHTML = '';

        // create table headers based on selected attributes
        selectedAttributes.forEach(attr => {
            const th = document.createElement('th');
            th.textContent = attr;
            tableHeader.appendChild(th);
        });

        // insert rows
        tasks.forEach(task => {
            const row = tableBody.insertRow();
            task.forEach(cellData => {
                const cell = row.insertCell();
                cell.textContent = cellData !== null ? cellData : 'N/A';
            });
        });
    } catch (error) {
        console.error("Error fetching tasks:", error);
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
            killList += `<p><strong>Impostor Killed:</strong> ${kill[0]} <strong>Time:</strong> ${kill[1]}</p>`;
        });
        resultElem.innerHTML = `<p><strong>Impostor Color:</strong> ${color}</p>${killList}`;
    } catch (error) {
        //console.error("Error fetching impostor kills:", error);
        document.getElementById('impostorKillsResult').textContent =
            `Error: Unable to fetch data for color "${color}" "${error}".`;
    }
}

//AGGREGATION GROUP BY on Task
async function fetchTasksGroupedByRoom() {
    const response = await fetch('/tasks-grouped-by-room', { method: 'GET' });
    const data = await response.json();
    populateTable("tasksGroupedByRoomTable", data.data);
}

//AGGREGATION HAVING on Task
async function fetchRoomWithMultipleTasks() {
    const response = await fetch('/tasks-multiple-rooms', { method: 'GET' });
    const data = await response.json();
    populateTable("roomMultipleTasksTable", data.data);
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

// ---------------------------------------------------------------
// initializes the webpage functionalities.
window.onload = function () {
    checkDbConnection();
    fetchPlayers();
    document.getElementById('impostorKillForm').addEventListener('submit', fetchImpostorsAndKills);
    document.getElementById('tasksGroupedByRoom').addEventListener('click', fetchTasksGroupedByRoom);
    document.getElementById('playersAllTasks').addEventListener('click', fetchPlayersAllTasks);
    document.getElementById('roomMultipleTasks').addEventListener('click', fetchRoomWithMultipleTasks);
    document.getElementById('fetchPlayers').addEventListener('click', fetchPlayers);
    document.getElementById('insertPlayerForm').addEventListener('submit', insertPlayer);
    document.getElementById('deletePlayerForm').addEventListener('submit', deletePlayer);
    document.getElementById('fetchKills').addEventListener('click', fetchKills);
    document.getElementById('updatePlayerForm').addEventListener('submit', updatePlayer);
    document.getElementById("selectChatForm").addEventListener("submit", selectChat);
    document.getElementById('fetchTasksForm').addEventListener('submit', fetchTasksWithProjection);
    document.getElementById('insertChatForm').addEventListener('submit', insertChat);
    document.getElementById('fetchTopImpostors').addEventListener('click', fetchTopImpostors);
    populatePlayerDropdown(); 
};