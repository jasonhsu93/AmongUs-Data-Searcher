//Projection on Task
async function fetchTasksWithProjection(event) {
    event.preventDefault();

    const selectedAttributes = Array.from(document.querySelectorAll('input[name="attributes"]:checked'))
        .map(checkbox => checkbox.value);

    if (selectedAttributes.length === 0) {
        alert('Please select at least one attribute to display.');
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

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('fetchTasksForm').addEventListener('submit', fetchTasksWithProjection);
    document.getElementById('tasksGroupedByRoom').addEventListener('click', fetchTasksGroupedByRoom);
    document.getElementById('roomMultipleTasks').addEventListener('click', fetchRoomWithMultipleTasks);
});
