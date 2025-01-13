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
    document.getElementById('insertPlayerResult').textContent = result.message || 'Could not insert player, make sure both the Color and PlayerName has not been used before!';
    fetchPlayers();
    populatePlayerDropdown();
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
    const color = document.getElementById('deletePlayerColor').value.trim();

    try {
        const response = await fetch(`/players/${color}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' }
        });

        const result = await response.json();

        if (response.ok) {
            document.getElementById('deletePlayerResult').textContent = result.message;
            fetchPlayers();
        } else {
            document.getElementById('deletePlayerResult').textContent = `Error: ${result.message}`;
        }
    } catch (error) {
        console.error('Error deleting player:', error);
        document.getElementById('deletePlayerResult').textContent = 'error occurred while deleting the player';
    }
}

// Populate dropdown for updating player
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

document.addEventListener('DOMContentLoaded', function () {
    fetchPlayers();
    populatePlayerDropdown();
    document.getElementById('fetchPlayers').addEventListener('click', fetchPlayers);
    document.getElementById('insertPlayerForm').addEventListener('submit', insertPlayer);
    document.getElementById('updatePlayerForm').addEventListener('submit', updatePlayer);
    document.getElementById('deletePlayerForm').addEventListener('submit', deletePlayer);
});