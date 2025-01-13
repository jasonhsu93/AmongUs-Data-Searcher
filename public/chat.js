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
            resultMessage.textContent = "Selected successfully, results shown above!";
        } else {
            resultMessage.textContent = "No results found.";
        }
    } catch (error) {
        console.error("Frontend Error:", error);
        resultMessage.textContent = `An error occurred: ${error.message}`;
    }
}

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

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('selectChatForm').addEventListener('submit', selectChat);
    document.getElementById('insertChatForm').addEventListener('submit', insertChat);
});